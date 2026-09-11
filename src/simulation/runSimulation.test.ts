import { describe, expect, it, vi } from 'vitest'
import { runSimulation } from './runSimulation'

describe('runSimulation fallback', () => {
  it('reports monotonic progress and completes the exact total', async () => {
    const completed: number[] = []
    const run = runSimulation({
      a: 1,
      b: 1,
      seed: 12,
      total: 500,
      batchSize: 100,
      workerFactory: null,
      onProgress: (progress) => completed.push(progress.completed),
    })
    const result = await run.promise
    expect(completed).toEqual([...completed].sort((a, b) => a - b))
    expect(result.completed).toBe(500)
    expect(result.mean).toBeGreaterThan(0)
  })

  it('can be cancelled before completion', async () => {
    vi.useFakeTimers()
    const run = runSimulation({ a: 1, b: 1, seed: 4, total: 10_000, batchSize: 10, workerFactory: null })
    run.cancel()
    await expect(run.promise).rejects.toThrow('Simulation cancelled')
    vi.useRealTimers()
  })
})
