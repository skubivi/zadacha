import { useEffect, useRef } from 'react'
import { createPointPair, mulberry32 } from '../math/simulation'

export function ExperimentField({ a, b, seed, progress }: { a: number; b: number; seed: number; progress: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d'); if (!ctx) return
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, rect.width, rect.height)
    const gap = 12, cellW = Math.max(80, Math.min(132, rect.width / 7)), cellH = cellW * .7
    const cols = Math.ceil(rect.width / (cellW + gap)), rows = Math.ceil(rect.height / (cellH + gap))
    const visible = Math.max(1, Math.ceil(cols * rows * Math.min(1, progress * 4 + .08)))
    const rng = mulberry32(seed)
    for (let i = 0; i < cols * rows; i += 1) {
      const pair = createPointPair(a, b, rng); if (i >= visible) continue
      const x = (i % cols) * (cellW + gap) + 1, y = Math.floor(i / cols) * (cellH + gap) + 1
      const inset = 9, w = cellW - inset * 2, h = cellH - inset * 2
      ctx.globalAlpha = .16 + Math.min(1, progress * 5) * .54
      ctx.strokeStyle = '#9b988f'; ctx.lineWidth = 1; ctx.strokeRect(x + inset, y + inset, w, h)
      const p1x = x + inset + pair.first.x / a * w, p1y = y + inset + pair.first.y / b * h
      const p2x = x + inset + pair.second.x / a * w, p2y = y + inset + pair.second.y / b * h
      ctx.strokeStyle = '#2457e6'; ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.stroke()
      ctx.fillStyle = '#2457e6'; for (const [px, py] of [[p1x,p1y],[p2x,p2y]]) { ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI*2); ctx.fill() }
    }
  }, [a, b, seed, progress])
  return <canvas ref={ref} className="experiment-field" aria-hidden="true" />
}
