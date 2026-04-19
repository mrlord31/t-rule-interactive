import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    return stored ? stored === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      onClick={() => setDark(d => !d)}
      style={{
        background: 'var(--color-surface-2)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '4px 10px',
        color: 'var(--color-text)',
        cursor: 'pointer',
        fontSize: '0.8rem',
      }}
    >
      {dark ? '☀ Claro' : '🌙 Oscuro'}
    </button>
  )
}
