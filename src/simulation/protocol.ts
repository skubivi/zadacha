export interface SimulationProgress {
  completed: number
  total: number
  mean: number
}

export interface SimulationRequest {
  a: number
  b: number
  seed: number
  total: number
  batchSize: number
}

export type SimulationWorkerMessage =
  | { type: 'progress'; payload: SimulationProgress }
  | { type: 'complete'; payload: SimulationProgress }
  | { type: 'error'; message: string }
