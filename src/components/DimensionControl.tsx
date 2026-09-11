interface Props { label: 'a' | 'b'; value: number; onChange: (value: number) => void }

export function DimensionControl({ label, value, onChange }: Props) {
  return (
    <label className="dimension-control">
      <span className="dimension-label"><i>{label}</i><output>{value.toFixed(1)}</output></span>
      <input aria-label={`Сторона ${label}`} type="range" min="0.5" max="3" step="0.1" value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ '--progress': `${((value - 0.5) / 2.5) * 100}%` } as React.CSSProperties} />
      <span className="range-bounds"><small>0.5</small><small>3.0</small></span>
    </label>
  )
}
