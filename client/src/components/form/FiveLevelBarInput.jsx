import { InputNumber, Slider, Space } from 'antd'
import { useSettingsStore } from '../../stores/settingsStore'

// Input component for 5-level bar with star position
const labels = ['Rất tốt', 'Tốt', 'Trung bình', 'Kém', 'Rất kém']

function FiveLevelBarInput({ value = 3, onChange }) {
    const configuredColors = useSettingsStore((s) => s.pdfAssets?.fiveLevelBar?.colors)
    const colors = (Array.isArray(configuredColors) && configuredColors.length === 5)
        ? configuredColors
        : ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']

    const handleChange = (val) => {
        const n = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'))
        if (!Number.isFinite(n)) return
        const clamped = Math.min(5, Math.max(1, n))
        onChange?.(clamped)
    }

    const numericValue = (() => {
        const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'))
        return Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 1
    })()

    // Same mapping as the PDF bar: 1..5 are centers of 5 equal segments.
    const markerPct = (numericValue - 0.5) / 5

    const labelIndex = Math.min(4, Math.max(0, Math.floor(numericValue - 1)))

    return (
        <div className="space-y-2">
            {/* Visual bar with clickable sections */}
            <div className="relative h-8">
                <div className="flex h-8 overflow-hidden rounded">
                    {colors.map((color, index) => (
                        <div
                            key={index}
                            onClick={() => handleChange(index + 1)}
                            className={`flex-1 cursor-pointer transition-all ${Math.floor(numericValue) === index + 1 ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                                }`}
                            style={{
                                backgroundColor: color,
                                borderRight:
                                    index < colors.length - 1 ? '1px solid rgba(255,255,255,0.35)' : 'none'
                            }}
                            title={`${index + 1} - ${labels[index]}`}
                        />
                    ))}
                </div>

                <div
                    className="absolute top-1/2"
                    style={{
                        left: `${markerPct * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        lineHeight: 0
                    }}
                >
                    <span className="text-white text-lg drop-shadow">⭐</span>
                </div>
            </div>

            {/* Slider + Number input */}
            <Space className="w-full">
                <Slider
                    min={1}
                    max={5}
                    step={0.1}
                    value={value}
                    onChange={handleChange}
                    className="flex-1"
                    style={{ width: 150 }}
                    marks={{
                        1: '1',
                        2: '2',
                        3: '3',
                        4: '4',
                        5: '5'
                    }}
                />
                <InputNumber
                    min={1}
                    max={5}
                    step={0.1}
                    value={value}
                    onChange={handleChange}
                    size="small"
                    style={{ width: 60 }}
                />
            </Space>

            {/* Label */}
            <div className="text-sm text-gray-600">
                Vị trí hiện tại: <span className="font-semibold">{numericValue.toFixed(1)}</span>{' '}
                <span className="text-gray-500">({labels[labelIndex]})</span>
            </div>
        </div>
    )
}

export default FiveLevelBarInput
