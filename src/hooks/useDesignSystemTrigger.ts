// src/hooks/useDesignSystemTrigger.ts
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'

/**
 * Returns a ref to attach to the logo element for long-press detection.
 * Also listens for Shift+D globally to navigate to /design.
 */
export function useDesignSystemTrigger() {
  const navigate = useNavigate()
  const logoRef = useRef<HTMLElement | null>(null)

  // Keyboard: Shift+D
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.shiftKey && e.key === 'D') {
        navigate('/design')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  // Long-press: 600ms on logo element
  useEffect(() => {
    const el = logoRef.current
    if (!el) {
      return
    }

    let timer: ReturnType<typeof setTimeout> | null = null

    function start() {
      timer = setTimeout(() => navigate('/design'), 600)
    }
    function cancel() {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
    }

    el.addEventListener('pointerdown', start)
    el.addEventListener('pointerup', cancel)
    el.addEventListener('pointerleave', cancel)

    return () => {
      el.removeEventListener('pointerdown', start)
      el.removeEventListener('pointerup', cancel)
      el.removeEventListener('pointerleave', cancel)
      cancel()
    }
  }, [navigate])

  return logoRef
}
