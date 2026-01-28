import { useEffect, useCallback } from 'react'

interface KeyboardOptions {
  isActive?: boolean
}

export function useKeyboard(
  handler: (event: KeyboardEvent) => void,
  options?: KeyboardOptions
): void {
  const { isActive = true } = options ?? {}

  const stableHandler = useCallback(handler, [handler])

  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      stableHandler(e)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stableHandler, isActive])
}
