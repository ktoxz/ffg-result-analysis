import * as XLSX from 'xlsx'

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function getByPath(obj, path) {
    const parts = String(path || '').split('.').filter(Boolean)
    let cur = obj
    for (const p of parts) {
        if (!cur || typeof cur !== 'object' || !(p in cur)) return undefined
        cur = cur[p]
    }
    return cur
}

function setByPath(obj, path, value) {
    const parts = String(path || '').split('.').filter(Boolean)
    if (!parts.length) return
    let cur = obj
    for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i]
        if (!isPlainObject(cur[p])) cur[p] = {}
        cur = cur[p]
    }
    cur[parts[parts.length - 1]] = value
}

function deepMerge(base, patch) {
    if (Array.isArray(patch)) return patch
    if (!isPlainObject(patch)) return patch

    const out = Array.isArray(base) ? [] : { ...(isPlainObject(base) ? base : {}) }
    for (const [k, v] of Object.entries(patch)) {
        const prev = isPlainObject(base) ? base[k] : undefined
        if (Array.isArray(v)) out[k] = v
        else if (isPlainObject(v)) out[k] = deepMerge(prev, v)
        else out[k] = v
    }
    return out
}

const numericPathMatchers = [
    /^patientInfo\.birthYear$/,
    /^healthScore\.score$/,
    /^bioAge\.(realAge|bioAge)$/,
    /^organSummary\.(cardiovascular|liver|kidney|blood)\.position$/,
    /^(cardiovascularRisk|liverFibrosis|inflammation)\.[a-zA-Z0-9_]+\.position$/,
    /^signature\.(day|month|year)$/,
    /^thalassemia\.(mentzer|greenKing|rdwi|srivastava)\.value$/
]

function coerceValue(path, value) {
    if (value === null || value === undefined) return ''

    const isNumericPath = numericPathMatchers.some((re) => re.test(path))
    if (!isNumericPath) return value

    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return ''
        const n = Number(trimmed.replace(',', '.'))
        return Number.isFinite(n) ? n : value
    }

    return value
}

function sheetToRows(workbook, sheetName) {
    const sheet = workbook.Sheets?.[sheetName]
    if (!sheet) return []
    return XLSX.utils.sheet_to_json(sheet, { defval: '' })
}

function normalizeLabel(label) {
    return String(label || '')
        .trim()
        .replace(/\s+/g, ' ')
}

// Human-friendly label -> internal rawMetrics key
export const RAW_METRICS_LABEL_MAP = {
    'Chiều cao': 'heightCm',
    'Cận nặng': 'weightKg',
    'Cân nặng': 'weightKg',
    'Giới tính': 'gender',
    'Tuổi': 'age',
    'BMI': 'bmi',
    'BSA': 'bsa',
    'Glucose': 'glucose',
    'WBC': 'wbc',
    'LYM#': 'lymAbs',
    'MID#': 'midAbs',
    'GRAN#': 'granAbs',
    'LYM%': 'lymPct',
    'MID%': 'midPct',
    'GRAN%': 'granPct',
    'RBC': 'rbc',
    'HGB': 'hgb',
    'HCT': 'hct',
    'MCV': 'mcv',
    'MCH': 'mch',
    'MCHC': 'mchc',
    'RDW-CV': 'rdwCv',
    'PLT': 'plt',
    'MPV': 'mpv',
    'PDW': 'pdw',
    'PCT': 'pct',
    'GLR': 'glr',
    'PLR': 'plr',
    'SII': 'sii',
    'LMR': 'lmr',
    'EMR': 'emr',
    'Mentzer': 'mentzer',
    'Green&King': 'greenKing',
    'Green & King': 'greenKing',
    'RDWI': 'rdwi',
    'Srivastava': 'srivastava',
    'Cholesterol': 'cholesterol',
    'Triglyceride': 'triglyceride',
    'Non - HDL': 'nonHdl',
    'Non-HDL': 'nonHdl',
    'HDL': 'hdl',
    'LDL': 'ldl',
    'VLDL': 'vldl',
    'Castelli I': 'castelli1',
    'Castelli II': 'castelli2',
    'AIP': 'aip',
    'TyG Index': 'tygIndex',
    'AST': 'ast',
    'ALT': 'alt',
    'De Ritis': 'deRitis',
    'FIB-4': 'fib4',
    'APRI': 'apri',
    'Urea': 'urea',
    'Creatinine': 'creatinine',
    'BUN': 'bun',
    'Ratio Urea/Cre': 'ratioUreaCre',
    'eGFR': 'egfr',
    'eCrCl': 'ecrcl',
    'Điểm Sức khỏe': 'healthScore',
    'Điểm sức khỏe': 'healthScore',
    'Tuổi Sinh học': 'bioAge',
    'Tuổi sinh học': 'bioAge'
}

const RAW_METRICS_TEMPLATE_LABELS = [
    'Chiều cao',
    'Cận nặng',
    'Giới tính',
    'Tuổi',
    'BMI',
    'BSA',
    'Glucose',
    'WBC',
    'LYM#',
    'MID#',
    'GRAN#',
    'LYM%',
    'MID%',
    'GRAN%',
    'RBC',
    'HGB',
    'HCT',
    'MCV',
    'MCH',
    'MCHC',
    'RDW-CV',
    'PLT',
    'MPV',
    'PDW',
    'PCT',
    'GLR',
    'PLR',
    'SII',
    'LMR',
    'EMR',
    'Mentzer',
    'Green&King',
    'RDWI',
    'Srivastava',
    'Cholesterol',
    'Triglyceride',
    'Non - HDL',
    'HDL',
    'LDL',
    'VLDL',
    'Castelli I',
    'Castelli II',
    'AIP',
    'TyG Index',
    'AST',
    'ALT',
    'De Ritis',
    'FIB-4',
    'APRI',
    'Urea',
    'Creatinine',
    'BUN',
    'Ratio Urea/Cre',
    'eGFR',
    'eCrCl',
    'Điểm Sức khỏe',
    'Tuổi Sinh học'
]

export function buildResultExcelTemplateBlob() {
    const wb = XLSX.utils.book_new()

    // Default template focuses on the raw metrics provided by user.
    // Intentionally does NOT include patient name / test date.
    const rawAOA = [
        ['Chỉ số', 'Giá trị'],
        ...RAW_METRICS_TEMPLATE_LABELS.map((label) => [label, ''])
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rawAOA), 'rawMetrics')

    // Provide common default rows but leave values empty.
    const bioChemRows = [
        { name: 'AST', value: '', status: '', reference: '', unit: '' },
        { name: 'ALT', value: '', status: '', reference: '', unit: '' },
        { name: 'Glucose', value: '', status: '', reference: '', unit: '' },
        { name: 'Triglyceride', value: '', status: '', reference: '', unit: '' },
        { name: 'Cholesterol', value: '', status: '', reference: '', unit: '' },
        { name: 'LDL', value: '', status: '', reference: '', unit: '' },
        { name: 'HDL', value: '', status: '', reference: '', unit: '' },
        { name: 'Creatinine', value: '', status: '', reference: '', unit: '' },
        { name: 'Urea', value: '', status: '', reference: '', unit: '' }
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bioChemRows), 'biochemistry')

    const urineRows = [
        { name: 'LEU', value: '', reference: '', unit: '' },
        { name: 'KET', value: '', reference: '', unit: '' },
        { name: 'NIT', value: '', reference: '', unit: '' },
        { name: 'URO', value: '', reference: '', unit: '' },
        { name: 'BIL', value: '', reference: '', unit: '' },
        { name: 'PRO', value: '', reference: '', unit: '' },
        { name: 'GLU', value: '', reference: '', unit: '' },
        { name: 'SG', value: '', reference: '', unit: '' },
        { name: 'BLD', value: '', reference: '', unit: '' },
        { name: 'pH', value: '', reference: '', unit: '' }
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(urineRows), 'urinalysis')

    const thalRows = [
        { name: 'Mentzer', value: '', color: '', comment: '' },
        { name: 'Green & King', value: '', color: '', comment: '' },
        { name: 'RDWI', value: '', color: '', comment: '' },
        { name: 'Srivastava', value: '', color: '', comment: '' }
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(thalRows), 'thalassemia')

    const notes = [
        { note: 'HƯỚNG DẪN:' },
        { note: '1) Sheet "rawMetrics": nhập theo đúng tên chỉ số (cột "Chỉ số") và điền giá trị ở cột "Giá trị".' },
        { note: '2) Không nhập tên BN/ngày trên file này (mặc định hệ thống không đọc các trường đó).' },
        { note: '3) Nếu cần nhập bảng, dùng sheet "biochemistry" / "urinalysis" / "thalassemia" theo cột như mẫu (có thể thêm dòng).' },
        { note: '4) Không đổi tên sheet/cột để hệ thống đọc đúng.' }
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(notes), 'notes')

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    return new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
}

export async function parseResultExcelFile(file, currentData) {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })

    const patch = {}
    let applied = 0
    let ignored = 0

    // Sheet: kv (key/value dot-path)
    const kvRows = sheetToRows(wb, 'kv')
    for (const row of kvRows) {
        const key = String(row.key || '').trim()
        if (!key) continue

        // As requested: do not import patient info by default
        if (key.startsWith('patientInfo.')) {
            ignored += 1
            continue
        }

        const currentValue = getByPath(currentData, key)
        if (typeof currentValue === 'undefined') {
            ignored += 1
            continue
        }

        const coerced = coerceValue(key, row.value)
        setByPath(patch, key, coerced)
        applied += 1
    }

    // Sheet: rawMetrics (field/value)
    const rmRows = sheetToRows(wb, 'rawMetrics')
    if (rmRows.length) {
        for (const row of rmRows) {
            // New format (human-friendly): "Chỉ số" / "Giá trị"
            const label = normalizeLabel(row['Chỉ số'] ?? row['Chi so'] ?? row.label ?? row.Label)
            const value = row['Giá trị'] ?? row['Gia tri'] ?? row.value ?? row.Value

            if (label) {
                const mapped = RAW_METRICS_LABEL_MAP[label] || RAW_METRICS_LABEL_MAP[normalizeLabel(label)]
                if (!mapped) {
                    // Unknown label
                    ignored += 1
                    continue
                }
                const exists = currentData?.rawMetrics && Object.prototype.hasOwnProperty.call(currentData.rawMetrics, mapped)
                if (!exists) {
                    ignored += 1
                    continue
                }
                setByPath(patch, `rawMetrics.${mapped}`, value ?? '')
                applied += 1
                continue
            }

            // Legacy format: field/value
            const field = String(row.field || '').trim()
            if (!field) continue
            const exists = currentData?.rawMetrics && Object.prototype.hasOwnProperty.call(currentData.rawMetrics, field)
            if (!exists) {
                ignored += 1
                continue
            }
            setByPath(patch, `rawMetrics.${field}`, row.value ?? '')
            applied += 1
        }
    }

    // Sheet: biochemistry
    const bcRows = sheetToRows(wb, 'biochemistry')
        .map((r, idx) => ({
            id: Date.now() + idx,
            name: r.name ?? '',
            value: r.value ?? '',
            status: r.status || 'Bình Thường',
            reference: r.reference ?? '',
            unit: r.unit ?? ''
        }))
        .filter((r) => String(r.name || '').trim() !== '' && String(r.value || '').trim() !== '')

    if (bcRows.length) {
        patch.biochemistry = bcRows
    }

    // Sheet: urinalysis
    const uaRows = sheetToRows(wb, 'urinalysis')
        .map((r, idx) => ({
            id: Date.now() + 1000 + idx,
            name: r.name ?? '',
            value: r.value ?? '',
            reference: r.reference ?? '',
            unit: r.unit ?? ''
        }))
        .filter((r) => String(r.name || '').trim() !== '' && String(r.value || '').trim() !== '')

    if (uaRows.length) {
        patch.urinalysis = uaRows
    }

    // Sheet: thalassemia
    const labelToKey = (label) => {
        const s = normalizeLabel(label).toLowerCase()
        if (!s) return null
        if (s === 'mentzer') return 'mentzer'
        if (s === 'green&king' || s === 'green & king' || s === 'green and king') return 'greenKing'
        if (s === 'rdwi') return 'rdwi'
        if (s === 'srivastava') return 'srivastava'
        if (s === 'comment' || s === 'nhận xét' || s === 'nhan xet') return 'comment'
        return null
    }

    const thRows = sheetToRows(wb, 'thalassemia')
    if (thRows.length) {
        const thPatch = {}

        for (const r of thRows) {
            const key = labelToKey(r.key ?? r.name ?? r.label)
            const rawValue = r.value
            const rawColor = r.color
            const rawComment = r.comment

            // Accept comment column on any row (template-friendly).
            if (rawComment !== null && rawComment !== undefined) {
                const c = String(rawComment).trim()
                if (c && !thPatch.comment) {
                    thPatch.comment = c
                    applied += 1
                }
            }

            if (!key) {
                ignored += 1
                continue
            }

            if (key === 'comment') {
                const c = String(rawComment ?? rawValue ?? '').trim()
                if (c) {
                    thPatch.comment = c
                    applied += 1
                } else {
                    ignored += 1
                }
                continue
            }

            const v = rawValue === null || rawValue === undefined ? '' : String(rawValue).trim()
            const color = rawColor === null || rawColor === undefined ? '' : String(rawColor).trim()

            // Do not create empty rows; only apply if user provided something.
            if (!v && !color) {
                ignored += 1
                continue
            }

            const nextItem = {}
            if (v) {
                const n = Number(v.replace(',', '.'))
                nextItem.value = Number.isFinite(n) ? n : v
            }
            if (color) nextItem.color = color

            thPatch[key] = nextItem
            applied += 1
        }

        if (Object.keys(thPatch).length) {
            patch.thalassemia = thPatch
        }
    }

    return {
        patch,
        meta: { applied, ignored, sheets: wb.SheetNames }
    }
}

export function applyResultExcelPatch(currentData, patch) {
    return deepMerge(currentData, patch)
}
