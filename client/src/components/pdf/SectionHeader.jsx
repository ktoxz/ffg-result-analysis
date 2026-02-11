// Section header matching FGG template - numbered sections with gradient
function SectionHeader({ number, title, color = 'blue' }) {
    const styles = {
        blue: { bg: '#1e40af', icon: '🔬' },
        green: { bg: '#15803d', icon: '🧬' },
        orange: { bg: '#c2410c', icon: '❤️' },
        purple: { bg: '#7e22ce', icon: '💊' },
        red: { bg: '#b91c1c', icon: '🩺' },
        teal: { bg: '#0d9488', icon: '🔍' }
    }

    const style = styles[color] || styles.blue

    return (
        <div
            className="flex items-center gap-3 py-2.5 px-4 rounded-md mb-4 shadow-sm"
            style={{ backgroundColor: style.bg }}
        >
            {number && (
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{number}</span>
                </div>
            )}
            <h2 className="text-white text-base font-bold tracking-wide uppercase flex-1">
                {title}
            </h2>
        </div>
    )
}

export default SectionHeader
