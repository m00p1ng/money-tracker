import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { AppShell } from './components/AppShell'
import { BalancePage } from './features/balance/BalancePage'
import { WalletDetailPage } from './features/balance/WalletDetailPage'
import { HomePage } from './features/home/HomePage'
import { CategoriesPage } from './features/settings/CategoriesPage'
import { CurrenciesPage } from './features/settings/CurrenciesPage'
import { ThemePage } from './features/settings/ThemePage'
import { WalletsPage } from './features/settings/WalletsPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { TransactionPage } from './features/transaction/TransactionPage'

const bottomNavRoutes = new Set(['/', '/balance', '/settings'])

export function RoutedApp() {
  const location = useLocation()
  const showBottomNav = bottomNavRoutes.has(location.pathname)

  return (
    <AppShell showBottomNav={showBottomNav}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/balance" element={<BalancePage />} />
        <Route path="/balance/wallet/:id" element={<WalletDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/wallets" element={<WalletsPage />} />
        <Route path="/settings/categories" element={<CategoriesPage />} />
        <Route path="/settings/currencies" element={<CurrenciesPage />} />
        <Route path="/settings/theme" element={<ThemePage />} />
        <Route path="/transaction/new" element={<TransactionPage />} />
        <Route path="/transaction/:id" element={<TransactionPage />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  )
}
