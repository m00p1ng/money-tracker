import { useLayoutEffect, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import AppShell from '@/components/AppShell'
import BalancePage from '@/features/balance/BalancePage'
import WalletDetailPage from '@/features/balance/WalletDetailPage'
import HomePage from '@/features/home/HomePage'
import CategoriesPage from '@/features/settings/CategoriesPage'
import CategoryFormPage from '@/features/settings/CategoryFormPage'
import CurrenciesPage from '@/features/settings/CurrenciesPage'
import CurrencyFormPage from '@/features/settings/CurrencyFormPage'
import ThemePage from '@/features/settings/ThemePage'
import WalletsPage from '@/features/settings/WalletsPage'
import WalletFormPage from '@/features/settings/WalletFormPage'
import SettingsPage from '@/features/settings/SettingsPage'
import CategorySelectionPage from '@/features/transaction/CategorySelectionPage'
import TransactionPage from '@/features/transaction/TransactionPage'
import DesignPage from '@/features/design/DesignPage'
import { NavigationDirectionProvider, useNavigationDirection } from '@/context/navigationDirection'

const TAB_ROUTES = new Set(['/', '/balance', '/settings'])

const tabVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

function makePageVariants(direction: 'forward' | 'back'): Variants {
  const enterX = direction === 'back' ? -24 : 24
  const exitX = direction === 'back' ? 24 : -24
  return {
    initial: { opacity: 0, x: enterX, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 30 } },
    exit: { opacity: 0, x: exitX, scale: 0.98, transition: { duration: 0.18, ease: 'easeIn' } },
  }
}

const bottomNavRoutes = ['/', '/balance', '/settings']

function useRouteVariants(pathname: string, direction: 'forward' | 'back'): Variants {
  const [state, setState] = useState({
    prevPath: pathname,
    variants: tabVariants as Variants,
  })

  if (state.prevPath !== pathname) {
    const isCurrentTab = TAB_ROUTES.has(pathname)
    const isPrevTab = TAB_ROUTES.has(state.prevPath)
    const variants = isCurrentTab && isPrevTab ? tabVariants : makePageVariants(direction)
    setState({ prevPath: pathname, variants })
    return variants
  }

  return state.variants
}

export function RoutedApp() {
  const location = useLocation()
  const { direction, setDirection } = useNavigationDirection()
  const variants = useRouteVariants(location.pathname, direction)

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
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ minHeight: '100%' }}
        >
          <Routes location={location}>
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
            <Route path="/transaction/category" element={<CategorySelectionPage />} />
            <Route path="/transaction/new" element={<TransactionPage />} />
            <Route path="/transaction/repeat/:sourceId/:date" element={<TransactionPage />} />
            <Route path="/transaction/:id" element={<TransactionPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <NavigationDirectionProvider>
        <Routes>
          <Route path="/design" element={<DesignPage />} />
          <Route path="/*" element={<RoutedApp />} />
        </Routes>
      </NavigationDirectionProvider>
    </BrowserRouter>
  )
}
