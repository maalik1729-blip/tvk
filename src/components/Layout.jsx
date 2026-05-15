import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Topbar from './Topbar'
import Footer from './Footer'
import SmoothScroll from './SmoothScroll'
import ScrollProgress from './ScrollProgress'
import HelpFab from './HelpFab'

/**
 * App shell. Hides the topbar/footer on the dedicated auth screens — those
 * pages are full-bleed centred panels that look better without the rest of
 * the chrome competing for attention.
 */
export default function Layout() {
  const { pathname } = useLocation()
  const minimal = pathname === '/login' || pathname === '/register'

  // Scroll to top on route change (works with Lenis too)
  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  if (minimal) {
    return (
      <SmoothScroll>
        <div className="min-h-screen bg-white">
          <Outlet />
        </div>
      </SmoothScroll>
    )
  }

  return (
    <SmoothScroll>
      <ScrollProgress />
      <div className="min-h-screen flex flex-col bg-white">
        <Topbar />
        <main className="flex-1 pt-16 sm:pt-[68px]">
          <Outlet />
        </main>
        <Footer />
      </div>
      <HelpFab />
    </SmoothScroll>
  )
}
