import { describe, expect, it } from 'vitest'
import { createGridTimeline } from './gridTimeline'

describe('grid animation timeline', () => {
  it('reveals every cell once in a deterministic shuffled order', () => {
    const first = createGridTimeline(12, 41)
    const second = createGridTimeline(12, 41)
    expect(first).toEqual(second)
    expect([...first].sort((a, b) => a - b)).toEqual(Array.from({ length: 12 }, (_, index) => index))
    expect(first).not.toEqual(Array.from({ length: 12 }, (_, index) => index))
  })

  it('starts each cell with frame, then points, then line', () => {
    const [cell] = createGridTimeline(1, 7)
    expect(cell).toBe(0)
  })
})
