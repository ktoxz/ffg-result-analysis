import { useEffect, useRef } from 'react'
import { Input, Button, Table, Select } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSettingsStore } from '../../stores/settingsStore'

// Urinalysis table input
function UrinalysisInput({ value = [], onChange }) {
    const urinalysisSettings = useSettingsStore((s) => s.urinalysisSettings)
    const didInitDefaultsRef = useRef(false)

    // Default urinalysis items (match screenshot order)
    const defaultItems = ['LEU', 'KET', 'NIT', 'URO', 'BIL', 'PRO', 'GLU', 'SG', 'BLD', 'pH']

    useEffect(() => {
        if (didInitDefaultsRef.current) return
        didInitDefaultsRef.current = true
        if (Array.isArray(value) && value.length > 0) return

        const now = Date.now()
        const rows = defaultItems.map((name, idx) => {
            const s = urinalysisSettings?.[name]
            return {
                id: now + idx,
                name,
                value: '',
                reference: s?.referenceText || '',
                unit: s?.unit || ''
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

            if (field === 'name') {
                const s = urinalysisSettings?.[val]
                if (s) {
                    updated.reference = s.referenceText || updated.reference
                    updated.unit = s.unit || updated.unit
                }
            }

            return updated
        })

        onChange?.(next)
    }

    const getUnitOptions = (name) => {
        const s = urinalysisSettings?.[name]
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
                    placeholder="Chọn danh mục"
                    showSearch
                    mode="combobox"
                    options={defaultItems.map((k) => ({ label: k, value: k }))}
                />
            )
        },
        {
            title: 'Kết quả',
            dataIndex: 'value',
            key: 'value',
            width: 120,
            render: (text, record) => (
                <Select
                    value={text}
                    onChange={(v) => handleChange(record.id, 'value', v)}
                    style={{ width: '100%' }}
                    placeholder="Chọn/nhập"
                    showSearch
                    mode="combobox"
                    options={[
                        { label: 'ÂM TÍNH', value: 'ÂM TÍNH' },
                        { label: 'DƯƠNG TÍNH', value: 'DƯƠNG TÍNH' },
                        { label: 'NORMAL', value: 'NORMAL' }
                    ]}
                />
            )
        },
        {
            title: 'Tham chiếu',
            dataIndex: 'reference',
            key: 'reference',
            width: 150,
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleChange(record.id, 'reference', e.target.value)}
                    placeholder="Chỉ số bình thường"
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
                    placeholder="(trống)"
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
            <div className="flex gap-2 mt-3">
                <Button
                    type="dashed"
                    onClick={handleAdd}
                    icon={<PlusOutlined />}
                    className="flex-1"
                >
                    Thêm chỉ số
                </Button>
            </div>
        </div>
    )
}

export default UrinalysisInput
