import React, { useEffect, useState } from 'react'

interface DamagePopupProps {
  damage: number
  critical: boolean
  id: string
}

export function DamagePopup({
  damage,
  critical,
  id,
}: DamagePopupProps): React.ReactNode {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1000)
    return () => clearTimeout(timer)
  }, [id])

  if (!visible) return null

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span
        className={`animate-damage-popup font-black ${
          critical ? 'text-2xl text-yellow-400' : 'text-xl text-red-400'
        }`}
      >
        {critical && 'CRITICAL! '}
        -{damage}
      </span>
    </div>
  )
}
