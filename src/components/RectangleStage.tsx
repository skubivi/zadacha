import { motion } from 'motion/react'
import type { PointPair } from '../math/simulation'

interface Props { a: number; b: number; pair?: PointPair; lineVisible?: boolean }

export function RectangleStage({ a, b, pair, lineVisible = false }: Props) {
  const max = Math.max(a, b)
  const width = `${(a / max) * 100}%`
  const height = `${(b / max) * 100}%`
  const point = (x: number, y: number) => ({ left: `${(x / a) * 100}%`, top: `${(y / b) * 100}%` })
  return <div className="stage">
    <motion.div className="rectangle" animate={{ width, height }} transition={{ duration: .8, ease: [0.16, 1, 0.3, 1] }}>
      {pair && <>
        <motion.span className="point point--one" style={point(pair.first.x, pair.first.y)} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: .55 }} />
        <motion.span className="point point--two" style={point(pair.second.x, pair.second.y)} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: .55, delay: .2 }} />
        <svg className="connection" viewBox={`0 0 ${a} ${b}`} preserveAspectRatio="none" aria-hidden="true">
          <motion.line x1={pair.first.x} y1={pair.first.y} x2={pair.second.x} y2={pair.second.y}
            pathLength="1" initial={{ pathLength: 0 }} animate={{ pathLength: lineVisible ? 1 : 0 }}
            transition={{ duration: 1.8, ease: [0.45, 0, 0.2, 1] }} />
        </svg>
      </>}
    </motion.div>
  </div>
}
