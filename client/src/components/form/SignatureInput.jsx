import { Input, DatePicker, Space } from 'antd'
import dayjs from 'dayjs'

// Signature section input
function SignatureInput({ value = {}, onChange }) {
    const handleChange = (field, val) => {
        onChange?.({ ...value, [field]: val })
    }

    const handleDateChange = (date) => {
        if (date) {
            onChange?.({
                ...value,
                day: date.date(),
                month: date.month() + 1,
                year: date.year()
            })
        }
    }

    const currentDate = value.day && value.month && value.year
        ? dayjs(`${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`)
        : null

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa điểm
                    </label>
                    <Input
                        value={value.location || ''}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="TP. Hồ Chí Minh"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày ký
                    </label>
                    <DatePicker
                        value={currentDate}
                        onChange={handleDateChange}
                        format="DD/MM/YYYY"
                        className="w-full"
                        placeholder="Chọn ngày"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người đánh giá kết quả
                </label>
                <Input
                    value={value.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="BS. Nguyễn Văn A"
                />
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-4 rounded-lg text-right">
                <p className="text-gray-600 text-sm">
                    {value.location || 'TP. Hồ Chí Minh'}, ngày {value.day || '__'} tháng {value.month || '__'} năm {value.year || '____'}
                </p>
                <p className="font-semibold text-sm mt-2">Người đánh giá kết quả</p>
                <p className="text-blue-700 font-bold mt-4">{value.name || '_______________'}</p>
            </div>
        </div>
    )
}

export default SignatureInput
