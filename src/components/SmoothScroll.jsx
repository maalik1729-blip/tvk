import { useEffect, useRef } from 'react'

/**
 * Lenis smooth-scroll wrapper. Initialises a global Lenis instance on mount
 * and tears it down on unmount. Uses dynamic import so the bundle still
 * builds even if `lenis` is not yet installed.
 */
export default function SmoothScroll({ children }) {
  const rafRef = useRef(null)
  const lenisRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    import('lenis')
      .then(({ default: Lenis }) => {
        if (cancelled) return
        const lenis = new Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.4,
        })
        lenisRef.current = lenis
        // Expose for inner anchor scrolls if needed
        window.__lenis = lenis

        const raf = (time) => {
          lenis.raf(time)
          rafRef.current = requestAnimationFrame(raf)
        }
        rafRef.current = requestAnimationFrame(raf)
      })
      .catch(() => {
        // Lenis not installed — fall back to native smooth scrolling.
      })

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      delete window.__lenis
    }
  }, [])

  return children
}
