// Organ summary bar - FGG template style with gradient
function OrganSummaryBar({ position = 50 }) {
    return (
        <div className="relative h-5 rounded-full overflow-hidden">
            {/* Background gradient bar */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to right, #ef4444 0%, #f97316 20%, #facc15 40%, #84cc16 60%, #22c55e 80%, #16a34a 100%)'
                }}
            />

            {/* Position marker - white triangle pointing down */}
            <div
                className="absolute top-0 -translate-x-1/2"
                style={{ left: `${Math.min(Math.max(position, 5), 95)}%` }}
            >
                <div
                    className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-white"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                />
            </div>
        </div>
    )
}

export default OrganSummaryBar
