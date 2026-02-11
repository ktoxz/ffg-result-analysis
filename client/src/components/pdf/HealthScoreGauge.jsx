function polarToCartesian(cx, cy, r, angleDeg) {
    const a = (angleDeg * Math.PI) / 180
    return {
        x: cx + r * Math.cos(a),
        y: cy + r * Math.sin(a)
    }
}

function arcPath(cx, cy, r, startAngle, endAngle) {
    const s = polarToCartesian(cx, cy, r, startAngle)
    const e = polarToCartesian(cx, cy, r, endAngle)
    return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`
}

function arcPathEx(cx, cy, r, startAngle, endAngle, largeArcFlag, sweepFlag) {
    const s = polarToCartesian(cx, cy, r, startAngle)
    const e = polarToCartesian(cx, cy, r, endAngle)
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${e.x} ${e.y}`
}

function normalizeHexColor(color) {
    if (typeof color !== 'string') return null
    const c = color.trim()
    if (!c) return null
    if (c.startsWith('#')) {
        const hex = c.slice(1)
        if (/^[0-9a-fA-F]{3}$/.test(hex)) {
            return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase()
        }
        if (/^[0-9a-fA-F]{6}$/.test(hex)) return `#${hex}`.toLowerCase()
    }
    return null
}

function hexToRgb(hex) {
    const h = normalizeHexColor(hex)
    if (!h) return null
    const r = parseInt(h.slice(1, 3), 16)
    const g = parseInt(h.slice(3, 5), 16)
    const b = parseInt(h.slice(5, 7), 16)
    return { r, g, b }
}

function rgbToHex({ r, g, b }) {
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)))
    const to2 = (v) => clamp(v).toString(16).padStart(2, '0')
    return `#${to2(r)}${to2(g)}${to2(b)}`
}

function lerp(a, b, t) {
    return a + (b - a) * t
}

function lerpHex(a, b, t) {
    const ra = hexToRgb(a)
    const rb = hexToRgb(b)
    if (!ra || !rb) return a
    return rgbToHex({
        r: lerp(ra.r, rb.r, t),
        g: lerp(ra.g, rb.g, t),
        b: lerp(ra.b, rb.b, t)
    })
}

function resampleColors(colors, count) {
    const list = Array.isArray(colors) ? colors.map(normalizeHexColor).filter(Boolean) : []
    if (count <= 0) return []
    if (list.length === 0) return []
    if (list.length === 1) return Array.from({ length: count }, () => list[0])
    if (list.length === count) return list
    if (list.length > count) return list.slice(0, count)

    // Interpolate across provided stops
    const out = []
    for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0 : i / (count - 1)
        const pos = t * (list.length - 1)
        const idx = Math.floor(pos)
        const localT = pos - idx
        const c0 = list[idx]
        const c1 = list[Math.min(idx + 1, list.length - 1)]
        out.push(lerpHex(c0, c1, localT))
    }
    return out
}

function HealthScoreGauge({ score = 0, rating = '', config = {} }) {
    const clamped = Math.max(0, Math.min(100, Number(score) || 0))
    const arcThickness = Number(config.arcThickness || 26)
    const needleColor = config.needleColor || '#111827'

    const mode = config.mode || 'segments' // 'segments' | 'ends'
    const defaultSegmentColors8 = ['#ef4444', '#f97316', '#fb923c', '#facc15', '#a3e635', '#84cc16', '#22c55e', '#10b981']
    const segCount = Number.isFinite(Number(config.segmentCount)) ? Math.max(1, Math.floor(Number(config.segmentCount))) : 8
    const segmentColors = resampleColors(config.segmentColors, segCount)
    const effectiveColors = segmentColors.length ? segmentColors : defaultSegmentColors8
    const colors = resampleColors(effectiveColors, segCount)
    const badColor = colors[0] || '#ef4444'
    const goodColor = colors[colors.length - 1] || '#22c55e'

    const cx = 160
    const cy = 135
    const r = 95

    // Wide horseshoe arc (like template): default 240° across the top/sides, open 120° at the bottom.
    // Using a large-arc SVG command so the arc is truly 240° (not the short 120°).
    const startAngle = Number.isFinite(Number(config.startAngle)) ? Number(config.startAngle) : 150
    const arcDegrees = Number.isFinite(Number(config.arcDegrees)) ? Number(config.arcDegrees) : 240
    const sweepFlag = Number.isFinite(Number(config.sweepFlag)) ? Number(config.sweepFlag) : 1
    const span = arcDegrees
    const endAngle = startAngle + span

    const needleAngle = startAngle + (clamped / 100) * span
    const needleEnd = polarToCartesian(cx, cy, r - 22, needleAngle)

    const segAngle = span / segCount
    const endSeg = Number.isFinite(Number(config.endSegmentAngle)) ? Number(config.endSegmentAngle) : 24
    const segGap = Number.isFinite(Number(config.segmentGapDegrees)) ? Math.max(0, Number(config.segmentGapDegrees)) : 1.5

    return (
        <div className="flex flex-col items-center">
            <svg width="320" height="190" viewBox="0 0 320 190" style={{ fontFamily: 'Be Vietnam Pro, Arial, sans-serif' }}>
                {/* Base arc */}
                <path
                    d={arcPathEx(cx, cy, r, startAngle, endAngle, span > 180 ? 1 : 0, sweepFlag)}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={arcThickness}
                    strokeLinecap="butt"
                />

                {mode === 'ends' ? (
                    <>
                        {/* Left red end */}
                        <path
                            d={arcPathEx(cx, cy, r, startAngle, startAngle + endSeg, 0, sweepFlag)}
                            fill="none"
                            stroke={badColor}
                            strokeWidth={arcThickness}
                            strokeLinecap="butt"
                        />
                        {/* Right green end */}
                        <path
                            d={arcPathEx(cx, cy, r, endAngle - endSeg, endAngle, 0, sweepFlag)}
                            fill="none"
                            stroke={goodColor}
                            strokeWidth={arcThickness}
                            strokeLinecap="butt"
                        />
                    </>
                ) : (
                    /* Multi-level segments across the arc (template-style) */
                    <>
                        {Array.from({ length: segCount }).map((_, i) => {
                            const s = startAngle + i * segAngle
                            const e = startAngle + (i + 1) * segAngle
                            const color = colors[i] || '#22c55e'

                            const halfGap = Math.min(segGap / 2, Math.max(0, (e - s) / 3))
                            const sAdj = i === 0 ? s : s + halfGap
                            const eAdj = i === segCount - 1 ? e : e - halfGap
                            if (eAdj <= sAdj) return null

                            return (
                                <path
                                    key={i}
                                    d={arcPathEx(cx, cy, r, sAdj, eAdj, 0, sweepFlag)}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={arcThickness}
                                    strokeLinecap="butt"
                                />
                            )
                        })}
                    </>
                )}

                {/* Needle */}
                <line
                    x1={cx}
                    y1={cy}
                    x2={needleEnd.x}
                    y2={needleEnd.y}
                    stroke={needleColor}
                    strokeWidth="5"
                    strokeLinecap="round"
                />

                {/* Center hub */}
                <circle cx={cx} cy={cy} r="8" fill="#ffffff" stroke={needleColor} strokeWidth="4" />
            </svg>

            <div className="text-center mt-2">
                <div className="text-[14px] font-extrabold" style={{ color: '#16a34a' }}>
                    Điểm sức khỏe AI: {clamped}/100
                </div>
                <div className="text-[14px] font-extrabold" style={{ color: '#16a34a' }}>
                    Đánh giá: {rating || 'N/A'}
                </div>
            </div>
        </div>
    )
}

export default HealthScoreGauge
