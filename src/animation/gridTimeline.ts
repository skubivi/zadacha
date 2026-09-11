import { mulberry32 } from '../math/simulation'

export function createGridTimeline(cellCount: number, seed: number): number[] {
  const order = Array.from({ length: cellCount }, (_, index) => index)
  const rng = mulberry32(seed ^ 0x9e3779b9)
  for (let index = order.length - 1; index > 1; index -= 1) {
    const target = 1 + Math.floor(rng() * index)
    ;[order[index], order[target]] = [order[target], order[index]]
  }
  return order
}
