import React from 'react'
import { render, useApp } from 'ink'
import { writeFileSync } from 'node:fs'
import { App } from '@super-insect-battle/ui'
import { serializeReplay } from '@super-insect-battle/engine'
import type { BattleReplay } from '@super-insect-battle/engine'

function Main(): React.ReactNode {
  const { exit } = useApp()

  const handleSaveReplay = (replay: BattleReplay): void => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `replay-${timestamp}.json`
    writeFileSync(filename, serializeReplay(replay))
  }

  return <App onExit={exit} onSaveReplay={handleSaveReplay} />
}

render(<Main />)
