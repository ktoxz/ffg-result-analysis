import React, { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react'
import HealthScoreGauge from './HealthScoreGauge'
import FiveLevelBar from './FiveLevelBar'
import BiochemistryTable from './BiochemistryTable'
import UrinalysisTable from './UrinalysisTable'
import ThalassemiaBox from './ThalassemiaBox'

const PDFPreview = forwardRef(({ result, assets: assetsProp }, ref) => {
    const {
        patientInfo = {},
        healthScore = {},
        bioAge = {},
        organSummary = {},
        cardiovascularRisk = {},
        liverFibrosis = {},
        inflammation = {},
        biochemistry = [],
        urinalysis = [],
        thalassemia = {},
        evaluation = {},
        signature = {},
        testDate = '',
        doctorName = '',
        assets: assetsFromResult = {}
    } = result || {}

    const assets = assetsProp || assetsFromResult || {}
    const bannerGradient = assets.bannerGradient || 'linear-gradient(90deg, #0b4fb3 0%, #b54ad5 100%)'

    const fiveLevelCfg = assets.fiveLevelBar || {}
    const gaugeCfg = assets.healthGauge || {}

    // ---- Flow pagination for tail pages (avoid large blank areas) ----
    const pageProbeRef = useRef(null)
    const measureRef = useRef(null)
    const [tailPages, setTailPages] = useState([])

    const tailKey = useMemo(() => {
        // A compact key to trigger re-measure when variable content changes.
        const t = thalassemia || {}
        return JSON.stringify({
            cardio: cardiovascularRisk,
            liver: liverFibrosis,
            inflam: inflammation,
            bioLen: (biochemistry || []).length,
            uriLen: (urinalysis || []).length,
            thal: { mentzer: t.mentzer, greenKing: t.greenKing, rdwi: t.rdwi, srivastava: t.srivastava, comment: t.comment },
            eval: { negatives: evaluation?.negatives || '', positives: evaluation?.positives || '', general: evaluation?.general || '' },
            sig: signature || {},
            testDate,
            doctorName,
            thalImg: assets.thalassemiaImageUrl,
            deepDiveIcons: assets.deepDiveIcons || {},
            evalIcons: assets.evaluationIcons || {},
            fiveLevelCfg
        })
    }, [
        cardiovascularRisk,
        liverFibrosis,
        inflammation,
        biochemistry,
        urinalysis,
        thalassemia,
        evaluation,
        signature,
        testDate,
        doctorName,
        assets.deepDiveIcons,
        assets.thalassemiaImageUrl,
        assets.evaluationIcons,
        fiveLevelCfg
    ])

    const EvalBlock = ({ title, iconUrl, fallbackIcon, lines = '' }) => {
        const items = (lines || '').split('\n').filter(Boolean)
        return (
            <div>
                <div className="flex items-center justify-center gap-3 mb-3">
                    {iconUrl ? (
                        <img
                            src={iconUrl}
                            alt={title}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                                e.currentTarget.onerror = null
                                e.currentTarget.src = '/images/placeholder-image.svg'
                            }}
                        />
                    ) : (
                        <div className="text-5xl" style={{ lineHeight: 1 }}>{fallbackIcon}</div>
                    )}
                    <div className="text-[18px] font-extrabold" style={{ color: '#6d28d9' }}>{title}</div>
                </div>

                {items.length ? (
                    <ul className="space-y-2 pl-6">
                        {items.map((line, i) => (
                            <li key={i} className="flex items-start gap-2 text-[14px] text-gray-800">
                                <span className="text-gray-400">•</span>
                                <span dangerouslySetInnerHTML={{ __html: formatBoldText(line) }} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 italic text-sm text-center">Không có ghi chú</p>
                )}
            </div>
        )
    }

    const SignatureBlock = () => (
        <div className="mt-10 text-right">
            <p className="text-gray-700 mb-2">
                {signature.location || 'Thành phố Hồ Chí Minh'}, Ngày {signature.day || '__'} Tháng {signature.month || '__'} Năm {signature.year || '____'}.
            </p>
            <p className="font-semibold text-gray-700 mb-8">Người chịu trách nhiệm chuyên môn</p>
            <p className="text-blue-700 font-bold" style={{ fontSize: 16 }}>
                {signature.name || doctorName || ''}
            </p>
        </div>
    )

    const tailBlocks = useMemo(() => {
        const deepDiveBar = (item) => (
            <FiveLevelBar
                position={item.position || 1}
                colors={fiveLevelCfg.colors}
                height={18}
                markerColor={fiveLevelCfg.markerColor}
                markerStrokeColor={fiveLevelCfg.markerStrokeColor}
                markerStrokeWidth={fiveLevelCfg.markerStrokeWidth}
                markerSize={fiveLevelCfg.markerSize}
                markerImageUrl={fiveLevelCfg.markerImageUrl}
            />
        )

        return [
            {
                key: 'banner-deepdive',
                // First banner in the tail; no need to force a new page here.
                avoidOrphanWithNext: true,
                element: <PageBanner title="PHÂN TÍCH CHUYÊN SÂU - AI DEEP DIVE" gradient={bannerGradient} />
            },
            {
                key: 'sec4',
                element: (
                    <div className="mb-6">
                        <SectionTitle number="4" title="TIÊN LƯỢNG ĐỘT QUỴ & TIM MẠCH" />
                        <div className="space-y-3">
                            {[
                                { key: 'castelli1', label: 'Castelli I' },
                                { key: 'castelli2', label: 'Castelli II' },
                                { key: 'tygIndex', label: 'TyG Index' },
                                { key: 'aip', label: 'AIP' }
                            ].map(({ key, label }) => {
                                const item = cardiovascularRisk[key] || {}
                                return (
                                    <div key={key} className="flex items-center gap-4">
                                        <span className="w-40 text-gray-700">
                                            {label}: <strong style={{ color: item.valueColor || '#111827' }}>{item.value || '-'}</strong>
                                        </span>
                                        <div className="flex-1">{deepDiveBar(item)}</div>
                                    </div>
                                )
                            })}
                        </div>
                        {cardiovascularRisk.comment && (
                            <DeepDiveBox iconKey="cardiovascular" fallbackEmoji="❤️">
                                <div dangerouslySetInnerHTML={{ __html: formatBoldText(cardiovascularRisk.comment) }} />
                            </DeepDiveBox>
                        )}
                    </div>
                )
            },
            {
                key: 'sec5',
                element: (
                    <div className="mb-6">
                        <SectionTitle number="5" title="TẦM SOÁT XƠ HÓA GAN" />
                        <div className="space-y-3">
                            {[
                                { key: 'fib4', label: 'FIB-4' },
                                { key: 'apri', label: 'APRI' },
                                { key: 'deRitis', label: 'De Ritis' }
                            ].map(({ key, label }) => {
                                const item = liverFibrosis[key] || {}
                                return (
                                    <div key={key} className="flex items-center gap-4">
                                        <span className="w-40 text-gray-700">
                                            {label}: <strong style={{ color: item.valueColor || '#111827' }}>{item.value || '-'}</strong>
                                        </span>
                                        <div className="flex-1">{deepDiveBar(item)}</div>
                                    </div>
                                )
                            })}
                        </div>
                        {liverFibrosis.comment && (
                            <DeepDiveBox iconKey="liver" fallbackEmoji="🫁">
                                <div dangerouslySetInnerHTML={{ __html: formatBoldText(liverFibrosis.comment) }} />
                            </DeepDiveBox>
                        )}
                    </div>
                )
            },
            {
                key: 'sec6',
                element: (
                    <div className="mb-2">
                        <SectionTitle number="6" title="SỨC ĐỀ KHÁNG & VIÊM" />
                        <div className="space-y-3">
                            {[
                                { key: 'sii', label: 'SII' },
                                { key: 'glr', label: 'GLR' },
                                { key: 'plr', label: 'PLR' },
                                { key: 'lmr', label: 'LMR' }
                            ].map(({ key, label }) => {
                                const item = inflammation[key] || {}
                                return (
                                    <div key={key} className="flex items-center gap-4">
                                        <span className="w-40 text-gray-700">
                                            {label}: <strong style={{ color: item.valueColor || '#111827' }}>{item.value || '-'}</strong>
                                        </span>
                                        <div className="flex-1">{deepDiveBar(item)}</div>
                                    </div>
                                )
                            })}
                        </div>
                        {inflammation.comment && (
                            <DeepDiveBox iconKey="inflammation" fallbackEmoji="🛡️">
                                <div dangerouslySetInnerHTML={{ __html: formatBoldText(inflammation.comment) }} />
                            </DeepDiveBox>
                        )}
                    </div>
                )
            },
            {
                key: 'banner-labs',
                // Avoid leaving the banner alone at the bottom of a page.
                avoidOrphanWithNext: true,
                element: <PageBanner title="SINH HÓA & THALASSAEMIA" gradient={bannerGradient} />
            },
            {
                key: 'sec7',
                element: (
                    <div className="mb-6">
                        <SectionTitle number="7" title="Bảng chi tiết Sinh Hóa" />
                        <BiochemistryTable data={biochemistry} />
                    </div>
                )
            },
            {
                key: 'sec8',
                element: (
                    <div className="mb-6">
                        <SectionTitle number="8" title="Bảng chi tiết Phân tích nước tiểu" />
                        <UrinalysisTable data={urinalysis} />
                    </div>
                )
            },
            {
                key: 'sec9',
                element: (
                    <div className="mb-4">
                        <SectionTitle number="9" title="Tầm soát Gien Thalassaemia" />
                        <ThalassemiaBox data={thalassemia} comment={thalassemia.comment || ''} imageUrl={assets.thalassemiaImageUrl} />
                    </div>
                )
            },
            {
                key: 'banner-eval',
                // Avoid leaving the banner alone at the bottom of a page.
                avoidOrphanWithNext: true,
                element: <PageBanner title="ĐÁNH GIÁ" gradient={bannerGradient} />
            },
            {
                key: 'eval-neg',
                element: (
                    <div className="mb-8">
                        <EvalBlock title="Chưa tốt" iconUrl={assets?.evaluationIcons?.negatives} fallbackIcon="✖" lines={evaluation.negatives || ''} />
                    </div>
                )
            },
            {
                key: 'eval-pos',
                element: (
                    <div className="mb-8">
                        <EvalBlock title="Ưu điểm" iconUrl={assets?.evaluationIcons?.positives} fallbackIcon="✔" lines={evaluation.positives || ''} />
                    </div>
                )
            },
            {
                key: 'eval-gen',
                element: (
                    <div className="mb-6">
                        <EvalBlock title="Đánh giá chung" iconUrl={assets?.evaluationIcons?.general} fallbackIcon="💗" lines={evaluation.general || ''} />
                    </div>
                )
            },
            {
                key: 'signature',
                element: <SignatureBlock />
            }
        ]
    }, [
        bannerGradient,
        cardiovascularRisk,
        liverFibrosis,
        inflammation,
        biochemistry,
        urinalysis,
        thalassemia,
        evaluation,
        signature,
        doctorName,
        assets?.thalassemiaImageUrl,
        assets?.evaluationIcons?.negatives,
        assets?.evaluationIcons?.positives,
        assets?.evaluationIcons?.general,
        fiveLevelCfg
    ])

    useLayoutEffect(() => {
        const probe = pageProbeRef.current
        const measurer = measureRef.current
        if (!probe || !measurer) return

        const probeStyle = window.getComputedStyle(probe)
        const padTop = parseFloat(probeStyle.paddingTop || '0')
        const padBottom = parseFloat(probeStyle.paddingBottom || '0')
        const available = probe.clientHeight - padTop - padBottom

        const nodes = Array.from(measurer.querySelectorAll('[data-pdf-block="1"]'))
        const heights = nodes.map((n) => {
            const rectH = n.getBoundingClientRect().height
            const s = window.getComputedStyle(n)
            const mt = parseFloat(s.marginTop || '0')
            const mb = parseFloat(s.marginBottom || '0')
            return rectH + mt + mb
        })

        const pages = []
        let current = []
        let used = 0

        heights.forEach((h, idx) => {
            const forceNew = Boolean(tailBlocks[idx]?.forceNewPageBefore)
            if (forceNew && current.length) {
                pages.push(current)
                current = []
                used = 0
            }

            const avoidOrphan = Boolean(tailBlocks[idx]?.avoidOrphanWithNext)
            if (avoidOrphan && current.length) {
                const nextH = heights[idx + 1] || 0
                // If the banner (or similar header block) plus the next block cannot fit
                // on the current page, start a new page so the header stays with content.
                if (used + h + nextH > available) {
                    pages.push(current)
                    current = []
                    used = 0
                }
            }

            const next = used + h
            if (current.length && next > available) {
                pages.push(current)
                current = [idx]
                used = h
            } else {
                current.push(idx)
                used = next
            }
        })
        if (current.length) pages.push(current)

        setTailPages((prev) => {
            const nextKey = JSON.stringify(pages)
            const prevKey = JSON.stringify(prev)
            return prevKey === nextKey ? prev : pages
        })
    }, [tailKey])

    // Section title component (purple like template)
    function SectionTitle({ number, title }) {
        return (
            <h3 className="text-[16px] font-extrabold mb-2" style={{ color: '#6d28d9' }}>
                {number}. {title}
            </h3>
        )
    }

    // Page header banner
    function PageBanner({ title, gradient }) {
        return (
            <div
                className="text-center py-2 rounded-full mb-4 shadow-md"
                style={{ background: gradient }}
            >
                <h2 className="text-white text-[20px] font-extrabold tracking-wide">{title}</h2>
            </div>
        )
    }

    function DeepDiveBox({ iconKey, fallbackEmoji, children }) {
        const url = assets?.deepDiveIcons?.[iconKey]
        return (
            <div className="mt-4 border-2 border-gray-900 bg-white p-4 flex gap-4" style={{ borderRadius: 2 }}>
                <div className="flex-shrink-0 w-16 flex items-end justify-center">
                    {url ? (
                        <img
                            src={url}
                            alt={iconKey}
                            className="w-14 h-14 object-contain"
                            onError={(e) => {
                                e.currentTarget.onerror = null
                                e.currentTarget.src = '/images/placeholder-image.svg'
                            }}
                        />
                    ) : (
                        <div className="text-5xl" style={{ lineHeight: 1 }}>{fallbackEmoji}</div>
                    )}
                </div>
                <div className="text-[13px] text-gray-800 leading-relaxed">
                    <div className="font-bold mb-1">Đánh giá:</div>
                    {children}
                </div>
            </div>
        )
    }

    const ratingColor = (rating) => {
        const r = (rating || '').toLowerCase()
        if (r.includes('tuyệt vời')) return '#16a34a'
        if (r.includes('rất tốt')) return '#16a34a'
        if (r.includes('khá - tốt')) return '#16a34a'
        if (r.includes('tốt')) return '#22c55e'
        if (r.includes('khá')) return '#f59e0b'
        if (r.includes('trung bình - kém')) return '#f97316'
        if (r.includes('trung bình')) return '#2563eb'
        if (r.includes('kém')) return '#dc2626'
        return '#2563eb'
    }

    const organRows = [
        { key: 'cardiovascular', label: 'Tim mạch & Mỡ Máu' },
        { key: 'blood', label: 'Huyết Học & Miễn Dịch' },
        { key: 'liver', label: 'Gan & Mật' },
        { key: 'kidney', label: 'Thận & Tiết Niệu' },
    ]

    return (
        <div ref={ref} className="bg-white" style={{ fontFamily: 'Be Vietnam Pro, Arial, sans-serif', fontSize: '14px' }}>
            <style>{`
                .pdf-page {
                    width: 210mm;
                    height: 297mm;
                    box-sizing: border-box;
                    background: #ffffff;
                    padding: 8mm 10mm 10mm 10mm;
                    overflow: hidden;
                }

                .patient-info-box {
                    position: relative;
                    background: #f3f4f6; /* close to template grey */
                    border: 1px solid #d1d5db;
                    box-shadow: 0 0 0 3px #e5e7eb; /* outer stroke */
                }

                .section-box-purple {
                    border: 2px solid #6d28d9;
                    outline: 3px solid #c4b5fd; /* violet outer stroke */
                    outline-offset: 0px;
                    background: #ffffff;
                }

                /* Ensure predictable pagination for html2pdf/jsPDF */
                .pdf-page {
                    page-break-after: always;
                    break-after: page;
                }

                .pdf-page.pdf-page-last {
                    page-break-after: auto;
                    break-after: auto;
                }
            `}</style>
            {/* ===== PAGE 1 ===== */}
            <div className="pdf-page">
                {/* Main Title Banner */}
                <PageBanner
                    title="KẾT QUẢ PHÂN TÍCH SỨC KHỎE AI ANALYSIS"
                    gradient={bannerGradient}
                />

                {/* Header with Logo */}
                <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden">
                            <img
                                src={assets.logoUrl || '/images/logo.svg'}
                                alt="FGG"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = '/images/placeholder-image.svg'
                                }}
                            />
                        </div>
                        <span className="text-gray-700 font-medium" style={{ fontSize: 14 }}>
                            FGG Việt Nam - AI Health Technology
                        </span>
                    </div>
                </div>

                {/* Patient Info Box */}
                <div className="patient-info-box p-3 mb-4" style={{ borderRadius: 0 }}>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-gray-600">Họ và Tên: </span>
                            <span className="font-bold text-gray-800">{patientInfo.name || '-'}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Mã hồ sơ: </span>
                            <span className="font-medium">{patientInfo.code || '-'}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Năm sinh: </span>
                            <span className="font-bold">{patientInfo.birthYear || '-'}</span>
                        </div>
                        {testDate && (
                            <div>
                                <span className="text-gray-600">Ngày XN: </span>
                                <span className="font-medium">{testDate}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 1: Health Score */}
                <div className="mb-5 section-box-purple p-3" style={{ borderRadius: 0 }}>
                    <SectionTitle number="1" title="ĐIỂM SỐ SỨC KHỎE (HEALTH SCORE)" />
                    <div className="flex justify-center">
                        <HealthScoreGauge score={healthScore.score || 0} rating={healthScore.rating || ''} config={gaugeCfg} />
                    </div>
                </div>

                {/* Section 2: Bio Age */}
                <div className="mb-5">
                    <SectionTitle number="2" title="TUỔI SINH HỌC (BIO AGE)" />
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="bg-sky-200 text-center py-3 border-2 border-sky-300" style={{ borderRadius: 0 }}>
                            <span className="font-bold text-gray-800" style={{ fontSize: 14 }}>TUỔI THẬT: {bioAge.realAge || '-'}</span>
                        </div>
                        <div className="bg-rose-200 text-center py-3 border-2 border-rose-300" style={{ borderRadius: 0 }}>
                            <span className="font-bold text-rose-700" style={{ fontSize: 14 }}>BIO AGE: {bioAge.bioAge || '-'}</span>
                        </div>
                    </div>
                    <p className={bioAge.warning ? 'text-red-600 text-sm italic' : 'text-gray-500 text-sm italic'}>
                        <span className="font-semibold">Cảnh báo:</span>{' '}
                        {bioAge.warning || '...'}
                    </p>
                </div>

                {/* Section 3: Organ Summary */}
                <div className="mb-3">
                    <SectionTitle number="3" title="TÓM TẮT HỆ CƠ QUAN" />
                    <div className="space-y-2">
                        {organRows.map(({ key, label }) => {
                            const rating = organSummary[key]?.rating || '-'
                            const iconUrl = assets?.organIcons?.[key] || '/images/placeholder-image.svg'
                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-3 p-2"
                                    style={{
                                        background: 'linear-gradient(90deg, #e5e7eb 0%, #ffffff 70%)'
                                    }}
                                >
                                    <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={iconUrl}
                                            alt={key}
                                            className="w-4 h-4 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null
                                                e.currentTarget.src = '/images/placeholder-image.svg'
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-700" style={{ fontSize: 13 }}>
                                            {label}
                                        </div>
                                    </div>
                                    <div className="font-bold" style={{ color: ratingColor(rating) }}>
                                        {rating}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Probe page (offscreen) to compute available page content height */}
            <div
                ref={pageProbeRef}
                className="pdf-page"
                data-pdf-probe="1"
                style={{ position: 'absolute', left: '-99999px', top: 0, visibility: 'hidden', pointerEvents: 'none' }}
            />

            {/* Measure blocks (offscreen) */}
            <div
                ref={measureRef}
                style={{ position: 'absolute', left: '-99999px', top: 0, visibility: 'hidden', pointerEvents: 'none', width: '210mm' }}
            >
                {tailBlocks.map((b) => (
                    <div key={`m-${b.key}`} data-pdf-block="1">
                        {b.element}
                    </div>
                ))}
            </div>

            {/* Render tail pages with flow-based pagination */}
            {(tailPages.length ? tailPages : [tailBlocks.map((_, idx) => idx)]).map((idxs, pageIdx, arr) => (
                <div key={`tail-${pageIdx}`} className={`pdf-page${pageIdx === arr.length - 1 ? ' pdf-page-last' : ''}`}>
                    {idxs.map((i) => (
                        <React.Fragment key={tailBlocks[i].key}>{tailBlocks[i].element}</React.Fragment>
                    ))}
                </div>
            ))}
        </div>
    )
})

// Helper to format **bold** text
function formatBoldText(text) {
    if (!text) return ''
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

PDFPreview.displayName = 'PDFPreview'

export default PDFPreview
