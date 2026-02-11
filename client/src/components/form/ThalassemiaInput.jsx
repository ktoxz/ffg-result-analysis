import { Input, InputNumber, Select, Space } from 'antd'

// Thalassemia screening input
function ThalassemiaInput({ value = {}, onChange }) {
    const items = [
        { key: 'mentzer', label: 'Mentzer' },
        { key: 'greenKing', label: 'Green & King' },
        { key: 'rdwi', label: 'RDWI' },
        { key: 'srivastava', label: 'Srivastava' }
    ]

    const handleChange = (key, field, val) => {
        onChange?.({
            ...value,
            [key]: {
                ...(value[key] || {}),
                [field]: val
            }
        })
    }

    const handleCommentChange = (e) => {
        onChange?.({ ...value, comment: e.target.value })
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {items.map(({ key, label }) => {
                    const item = value[key] || {}
                    return (
                        <div
                            key={key}
                            className={`p-4 rounded-lg border-2 ${item.color === 'warning' ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                                }`}
                        >
                            <div className="font-medium mb-2">{label}</div>
                            <Space>
                                <InputNumber
                                    value={item.value}
                                    onChange={(v) => handleChange(key, 'value', v)}
                                    placeholder="Giá trị"
                                    step={0.1}
                                    style={{ width: 100 }}
                                />
                                <Select
                                    value={item.color || 'normal'}
                                    onChange={(v) => handleChange(key, 'color', v)}
                                    style={{ width: 120 }}
                                >
                                    <Select.Option value="normal">
                                        <span className="text-gray-600">Bình thường</span>
                                    </Select.Option>
                                    <Select.Option value="warning">
                                        <span className="text-red-600">⚠️ Cảnh báo</span>
                                    </Select.Option>
                                </Select>
                            </Space>
                        </div>
                    )
                })}
            </div>

            {/* Comment */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhận xét Thalassemia
                </label>
                <Input.TextArea
                    value={value.comment || ''}
                    onChange={handleCommentChange}
                    placeholder="Nhập nhận xét về tầm soát Thalassemia..."
                    rows={2}
                />
            </div>
        </div>
    )
}

export default ThalassemiaInput
