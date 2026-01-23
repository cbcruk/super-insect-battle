import { useRef, useEffect, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export interface UseTerminalOptions {
  onInput: (input: string) => void
  onReady?: () => void
}

export interface UseTerminalReturn {
  terminalRef: React.RefObject<HTMLDivElement | null>
  write: (text: string) => void
  writeLine: (text: string) => void
  clear: () => void
  focus: () => void
}

export function useTerminal(options: UseTerminalOptions): UseTerminalReturn {
  const { onInput, onReady } = options
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const inputBufferRef = useRef<string>('')
  const onInputRef = useRef(onInput)
  const onReadyRef = useRef(onReady)

  onInputRef.current = onInput
  onReadyRef.current = onReady

  const write = useCallback((text: string): void => {
    xtermRef.current?.write(text)
  }, [])

  const writeLine = useCallback((text: string): void => {
    const lines = text.split('\n')
    lines.forEach((line, index) => {
      xtermRef.current?.write(line)
      if (index < lines.length - 1) {
        xtermRef.current?.write('\r\n')
      }
    })
    xtermRef.current?.write('\r\n')
  }, [])

  const clear = useCallback((): void => {
    xtermRef.current?.clear()
  }, [])

  const focus = useCallback((): void => {
    xtermRef.current?.focus()
  }, [])

  useEffect(() => {
    const container = terminalRef.current
    if (!container) return

    let terminal: Terminal | null = null
    let fitAddon: FitAddon | null = null
    let resizeHandler: (() => void) | null = null
    let disposed = false

    const initTerminal = (): void => {
      if (disposed) return
      if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
        requestAnimationFrame(initTerminal)
        return
      }

      terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#1a1a2e',
          foreground: '#eaeaea',
          cursor: '#eaeaea',
          cursorAccent: '#1a1a2e',
          black: '#1a1a2e',
          brightBlack: '#4a4a5e',
          red: '#ff6b6b',
          brightRed: '#ff8787',
          green: '#69db7c',
          brightGreen: '#8ce99a',
          yellow: '#ffd43b',
          brightYellow: '#ffe066',
          blue: '#74c0fc',
          brightBlue: '#a5d8ff',
          magenta: '#da77f2',
          brightMagenta: '#e599f7',
          cyan: '#63e6be',
          brightCyan: '#96f2d7',
          white: '#eaeaea',
          brightWhite: '#ffffff',
        },
        convertEol: true,
        scrollback: 1000,
      })

      fitAddon = new FitAddon()
      terminal.loadAddon(fitAddon)

      terminal.open(container)
      fitAddon.fit()

      xtermRef.current = terminal
      fitAddonRef.current = fitAddon

      terminal.onData((data) => {
        const code = data.charCodeAt(0)

        if (code === 13) {
          terminal?.write('\r\n')
          const input = inputBufferRef.current
          inputBufferRef.current = ''
          onInputRef.current(input)
        } else if (code === 127) {
          if (inputBufferRef.current.length > 0) {
            inputBufferRef.current = inputBufferRef.current.slice(0, -1)
            terminal?.write('\b \b')
          }
        } else if (code >= 32) {
          inputBufferRef.current += data
          terminal?.write(data)
        }
      })

      resizeHandler = (): void => {
        fitAddon?.fit()
      }

      window.addEventListener('resize', resizeHandler)

      onReadyRef.current?.()
    }

    requestAnimationFrame(initTerminal)

    return () => {
      disposed = true
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler)
      }
      terminal?.dispose()
      xtermRef.current = null
      fitAddonRef.current = null
    }
  }, [])

  return {
    terminalRef,
    write,
    writeLine,
    clear,
    focus,
  }
}
