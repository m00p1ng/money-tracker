import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'

import { NavigationDirectionProvider, useNavigationDirection, useBackNavigate } from '@/context/navigationDirection'

interface WrapperProps {
  children: React.ReactNode
}

function wrapper({ children }: WrapperProps) {
  return (
    <MemoryRouter>
      <NavigationDirectionProvider>{children}</NavigationDirectionProvider>
    </MemoryRouter>
  )
}

describe('NavigationDirectionContext', () => {
  it('defaults to forward', () => {
    const { result } = renderHook(() => useNavigationDirection(), { wrapper })
    expect(result.current.direction).toBe('forward')
  })

  it('useBackNavigate sets direction to back', () => {
    const { result } = renderHook(() => ({
      ctx: useNavigationDirection(),
      nav: useBackNavigate(),
    }), { wrapper })
    act(() => {
      result.current.nav('/settings')
    })
    expect(result.current.ctx.direction).toBe('back')
  })

  it('setDirection resets to forward', () => {
    const { result } = renderHook(() => useNavigationDirection(), { wrapper })
    act(() => result.current.setDirection('back'))
    act(() => result.current.setDirection('forward'))
    expect(result.current.direction).toBe('forward')
  })
})
