import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { DimensionControl } from './components/DimensionControl'
import { ExperimentField } from './components/ExperimentField'
import { PrimaryButton } from './components/PrimaryButton'
import { RectangleStage } from './components/RectangleStage'
import { analyticalMean, createPointPair, mulberry32 } from './math/simulation'
import { runSimulation, type SimulationProgress } from './simulation/runSimulation'

type Scene = 'intro' | 'setup' | 'experiment' | 'simulation' | 'result'
const TOTAL = 1_000_000

const transition = { duration: .75, ease: [0.16, 1, 0.3, 1] as const }

export default function App() {
  const [scene, setScene] = useState<Scene>('intro')
  const [a, setA] = useState(1), [b, setB] = useState(1)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2 ** 32))
  const [progress, setProgress] = useState<SimulationProgress>({ completed: 0, total: TOTAL, mean: 0 })
  const [visualPercent, setVisualPercent] = useState(0)
  const [error, setError] = useState('')
  const reduced = useReducedMotion()
  const pair = useMemo(() => createPointPair(a, b, mulberry32(seed)), [a, b, seed])

  useEffect(() => {
    if (scene !== 'experiment') return
    const timer = setTimeout(() => setScene('simulation'), reduced ? 250 : 2600)
    return () => clearTimeout(timer)
  }, [scene, reduced])

  useEffect(() => {
    if (scene !== 'simulation') return
    const startedAt = performance.now()
    setError(''); setProgress({ completed: 0, total: TOTAL, mean: 0 })
    const run = runSimulation({ a, b, seed, total: TOTAL, onProgress: setProgress })
    run.promise.then((value) => {
      setProgress(value)
      const remaining = reduced ? 100 : Math.max(0, 3200 - (performance.now() - startedAt))
      setTimeout(() => setScene('result'), remaining)
    })
      .catch((reason) => { if (reason.message !== 'Simulation cancelled') setError('Расчёт прервался. Попробуем ещё раз?') })
    return run.cancel
  }, [scene, a, b, seed, reduced])

  useEffect(() => {
    if (scene !== 'simulation') { setVisualPercent(0); return }
    if (reduced) { setVisualPercent(1); return }
    const startedAt = performance.now()
    let frame = 0
    const animate = (now: number) => {
      setVisualPercent(Math.min(1, (now - startedAt) / 3000))
      if (now - startedAt < 3000) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [scene, reduced])

  const replay = () => { setSeed(Math.floor(Math.random() * 2 ** 32)); setScene('experiment') }
  const reset = () => setScene('setup')
  const exact = analyticalMean(a, b), percent = Math.min(progress.completed / TOTAL, visualPercent)
  const displayedCompleted = Math.min(progress.completed, Math.floor(TOTAL * visualPercent))
  const variants = reduced ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } :
    { initial: { opacity: 0, y: 24, filter: 'blur(10px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, exit: { opacity: 0, y: -20, filter: 'blur(8px)' } }

  return <main className="app-shell">
    <header className="topbar"><span className="wordmark">DIST / 01</span><span className="scene-index">{['intro','setup','experiment','simulation','result'].indexOf(scene)+1} — 5</span></header>
    <AnimatePresence mode="wait">
      <motion.section key={scene} className={`scene scene--${scene}`} {...variants} transition={transition}>
        {scene === 'intro' && <>
          <div className="intro-copy"><p className="eyebrow">Мысленный эксперимент</p><h1>Что находится<br/>между <em>двумя точками?</em></h1><p className="lede">Выберем две случайные точки внутри единичного квадрата. Какое расстояние в среднем окажется между ними?</p><PrimaryButton onClick={() => setScene('setup')}>Исследовать</PrimaryButton></div>
          <div className="intro-art" aria-hidden="true"><div className="orbit-point orbit-point--a"/><div className="orbit-line"/><div className="orbit-point orbit-point--b"/><span>?</span></div>
        </>}
        {scene === 'setup' && <>
          <div className="scene-copy"><p className="eyebrow">Задайте пространство</p><h2>Сначала — форма.</h2><p>Меняйте стороны прямоугольника. Мы равномерно разбросаем внутри него точки.</p><div className="controls"><DimensionControl label="a" value={a} onChange={setA}/><DimensionControl label="b" value={b} onChange={setB}/></div><PrimaryButton onClick={replay}>Начать эксперимент</PrimaryButton></div>
          <RectangleStage a={a} b={b}/>
        </>}
        {scene === 'experiment' && <><div className="floating-label"><span>Один случай</span><b>Две случайные точки</b></div><RectangleStage a={a} b={b} pair={pair} question/><div className="formula-chip">d = √((x₁−x₂)² + (y₁−y₂)²)</div></>}
        {scene === 'simulation' && <>
          <ExperimentField a={a} b={b} seed={seed} progress={percent}/>
          <div className="simulation-overlay"><p className="eyebrow">Повторяем эксперимент</p><strong>{displayedCompleted.toLocaleString('ru-RU')}</strong><span>из {TOTAL.toLocaleString('ru-RU')}</span><div className="progress-track"><i style={{ transform: `scaleX(${percent})` }}/></div><p className="running-mean">текущее среднее <b>{progress.mean ? progress.mean.toFixed(6) : '—'}</b></p>{error && <><p role="alert">{error}</p><button onClick={replay}>Повторить</button></>}</div>
          <span className="sr-only" aria-live="polite">Обработано {Math.floor(displayedCompleted / 100000) * 100000} испытаний</span>
        </>}
        {scene === 'result' && <div className="result-wrap"><p className="eyebrow">Миллион испытаний спустя</p><div className="result-number">{progress.mean.toFixed(6)}</div><h2>Средняя дистанция</h2><div className="result-meta"><div><span>Точное значение</span><b>{exact.toFixed(9)}</b></div><div><span>Погрешность</span><b>{Math.abs(progress.mean-exact).toExponential(2)}</b></div><div><span>Прямоугольник</span><b>{a.toFixed(1)} × {b.toFixed(1)}</b></div></div><p className="result-note">Случайность шумит. Но миллион наблюдений собирает её в почти точный ответ.</p><div className="result-actions"><PrimaryButton onClick={replay}>Повторить</PrimaryButton><button className="text-button" onClick={reset}>Изменить стороны</button></div></div>}
      </motion.section>
    </AnimatePresence>
  </main>
}
