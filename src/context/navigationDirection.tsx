import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate, type NavigateOptions, type To } from 'react-router'

type Direction = 'forward' | 'back'

interface NavigationDirectionContextValue {
  direction: Direction
  setDirection: (d: Direction) => void
}

const NavigationDirectionContext = createContext<NavigationDirectionContextValue>({
  direction: 'forward',
  setDirection: () => {},
})

export function NavigationDirectionProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<Direction>('forward')
  return (
    <NavigationDirectionContext.Provider value={{ direction, setDirection }}>
      {children}
    </NavigationDirectionContext.Provider>
  )
}

export function useNavigationDirection() {
  return useContext(NavigationDirectionContext)
}

export function useBackNavigate() {
  const navigate = useNavigate()
  const { setDirection } = useNavigationDirection()
  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      setDirection('back')
      if (typeof to === 'number') {
        navigate(to)
      } else {
        navigate(to, options)
      }
    },
    [navigate, setDirection],
  )
}
