import React from 'react'
import { Box, Text, useInput } from 'ink'
import type { BattleReplay } from '@super-insect-battle/engine'

interface ReplaySavePromptProps {
  replay: BattleReplay
  onSave: (replay: BattleReplay) => void
  onDone: () => void
}

export function ReplaySavePrompt({
  replay,
  onSave,
  onDone,
}: ReplaySavePromptProps): React.ReactNode {
  useInput((input) => {
    if (input === 'y' || input === 'Y') {
      onSave(replay)
      onDone()
    } else if (input === 'n' || input === 'N') {
      onDone()
    }
  })

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color="yellow" bold>
        Save replay? (Y/N)
      </Text>
      <Text color="gray">
        {replay.header.playerArthropodId} vs {replay.header.opponentArthropodId}{' '}
        ({replay.turns.length} turns)
      </Text>
    </Box>
  )
}
