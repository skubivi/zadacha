export interface Rect { x: number; y: number; width: number; height: number }
export interface NormalizedPoint { x: number; y: number }

export function fitRectangle(slot: Rect, a: number, b: number, widthScale = 1, heightScale = 1): Rect {
  const availableWidth = slot.width * widthScale
  const availableHeight = slot.height * heightScale
  const scale = Math.min(availableWidth / a, availableHeight / b)
  const width = a * scale, height = b * scale
  return { x: slot.x + (slot.width - width) / 2, y: slot.y + (slot.height - height) / 2, width, height }
}

export function interpolateRect(from: Rect, to: Rect, progress: number): Rect {
  const p = Math.max(0, Math.min(1, progress))
  return {
    x: from.x + (to.x - from.x) * p,
    y: from.y + (to.y - from.y) * p,
    width: from.width + (to.width - from.width) * p,
    height: from.height + (to.height - from.height) * p,
  }
}

export function pointInRect(rect: Rect, point: NormalizedPoint) {
  return { x: rect.x + point.x * rect.width, y: rect.y + point.y * rect.height }
}

export const smoothstep = (value: number) => {
  const p = Math.max(0, Math.min(1, value))
  return p * p * (3 - 2 * p)
}
