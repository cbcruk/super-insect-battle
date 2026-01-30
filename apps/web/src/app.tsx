import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { AppLayout } from '@super-insect-battle/web-ui'
import { HomePage } from './pages/home.tsx'
import { BattleSetupPage } from './pages/battle-setup.tsx'
import { BattlePage } from './pages/battle.tsx'
import { EncyclopediaPage } from './pages/encyclopedia.tsx'
import { StatisticsPage } from './pages/statistics.tsx'

export default function App(): React.ReactNode {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="battle/setup" element={<BattleSetupPage />} />
          <Route path="battle" element={<BattlePage />} />
          <Route path="encyclopedia" element={<EncyclopediaPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
