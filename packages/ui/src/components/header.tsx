import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'

export function Header(): React.ReactNode {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  if (!ready) {
    return null
  }

  return (
    <Box
      borderStyle="double"
      borderColor="yellow"
      paddingX={2}
      marginBottom={1}
      justifyContent="center"
    >
      <Text color="yellow" bold>
        슈퍼곤충대전 시뮬레이터
      </Text>
    </Box>
  )
}
