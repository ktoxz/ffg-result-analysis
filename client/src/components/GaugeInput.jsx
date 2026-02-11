import { Input, Select, Card } from 'antd'

const colorOptions = [
    { value: 'green', label: '🟢 Xanh lá (Tốt)', color: '#52c41a' },
    { value: 'yellow', label: '🟡 Vàng (Cảnh báo)', color: '#faad14' },
    { value: 'orange', label: '🟠 Cam (Cao)', color: '#fa8c16' },
    { value: 'red', label: '🔴 Đỏ (Nguy hiểm)', color: '#f5222d' },
    { value: 'purple', label: '🟣 Tím', color: '#722ed1' }
]

function GaugeInput({ title, data, onChange }) {
    return (
        <Card size="small" className="bg-gray-50">
            <h4 className="font-bold mb-3">{title}</h4>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="0-100"
                        min={0}
                        max={100}
                        value={data.value || ''}
                        onChange={(e) => onChange('value', parseInt(e.target.value) || 0)}
                        addonAfter="%"
                        style={{ flex: 1 }}
                    />
                    <Select
                        value={data.color}
                        onChange={(value) => onChange('color', value)}
                        style={{ width: 160 }}
                        options={colorOptions}
                    />
                </div>
                <Input
                    placeholder="Mô tả (VD: Nguy cơ thấp)"
                    value={data.desc || ''}
                    onChange={(e) => onChange('desc', e.target.value)}
                />
            </div>
        </Card>
    )
}

export default GaugeInput
