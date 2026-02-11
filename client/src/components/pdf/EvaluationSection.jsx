function EvalBlock({ title, iconUrl, fallbackIcon, lines = '' }) {
    const items = (lines || '').split('\n').filter(Boolean)
    return (
        <div>
            <div className="flex items-center justify-center gap-3 mb-3">
                {iconUrl ? (
                    <img
                        src={iconUrl}
                        alt={title}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = '/images/placeholder-image.svg'
                        }}
                    />
                ) : (
                    <div className="text-5xl" style={{ lineHeight: 1 }}>{fallbackIcon}</div>
                )}
                <div className="text-[18px] font-extrabold" style={{ color: '#6d28d9' }}>{title}</div>
            </div>

            {items.length ? (
                <ul className="space-y-2 pl-6">
                    {items.map((line, i) => (
                        <li key={i} className="flex items-start gap-2 text-[14px] text-gray-800">
                            <span className="text-gray-400">•</span>
                            <span dangerouslySetInnerHTML={{ __html: formatBoldText(line) }} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400 italic text-sm text-center">Không có ghi chú</p>
            )}
        </div>
    )
}

function EvaluationSection({ negatives = '', positives = '', general = '', icons = {} }) {
    return (
        <div>
            <div className="space-y-8">
                <EvalBlock title="Chưa tốt" iconUrl={icons?.negatives} fallbackIcon="✖" lines={negatives} />
                <EvalBlock title="Ưu điểm" iconUrl={icons?.positives} fallbackIcon="✔" lines={positives} />
                <EvalBlock title="Đánh giá chung" iconUrl={icons?.general} fallbackIcon="💗" lines={general} />
            </div>
        </div>
    )
}

// Helper to format **bold** text
function formatBoldText(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
}

export default EvaluationSection
