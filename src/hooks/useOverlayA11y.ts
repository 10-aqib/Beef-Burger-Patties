import { useEffect, useRef } from 'react'

// ─── Global Scroll Lock Counter ─────────────────────────────────
let activeOverlayCount = 0
let originalOverflow = ''

function lockBodyScroll() {
  if (typeof document === 'undefined') return
  if (activeOverlayCount === 0) {
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  activeOverlayCount++
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return
  activeOverlayCount = Math.max(0, activeOverlayCount - 1)
  if (activeOverlayCount === 0) {
    document.body.style.overflow = originalOverflow
  }
}

// ─── Global Escape Key Stack ────────────────────────────────────
type EscapeHandler = () => void
const escapeStack: EscapeHandler[] = []

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && escapeStack.length > 0) {
      e.preventDefault()
      const topHandler = escapeStack[escapeStack.length - 1]
      if (topHandler) {
        topHandler()
      }
    }
  })
}

interface UseOverlayA11yOptions {
  isOpen: boolean
  onClose: () => void
  containerRef?: React.RefObject<HTMLElement | null>
  trapFocus?: boolean
  initialFocusRef?: React.RefObject<HTMLElement | null>
}

/**
 * useOverlayA11y
 * 
 * Comprehensive accessibility hook for modals, drawers, and overlays:
 * 1. Safe reference-counted body scroll lock (nested modals won't prematurely unlock scroll)
 * 2. LIFO Escape key stack (only the topmost overlay dismisses on Escape)
 * 3. Focus return to the trigger element on close
 * 4. Keyboard focus trapping within the active overlay dialog
 */
export function useOverlayA11y({
  isOpen,
  onClose,
  containerRef,
  trapFocus = true,
  initialFocusRef,
}: UseOverlayA11yOptions) {
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Manage body scroll lock
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll()
      return () => {
        unlockBodyScroll()
      }
    }
  }, [isOpen])

  // Manage Escape key stack
  useEffect(() => {
    if (!isOpen) return

    escapeStack.push(onClose)
    return () => {
      const idx = escapeStack.lastIndexOf(onClose)
      if (idx !== -1) {
        escapeStack.splice(idx, 1)
      }
    }
  }, [isOpen, onClose])

  // Manage Focus: capture previous, focus container, trap tab key, return on close
  useEffect(() => {
    if (!isOpen) return

    // Save triggering element
    previousActiveElement.current = document.activeElement as HTMLElement | null

    // Focus initial target or container
    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else if (containerRef?.current) {
        containerRef.current.focus()
      }
    }, 50)

    function handleTabKey(e: KeyboardEvent) {
      if (!trapFocus || e.key !== 'Tab' || !containerRef?.current) return

      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    window.addEventListener('keydown', handleTabKey)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleTabKey)
      // Restore focus to trigger element
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, trapFocus, containerRef, initialFocusRef])
}
