import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Topbar from './Topbar'
import Footer from './Footer'
import BottomTabBar from './BottomTabBar'
import SmoothScroll from './SmoothScroll'
import ScrollProgress from './ScrollProgress'

/**
 * App shell.
 * - Auth screens (/login, /register) render full-bleed without chrome.
 * - All other routes get Topbar + content + Footer + BottomTabBar (mobile only).
 *
 * Topbar is sticky (h-14 mobile / h-16 desktop). main has matching top padding
 * so anchored content doesn't sit under the bar. Bottom padding clears the
 * mobile tab bar so the last row of any list is reachable.
 */
export default function Layout() {
  const { pathname } = useLocation()
  const minimal = pathname === '/login' || pathname === '/register'

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
        <div className="min-h-screen bg-surface">
          <Outlet />
        </div>
      </SmoothScroll>
    )
  }

  return (
    <SmoothScroll>
      <ScrollProgress />
      <div className="min-h-screen flex flex-col bg-surface">
        <Topbar />
        <main className="flex-1 pb-[68px] lg:pb-0">
          {/* Topbar is `sticky`, no top padding needed on main */}
          <Outlet />
        </main>
        <Footer />
        <BottomTabBar />
      </div>
    </SmoothScroll>
  )
}
