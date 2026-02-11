import { Input } from 'antd'

// Evaluation section input (negatives, positives, general)
function EvaluationInput({ value = {}, onChange }) {
    const handleChange = (field, val) => {
        onChange?.({ ...value, [field]: val })
    }

    return (
        <div className="space-y-6">
            {/* Negatives */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">❌</span>
                    <label className="font-semibold text-red-600 text-lg">Chưa tốt</label>
                </div>
                <Input.TextArea
                    value={value.negatives || ''}
                    onChange={(e) => handleChange('negatives', e.target.value)}
                    placeholder="Mỗi mục một dòng. Dùng **text** để in đậm.&#10;VD: **Cholesterol cao** cần kiểm soát chế độ ăn&#10;Thiếu vitamin D, cần bổ sung"
                    rows={5}
                    className="font-mono"
                />
                <div className="text-xs text-gray-500 mt-1">
                    Mỗi dòng là một mục. Dùng **text** để in đậm.
                </div>
            </div>

            {/* Positives */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✅</span>
                    <label className="font-semibold text-green-600 text-lg">Ưu điểm</label>
                </div>
                <Input.TextArea
                    value={value.positives || ''}
                    onChange={(e) => handleChange('positives', e.target.value)}
                    placeholder="Mỗi mục một dòng. Dùng **text** để in đậm.&#10;VD: **Glucose bình thường** - kiểm soát tốt&#10;Chức năng gan ổn định"
                    rows={5}
                    className="font-mono"
                />
                <div className="text-xs text-gray-500 mt-1">
                    Mỗi dòng là một mục. Dùng **text** để in đậm.
                </div>
            </div>

            {/* General */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💡</span>
                    <label className="font-semibold text-blue-600 text-lg">Đánh giá chung</label>
                </div>
                <Input.TextArea
                    value={value.general || ''}
                    onChange={(e) => handleChange('general', e.target.value)}
                    placeholder="Nhập đánh giá tổng quan về tình trạng sức khỏe của bệnh nhân. Có thể paste từ AI..."
                    rows={6}
                />
            </div>
        </div>
    )
}

export default EvaluationInput
