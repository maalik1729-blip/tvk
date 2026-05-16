import { NavLink, useLocation } from 'react-router-dom'
import { FileText, Search, Eye, User as UserIcon, Home, LogIn } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { cn } from './ui/cn'

/**
 * Persistent bottom tab bar for sm/md viewports only.
 * Spec: outputs/04 → Navigation Improvements → BottomTabBar.
 *
 * Hidden on lg+ (top nav takes over) and on auth screens (Layout drops chrome).
 */
const AUTH_TABS = [
  { to: '/grievance',     label: 'File',     Icon: FileText },
  { to: '/track',         label: 'Track',    Icon: Search   },
  { to: '/my-grievances', label: 'Requests', Icon: Eye      },
  { to: '/profile',       label: 'Profile',  Icon: UserIcon },
]

const GUEST_TABS = [
  { to: '/',         label: 'Home',     Icon: Home  },
  { to: '/login',    label: 'Sign in',  Icon: LogIn },
  { to: '/register', label: 'Register', Icon: UserIcon },
]

export default function BottomTabBar() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  // Hide on auth screens to avoid duplicate chrome.
  if (pathname === '/login' || pathname === '/register') return null

  const tabs = user ? AUTH_TABS : GUEST_TABS

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40
                 bg-surface border-t border-hairline
                 grid grid-cols-4
                 pb-[env(safe-area-inset-bottom)]"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'relative flex flex-col items-center justify-center gap-1 h-[52px]',
              'min-h-[44px] min-w-[44px] text-[11px] font-semibold',
              'transition-colors',
              isActive
                ? 'text-ink-900'
                : 'text-ink-500 hover:text-ink-900',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-3 right-3 h-[2px] bg-brand-red rounded-b-sm"
                />
              )}
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
