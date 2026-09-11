import { createPointPair, distance, mulberry32 } from '../math/simulation'
import type { SimulationProgress, SimulationRequest, SimulationWorkerMessage } from './protocol'

interface RunnerOptions extends Omit<SimulationRequest, 'batchSize'> {
  batchSize?: number
  onProgress?: (progress: SimulationProgress) => void
  workerFactory?: (() => Worker) | null
}

export interface SimulationRun {
  promise: Promise<SimulationProgress>
  cancel: () => void
}

const cancelledError = () => new Error('Simulation cancelled')

export function runSimulation({
  a,
  b,
  seed,
  total,
  batchSize = 20_000,
  onProgress,
  workerFactory = () => new Worker(new URL('./simulation.worker.ts', import.meta.url), { type: 'module' }),
}: RunnerOptions): SimulationRun {
  let cancelled = false
  let rejectPromise: (reason: Error) => void = () => undefined
  let activeWorker: Worker | undefined

  const promise = new Promise<SimulationProgress>((resolve, reject) => {
    rejectPromise = reject
    if (workerFactory) {
      try {
        activeWorker = workerFactory()
        activeWorker.onmessage = ({ data }: MessageEvent<SimulationWorkerMessage>) => {
          if (data.type === 'error') {
            activeWorker?.terminate()
            reject(new Error(data.message))
            return
          }
          onProgress?.(data.payload)
          if (data.type === 'complete') {
            activeWorker?.terminate()
            resolve(data.payload)
          }
        }
        activeWorker.onerror = () => {
          activeWorker?.terminate()
          reject(new Error('Simulation worker failed'))
        }
        activeWorker.postMessage({ a, b, seed, total, batchSize } satisfies SimulationRequest)
        return
      } catch {
        activeWorker?.terminate()
      }
    }

    const rng = mulberry32(seed)
    let completed = 0
    let sum = 0
    const tick = () => {
      if (cancelled) return
      const end = Math.min(total, completed + batchSize)
      while (completed < end) {
        sum += distance(createPointPair(a, b, rng))
        completed += 1
      }
      const progress = { completed, total, mean: sum / completed }
      onProgress?.(progress)
      if (completed === total) resolve(progress)
      else setTimeout(tick, 0)
    }
    setTimeout(tick, 0)
  })

  return {
    promise,
    cancel: () => {
      if (cancelled) return
      cancelled = true
      activeWorker?.terminate()
      rejectPromise(cancelledError())
    },
  }
}

export type { SimulationProgress }
