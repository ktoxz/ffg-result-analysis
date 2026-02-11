const colorMap = {
    green: '#52c41a',
    yellow: '#faad14',
    orange: '#fa8c16',
    red: '#f5222d',
    purple: '#722ed1'
}

function GaugeChart({ value, color, label, desc }) {
    const colorHex = colorMap[color] || color
    const radius = 40
    const circumference = Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    return (
        <div className="text-center">
            <svg width="100" height="60" viewBox="0 0 100 60">
                {/* Background arc */}
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
                {/* Value arc */}
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke={colorHex}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
                {/* Value text */}
                <text
                    x="50"
                    y="45"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="bold"
                    fill={colorHex}
                >
                    {value}%
                </text>
            </svg>
            <div className="text-xs font-medium text-gray-700 mt-1">{label}</div>
            {desc && <div className="text-xs text-gray-500">{desc}</div>}
        </div>
    )
}

export default GaugeChart
