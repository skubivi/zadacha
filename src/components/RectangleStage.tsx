import { motion } from 'motion/react'
import type { PointPair } from '../math/simulation'

interface Props { a: number; b: number; pair?: PointPair; question?: boolean; compact?: boolean }

export function RectangleStage({ a, b, pair, question = false, compact = false }: Props) {
  const max = Math.max(a, b)
  const width = `${(a / max) * 100}%`
  const height = `${(b / max) * 100}%`
  const point = (x: number, y: number) => ({ left: `${(x / a) * 100}%`, top: `${(y / b) * 100}%` })
  return (
    <div className={`stage ${compact ? 'stage--compact' : ''}`}>
      <motion.div className="rectangle" animate={{ width, height }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }}>
        <span className="measure measure--a">a = {a.toFixed(1)}</span><span className="measure measure--b">b = {b.toFixed(1)}</span>
        {pair && <>
          <svg className="connection" viewBox={`0 0 ${a} ${b}`} preserveAspectRatio="none" aria-hidden="true">
            <motion.line x1={pair.first.x} y1={pair.first.y} x2={pair.second.x} y2={pair.second.y} style={{ strokeWidth: 2 }}
              pathLength="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9, delay: .35 }} />
          </svg>
          <motion.span className="point point--one" style={point(pair.first.x, pair.first.y)} initial={{ scale: 0 }} animate={{ scale: 1 }} />
          <motion.span className="point point--two" style={point(pair.second.x, pair.second.y)} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: .22 }} />
          {question && <motion.span className="question-mark" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 }}>?</motion.span>}
        </>}
      </motion.div>
    </div>
  )
}
