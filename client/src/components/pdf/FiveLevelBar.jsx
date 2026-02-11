// 5-level color bar with marker (configurable)
const defaultLevelColors = ['#ef4444', '#f97316', '#22c55e', '#f97316', '#ef4444']

function StarMarker({
    size = 20,
    fill = '#1d4ed8',
    stroke = '#0b2a6f',
    strokeWidth = 1.5
}) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
            <path
                d="M12 2.4l2.83 6.02 6.6.58-5 4.33 1.5 6.44L12 16.9 6.07 19.8l1.5-6.44-5-4.33 6.6-.58L12 2.4z"
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
            />
        </svg>
    )
}

function FiveLevelBar({
    position = 1,
    colors = defaultLevelColors,
    height = 18,
    markerColor = '#1d4ed8',
    markerStrokeColor = '#0b2a6f',
    markerStrokeWidth = 1.5,
    markerSize = 20,
    markerImageUrl = ''
}) {
    const palette = colors?.length ? colors : defaultLevelColors
    const posNum = typeof position === 'number' ? position : parseFloat(String(position).replace(',', '.'))
    const clamped = Number.isFinite(posNum) ? Math.min(5, Math.max(1, posNum)) : 1
    // Map 1..5 to the CENTER of each of the 5 segments (so 1 => 10%, 5 => 90%).
    // This keeps integer positions consistent with the previous UI, while allowing decimals.
    const pct = (clamped - 0.5) / 5
    return (
        <div className="relative" style={{ height }}>
            <div className="flex h-full">
                {palette.map((color, index) => (
                    <div
                        key={index}
                        className="flex-1"
                        style={{
                            backgroundColor: color,
                            borderRight: index < palette.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none'
                        }}
                    />
                ))}
            </div>

            <div
                className="absolute top-1/2 drop-shadow-md"
                style={{
                    left: `${pct * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    lineHeight: 0
                }}
            >
                {markerImageUrl ? (
                    <img
                        src={markerImageUrl}
                        alt="marker"
                        style={{ width: markerSize, height: markerSize, objectFit: 'contain' }}
                        onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = ''
                        }}
                    />
                ) : (
                    <StarMarker
                        size={markerSize}
                        fill={markerColor}
                        stroke={markerStrokeColor}
                        strokeWidth={markerStrokeWidth}
                    />
                )}
            </div>
        </div>
    )
}

export default FiveLevelBar
