import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { AppLayout } from './components/layout/app-layout.tsx'
import { HomePage } from './pages/home.tsx'
import { BattleSetupPage } from './pages/battle-setup.tsx'
import { BattlePage } from './pages/battle.tsx'
import { EncyclopediaPage } from './pages/encyclopedia.tsx'
import { EncyclopediaDetailPage } from './pages/encyclopedia-detail.tsx'
import { StatisticsPage } from './pages/statistics.tsx'
import { ReplayPage } from './pages/replay.tsx'

export default function App(): React.ReactNode {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<BattleSetupPage />} />
          <Route path="dashboard" element={<HomePage />} />
          <Route path="battle" element={<BattlePage />} />
          <Route path="encyclopedia" element={<EncyclopediaPage />} />
          <Route path="encyclopedia/:id" element={<EncyclopediaDetailPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="replay" element={<ReplayPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
