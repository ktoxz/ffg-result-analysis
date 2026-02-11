import { useEffect, useRef } from 'react'
import { Input, InputNumber, Select, Button, Table } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSettingsStore } from '../../stores/settingsStore'

// Biochemistry table input (manual: input -> PDF 1:1)
function BiochemistryInput({ value = [], onChange }) {
    const biochemistrySettings = useSettingsStore((s) => s.biochemistrySettings)
    const calculateBiochemistryStatus = useSettingsStore((s) => s.calculateBiochemistryStatus)

    const didInitDefaultsRef = useRef(false)

    const DEFAULT_BIOCHEM = ['AST', 'ALT', 'Glucose', 'Triglyceride', 'Cholesterol', 'LDL', 'Creatinine', 'Urea']

    useEffect(() => {
        if (didInitDefaultsRef.current) return
        didInitDefaultsRef.current = true
        if (Array.isArray(value) && value.length > 0) return

        const now = Date.now()
        const rows = DEFAULT_BIOCHEM.map((name, idx) => {
            const s = biochemistrySettings?.[name]
            const reference = s?.referenceText || (s?.low !== undefined && s?.high !== undefined ? `${s.low}-${s.high}` : '')
            const unit = s?.unit || ''
            return {
                id: now + idx,
                name,
                value: '',
                status: calculateBiochemistryStatus(name, ''),
                statusMode: 'auto',
                reference,
                unit
            }
        })
        onChange?.(rows)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleAdd = () => {
        const newItem = {
            id: Date.now(),
            name: '',
            value: '',
            status: 'Bình Thường',
            statusMode: 'auto',
            reference: '',
            unit: ''
        }
        onChange?.([...value, newItem])
    }

    const handleRemove = (id) => {
        onChange?.(value.filter(item => item.id !== id))
    }

    const handleChange = (id, field, val) => {
        const next = value.map((item) => {
            if (item.id !== id) return item

            const updated = { ...item, [field]: val }

            if (field === 'status') {
                updated.statusMode = 'manual'
                return updated
            }

            if (field === 'statusMode') {
                return updated
            }

            // When selecting an analyte, auto-fill reference/unit from Settings
            if (field === 'name') {
                const settings = biochemistrySettings?.[val]
                if (settings) {
                    updated.reference = settings.referenceText || updated.reference || `${settings.low}-${settings.high}`
                    updated.unit = settings.unit || updated.unit
                }
                if (updated.statusMode !== 'manual') {
                    updated.status = calculateBiochemistryStatus(val, updated.value)
                }
            }

            // When value changes, auto-calc status from thresholds
            if (field === 'value') {
                if (updated.statusMode !== 'manual') {
                    updated.status = calculateBiochemistryStatus(updated.name, val)
                }
            }

            // When unit changes, keep as-is (combobox)
            return updated
        })

        onChange?.(next)
    }

    const getUnitOptions = (name) => {
        const s = biochemistrySettings?.[name]
        const opts = (s?.unitOptions && Array.isArray(s.unitOptions) && s.unitOptions.length)
            ? s.unitOptions
            : (s?.unit ? [s.unit] : [])
        return opts.map((u) => ({ label: u, value: u }))
    }

    const columns = [
        {
            title: 'Danh mục',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            render: (text, record) => (
                <Select
                    value={text}
                    onChange={(v) => handleChange(record.id, 'name', v)}
                    style={{ width: '100%' }}
                    placeholder="Chọn chỉ số"
                    showSearch
                >
                    <Select.Option value="Glucose">Glucose</Select.Option>
                    <Select.Option value="Cholesterol">Cholesterol</Select.Option>
                    <Select.Option value="Triglyceride">Triglyceride</Select.Option>
                    <Select.Option value="HDL">HDL</Select.Option>
                    <Select.Option value="LDL">LDL</Select.Option>
                    <Select.Option value="AST">AST (SGOT)</Select.Option>
                    <Select.Option value="ALT">ALT (SGPT)</Select.Option>
                    <Select.Option value="Creatinine">Creatinine</Select.Option>
                    <Select.Option value="Urea">Urea</Select.Option>
                    <Select.Option value="Uric Acid">Uric Acid</Select.Option>
                    <Select.Option value="HbA1c">HbA1c</Select.Option>
                    <Select.Option value="CRP">CRP</Select.Option>
                </Select>
            )
        },
        {
            title: 'Kết quả',
            dataIndex: 'value',
            key: 'value',
            width: 100,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    onChange={(v) => handleChange(record.id, 'value', v)}
                    style={{ width: '100%' }}
                    step={0.1}
                />
            )
        },
        {
            title: 'Thông tin',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (text, record) => (
                <Select
                    value={text}
                    onChange={(v) => handleChange(record.id, 'status', v)}
                    style={{ width: '100%' }}
                    size="small"
                    showSearch
                    mode="combobox"
                    options={[
                        { label: 'Thấp', value: 'Thấp' },
                        { label: 'Bình Thường', value: 'Bình Thường' },
                        { label: 'Cao', value: 'Cao' }
                    ]}
                    placeholder="(tự tính)"
                />
            )
        },
        {
            title: 'Tham chiếu',
            dataIndex: 'reference',
            key: 'reference',
            width: 120,
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(record.id, 'reference', e.target.value)}
                    placeholder="VD: 3.9-6.1"
                />
            )
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unit',
            key: 'unit',
            width: 80,
            render: (text, record) => (
                <Select
                    value={text}
                    onChange={(v) => handleChange(record.id, 'unit', v)}
                    style={{ width: '100%' }}
                    placeholder="Chọn đơn vị"
                    showSearch
                    mode="combobox"
                    options={getUnitOptions(record.name)}
                />
            )
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(record.id)}
                />
            )
        }
    ]

    return (
        <div>
            <Table
                dataSource={value}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                bordered
            />
            <Button
                type="dashed"
                onClick={handleAdd}
                icon={<PlusOutlined />}
                className="mt-3 w-full"
            >
                Thêm chỉ số
            </Button>
        </div>
    )
}

export default BiochemistryInput
