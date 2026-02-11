// Thalassemia screening box matching FGG template
function ThalassemiaBox({ data = {}, comment = '', imageUrl }) {
    const items = [
        { label: 'Mentzer', key: 'mentzer' },
        { label: 'Green & King', key: 'greenKing' },
        { label: 'RDWI', key: 'rdwi' },
        { label: 'Srivastava', key: 'srivastava' }
    ]

    const getItemValue = (key) => {
        const item = data[key]
        if (!item) return { value: '-', isAbnormal: false }
        if (typeof item === 'object') {
            return {
                value: item.value || '-',
                isAbnormal: item.isAbnormal || item.color === 'warning' || item.color === 'red'
            }
        }
        return { value: item, isAbnormal: false }
    }

    const rows = [
        ['mentzer', 'greenKing'],
        ['rdwi', 'srivastava'],
    ]

    const labelOf = (key) => items.find(i => i.key === key)?.label || key

    return (
        <div>
            {/* Top image */}
            <div className="flex justify-center mb-2">
                <div className="w-20 h-20 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                    <img
                        src={imageUrl || '/images/placeholder-image.svg'}
                        alt="thalassemia"
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = '/images/placeholder-image.svg'
                        }}
                    />
                </div>
            </div>

            {/* 2x2 table */}
            <div className="border border-gray-300 rounded overflow-hidden">
                {rows.map((pair, idx) => (
                    <div key={idx} className="grid grid-cols-2">
                        {pair.map((k) => {
                            const { value, isAbnormal } = getItemValue(k)
                            return (
                                <div
                                    key={k}
                                    className="px-4 py-3 flex items-center justify-between"
                                    style={{
                                        borderRight: k === pair[0] ? '1px solid #d1d5db' : undefined,
                                        borderTop: idx > 0 ? '1px solid #d1d5db' : undefined,
                                        background: isAbnormal ? '#fee2e2' : '#ffffff'
                                    }}
                                >
                                    <span className="text-sm font-semibold text-gray-700">{labelOf(k)}</span>
                                    <span className="text-sm font-bold text-gray-900">{value}</span>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Evaluation/comment */}
            <div className="mt-3 border border-gray-300 rounded p-3" style={{ background: '#f9fafb' }}>
                <div className="text-sm text-gray-800">
                    <span className="font-bold">Đánh giá:</span>{' '}
                    {comment ? (
                        <span dangerouslySetInnerHTML={{ __html: formatBoldText(comment) }} />
                    ) : (
                        <span className="text-gray-400 italic">Không có ghi chú</span>
                    )}
                </div>
            </div>
        </div>
    )
}

// Helper to format **bold** text
function formatBoldText(text) {
    return (text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

export default ThalassemiaBox
