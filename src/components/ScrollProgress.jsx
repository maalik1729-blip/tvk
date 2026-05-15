import { useEffect, useRef } from 'react'

/**
 * Thin gradient progress bar that tracks vertical scroll position.
 * Uses requestAnimationFrame so it remains smooth alongside Lenis.
 */
export default function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const el = barRef.current
      if (!el) return
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0
      el.style.width = pct + '%'
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return <div ref={barRef} className="tvk-scroll-progress" aria-hidden="true" />
}
