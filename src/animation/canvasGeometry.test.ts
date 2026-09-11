import { describe, expect, it } from 'vitest'
import { fitRectangle, interpolateRect, pointInRect } from './canvasGeometry'

describe('continuous canvas geometry', () => {
  it('lands the featured rectangle exactly on the first grid cell', () => {
    const featured = fitRectangle({ x: 0, y: 0, width: 1280, height: 720 }, 1, 1, .64, .72)
    const firstCell = fitRectangle({ x: 5, y: 5, width: 150, height: 104 }, 1, 1)
    expect(interpolateRect(featured, firstCell, 1)).toEqual(firstCell)
  })

  it('keeps normalized points attached while the rectangle moves', () => {
    const target = { x: 10, y: 20, width: 100, height: 50 }
    expect(pointInRect(target, { x: .25, y: .8 })).toEqual({ x: 35, y: 60 })
  })
})
