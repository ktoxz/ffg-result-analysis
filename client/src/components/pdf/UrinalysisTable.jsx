// Urinalysis table matching FGG template exactly
function UrinalysisTable({ data = [] }) {
    const filtered = (data || []).filter((row) => {
        const v = row?.value
        return String(v ?? '').trim() !== ''
    })

    if (!filtered || filtered.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 italic">
                Chưa có dữ liệu phân tích nước tiểu
            </div>
        )
    }

    return (
        <table className="w-full border-collapse text-sm table-fixed" style={{ lineHeight: 1.35 }}>
            <thead>
                <tr className="bg-gray-100">
                    <th
                        className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700"
                        style={{ width: '45%' }}
                    >
                        Danh Mục
                    </th>
                    <th
                        className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700"
                        style={{ width: '20%' }}
                    >
                        Kết Quả
                    </th>
                    <th
                        className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700"
                        style={{ width: '25%' }}
                    >
                        Chỉ số tham chiếu
                    </th>
                    <th
                        className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700"
                        style={{ width: '10%' }}
                    >
                        Đơn vị
                    </th>
                </tr>
            </thead>
            <tbody>
                {filtered.map((row, index) => (
                    <tr key={row.id || index}>
                        <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">
                            {row.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center font-bold text-gray-800">
                            {row.value}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-gray-600">
                            {row.reference}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-gray-600">
                            {row.unit}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default UrinalysisTable
