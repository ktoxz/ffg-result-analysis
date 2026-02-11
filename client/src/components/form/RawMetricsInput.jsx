import { Collapse, Input, Row, Col, Divider, Select } from 'antd'

const Field = ({ label, value, onChange, placeholder, status, help, disabled }) => (
    <div>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <Input
            size="small"
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || ''}
            status={status}
            disabled={disabled}
        />
        {help ? <div className="text-xs text-red-600 mt-1">{help}</div> : null}
    </div>
)

const group = (title, fields) => ({ key: title, label: title, children: fields })

function RawMetricsInput({ value = {}, onChange }) {
    const parseNumber = (raw) => {
        if (raw === null || raw === undefined) return null
        const s = String(raw).trim()
        if (!s) return null
        const n = parseFloat(s.replace(',', '.'))
        return Number.isFinite(n) ? n : null
    }

    const normalizeGender = (raw) => {
        const s = String(raw || '').trim().toLowerCase()
        if (!s) return ''
        if (s === 'male' || s.includes('nam')) return 'male'
        if (s === 'female' || s.includes('nữ') || s.includes('nu')) return 'female'
        return ''
    }

    const setField = (key, val) => {
        onChange?.({ ...value, [key]: val })
    }

    const heightCm = parseNumber(value.heightCm)
    const weightKg = parseNumber(value.weightKg)
    const age = parseNumber(value.age)
    const genderNorm = normalizeGender(value.gender)

    const bmi = (() => {
        if (!heightCm || !weightKg) return null
        if (heightCm <= 0 || weightKg <= 0) return null
        const hM = heightCm / 100
        const v = weightKg / (hM * hM)
        return Number.isFinite(v) ? v : null
    })()

    const heightErr = value.heightCm && heightCm === null
        ? 'Chiều cao phải là số'
        : heightCm !== null && (heightCm < 50 || heightCm > 250)
            ? 'Chiều cao nên trong khoảng 50-250 cm'
            : ''
    const weightErr = value.weightKg && weightKg === null
        ? 'Cân nặng phải là số'
        : weightKg !== null && (weightKg < 10 || weightKg > 300)
            ? 'Cân nặng nên trong khoảng 10-300 kg'
            : ''
    const ageErr = value.age && age === null
        ? 'Tuổi phải là số'
        : age !== null && (age < 0 || age > 120)
            ? 'Tuổi nên trong khoảng 0-120'
            : ''

    const items = [
        group('👤 Nhân trắc & thông tin cơ bản', (
            <div>
                <Row gutter={[12, 12]}>
                    <Col span={12}>
                        <Field
                            label="Chiều cao (cm)"
                            value={value.heightCm}
                            onChange={(v) => setField('heightCm', v)}
                            placeholder="153"
                            status={heightErr ? 'error' : undefined}
                            help={heightErr}
                        />
                    </Col>
                    <Col span={12}>
                        <Field
                            label="Cân nặng (kg)"
                            value={value.weightKg}
                            onChange={(v) => setField('weightKg', v)}
                            placeholder="52"
                            status={weightErr ? 'error' : undefined}
                            help={weightErr}
                        />
                    </Col>
                    <Col span={12}>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Giới tính</div>
                            <Select
                                size="small"
                                value={genderNorm || undefined}
                                onChange={(v) => setField('gender', v)}
                                placeholder="Chọn"
                                className="w-full"
                                options={[
                                    { label: 'Nam', value: 'male' },
                                    { label: 'Nữ', value: 'female' }
                                ]}
                                allowClear
                            />
                        </div>
                    </Col>
                    <Col span={12}>
                        <Field
                            label="Tuổi (tự tính)"
                            value={value.age}
                            onChange={(v) => setField('age', v)}
                            placeholder="Tự tính từ năm sinh"
                            status={ageErr ? 'error' : undefined}
                            help={ageErr}
                            disabled
                        />
                    </Col>

                    <Col span={12}>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">BMI (tự tính)</div>
                            <Input
                                size="small"
                                value={bmi === null ? '' : bmi.toFixed(2)}
                                placeholder="Nhập chiều cao & cân nặng"
                                disabled
                            />
                            <div className="text-xs text-gray-400 mt-1">
                                BMI chỉ hiển thị để tham khảo, không đưa vào PDF.
                            </div>
                        </div>
                    </Col>
                    <Col span={12}><Field label="BSA" value={value.bsa} onChange={(v) => setField('bsa', v)} placeholder="1,5" /></Col>
                </Row>
            </div>
        )),

        group('🩸 Huyết học (CBC) & chỉ số liên quan', (
            <div>
                <Row gutter={[12, 12]}>
                    <Col span={12}><Field label="WBC" value={value.wbc} onChange={(v) => setField('wbc', v)} placeholder="7,60" /></Col>
                    <Col span={12}><Field label="RBC" value={value.rbc} onChange={(v) => setField('rbc', v)} placeholder="4,11" /></Col>
                    <Col span={12}><Field label="HGB" value={value.hgb} onChange={(v) => setField('hgb', v)} placeholder="122,00" /></Col>
                    <Col span={12}><Field label="HCT" value={value.hct} onChange={(v) => setField('hct', v)} placeholder="36,50" /></Col>
                    <Col span={12}><Field label="MCV" value={value.mcv} onChange={(v) => setField('mcv', v)} placeholder="89,00" /></Col>
                    <Col span={12}><Field label="MCH" value={value.mch} onChange={(v) => setField('mch', v)} placeholder="29,80" /></Col>
                    <Col span={12}><Field label="MCHC" value={value.mchc} onChange={(v) => setField('mchc', v)} placeholder="335,00" /></Col>
                    <Col span={12}><Field label="RDW-CV" value={value.rdwCv} onChange={(v) => setField('rdwCv', v)} placeholder="15,40" /></Col>
                    <Col span={12}><Field label="PLT" value={value.plt} onChange={(v) => setField('plt', v)} placeholder="326,00" /></Col>
                    <Col span={12}><Field label="MPV" value={value.mpv} onChange={(v) => setField('mpv', v)} placeholder="9,00" /></Col>
                    <Col span={12}><Field label="PDW" value={value.pdw} onChange={(v) => setField('pdw', v)} placeholder="17,20" /></Col>
                    <Col span={12}><Field label="PCT" value={value.pct} onChange={(v) => setField('pct', v)} placeholder="0,292" /></Col>
                </Row>

                <Divider className="my-3" />

                <Row gutter={[12, 12]}>
                    <Col span={8}><Field label="LYM#" value={value.lymAbs} onChange={(v) => setField('lymAbs', v)} placeholder="2,50" /></Col>
                    <Col span={8}><Field label="MID#" value={value.midAbs} onChange={(v) => setField('midAbs', v)} placeholder="0,20" /></Col>
                    <Col span={8}><Field label="GRAN#" value={value.granAbs} onChange={(v) => setField('granAbs', v)} placeholder="4,82" /></Col>
                    <Col span={8}><Field label="LYM%" value={value.lymPct} onChange={(v) => setField('lymPct', v)} placeholder="33,30" /></Col>
                    <Col span={8}><Field label="MID%" value={value.midPct} onChange={(v) => setField('midPct', v)} placeholder="3,30" /></Col>
                    <Col span={8}><Field label="GRAN%" value={value.granPct} onChange={(v) => setField('granPct', v)} placeholder="63,40" /></Col>
                </Row>

                <Divider className="my-3" />

                <Row gutter={[12, 12]}>
                    <Col span={6}><Field label="GLR" value={value.glr} onChange={(v) => setField('glr', v)} placeholder="1,93" /></Col>
                    <Col span={6}><Field label="PLR" value={value.plr} onChange={(v) => setField('plr', v)} placeholder="130,40" /></Col>
                    <Col span={6}><Field label="SII" value={value.sii} onChange={(v) => setField('sii', v)} placeholder="628,32" /></Col>
                    <Col span={6}><Field label="LMR" value={value.lmr} onChange={(v) => setField('lmr', v)} placeholder="0,08" /></Col>
                    <Col span={6}><Field label="EMR" value={value.emr} onChange={(v) => setField('emr', v)} placeholder="1,20" /></Col>
                </Row>
            </div>
        )),

        group('🧪 Sinh hóa & mỡ máu', (
            <div>
                <Row gutter={[12, 12]}>
                    <Col span={8}><Field label="Glucose" value={value.glucose} onChange={(v) => setField('glucose', v)} placeholder="5,49" /></Col>
                    <Col span={8}><Field label="Cholesterol" value={value.cholesterol} onChange={(v) => setField('cholesterol', v)} placeholder="6,99" /></Col>
                    <Col span={8}><Field label="Triglyceride" value={value.triglyceride} onChange={(v) => setField('triglyceride', v)} placeholder="1,40" /></Col>
                    <Col span={8}><Field label="Non-HDL" value={value.nonHdl} onChange={(v) => setField('nonHdl', v)} placeholder="1,844844" /></Col>
                    <Col span={8}><Field label="HDL" value={value.hdl} onChange={(v) => setField('hdl', v)} placeholder="5,143156" /></Col>
                    <Col span={8}><Field label="LDL" value={value.ldl} onChange={(v) => setField('ldl', v)} placeholder="1,21" /></Col>
                    <Col span={8}><Field label="VLDL" value={value.vldl} onChange={(v) => setField('vldl', v)} placeholder="0,636364" /></Col>
                </Row>

                <Divider className="my-3" />

                <Row gutter={[12, 12]}>
                    <Col span={6}><Field label="Castelli I" value={value.castelli1} onChange={(v) => setField('castelli1', v)} placeholder="1,358699" /></Col>
                    <Col span={6}><Field label="Castelli II" value={value.castelli2} onChange={(v) => setField('castelli2', v)} placeholder="0,234969" /></Col>
                    <Col span={6}><Field label="AIP" value={value.aip} onChange={(v) => setField('aip', v)} placeholder="-0,5651" /></Col>
                    <Col span={6}><Field label="TyG Index" value={value.tygIndex} onChange={(v) => setField('tygIndex', v)} placeholder="8,719628" /></Col>
                </Row>
            </div>
        )),

        group('🫁 Gan / thận & chỉ số xơ hóa', (
            <div>
                <Row gutter={[12, 12]}>
                    <Col span={6}><Field label="AST" value={value.ast} onChange={(v) => setField('ast', v)} placeholder="26,00" /></Col>
                    <Col span={6}><Field label="ALT" value={value.alt} onChange={(v) => setField('alt', v)} placeholder="31,10" /></Col>
                    <Col span={6}><Field label="De Ritis" value={value.deRitis} onChange={(v) => setField('deRitis', v)} placeholder="0,836013" /></Col>
                    <Col span={6}><Field label="FIB-4" value={value.fib4} onChange={(v) => setField('fib4', v)} placeholder="0,600655" /></Col>
                    <Col span={6}><Field label="APRI" value={value.apri} onChange={(v) => setField('apri', v)} placeholder="0,199387" /></Col>
                    <Col span={6}><Field label="Urea" value={value.urea} onChange={(v) => setField('urea', v)} placeholder="5,80" /></Col>
                    <Col span={6}><Field label="Creatinine" value={value.creatinine} onChange={(v) => setField('creatinine', v)} placeholder="78,40" /></Col>
                    <Col span={6}><Field label="BUN" value={value.bun} onChange={(v) => setField('bun', v)} placeholder="16,24" /></Col>
                    <Col span={8}><Field label="Ratio Urea/Cre" value={value.ratioUreaCre} onChange={(v) => setField('ratioUreaCre', v)} placeholder="73,97959" /></Col>
                    <Col span={8}><Field label="eGFR" value={value.egfr} onChange={(v) => setField('egfr', v)} placeholder="82,32412" /></Col>
                    <Col span={8}><Field label="eCrCl" value={value.ecrcl} onChange={(v) => setField('ecrcl', v)} placeholder="67,87469" /></Col>
                </Row>
            </div>
        )),

        group('🧬 Thalassemia indices & kết quả', (
            <div>
                <Row gutter={[12, 12]}>
                    <Col span={6}><Field label="Mentzer" value={value.mentzer} onChange={(v) => setField('mentzer', v)} placeholder="21,65" /></Col>
                    <Col span={6}><Field label="Green&King" value={value.greenKing} onChange={(v) => setField('greenKing', v)} placeholder="10,00" /></Col>
                    <Col span={6}><Field label="RDWI" value={value.rdwi} onChange={(v) => setField('rdwi', v)} placeholder="5.633,17" /></Col>
                    <Col span={6}><Field label="Srivastava" value={value.srivastava} onChange={(v) => setField('srivastava', v)} placeholder="7,25" /></Col>
                </Row>

                <Divider className="my-3" />

                <Row gutter={[12, 12]}>
                    <Col span={12}><Field label="Điểm sức khỏe" value={value.healthScore} onChange={(v) => setField('healthScore', v)} placeholder="86" /></Col>
                    <Col span={12}><Field label="Tuổi sinh học" value={value.bioAge} onChange={(v) => setField('bioAge', v)} placeholder="42" /></Col>
                </Row>
            </div>
        )),
    ]

    return (
        <div className="space-y-3">
            <div className="text-xs text-gray-500">
                Các trường bên dưới lưu “đúng như nhập” (dạng chuỗi) để đảm bảo in PDF không bị đổi định dạng (dấu phẩy/dấu chấm).
            </div>
            <Collapse items={items} defaultActiveKey={[items[0].key]} />
        </div>
    )
}

export default RawMetricsInput
