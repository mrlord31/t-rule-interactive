import { useState, useRef, useEffect } from 'react'

interface Props {
  content: string
}

export function HelpTip({ content }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Ayuda"
        style={{
          width: 15, height: 15, borderRadius: '50%',
          border: '1px solid var(--color-border)',
          background: open ? 'var(--color-asset)' : 'var(--color-surface-2)',
          color: open ? '#0f0f1a' : 'var(--color-text-dim)',
          fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
          padding: 0, lineHeight: '15px', textAlign: 'center',
          flexShrink: 0,
        }}
      >
        ?
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          fontSize: '0.72rem',
          color: 'var(--color-text-muted)',
          width: 260,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          whiteSpace: 'pre-line',
          lineHeight: 1.6,
        }}>
          {content}
        </div>
      )}
    </div>
  )
}
