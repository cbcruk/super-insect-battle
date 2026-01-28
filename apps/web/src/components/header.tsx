import React from 'react'

export function Header(): React.ReactNode {
  return (
    <div
      style={{
        border: '3px double var(--tui-yellow)',
        padding: '0.25rem 1rem',
        marginBottom: '0.5rem',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: 'var(--tui-yellow)', fontWeight: 'bold' }}>
        Super Insect Battle Simulator
      </span>
    </div>
  )
}
