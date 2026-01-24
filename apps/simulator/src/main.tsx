import React from 'react'
import { render, useApp } from 'ink'
import { App } from '@super-insect-battle/ui'

function Main(): React.ReactNode {
  const { exit } = useApp()
  return <App onExit={exit} />
}

render(<Main />)
