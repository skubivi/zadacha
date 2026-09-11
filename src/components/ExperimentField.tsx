import { useEffect, useRef } from 'react'
import { createGridTimeline } from '../animation/gridTimeline'
import { createPointPair, mulberry32 } from '../math/simulation'

const clamp = (value: number) => Math.max(0, Math.min(1, value))

export function ExperimentField({ a, b, seed, progress }: { a: number; b: number; seed: number; progress: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const bounds = canvas.getBoundingClientRect()
    const dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = bounds.width * dpr; canvas.height = bounds.height * dpr
    const ctx = canvas.getContext('2d'); if (!ctx) return
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, bounds.width, bounds.height)
    const gap = 10, cellW = Math.max(86, Math.min(144, bounds.width / 8)), cellH = Math.max(72, cellW * .72)
    const cols = Math.ceil(bounds.width / (cellW + gap)), rows = Math.ceil(bounds.height / (cellH + gap))
    const count = cols * rows, order = createGridTimeline(count, seed), rank = new Array<number>(count)
    order.forEach((cell, index) => { rank[cell] = index })
    const rng = mulberry32(seed), pairs = Array.from({ length: count }, () => createPointPair(a, b, rng))
    const elapsed = progress * 7.6
    for (let index = 0; index < count; index += 1) {
      const start = count > 1 ? rank[index] / (count - 1) * 5.35 : 0
      const local = elapsed - start
      if (local <= 0) continue
      const frameAlpha = clamp(local / .32), pointsAlpha = clamp((local - .3) / .42), lineProgress = clamp((local - .78) / 1.45)
      const slotX = (index % cols) * (cellW + gap) + 5, slotY = Math.floor(index / cols) * (cellH + gap) + 5
      const scale = Math.min((cellW - 10) / a, (cellH - 10) / b)
      const w = a * scale, h = b * scale, x = slotX + (cellW - w) / 2, y = slotY + (cellH - h) / 2, pair = pairs[index]
      const p1x = x + pair.first.x / a * w, p1y = y + pair.first.y / b * h
      const p2x = x + pair.second.x / a * w, p2y = y + pair.second.y / b * h
      ctx.globalAlpha = frameAlpha * .66; ctx.strokeStyle = '#aaa79f'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h)
      ctx.globalAlpha = pointsAlpha; ctx.fillStyle = '#2457e6'
      for (const [px, py] of [[p1x, p1y], [p2x, p2y]]) { ctx.beginPath(); ctx.arc(px, py, 2.8, 0, Math.PI * 2); ctx.fill() }
      if (lineProgress > 0) { ctx.globalAlpha = lineProgress; ctx.strokeStyle = '#2457e6'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p1x + (p2x - p1x) * lineProgress, p1y + (p2y - p1y) * lineProgress); ctx.stroke() }
    }
    ctx.globalAlpha = 1
  }, [a, b, seed, progress])
  return <canvas ref={ref} className="experiment-field" aria-hidden="true" />
}
