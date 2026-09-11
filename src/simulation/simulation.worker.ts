/// <reference lib="webworker" />
import { createPointPair, distance, mulberry32 } from '../math/simulation'
import type { SimulationRequest, SimulationWorkerMessage } from './protocol'

self.onmessage = ({ data }: MessageEvent<SimulationRequest>) => {
  try {
    const rng = mulberry32(data.seed)
    let sum = 0
    for (let completed = 1; completed <= data.total; completed += 1) {
      sum += distance(createPointPair(data.a, data.b, rng))
      if (completed % data.batchSize === 0 || completed === data.total) {
        const payload = { completed, total: data.total, mean: sum / completed }
        const message: SimulationWorkerMessage = {
          type: completed === data.total ? 'complete' : 'progress',
          payload,
        }
        self.postMessage(message)
      }
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Simulation failed' })
  }
}
