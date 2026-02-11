import { InputNumber, Input, Space } from 'antd'

// Bio Age comparison input
function BioAgeInput({ value = { realAge: 0, bioAge: 0, warning: '' }, onChange }) {
    const handleChange = (field, val) => {
        onChange?.({ ...value, [field]: val })
    }

    const diff = (value.bioAge || 0) - (value.realAge || 0)

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-8">
                {/* Real Age */}
                <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">👤</span>
                    <label className="text-sm text-gray-600 mb-1">Tuổi thật</label>
                    <InputNumber
                        min={0}
                        max={150}
                        value={value.realAge || 0}
                        onChange={(v) => handleChange('realAge', v)}
                        size="large"
                        style={{ width: 100 }}
                    />
                </div>

                <span className="text-3xl text-gray-400">→</span>

                {/* Bio Age */}
                <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">🧬</span>
                    <label className="text-sm text-gray-600 mb-1">Tuổi sinh học</label>
                    <InputNumber
                        min={0}
                        max={150}
                        value={value.bioAge || 0}
                        onChange={(v) => handleChange('bioAge', v)}
                        size="large"
                        style={{ width: 100 }}
                    />
                </div>

                {/* Difference indicator */}
                <div className={`px-4 py-2 rounded-lg ${diff > 5 ? 'bg-red-100 text-red-700' :
                        diff > 0 ? 'bg-yellow-100 text-yellow-700' :
                            diff < -5 ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                    }`}>
                    <span className="font-semibold">
                        {diff > 0 ? `+${diff}` : diff} năm
                    </span>
                    <div className="text-xs">
                        {diff > 5 ? 'Già hơn nhiều' :
                            diff > 0 ? 'Già hơn' :
                                diff < -5 ? 'Trẻ hơn nhiều' :
                                    diff < 0 ? 'Trẻ hơn' : 'Bằng nhau'}
                    </div>
                </div>
            </div>

            {/* Warning text */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cảnh báo / Nhận xét
                </label>
                <Input.TextArea
                    value={value.warning || ''}
                    onChange={(e) => handleChange('warning', e.target.value)}
                    placeholder="Nhập cảnh báo hoặc nhận xét về tuổi sinh học..."
                    rows={2}
                />
            </div>
        </div>
    )
}

export default BioAgeInput
