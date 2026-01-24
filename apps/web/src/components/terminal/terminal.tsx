import React from 'react'
import { InkXterm } from 'ink-web/core'
import { App } from '@super-insect-battle/ui'
import 'xterm/css/xterm.css'

export function Terminal(): React.ReactNode {
  return (
    <InkXterm focus>
      <App />
    </InkXterm>
  )
}
