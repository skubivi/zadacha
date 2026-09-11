import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { DimensionControl } from './components/DimensionControl'
import { ExperimentField } from './components/ExperimentField'
import { PrimaryButton } from './components/PrimaryButton'
import { RectangleStage } from './components/RectangleStage'
import { analyticalMean, createPointPair, mulberry32 } from './math/simulation'
import { runSimulation, type SimulationProgress } from './simulation/runSimulation'

type Scene = 'intro' | 'setup' | 'experiment' | 'simulation' | 'result'
type IntroPhase = 'title' | 'question' | 'action'
type SetupPhase = 'title' | 'controls'
type ExperimentPhase = 'points' | 'line' | 'shrink'
const TOTAL = 1_000_000
const ease = [0.16, 1, 0.3, 1] as const

export default function App() {
  const [scene, setScene] = useState<Scene>('intro')
  const [introPhase, setIntroPhase] = useState<IntroPhase>('title')
  const [setupPhase, setSetupPhase] = useState<SetupPhase>('title')
  const [experimentPhase, setExperimentPhase] = useState<ExperimentPhase>('points')
  const [a, setA] = useState(1), [b, setB] = useState(1)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2 ** 32))
  const [progress, setProgress] = useState<SimulationProgress>({ completed: 0, total: TOTAL, mean: 0 })
  const [visualPercent, setVisualPercent] = useState(0)
  const [error, setError] = useState('')
  const reduced = useReducedMotion()
  const pair = useMemo(() => createPointPair(a, b, mulberry32(seed)), [a, b, seed])

  useEffect(() => {
    if (scene !== 'intro') return
    const question = setTimeout(() => setIntroPhase('question'), reduced ? 80 : 1800)
    const action = setTimeout(() => setIntroPhase('action'), reduced ? 160 : 3600)
    return () => { clearTimeout(question); clearTimeout(action) }
  }, [scene, reduced])

  useEffect(() => {
    if (scene !== 'setup') return
    setSetupPhase('title')
    const controls = setTimeout(() => setSetupPhase('controls'), reduced ? 80 : 1800)
    return () => clearTimeout(controls)
  }, [scene, reduced])

  useEffect(() => {
    if (scene !== 'experiment') return
    setExperimentPhase('points')
    const line = setTimeout(() => setExperimentPhase('line'), reduced ? 80 : 1000)
    const shrink = setTimeout(() => setExperimentPhase('shrink'), reduced ? 160 : 3400)
    const simulation = setTimeout(() => setScene('simulation'), reduced ? 240 : 5000)
    return () => { clearTimeout(line); clearTimeout(shrink); clearTimeout(simulation) }
  }, [scene, seed, reduced])

  useEffect(() => {
    if (scene !== 'simulation') return
    setError(''); setProgress({ completed: 0, total: TOTAL, mean: 0 })
    const startedAt = performance.now()
    const run = runSimulation({ a, b, seed, total: TOTAL, onProgress: setProgress })
    run.promise.then((value) => {
      setProgress(value)
      const remaining = reduced ? 100 : Math.max(0, 8000 - (performance.now() - startedAt))
      setTimeout(() => setScene('result'), remaining)
    }).catch((reason) => { if (reason.message !== 'Simulation cancelled') setError('Расчёт прервался. Попробуем ещё раз?') })
    return run.cancel
  }, [scene, a, b, seed, reduced])

  useEffect(() => {
    if (scene !== 'simulation') { setVisualPercent(0); return }
    if (reduced) { setVisualPercent(1); return }
    const startedAt = performance.now()
    let frame = 0
    const animate = (now: number) => {
      setVisualPercent(Math.min(1, (now - startedAt) / 7600))
      if (now - startedAt < 7600) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [scene, reduced])

  const begin = () => { setSeed(Math.floor(Math.random() * 2 ** 32)); setScene('experiment') }
  const replay = () => begin()
  const reset = () => setScene('setup')
  const exact = analyticalMean(a, b)
  const percent = Math.min(progress.completed / TOTAL, visualPercent)
  const displayedCompleted = Math.min(progress.completed, Math.floor(TOTAL * visualPercent))

  return <main className="app-shell clean-shell">
    <AnimatePresence mode="wait">
      <motion.section key={scene} className={`scene scene--${scene}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? .1 : .7 }}>
        {scene === 'intro' && <div className="type-sequence">
          <AnimatePresence mode="wait">
            {introPhase === 'title' && <motion.h1 key="intro-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: .8, ease }}>Мысленный эксперимент</motion.h1>}
            {introPhase !== 'title' && <motion.div key="intro-question" className="sequence-content" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, ease }}>
              <h1>Выберем две случайные точки внутри прямоугольника. Какое расстояние в среднем окажется между ними?</h1>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: introPhase === 'action' ? 1 : 0, y: introPhase === 'action' ? 0 : 16 }} transition={{ duration: .65, ease }}><PrimaryButton onClick={() => setScene('setup')}>Исследовать</PrimaryButton></motion.div>
            </motion.div>}
          </AnimatePresence>
        </div>}

        {scene === 'setup' && <div className="setup-sequence">
          <AnimatePresence mode="wait">
            {setupPhase === 'title' ? <motion.h1 key="setup-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: .8, ease }}>Задайте параметры</motion.h1> :
              <motion.div key="setup-controls" className="setup-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8 }}>
                <div className="controls"><DimensionControl label="a" value={a} onChange={setA}/><DimensionControl label="b" value={b} onChange={setB}/><PrimaryButton onClick={begin}>Начать</PrimaryButton></div>
                <RectangleStage a={a} b={b}/>
              </motion.div>}
          </AnimatePresence>
        </div>}

        {scene === 'experiment' && <motion.div className="featured-stage" animate={experimentPhase === 'shrink' ? { scale: .16, x: '-2vw', y: '-2vh' } : { scale: 1, x: 0, y: 0 }} transition={{ duration: 1.5, ease }}>
          <RectangleStage a={a} b={b} pair={pair} lineVisible={experimentPhase !== 'points'}/>
        </motion.div>}

        {scene === 'simulation' && <>
          <ExperimentField a={a} b={b} seed={seed} progress={percent}/>
          <div className="counter-overlay"><strong>{displayedCompleted.toLocaleString('ru-RU')}</strong><span>/ {TOTAL.toLocaleString('ru-RU')}</span><div className="progress-track"><i style={{ transform: `scaleX(${percent})` }}/></div><p>Среднее <b>{progress.mean ? progress.mean.toFixed(6) : '—'}</b></p>{error && <button onClick={replay}>{error}</button>}</div>
          <span className="sr-only" aria-live="polite">Обработано {Math.floor(displayedCompleted / 100000) * 100000} испытаний</span>
        </>}

        {scene === 'result' && <div className="result-wrap"><div className="result-number">{progress.mean.toFixed(6)}</div><h2>Средняя дистанция</h2><div className="result-meta"><div><span>Точное значение</span><b>{exact.toFixed(9)}</b></div><div><span>Погрешность</span><b>{Math.abs(progress.mean-exact).toExponential(2)}</b></div><div><span>Прямоугольник</span><b>{a.toFixed(1)} × {b.toFixed(1)}</b></div></div><div className="result-actions"><PrimaryButton onClick={replay}>Повторить</PrimaryButton><button className="text-button" onClick={reset}>Изменить стороны</button></div></div>}
      </motion.section>
    </AnimatePresence>
  </main>
}
