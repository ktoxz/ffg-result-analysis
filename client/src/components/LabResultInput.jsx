import { Input } from 'antd'

function LabResultInput({ name, data, onChange }) {
    return (
        <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
            <div className="w-40 font-medium text-sm">{name}</div>
            <Input
                placeholder="Giá trị"
                value={data.value || ''}
                onChange={(e) => onChange('value', e.target.value)}
                style={{ width: 100 }}
                size="small"
            />
            <Input
                placeholder="Đơn vị"
                value={data.unit || ''}
                onChange={(e) => onChange('unit', e.target.value)}
                style={{ width: 100 }}
                size="small"
            />
            <Input
                placeholder="Tham chiếu"
                value={data.ref || ''}
                onChange={(e) => onChange('ref', e.target.value)}
                style={{ width: 120 }}
                size="small"
            />
            <input
                type="color"
                value={data.color || '#00aa00'}
                onChange={(e) => onChange('color', e.target.value)}
                className="w-8 h-7 cursor-pointer rounded border border-gray-300"
                title="Chọn màu thanh"
            />
        </div>
    )
}

export default LabResultInput
