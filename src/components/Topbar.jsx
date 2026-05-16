import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LogOut, User as UserIcon, ChevronDown, Search, Eye,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { cn } from './ui/cn'
import Button from './ui/Button'

/**
 * Flat brand bar.
 * Spec: outputs/04 → Header Changes.
 *
 * Always solid bg-surface, hairline bottom border, single height that does
 * not transition on scroll. Nav links live here on lg+ only; on smaller
 * viewports the bottom tab bar takes over.
 */
const NAV_AUTH = [
  { to: '/grievance',     label: 'File'        },
  { to: '/track',         label: 'Track'       },
  { to: '/my-grievances', label: 'My Requests' },
]

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)

  // Close menu on outside click or Escape; return focus to trigger.
  useEffect(() => {
    if (!menuOpen) return
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // Close menu on route change.
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const initial = (user?.name || user?.phone || 'U').charAt(0).toUpperCase()

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 left-0 right-0 z-50 h-14 lg:h-16 bg-surface border-b border-hairline">
      <div className="max-w-[1200px] mx-auto h-full px-4 lg:px-8 flex items-center gap-4">

        {/* Brand lockup — logo + wordmark + sub-line */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 group rounded-md px-1 -mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
        >
          <img
            src="/f1c0ef41-c286-4bb3-807b-a2c94904e4b4.png"
            alt=""
            aria-hidden="true"
            width="32"
            height="32"
            className="w-8 h-8 rounded-md object-cover shadow-e1 shrink-0 ring-1 ring-hairline"
          />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-[15px] font-semibold text-ink-900 tracking-tight">Mylapore</span>
            <span className="text-[11px] text-ink-500 font-medium tracking-wide">Grievance Portal</span>
          </span>
        </Link>

        {/* Inline nav — lg+ only */}
        {user && (
          <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Primary">
            {NAV_AUTH.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'relative px-3 py-2 rounded-md text-[14px] font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2',
                    isActive
                      ? 'text-ink-900'
                      : 'text-ink-700 hover:bg-surface-2 hover:text-ink-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-brand-red rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2">
          {!user ? (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center h-9 px-3 rounded-md text-[14px] font-medium text-ink-700 hover:text-ink-900 hover:bg-surface-2 transition-colors"
              >
                Sign in
              </Link>
              <Button as={Link} to="/register" kind="primary" size="sm">
                Register
              </Button>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setMenuOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={cn(
                  'flex items-center gap-2 h-9 pl-1 pr-2 rounded-md',
                  'border border-transparent hover:border-hairline hover:bg-surface-2 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2',
                )}
              >
                <span className="w-7 h-7 rounded-full bg-surface-2 border border-hairline flex items-center justify-center text-[12px] font-semibold text-ink-900">
                  {initial}
                </span>
                <span className="hidden sm:inline text-[13px] font-medium text-ink-900 max-w-[140px] truncate">
                  {user.name || user.phone}
                </span>
                <ChevronDown className={cn('hidden sm:block w-3.5 h-3.5 text-ink-500 transition-transform', menuOpen && 'rotate-180')} aria-hidden="true" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-md bg-panel border border-hairline shadow-e2 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-hairline">
                    <div className="text-[14px] font-semibold text-ink-900 truncate">
                      {user.name || 'Member'}
                    </div>
                    <div className="text-[12px] text-ink-500 mt-0.5 truncate">
                      +{user.phone}
                    </div>
                  </div>

                  <div className="py-1">
                    <MenuItem icon={Eye}    label="My Requests"     onClick={() => { setMenuOpen(false); navigate('/my-grievances') }} />
                    <MenuItem icon={Search} label="Track Grievance" onClick={() => { setMenuOpen(false); navigate('/track') }} />
                  </div>

                  <div className="border-t border-hairline py-1">
                    <MenuItem
                      icon={LogOut}
                      label="Sign out"
                      onClick={handleLogout}
                      tone="danger"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuItem({ icon: Icon, label, onClick, tone }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-2 text-[13px] font-medium flex items-center gap-3 transition-colors',
        'focus-visible:outline-none focus-visible:bg-surface-2',
        tone === 'danger'
          ? 'text-status-danger hover:bg-status-danger/5'
          : 'text-ink-700 hover:bg-surface-2 hover:text-ink-900',
      )}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      {label}
    </button>
  )
}
