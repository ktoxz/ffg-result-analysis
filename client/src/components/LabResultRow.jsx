function LabResultRow({ name, value, unit, reference, color }) {
    return (
        <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-b-0 items-center text-sm">
            <div className="col-span-3 font-medium">{name}</div>
            <div className="col-span-2 font-bold">{value}</div>
            <div className="col-span-2 text-gray-500">{unit}</div>
            <div className="col-span-2 text-gray-500">{reference}</div>
            <div className="col-span-3">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full"
                        style={{
                            width: '60%',
                            backgroundColor: color || '#52c41a'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default LabResultRow
