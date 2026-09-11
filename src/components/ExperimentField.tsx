import { useEffect, useRef } from 'react'
import { fitRectangle, interpolateRect, pointInRect, smoothstep, type Rect } from '../animation/canvasGeometry'
import { createGridTimeline } from '../animation/gridTimeline'
import { createPointPair, mulberry32, type PointPair } from '../math/simulation'

const clamp = (value: number) => Math.max(0, Math.min(1, value))

function drawExperiment(ctx: CanvasRenderingContext2D, rect: Rect, pair: PointPair, a: number, b: number, frameAlpha: number, pointsAlpha: number, lineProgress: number) {
  const first = pointInRect(rect, { x: pair.first.x / a, y: pair.first.y / b })
  const second = pointInRect(rect, { x: pair.second.x / a, y: pair.second.y / b })
  ctx.globalAlpha = frameAlpha * .72; ctx.strokeStyle = '#aaa79f'; ctx.lineWidth = 1; ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
  ctx.globalAlpha = pointsAlpha; ctx.fillStyle = '#2457e6'
  const radius = Math.max(2.8, Math.min(7, rect.width / 85))
  for (const point of [first, second]) { ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill() }
  if (lineProgress > 0) {
    ctx.globalAlpha = lineProgress; ctx.strokeStyle = '#2457e6'; ctx.lineWidth = Math.max(1.2, Math.min(2, rect.width / 260))
    ctx.beginPath(); ctx.moveTo(first.x, first.y)
    ctx.lineTo(first.x + (second.x - first.x) * lineProgress, first.y + (second.y - first.y) * lineProgress); ctx.stroke()
  }
}

export function ExperimentField({ a, b, seed, progress }: { a: number; b: number; seed: number; progress: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const bounds = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = bounds.width * dpr; canvas.height = bounds.height * dpr
    const ctx = canvas.getContext('2d'); if (!ctx) return
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, bounds.width, bounds.height)

    const gap = 10, cellW = Math.max(86, Math.min(144, bounds.width / 8)), cellH = Math.max(72, cellW * .72)
    const cols = Math.ceil(bounds.width / (cellW + gap)), rows = Math.ceil(bounds.height / (cellH + gap)), count = cols * rows
    const cellSlot = (index: number): Rect => ({ x: (index % cols) * (cellW + gap) + 5, y: Math.floor(index / cols) * (cellH + gap) + 5, width: cellW, height: cellH })
    const cellRect = (index: number) => fitRectangle(cellSlot(index), a, b, .92, .9)
    const rng = mulberry32(seed), pairs = Array.from({ length: count }, () => createPointPair(a, b, rng))
    const large = fitRectangle({ x: 0, y: 0, width: bounds.width, height: bounds.height }, a, b, .64, .72)
    const zoom = smoothstep((progress - .25) / .13)
    const featured = interpolateRect(large, cellRect(0), zoom)
    const featuredLine = clamp((progress - .08) / .17)
    drawExperiment(ctx, featured, pairs[0], a, b, 1, clamp(progress / .05), featuredLine)

    const fillProgress = clamp((progress - .38) / .62)
    if (fillProgress > 0) {
      const order = createGridTimeline(count, seed), rank = new Array<number>(count)
      order.forEach((cell, index) => { rank[cell] = index })
      const elapsed = fillProgress * 7.6
      for (let index = 1; index < count; index += 1) {
        const start = rank[index] / (count - 1) * 5.35, local = elapsed - start
        if (local <= 0) continue
        drawExperiment(ctx, cellRect(index), pairs[index], a, b, clamp(local / .32), clamp((local - .3) / .42), clamp((local - .78) / 1.45))
      }
    }
    ctx.globalAlpha = 1
  }, [a, b, seed, progress])
  return <canvas ref={ref} className="experiment-field" aria-hidden="true" />
}
