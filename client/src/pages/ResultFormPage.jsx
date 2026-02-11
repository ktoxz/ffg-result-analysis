import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Form, Input, Card, Button, message, Tabs, Collapse, Space, InputNumber,
    Spin, Row, Col, Divider, Select, DatePicker, ColorPicker, Upload
} from 'antd'
import {
    SaveOutlined, EyeOutlined, ArrowLeftOutlined,
    HeartOutlined, ExperimentOutlined, MedicineBoxOutlined, FileTextOutlined,
    CheckCircleOutlined,
    UploadOutlined,
    DownloadOutlined
} from '@ant-design/icons'
import { useResultStore } from '../stores/resultStore'
import api from '../services/api'
import dayjs from 'dayjs'
import { applyResultExcelPatch, buildResultExcelTemplateBlob, parseResultExcelFile } from '../utils/excelIO'

// Form components
import HealthScoreInput from '../components/form/HealthScoreInput'
import BioAgeInput from '../components/form/BioAgeInput'
import OrganSummaryInput from '../components/form/OrganSummaryInput'
import FiveLevelBarInput from '../components/form/FiveLevelBarInput'
import BiochemistryInput from '../components/form/BiochemistryInput'
import UrinalysisInput from '../components/form/UrinalysisInput'
import ThalassemiaInput from '../components/form/ThalassemiaInput'
import EvaluationInput from '../components/form/EvaluationInput'
import SignatureInput from '../components/form/SignatureInput'
import RawMetricsInput from '../components/form/RawMetricsInput'

function ResultFormPage() {
    const { id, patientId } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [patients, setPatients] = useState([])
    const [selectedPatientId, setSelectedPatientId] = useState(null)
    const [testDate, setTestDate] = useState(dayjs())
    const [status, setStatus] = useState('draft')

    const {
        patientInfo, setPatientInfo,
        healthScore, setHealthScore,
        bioAge, setBioAge,
        organSummary, setOrganSummary,
        cardiovascularRisk, setCardiovascularRisk,
        liverFibrosis, setLiverFibrosis,
        inflammation, setInflammation,
        biochemistry, setBiochemistry,
        urinalysis, setUrinalysis,
        thalassemia, setThalassemia,
        evaluation, setEvaluation,
        signature, setSignature,
        rawMetrics, setRawMetrics,
        patchHealthScore,
        patchBioAge,
        patchRawMetrics,
        setAllData,
        getAllData,
        reset
    } = useResultStore()

    const parseMaybeNumber = (raw) => {
        if (raw === null || raw === undefined) return null
        const s = String(raw).trim()
        if (!s) return null
        const n = parseFloat(s.replace(',', '.'))
        return Number.isFinite(n) ? n : null
    }

    const sameNumeric = (a, b) => {
        const na = typeof a === 'number' ? a : parseMaybeNumber(a)
        const nb = typeof b === 'number' ? b : parseMaybeNumber(b)
        if (na === null || nb === null) return false
        return Math.abs(na - nb) < 1e-9
    }

    // Sync deep-dive (sections 4/5/6) values from rawMetrics so operators can input once.
    // This only writes when rawMetrics has a non-empty value; it will not clear existing values.
    useEffect(() => {
        const pickNonEmpty = (incoming, current) => {
            const s = incoming === null || incoming === undefined ? '' : String(incoming)
            return s.trim() ? s : (current ?? '')
        }

        const withDefaultPos = (item) => ({ position: 3, valueColor: '', ...item })

        const nextCardio = {
            ...cardiovascularRisk,
            castelli1: {
                ...withDefaultPos(cardiovascularRisk.castelli1),
                value: pickNonEmpty(rawMetrics?.castelli1, cardiovascularRisk.castelli1?.value)
            },
            castelli2: {
                ...withDefaultPos(cardiovascularRisk.castelli2),
                value: pickNonEmpty(rawMetrics?.castelli2, cardiovascularRisk.castelli2?.value)
            },
            tygIndex: {
                ...withDefaultPos(cardiovascularRisk.tygIndex),
                value: pickNonEmpty(rawMetrics?.tygIndex, cardiovascularRisk.tygIndex?.value)
            },
            aip: {
                ...withDefaultPos(cardiovascularRisk.aip),
                value: pickNonEmpty(rawMetrics?.aip, cardiovascularRisk.aip?.value)
            }
        }

        const nextLiver = {
            ...liverFibrosis,
            fib4: {
                ...withDefaultPos(liverFibrosis.fib4),
                value: pickNonEmpty(rawMetrics?.fib4, liverFibrosis.fib4?.value)
            },
            apri: {
                ...withDefaultPos(liverFibrosis.apri),
                value: pickNonEmpty(rawMetrics?.apri, liverFibrosis.apri?.value)
            },
            deRitis: {
                ...withDefaultPos(liverFibrosis.deRitis),
                value: pickNonEmpty(rawMetrics?.deRitis, liverFibrosis.deRitis?.value)
            }
        }

        const nextInflammation = {
            ...inflammation,
            sii: {
                ...withDefaultPos(inflammation.sii),
                value: pickNonEmpty(rawMetrics?.sii, inflammation.sii?.value)
            },
            glr: {
                ...withDefaultPos(inflammation.glr),
                value: pickNonEmpty(rawMetrics?.glr, inflammation.glr?.value)
            },
            plr: {
                ...withDefaultPos(inflammation.plr),
                value: pickNonEmpty(rawMetrics?.plr, inflammation.plr?.value)
            },
            lmr: {
                ...withDefaultPos(inflammation.lmr),
                value: pickNonEmpty(rawMetrics?.lmr, inflammation.lmr?.value)
            }
        }

        const changed = (a, b, keys) => keys.some((k) => (a?.[k]?.value || '') !== (b?.[k]?.value || ''))

        if (changed(nextCardio, cardiovascularRisk, ['castelli1', 'castelli2', 'tygIndex', 'aip'])) {
            setCardiovascularRisk(nextCardio)
        }
        if (changed(nextLiver, liverFibrosis, ['fib4', 'apri', 'deRitis'])) {
            setLiverFibrosis(nextLiver)
        }
        if (changed(nextInflammation, inflammation, ['sii', 'glr', 'plr', 'lmr'])) {
            setInflammation(nextInflammation)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        rawMetrics?.castelli1,
        rawMetrics?.castelli2,
        rawMetrics?.tygIndex,
        rawMetrics?.aip,
        rawMetrics?.fib4,
        rawMetrics?.apri,
        rawMetrics?.deRitis,
        rawMetrics?.sii,
        rawMetrics?.glr,
        rawMetrics?.plr,
        rawMetrics?.lmr
    ])

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }

    const handleDownloadExcelTemplate = () => {
        try {
            const blob = buildResultExcelTemplateBlob()
            downloadBlob(blob, 'ffg-result-template.xlsx')
            message.success('Đã tải mẫu Excel')
        } catch (err) {
            console.error(err)
            message.error('Không thể tạo file mẫu Excel')
        }
    }

    const handleImportExcel = async (file) => {
        try {
            const current = getAllData()
            const { patch, meta } = await parseResultExcelFile(file, current)
            const merged = applyResultExcelPatch(current, patch)
            setAllData(merged)
            message.success(`Đã nhập Excel (áp dụng ${meta.applied}, bỏ qua ${meta.ignored})`)
        } catch (err) {
            console.error(err)
            message.error('Lỗi khi đọc Excel. Hãy dùng file mẫu hoặc kiểm tra tên sheet/cột.')
        }
        // prevent Upload from auto uploading
        return false
    }

    // Load existing result if editing
    useEffect(() => {
        loadPatients()
        if (id && id !== 'new') {
            loadResult(id)
        } else if (patientId) {
            setSelectedPatientId(parseInt(patientId))
            loadPatient(patientId)
        } else {
            reset()
        }
    }, [id, patientId])

    // Auto-calculate patient real age from birthYear (preferred source).
    // Keep `bioAge.realAge` and `rawMetrics.age` consistent.
    useEffect(() => {
        const by = parseMaybeNumber(patientInfo?.birthYear)
        const currentYear = new Date().getFullYear()

        if (by && by >= 1900 && by <= currentYear) {
            const realAge = Math.max(0, currentYear - Math.floor(by))

            if (bioAge?.realAge !== realAge) {
                patchBioAge({ realAge })
            }

            const rawAge = rawMetrics?.age ?? ''
            const rawAgeNum = parseMaybeNumber(rawAge)
            if (!sameNumeric(rawAgeNum, realAge)) {
                patchRawMetrics({ age: String(realAge) })
            }
            return
        }

        // Fallback: if birthYear is missing but rawMetrics.age exists (e.g., Excel import), reflect it into bioAge.realAge.
        const ageFromRaw = parseMaybeNumber(rawMetrics?.age)
        if (ageFromRaw !== null) {
            const clamped = Math.min(150, Math.max(0, Math.round(ageFromRaw)))
            if (bioAge?.realAge !== clamped) {
                patchBioAge({ realAge: clamped })
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientInfo?.birthYear, rawMetrics?.age])

    // Two-way sync: rawMetrics ↔ overview (HealthScore, BioAge).
    // One-way sync (rawMetrics -> overview): safe after Excel import.
    // Reverse sync (overview -> rawMetrics) is handled in onChange handlers to avoid render loops.
    useEffect(() => {
        const hsFromRaw = parseMaybeNumber(rawMetrics?.healthScore)
        if (hsFromRaw !== null) {
            const clamped = Math.min(100, Math.max(0, hsFromRaw))
            if (!sameNumeric(healthScore?.score, clamped)) patchHealthScore({ score: clamped })
        }

        const bioFromRaw = parseMaybeNumber(rawMetrics?.bioAge)
        if (bioFromRaw !== null) {
            const clamped = Math.min(150, Math.max(0, bioFromRaw))
            if (!sameNumeric(bioAge?.bioAge, clamped)) patchBioAge({ bioAge: clamped })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawMetrics?.healthScore, rawMetrics?.bioAge])

    const loadPatients = async () => {
        try {
            const res = await api.get('/patients')
            // API returns { patients: [...] }
            const data = res.data?.patients || res.data || []
            setPatients(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Không thể tải danh sách bệnh nhân:', err)
            setPatients([])
        }
    }

    const handleHealthScoreChange = (next) => {
        setHealthScore(next)
        const scoreNum = typeof next?.score === 'number' ? next.score : parseMaybeNumber(next?.score)
        if (scoreNum !== null) {
            const clamped = Math.min(100, Math.max(0, scoreNum))
            const existingNum = parseMaybeNumber(rawMetrics?.healthScore)
            if (!sameNumeric(existingNum, clamped)) patchRawMetrics({ healthScore: String(clamped) })
        }
    }

    const handleBioAgeChange = (next) => {
        setBioAge(next)
        const bioNum = typeof next?.bioAge === 'number' ? next.bioAge : parseMaybeNumber(next?.bioAge)
        if (bioNum !== null) {
            const clamped = Math.min(150, Math.max(0, bioNum))
            const existingNum = parseMaybeNumber(rawMetrics?.bioAge)
            if (!sameNumeric(existingNum, clamped)) patchRawMetrics({ bioAge: String(clamped) })
        }

        const realAgeNum = typeof next?.realAge === 'number' ? next.realAge : parseMaybeNumber(next?.realAge)
        if (realAgeNum !== null) {
            const clamped = Math.min(150, Math.max(0, Math.round(realAgeNum)))
            const existingNum = parseMaybeNumber(rawMetrics?.age)
            if (!sameNumeric(existingNum, clamped)) patchRawMetrics({ age: String(clamped) })
        }
    }

    const handleRawMetricsChange = (next) => {
        setRawMetrics(next)

        const hsFromRaw = parseMaybeNumber(next?.healthScore)
        if (hsFromRaw !== null) {
            const clamped = Math.min(100, Math.max(0, hsFromRaw))
            if (!sameNumeric(healthScore?.score, clamped)) patchHealthScore({ score: clamped })
        }

        const bioFromRaw = parseMaybeNumber(next?.bioAge)
        if (bioFromRaw !== null) {
            const clamped = Math.min(150, Math.max(0, bioFromRaw))
            if (!sameNumeric(bioAge?.bioAge, clamped)) patchBioAge({ bioAge: clamped })
        }
    }

    const loadResult = async (resultId) => {
        try {
            setLoading(true)
            const res = await api.get(`/results/${resultId}`)
            const result = res.data?.result || res.data

            if (result) {
                // Set patient and date from result
                if (result.patientId) {
                    setSelectedPatientId(result.patientId)
                }
                if (result.testDate) {
                    setTestDate(dayjs(result.testDate))
                }

                // Load patient info for display
                setPatientInfo({
                    name: result.patientName || '',
                    code: result.patientCode || '',
                    birthYear: result.birthYear || null,
                    gender: result.gender || ''
                })

                // Load gauge data
                if (result.gaugeData) {
                    if (result.gaugeData.healthScore) setHealthScore(result.gaugeData.healthScore)
                    if (result.gaugeData.bioAge) setBioAge(result.gaugeData.bioAge)
                    if (result.gaugeData.organSummary) setOrganSummary(result.gaugeData.organSummary)
                    if (result.gaugeData.cardiovascularRisk) setCardiovascularRisk(result.gaugeData.cardiovascularRisk)
                    if (result.gaugeData.liverFibrosis) setLiverFibrosis(result.gaugeData.liverFibrosis)
                    if (result.gaugeData.inflammation) setInflammation(result.gaugeData.inflammation)
                }

                // Load lab results
                if (result.labResults) {
                    if (result.labResults.biochemistry) setBiochemistry(result.labResults.biochemistry)
                    if (result.labResults.urinalysis) setUrinalysis(result.labResults.urinalysis)
                    if (result.labResults.thalassemia) setThalassemia(result.labResults.thalassemia)
                }

                // Load analysis data
                if (result.analysisData) {
                    if (result.analysisData.evaluation) setEvaluation(result.analysisData.evaluation)
                    if (result.analysisData.patientInfo) setPatientInfo(prev => ({ ...prev, ...result.analysisData.patientInfo }))
                }

                // Load custom fields (raw metrics, signature overrides, etc.)
                if (result.customFields) {
                    if (result.customFields.rawMetrics) setRawMetrics(result.customFields.rawMetrics)
                    if (result.customFields.signature) setSignature(prev => ({ ...prev, ...result.customFields.signature }))
                }

                // Load signature
                if (result.doctorName) {
                    setSignature(prev => ({ ...prev, doctorName: result.doctorName }))
                }

                // Load status
                if (result.status) {
                    setStatus(result.status)
                }
            }
        } catch (err) {
            message.error('Không thể tải kết quả')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadPatient = async (pid) => {
        try {
            const res = await api.get(`/patients/${pid}`)
            const patient = res.data?.patient || res.data
            if (patient) {
                setPatientInfo({
                    name: patient.fullName,
                    code: patient.patientCode || patient.id?.toString().padStart(6, '0'),
                    birthYear: patient.birthYear,
                    gender: patient.gender || ''
                })
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handlePatientChange = (patientId) => {
        setSelectedPatientId(patientId)
        const patient = patients.find(p => p.id === patientId)
        if (patient) {
            setPatientInfo({
                name: patient.fullName,
                code: patient.patientCode || patient.id?.toString().padStart(6, '0'),
                birthYear: patient.birthYear,
                gender: patient.gender || ''
            })
            // Also set real age for bio age comparison
            if (patient.birthYear) {
                const currentYear = new Date().getFullYear()
                const realAge = currentYear - patient.birthYear
                setBioAge({ ...bioAge, realAge })
            }
        }
    }

    const handleSave = async () => {
        if (!selectedPatientId) {
            message.error('Vui lòng chọn bệnh nhân')
            return
        }
        if (!testDate) {
            message.error('Vui lòng chọn ngày xét nghiệm')
            return
        }

        try {
            setSaving(true)
            const data = getAllData()

            const biochemistryFiltered = (biochemistry || []).filter((row) => String(row?.value ?? '').trim() !== '')
            const urinalysisFiltered = (urinalysis || []).filter((row) => String(row?.value ?? '').trim() !== '')

            const payload = {
                patientId: selectedPatientId,
                testDate: testDate.format('YYYY-MM-DD'),
                doctorName: signature.doctorName || '',
                status: status,
                gaugeData: {
                    healthScore,
                    bioAge,
                    organSummary,
                    cardiovascularRisk,
                    liverFibrosis,
                    inflammation
                },
                labResults: {
                    biochemistry: biochemistryFiltered,
                    urinalysis: urinalysisFiltered,
                    thalassemia
                },
                analysisData: {
                    patientInfo,
                    evaluation
                },
                customFields: data
            }

            if (id && id !== 'new') {
                await api.put(`/results/${id}`, payload)
                message.success('Đã cập nhật kết quả')
            } else {
                const res = await api.post('/results', payload)
                message.success('Đã lưu kết quả mới')
                const newId = res.data.resultId || res.data.id
                navigate(`/results/${newId}/edit`)
            }
        } catch (err) {
            message.error('Lỗi khi lưu: ' + (err.response?.data?.error || err.message))
        } finally {
            setSaving(false)
        }
    }

    const handlePreview = () => {
        if (id && id !== 'new') {
            navigate(`/results/${id}`)
        } else {
            message.info('Vui lòng lưu trước khi xem PDF')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Spin size="large" />
            </div>
        )
    }

    const tabItems = [
        {
            key: '1',
            label: <span><HeartOutlined /> Tổng quan</span>,
            children: (
                <div className="space-y-6">
                    {/* Patient Info */}
                    <Card title="👤 Thông tin bệnh nhân & Ngày xét nghiệm" size="small">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Chọn bệnh nhân" required>
                                    <Select
                                        value={selectedPatientId}
                                        onChange={handlePatientChange}
                                        placeholder="-- Chọn bệnh nhân --"
                                        showSearch
                                        optionFilterProp="label"
                                        className="w-full"
                                        options={patients.map(p => ({
                                            value: p.id,
                                            label: `${p.fullName} (${p.birthYear || 'N/A'}) - ${p.gender === 'male' ? 'Nam' : 'Nữ'}`
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Ngày xét nghiệm" required>
                                    <DatePicker
                                        value={testDate}
                                        onChange={setTestDate}
                                        format="DD/MM/YYYY"
                                        className="w-full"
                                        placeholder="Chọn ngày"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label="Mã hồ sơ">
                                    <Input
                                        value={patientInfo.code}
                                        onChange={(e) => setPatientInfo({ ...patientInfo, code: e.target.value })}
                                        placeholder="000001"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item label="Họ và tên (hiển thị trên PDF)">
                                    <Input
                                        value={patientInfo.name}
                                        onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Năm sinh">
                                    <InputNumber
                                        value={patientInfo.birthYear}
                                        onChange={(v) => setPatientInfo({ ...patientInfo, birthYear: v })}
                                        placeholder="1990"
                                        min={1900}
                                        max={2030}
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* Health Score */}
                    <Card title="📊 Điểm sức khỏe AI" size="small">
                        <HealthScoreInput value={healthScore} onChange={handleHealthScoreChange} />
                    </Card>

                    {/* Bio Age */}
                    <Card title="🧬 Tuổi sinh học" size="small">
                        <BioAgeInput value={bioAge} onChange={handleBioAgeChange} />
                    </Card>

                    {/* Organ Summary */}
                    <Card title="🏥 Tóm tắt hệ cơ quan" size="small">
                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium mb-2">❤️ Tim mạch</label>
                                <OrganSummaryInput
                                    value={organSummary.cardiovascular}
                                    onChange={(v) => setOrganSummary({ ...organSummary, cardiovascular: v })}
                                />
                            </div>
                            <Divider />
                            <div>
                                <label className="block font-medium mb-2">🫁 Gan mật</label>
                                <OrganSummaryInput
                                    value={organSummary.liver}
                                    onChange={(v) => setOrganSummary({ ...organSummary, liver: v })}
                                />
                            </div>
                            <Divider />
                            <div>
                                <label className="block font-medium mb-2">🔬 Thận tiết niệu</label>
                                <OrganSummaryInput
                                    value={organSummary.kidney}
                                    onChange={(v) => setOrganSummary({ ...organSummary, kidney: v })}
                                />
                            </div>
                            <Divider />
                            <div>
                                <label className="block font-medium mb-2">🩸 Huyết học</label>
                                <OrganSummaryInput
                                    value={organSummary.blood}
                                    onChange={(v) => setOrganSummary({ ...organSummary, blood: v })}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            )
        },
        {
            key: '2',
            label: <span><ExperimentOutlined /> Chỉ số rủi ro</span>,
            children: (
                <div className="space-y-6">
                    {/* Cardiovascular Risk */}
                    <Card title="💔 Tiên lượng đột quỵ & tim mạch (theo mẫu PDF)" size="small">
                        <div className="space-y-5">
                            {[
                                { key: 'castelli1', label: 'Castelli I' },
                                { key: 'castelli2', label: 'Castelli II' },
                                { key: 'tygIndex', label: 'TyG Index' },
                                { key: 'aip', label: 'AIP' }
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <label className="font-medium">{label}</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                size="small"
                                                value={cardiovascularRisk[key]?.value || ''}
                                                onChange={(e) => setCardiovascularRisk({
                                                    ...cardiovascularRisk,
                                                    [key]: { ...cardiovascularRisk[key], value: e.target.value }
                                                })}
                                                placeholder="Nhập giá trị (vd: 1,43)"
                                                style={{ width: 160 }}
                                            />
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-500">Màu:</span>
                                                <ColorPicker
                                                    size="small"
                                                    value={cardiovascularRisk[key]?.valueColor || '#111827'}
                                                    onChange={(c) => setCardiovascularRisk({
                                                        ...cardiovascularRisk,
                                                        [key]: { ...cardiovascularRisk[key], valueColor: c.toHexString() }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <FiveLevelBarInput
                                        value={cardiovascularRisk[key]?.position || 3}
                                        onChange={(pos) => setCardiovascularRisk({
                                            ...cardiovascularRisk,
                                            [key]: { ...cardiovascularRisk[key], position: pos }
                                        })}
                                    />
                                </div>
                            ))}

                            <Divider className="my-2" />

                            <div>
                                <label className="block font-medium mb-2">Đánh giá (copy/paste)</label>
                                <Input.TextArea
                                    value={cardiovascularRisk.comment || ''}
                                    onChange={(e) => setCardiovascularRisk({ ...cardiovascularRisk, comment: e.target.value })}
                                    placeholder="Dán đoạn đánh giá của mục 4... Dùng **text** để in đậm"
                                    rows={4}
                                    className="font-mono"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Liver Fibrosis */}
                    <Card title="🫁 Tầm soát xơ hóa gan (theo mẫu PDF)" size="small">
                        <div className="space-y-5">
                            {[
                                { key: 'fib4', label: 'FIB-4' },
                                { key: 'apri', label: 'APRI' },
                                { key: 'deRitis', label: 'De Ritis' }
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <label className="font-medium">{label}</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                size="small"
                                                value={liverFibrosis[key]?.value || ''}
                                                onChange={(e) => setLiverFibrosis({
                                                    ...liverFibrosis,
                                                    [key]: { ...liverFibrosis[key], value: e.target.value }
                                                })}
                                                placeholder="Nhập giá trị (vd: 0,41)"
                                                style={{ width: 160 }}
                                            />
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-500">Màu:</span>
                                                <ColorPicker
                                                    size="small"
                                                    value={liverFibrosis[key]?.valueColor || '#111827'}
                                                    onChange={(c) => setLiverFibrosis({
                                                        ...liverFibrosis,
                                                        [key]: { ...liverFibrosis[key], valueColor: c.toHexString() }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <FiveLevelBarInput
                                        value={liverFibrosis[key]?.position || 3}
                                        onChange={(pos) => setLiverFibrosis({
                                            ...liverFibrosis,
                                            [key]: { ...liverFibrosis[key], position: pos }
                                        })}
                                    />
                                </div>
                            ))}

                            <Divider className="my-2" />

                            <div>
                                <label className="block font-medium mb-2">Đánh giá (copy/paste)</label>
                                <Input.TextArea
                                    value={liverFibrosis.comment || ''}
                                    onChange={(e) => setLiverFibrosis({ ...liverFibrosis, comment: e.target.value })}
                                    placeholder="Dán đoạn đánh giá của mục 5... Dùng **text** để in đậm"
                                    rows={4}
                                    className="font-mono"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Inflammation */}
                    <Card title="🔥 Sức đề kháng & viêm (theo mẫu PDF)" size="small">
                        <div className="space-y-5">
                            {[
                                { key: 'sii', label: 'SII' },
                                { key: 'glr', label: 'GLR' },
                                { key: 'plr', label: 'PLR' },
                                { key: 'lmr', label: 'LMR' }
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <label className="font-medium">{label}</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                size="small"
                                                value={inflammation[key]?.value || ''}
                                                onChange={(e) => setInflammation({
                                                    ...inflammation,
                                                    [key]: { ...inflammation[key], value: e.target.value }
                                                })}
                                                placeholder="Nhập giá trị (vd: 448)"
                                                style={{ width: 160 }}
                                            />
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-500">Màu:</span>
                                                <ColorPicker
                                                    size="small"
                                                    value={inflammation[key]?.valueColor || '#111827'}
                                                    onChange={(c) => setInflammation({
                                                        ...inflammation,
                                                        [key]: { ...inflammation[key], valueColor: c.toHexString() }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <FiveLevelBarInput
                                        value={inflammation[key]?.position || 3}
                                        onChange={(pos) => setInflammation({
                                            ...inflammation,
                                            [key]: { ...inflammation[key], position: pos }
                                        })}
                                    />
                                </div>
                            ))}

                            <Divider className="my-2" />

                            <div>
                                <label className="block font-medium mb-2">Đánh giá (copy/paste)</label>
                                <Input.TextArea
                                    value={inflammation.comment || ''}
                                    onChange={(e) => setInflammation({ ...inflammation, comment: e.target.value })}
                                    placeholder="Dán đoạn đánh giá của mục 6... Dùng **text** để in đậm"
                                    rows={4}
                                    className="font-mono"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            )
        },
        {
            key: 'raw',
            label: <span><FileTextOutlined /> Dữ liệu gốc</span>,
            children: (
                <div className="space-y-6">
                    <Card title="📄 Nhập tất cả chỉ số từ file mẫu (copy/paste)" size="small">
                        <RawMetricsInput value={rawMetrics} onChange={handleRawMetricsChange} />
                    </Card>
                </div>
            )
        },
        {
            key: '3',
            label: <span><MedicineBoxOutlined /> Xét nghiệm</span>,
            children: (
                <div className="space-y-6">
                    {/* Biochemistry */}
                    <Card title="🧪 Sinh hóa máu" size="small">
                        <BiochemistryInput value={biochemistry} onChange={setBiochemistry} />
                    </Card>

                    {/* Urinalysis */}
                    <Card title="💧 Phân tích nước tiểu" size="small">
                        <UrinalysisInput value={urinalysis} onChange={setUrinalysis} />
                    </Card>

                    {/* Thalassemia */}
                    <Card title="🩸 Tầm soát Thalassemia" size="small">
                        <ThalassemiaInput value={thalassemia} onChange={setThalassemia} />
                    </Card>
                </div>
            )
        },
        {
            key: '4',
            label: <span><FileTextOutlined /> Đánh giá</span>,
            children: (
                <div className="space-y-6">
                    {/* Evaluation */}
                    <Card title="📝 Đánh giá kết quả" size="small">
                        <EvaluationInput value={evaluation} onChange={setEvaluation} />
                    </Card>

                    {/* Signature */}
                    <Card title="✍️ Chữ ký" size="small">
                        <SignatureInput value={signature} onChange={setSignature} />
                    </Card>
                </div>
            )
        }
    ]

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/results')}
                    >
                        Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {id && id !== 'new' ? 'Chỉnh sửa kết quả' : 'Tạo kết quả mới'}
                    </h1>
                    {id && id !== 'new' && (
                        <Select
                            value={status}
                            onChange={setStatus}
                            style={{ width: 140 }}
                            options={[
                                { value: 'draft', label: '✏️ Nháp' },
                                { value: 'completed', label: '✅ Hoàn thành' }
                            ]}
                        />
                    )}
                </div>

                <Space>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadExcelTemplate}
                    >
                        Tải mẫu Excel
                    </Button>

                    <Upload
                        accept=".xlsx,.xls"
                        showUploadList={false}
                        beforeUpload={handleImportExcel}
                    >
                        <Button icon={<UploadOutlined />}>Nhập từ Excel</Button>
                    </Upload>

                    <Button
                        icon={<EyeOutlined />}
                        onClick={handlePreview}
                        disabled={!id || id === 'new'}
                    >
                        Xem PDF
                    </Button>
                    {status === 'draft' && id && id !== 'new' && (
                        <Button
                            icon={<CheckCircleOutlined />}
                            onClick={() => { setStatus('completed'); handleSave() }}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
                        >
                            Hoàn thành
                        </Button>
                    )}
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={saving}
                    >
                        Lưu
                    </Button>
                </Space>
            </div>

            {/* Form Tabs */}
            <Tabs
                defaultActiveKey="1"
                items={tabItems}
                type="card"
                size="large"
            />
        </div>
    )
}

export default ResultFormPage
