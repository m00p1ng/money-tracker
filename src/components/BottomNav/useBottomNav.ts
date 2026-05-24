import { useRef, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'

const DESIGN_TRIGGER_CLICKS = 3
const DESIGN_TRIGGER_WINDOW_MS = 1200

export function useBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const settingsPresses = useRef({ count: 0, lastPressAt: 0 })

  function onSettingsPress(event: MouseEvent<HTMLAnchorElement>) {
    const now = Date.now()
    const withinWindow = now - settingsPresses.current.lastPressAt <= DESIGN_TRIGGER_WINDOW_MS
    const count = withinWindow
      ? settingsPresses.current.count + 1
      : 1

    settingsPresses.current = { count, lastPressAt: now }

    if (count >= DESIGN_TRIGGER_CLICKS) {
      event.preventDefault()
      settingsPresses.current = { count: 0, lastPressAt: 0 }
      navigate('/design')
    }
  }

  return { pathname: location.pathname, onSettingsPress }
}
