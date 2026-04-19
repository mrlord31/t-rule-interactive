import { useState, useEffect } from 'react'

interface Props {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  style?: React.CSSProperties
}

export function NumericInput({ value, onChange, placeholder = '0', style }: Props) {
  const [raw, setRaw] = useState(value === 0 ? '' : String(value))

  useEffect(() => {
    setRaw(value === 0 ? '' : String(value))
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.replace(',', '.')
    setRaw(input)
    const parsed = parseFloat(input)
    onChange(isNaN(parsed) ? 0 : parsed)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={raw}
      onChange={handleChange}
      placeholder={placeholder}
      style={{
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-text)',
        padding: '4px 8px',
        fontSize: '0.85rem',
        fontVariantNumeric: 'tabular-nums',
        width: '100%',
        ...style,
      }}
    />
  )
}
