import { InputNumber, Slider, Space } from 'antd'

// Input for organ summary bar (0-100 position with gradient)
const ratings = [
    { min: 0, max: 20, label: 'Rất kém', color: 'text-red-600' },
    { min: 20, max: 40, label: 'Kém', color: 'text-orange-600' },
    { min: 40, max: 60, label: 'Trung bình', color: 'text-yellow-600' },
    { min: 60, max: 80, label: 'Khá', color: 'text-lime-600' },
    { min: 80, max: 100, label: 'Tốt', color: 'text-green-600' }
]

function OrganSummaryInput({ value = { position: 50, rating: '' }, onChange }) {
    const position = value.position || 50

    const handlePositionChange = (pos) => {
        const rating = getRatingFromPosition(pos)
        onChange?.({ ...value, position: pos, rating })
    }

    const getRatingFromPosition = (pos) => {
        const found = ratings.find(r => pos >= r.min && pos < r.max)
        return found ? found.label : 'Tốt'
    }

    const currentRating = ratings.find(r => position >= r.min && (position < r.max || (r.max === 100 && position === 100)))

    return (
        <div className="space-y-3">
            {/* Visual gradient bar */}
            <div className="relative">
                <div
                    className="h-6 rounded-full"
                    style={{
                        background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)'
                    }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-lg transition-all"
                    style={{ left: `calc(${position}% - 8px)` }}
                />
            </div>

            {/* Slider + Number */}
            <Space className="w-full">
                <Slider
                    min={0}
                    max={100}
                    value={position}
                    onChange={handlePositionChange}
                    style={{ width: 200 }}
                    tooltip={{ formatter: (val) => `${val}%` }}
                />
                <InputNumber
                    min={0}
                    max={100}
                    value={position}
                    onChange={handlePositionChange}
                    size="small"
                    style={{ width: 70 }}
                    addonAfter="%"
                />
            </Space>

            {/* Current rating */}
            <div className="text-sm">
                Đánh giá: <span className={`font-semibold ${currentRating?.color || ''}`}>
                    {value.rating || currentRating?.label || '-'}
                </span>
            </div>
        </div>
    )
}

export default OrganSummaryInput
