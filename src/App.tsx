import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { AppShell } from './components/AppShell'
import { BalancePage } from './features/balance/BalancePage'
import { WalletDetailPage } from './features/balance/WalletDetailPage'
import { HomePage } from './features/home/HomePage'
import { CategoriesPage } from './features/settings/CategoriesPage'
import { CategoryFormPage } from './features/settings/CategoryFormPage'
import { CurrenciesPage } from './features/settings/CurrenciesPage'
import { CurrencyFormPage } from './features/settings/CurrencyFormPage'
import { ThemePage } from './features/settings/ThemePage'
import { WalletsPage } from './features/settings/WalletsPage'
import { WalletFormPage } from './features/settings/WalletFormPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { TransactionPage } from './features/transaction/TransactionPage'

const bottomNavRoutes = ['/', '/balance', '/settings']

export function RoutedApp() {
  const location = useLocation()
  const showBottomNav = bottomNavRoutes.some((route) => {
    if (route === '/') {
      return location.pathname === '/'
    }
    if (route === '/settings') {
      return location.pathname === '/settings' || location.pathname.startsWith('/settings/')
    }
    return location.pathname === route
  })

  return (
    <AppShell showBottomNav={showBottomNav}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/balance" element={<BalancePage />} />
        <Route path="/balance/wallet/:id" element={<WalletDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/wallets" element={<WalletsPage />} />
        <Route path="/settings/wallets/new" element={<WalletFormPage />} />
        <Route path="/settings/wallets/:id" element={<WalletFormPage />} />
        <Route path="/settings/categories" element={<CategoriesPage />} />
        <Route path="/settings/categories/new" element={<CategoryFormPage />} />
        <Route path="/settings/categories/:id" element={<CategoryFormPage />} />
        <Route path="/settings/currencies" element={<CurrenciesPage />} />
        <Route path="/settings/currencies/new" element={<CurrencyFormPage />} />
        <Route path="/settings/currencies/:code" element={<CurrencyFormPage />} />
        <Route path="/settings/theme" element={<ThemePage />} />
        <Route path="/transaction/new" element={<TransactionPage />} />
        <Route path="/transaction/repeat/:sourceId/:date" element={<TransactionPage />} />
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
