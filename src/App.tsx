import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { AppShell } from './components/AppShell'
import { HomePage } from './features/home/HomePage'
import { TransactionPage } from './features/transaction/TransactionPage'

function RoutedApp() {
  const location = useLocation()
  const showBottomNav = location.pathname === '/'

  return (
    <AppShell showBottomNav={showBottomNav}>
      <Routes>
        <Route path="/" element={<HomePage />} />
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
