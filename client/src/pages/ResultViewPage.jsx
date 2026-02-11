import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Spin, message, Space } from 'antd'
import { ArrowLeftOutlined, DownloadOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import PDFPreview from '../components/pdf/PDFPreview'
import api from '../services/api'
import { useSettingsStore } from '../stores/settingsStore'

function ResultViewPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const pdfRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState(null)
    const [exporting, setExporting] = useState(false)

    const pdfAssets = useSettingsStore((s) => s.pdfAssets)

    useEffect(() => {
        loadResult()
    }, [id])

    const loadResult = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/results/${id}`)
            const data = res.data?.result || res.data

            if (data) {
                // Construct result object from server data
                const resultData = {
                    patientInfo: {
                        name: data.patientName || '',
                        code: data.patientCode || '',
                        birthYear: data.birthYear || null,
                        gender: data.gender || ''
                    },
                    ...(data.gaugeData || {}),
                    ...(data.labResults || {}),
                    ...(data.analysisData || {}),
                    ...(data.customFields || {}),
                    testDate: data.testDate,
                    doctorName: data.doctorName,
                    status: data.status
                }
                setResult(resultData)
            }
        } catch (err) {
            message.error('Không thể tải kết quả')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleExportPDF = async () => {
        if (!pdfRef.current) return

        try {
            setExporting(true)

            // Ensure web fonts are fully loaded before capture
            if (document.fonts?.ready) {
                await document.fonts.ready
            }

            const filename = `ket-qua-${result?.patientInfo?.code || id}.pdf`

            // Render each A4 "page" separately to avoid html2pdf auto page-splitting
            // (which commonly creates unexpected blank pages).
            const root = pdfRef.current
            const pageEls = Array.from(root.querySelectorAll('.pdf-page:not([data-pdf-probe="1"])'))
            const targets = pageEls.length ? pageEls : [root]

            const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()

            for (let i = 0; i < targets.length; i++) {
                const el = targets[i]
                const canvas = await html2canvas(el, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    windowWidth: el.scrollWidth,
                    windowHeight: el.scrollHeight
                })

                const imgData = canvas.toDataURL('image/jpeg', 0.98)

                // Fit image into A4 without stretching
                const imgWidth = pageWidth
                let imgHeight = (canvas.height * imgWidth) / canvas.width
                let x = 0
                let y = 0
                if (imgHeight > pageHeight) {
                    const scale = pageHeight / imgHeight
                    imgHeight = imgHeight * scale
                    x = (pageWidth - imgWidth * scale) / 2
                    y = 0
                    pdf.addImage(imgData, 'JPEG', x, y, imgWidth * scale, imgHeight)
                } else {
                    y = (pageHeight - imgHeight) / 2
                    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight)
                }

                if (i < targets.length - 1) {
                    pdf.addPage()
                }
            }

            pdf.save(filename)
            message.success('Đã xuất PDF thành công')
        } catch (err) {
            message.error('Lỗi khi xuất PDF')
            console.error(err)
        } finally {
            setExporting(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Spin size="large" />
            </div>
        )
    }

    if (!result) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Không tìm thấy kết quả</p>
                <Button onClick={() => navigate('/results')}>Quay lại danh sách</Button>
            </div>
        )
    }

    return (
        <div>
            {/* Header - hide when printing */}
            <div className="flex items-center justify-between mb-6 print:hidden">
                <div className="flex items-center gap-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/results')}
                    >
                        Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold">
                        Kết quả xét nghiệm - {result?.patientInfo?.name || 'N/A'}
                    </h1>
                </div>

                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/results/${id}/edit`)}
                    >
                        Chỉnh sửa
                    </Button>
                    <Button
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                    >
                        In
                    </Button>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExportPDF}
                        loading={exporting}
                    >
                        Xuất PDF
                    </Button>
                </Space>
            </div>

            {/* PDF Preview */}
            <div className="bg-gray-200 p-4 rounded-lg print:bg-white print:p-0">
                <div className="shadow-xl" id="pdf-preview">
                    <PDFPreview
                        ref={pdfRef}
                        result={result}
                        assets={{
                            ...(pdfAssets || {}),
                            ...((result && result.assets) || {})
                        }}
                    />
                </div>
            </div>

            {/* Print styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          #pdf-preview, #pdf-preview * {
            visibility: visible;
          }
          #pdf-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
        </div>
    )
}

export default ResultViewPage
