import { describe, expect, it } from 'vitest'
import { analyticalMean, createPointPair, distance, mulberry32, simulateBatch } from './simulation'

describe('distance simulation math', () => {
  it('reproduces the same point pair from the same seed', () => {
    expect(createPointPair(2, 3, mulberry32(42))).toEqual(createPointPair(2, 3, mulberry32(42)))
  })

  it('calculates a known 3-4-5 distance', () => {
    expect(distance({ first: { x: 0, y: 0 }, second: { x: 3, y: 4 } })).toBe(5)
  })

  it('matches the known unit-square analytical mean', () => {
    expect(analyticalMean(1, 1)).toBeCloseTo(0.5214054331647207, 12)
  })

  it('is symmetric when rectangle sides are swapped', () => {
    expect(analyticalMean(1.2, 2.7)).toBeCloseTo(analyticalMean(2.7, 1.2), 14)
  })

  it('aggregates exactly the requested number of samples', () => {
    const result = simulateBatch({ a: 1, b: 1, seed: 7, count: 25 })
    expect(result.completed).toBe(25)
    expect(result.sum).toBeGreaterThan(0)
  })
})
