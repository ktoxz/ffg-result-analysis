import { InputNumber, Slider, Input, Space, Select } from 'antd'

function HealthScoreInput({ value = { score: 50, rating: '', comment: '' }, onChange }) {
    const score = value.score || 50

    const handleScoreChange = (newScore) => {
        // Preserve rating if user already set it; otherwise suggest based on score.
        const nextRating = value.rating ? value.rating : getRatingFromScore(newScore)
        onChange?.({ ...value, score: newScore, rating: nextRating })
    }

    const getRatingFromScore = (s) => {
        // 8-level scale (template-friendly)
        if (s >= 97) return 'Tuyệt vời'
        if (s >= 90) return 'Rất tốt'
        if (s >= 80) return 'Tốt'
        if (s >= 70) return 'Khá - tốt'
        if (s >= 60) return 'Khá'
        if (s >= 50) return 'Trung bình'
        if (s >= 40) return 'Trung bình - kém'
        return 'Kém'
    }

    const handleCommentChange = (e) => {
        onChange?.({ ...value, comment: e.target.value })
    }

    const handleRatingChange = (r) => {
        onChange?.({ ...value, rating: r })
    }

    // Calculate needle rotation for preview
    const rotation = -90 + (score / 100) * 180

    return (
        <div className="space-y-4">
            {/* Mini gauge preview */}
            <div className="flex items-center gap-6">
                <svg width="120" height="70" viewBox="0 0 220 130">
                    <defs>
                        <linearGradient id="miniGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#e74c3c" />
                            <stop offset="25%" stopColor="#f39c12" />
                            <stop offset="50%" stopColor="#f1c40f" />
                            <stop offset="75%" stopColor="#2ecc71" />
                            <stop offset="100%" stopColor="#27ae60" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M 20 110 A 90 90 0 0 1 200 110"
                        fill="none"
                        stroke="url(#miniGaugeGradient)"
                        strokeWidth="20"
                        strokeLinecap="round"
                    />
                    <circle cx="110" cy="110" r="6" fill="#333" />
                    <g transform={`rotate(${rotation}, 110, 110)`}>
                        <polygon points="110,40 106,110 114,110" fill="#333" />
                    </g>
                    <circle cx="110" cy="110" r="4" fill="#fff" stroke="#333" strokeWidth="2" />
                </svg>

                <div className="flex-1">
                    <Space direction="vertical" className="w-full">
                        <div className="flex items-center gap-4">
                            <Slider
                                min={0}
                                max={100}
                                value={score}
                                onChange={handleScoreChange}
                                style={{ width: 200 }}
                                trackStyle={{ backgroundColor: getColorForScore(score) }}
                            />
                            <InputNumber
                                min={0}
                                max={100}
                                value={score}
                                onChange={handleScoreChange}
                                size="small"
                                style={{ width: 70 }}
                            />
                        </div>
                        <div className="text-sm">
                            Điểm: <span className="font-bold text-blue-600">{score}/100</span>
                            <span className="mx-2">•</span>
                            Đánh giá: <span className="font-semibold">{value.rating || getRatingFromScore(score)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Chọn đánh giá:</span>
                            <Select
                                size="small"
                                value={value.rating || getRatingFromScore(score)}
                                onChange={handleRatingChange}
                                style={{ width: 180 }}
                                options={[
                                    { value: 'Kém', label: 'Kém' },
                                    { value: 'Trung bình - kém', label: 'Trung bình - kém' },
                                    { value: 'Trung bình', label: 'Trung bình' },
                                    { value: 'Khá', label: 'Khá' },
                                    { value: 'Khá - tốt', label: 'Khá - tốt' },
                                    { value: 'Tốt', label: 'Tốt' },
                                    { value: 'Rất tốt', label: 'Rất tốt' },
                                    { value: 'Tuyệt vời', label: 'Tuyệt vời' },
                                ]}
                            />
                        </div>
                    </Space>
                </div>
            </div>

            {/* Comment textarea */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhận xét điểm sức khỏe
                </label>
                <Input.TextArea
                    value={value.comment || ''}
                    onChange={handleCommentChange}
                    placeholder="Nhập nhận xét về điểm sức khỏe của bệnh nhân..."
                    rows={3}
                />
            </div>
        </div>
    )
}

function getColorForScore(score) {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#84cc16'
    if (score >= 40) return '#eab308'
    if (score >= 20) return '#f97316'
    return '#ef4444'
}

export default HealthScoreInput