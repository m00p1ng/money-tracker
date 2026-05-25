import {
  AnimatePresence,
  motion,
  type Variants,
} from 'framer-motion'
import { useLayoutEffect, useState } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router'

import { AppShell } from '@/components'
import { NavigationDirectionProvider, useNavigationDirection } from '@/context/navigationDirection'
import { BalancePage, WalletDetailPage } from '@/features/balance'
import { DesignPage } from '@/features/design'
import { HomePage } from '@/features/home'
import {
  CategoriesPage,
  CategoryFormPage,
  CurrenciesPage,
  CurrencyFormPage,
  SettingsPage,
  ThemePage,
  WalletFormPage,
  WalletsPage,
} from '@/features/settings'
import { CategorySelectionPage, TransactionPage } from '@/features/transaction'

const TAB_ROUTES = new Set(['/', '/balance', '/settings'])

const tabVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

function makePageVariants(direction: 'forward' | 'back'): Variants {
  const enterX = direction === 'back' ? '-100%' : '100%'
  const exitX = direction === 'back' ? '100%' : '-100%'

  return {
    initial: { x: enterX },
    animate: {
      x: 0,
      transition: { type: 'spring', stiffness: 350, damping: 35, mass: 1 },
    },
    exit: {
      x: exitX,
      transition: { type: 'spring', stiffness: 350, damping: 35, mass: 1 },
    },
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
    const variants = isCurrentTab && isPrevTab
      ? tabVariants
      : makePageVariants(direction)
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
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100%' }}>
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={location.pathname}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: 'absolute', width: '100%', top: 0 }}
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
      </div>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/money-tracker">
      <NavigationDirectionProvider>
        <Routes>
          <Route path="/design" element={<DesignPage />} />
          <Route path="/*" element={<RoutedApp />} />
        </Routes>
      </NavigationDirectionProvider>
    </BrowserRouter>
  )
}
