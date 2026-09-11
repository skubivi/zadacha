export interface Point {
  x: number
  y: number
}

export interface PointPair {
  first: Point
  second: Point
}

export type RandomSource = () => number

export function mulberry32(seed: number): RandomSource {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function createPointPair(a: number, b: number, rng: RandomSource): PointPair {
  return {
    first: { x: rng() * a, y: rng() * b },
    second: { x: rng() * a, y: rng() * b },
  }
}

export function distance(pair: PointPair): number {
  return Math.hypot(pair.first.x - pair.second.x, pair.first.y - pair.second.y)
}

export function analyticalMean(a: number, b: number): number {
  if (a <= 0 || b <= 0) throw new RangeError('Rectangle sides must be positive')
  const diagonal = Math.hypot(a, b)
  return (
    a ** 3 / b ** 2 +
    b ** 3 / a ** 2 +
    diagonal * (3 - a ** 2 / b ** 2 - b ** 2 / a ** 2) +
    2.5 *
      ((b ** 2 / a) * Math.log((a + diagonal) / b) +
        (a ** 2 / b) * Math.log((b + diagonal) / a))
  ) / 15
}

export interface BatchOptions {
  a: number
  b: number
  seed: number
  count: number
}

export interface BatchResult {
  completed: number
  sum: number
}

export function simulateBatch({ a, b, seed, count }: BatchOptions): BatchResult {
  const rng = mulberry32(seed)
  let sum = 0
  let compensation = 0
  for (let index = 0; index < count; index += 1) {
    const value = distance(createPointPair(a, b, rng))
    const corrected = value - compensation
    const next = sum + corrected
    compensation = next - sum - corrected
    sum = next
  }
  return { completed: count, sum }
}
