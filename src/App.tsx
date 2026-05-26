import { useLayoutEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router'

import { AppShell } from '@/components'
import { Background } from '@/components/Background'
import { NavigationDirectionProvider, useNavigationDirection } from '@/context/navigationDirection'
import { BalancePage, WalletDetailPage, WalletFormPage } from '@/features/balance'
import { CalendarPage } from '@/features/calendar'
import { DesignPage } from '@/features/design'
import { HomePage } from '@/features/home'
import {
  CategoriesPage,
  CategoryFormPage,
  CurrenciesPage,
  CurrencyFormPage,
  SettingsPage,
  ThemePage,
  WalletsPage,
} from '@/features/settings'
import { CategorySelectionPage, TransactionPage } from '@/features/transaction'

const bottomNavRoutes = ['/', '/balance', '/settings']

export function RoutedApp() {
  const location = useLocation()
  const { setDirection } = useNavigationDirection()

  useLayoutEffect(() => {
    setDirection('forward')
  }, [location.pathname, setDirection])

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
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/balance" element={<BalancePage />} />
        <Route path="/balance/wallet/:id" element={<WalletDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/wallets" element={<WalletsPage />} />
        <Route path="/balance/wallets/new" element={<WalletFormPage />} />
        <Route path="/balance/wallets/:id" element={<WalletFormPage />} />
        <Route path="/settings/categories" element={<CategoriesPage />} />
        <Route path="/settings/categories/new" element={<CategoryFormPage />} />
        <Route path="/settings/categories/:id" element={<CategoryFormPage />} />
        <Route path="/settings/currencies" element={<CurrenciesPage />} />
        <Route path="/settings/currencies/new" element={<CurrencyFormPage />} />
        <Route path="/settings/currencies/:code" element={<CurrencyFormPage />} />
        <Route path="/settings/theme" element={<ThemePage />} />
        <Route path="/transaction/category" element={<CategorySelectionPage />} />
        <Route path="/transaction/new" element={<TransactionPage />} />
        <Route path="/transaction/repeat/:sourceId/:date" element={<TransactionPage />} />
        <Route path="/transaction/:id" element={<TransactionPage />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <>
      <Background />
      <div className="relative" style={{ zIndex: 1 }}>
        <BrowserRouter basename="/money-tracker">
          <NavigationDirectionProvider>
            <Routes>
              <Route path="/design" element={<Navigate to="/design/tokens" replace />} />
              <Route path="/design/:section" element={<DesignPage />} />
              <Route path="/*" element={<RoutedApp />} />
            </Routes>
          </NavigationDirectionProvider>
        </BrowserRouter>
      </div>
    </>
  )
}
