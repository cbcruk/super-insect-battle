import React, { useRef, useCallback } from 'react'
import { useTerminal } from '../../hooks/use-terminal'
import { useGame } from '../../hooks/use-game'

export function Terminal(): React.ReactNode {
  const { processInput, getInitialOutput } = useGame()
  const writeRef = useRef<((text: string) => void) | null>(null)
  const focusRef = useRef<(() => void) | null>(null)

  const writeOutput = useCallback((output: string[]): void => {
    output.forEach((line) => {
      const lines = line.split('\n')
      lines.forEach((l, index) => {
        writeRef.current?.(l)
        if (index < lines.length - 1) {
          writeRef.current?.('\r\n')
        }
      })
    })
  }, [])

  const handleInput = useCallback(
    (input: string): void => {
      const output = processInput(input)
      writeOutput(output)
    },
    [processInput, writeOutput]
  )

  const handleReady = useCallback((): void => {
    const initialOutput = getInitialOutput()
    writeOutput(initialOutput)
    focusRef.current?.()
  }, [getInitialOutput, writeOutput])

  const { terminalRef, write, focus } = useTerminal({
    onInput: handleInput,
    onReady: handleReady,
  })

  writeRef.current = write
  focusRef.current = focus

  return (
    <div
      ref={terminalRef}
      className="h-[calc(100%-40px)] w-full bg-[#1a1a2e]"
      onClick={focus}
    />
  )
}
