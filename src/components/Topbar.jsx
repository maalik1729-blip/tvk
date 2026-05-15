import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, X, LogOut, User as UserIcon, FileText, Eye, Search, Home, ChevronDown, Phone,
} from 'lucide-react'
import { useAuth } from '../lib/auth'

/**
 * Sticky glassmorphism TVK navbar.
 * Goes opaque after the user scrolls past 8px so the page hero can breathe
 * while keeping the bar legible everywhere else.
 */
export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const allItems = user
    ? [
        { to: '/',              label: 'Home',           Icon: Home },
        { to: '/grievance',     label: 'File Grievance', Icon: FileText },
        { to: '/my-grievances', label: 'My Requests',    Icon: Eye },
        { to: '/track',         label: 'Track',          Icon: Search },
      ]
    : [
        { to: '/',         label: 'Home',  Icon: Home },
      ]
  // Hide "Home" entry when already on the landing page
  const navItems = isHome ? allItems.filter((i) => i.to !== '/') : allItems

  const initial = (user?.name || user?.phone || 'U').charAt(0).toUpperCase()

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className={`tvk-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 md:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-3 sm:gap-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div
            className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-tvk-red/30 group-hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}
          >
            <img
              src="/9a355bb7-ad98-488e-8575-f587165170ac.png"
              alt="TVK Flag"
              className="w-7 h-7 object-contain rounded-sm shadow-inner"
            />
            <span
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-7 h-1 rounded-full"
              style={{ background: 'linear-gradient(90deg, #FFD60A 0%, #FF8C00 100%)' }}
            />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-extrabold text-tvk-black text-[15px] tracking-tight">Mylapore</div>
            <div className="text-[10px] text-tvk-red uppercase tracking-[0.18em] font-bold mt-0.5">
              TVK • Grievance Portal
            </div>
          </div>
        </Link>

        {/* Centred desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `tvk-nav-link ripple ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Auth cluster */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!user ? (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-[13px] font-semibold text-tvk-black hover:text-tvk-red hover:bg-tvk-red/5 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="ripple inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[13px] font-bold text-white shadow-md hover:-translate-y-0.5 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)',
                  boxShadow: '0 8px 22px -8px rgba(200,16,46,0.55)',
                }}
              >
                <UserIcon className="w-4 h-4" strokeWidth={2.4} />
                Register
              </Link>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-tvk-red/5 transition-all border border-transparent hover:border-tvk-red/15"
              >
                <span
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center text-[13px] font-bold shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}
                >
                  {initial}
                </span>
                <span className="hidden sm:inline text-[13px] font-semibold text-tvk-black max-w-[140px] truncate">
                  {user.name || user.phone}
                </span>
                <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-tvk-red/10 shadow-2xl overflow-hidden">
                  <div
                    className="px-5 py-5 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #8B0000 0%, #C8102E 60%, #5A0000 100%)' }}
                  >
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-tvk-yellow/15 rounded-full blur-xl"></div>
                    <div className="relative z-10 flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-tvk-yellow/20 border border-tvk-yellow/40 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <span className="text-base font-bold text-white">{initial}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-bold text-white truncate">{user.name || 'Member'}</div>
                        <div className="text-[12px] text-tvk-yellow/90 mt-0.5 truncate">+{user.phone}</div>
                        {user.epic && (
                          <div className="text-[11px] text-white/70 mt-1 font-medium">EPIC: {user.epic}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); navigate('/my-grievances') }}
                      className="w-full text-left px-5 py-3 text-[13px] text-gray-700 hover:bg-tvk-red/5 hover:text-tvk-red flex items-center gap-3 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 flex-shrink-0" strokeWidth={2.2} />
                      <span className="font-semibold">My Requests</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); navigate('/track') }}
                      className="w-full text-left px-5 py-3 text-[13px] text-gray-700 hover:bg-tvk-red/5 hover:text-tvk-red flex items-center gap-3 transition-colors"
                    >
                      <Search className="w-4 h-4 flex-shrink-0" strokeWidth={2.2} />
                      <span className="font-semibold">Track Grievance</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-100"></div>

                  <div className="py-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={2.2} />
                      <span className="font-semibold">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-xl text-tvk-black hover:bg-tvk-red/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-tvk-red/10 bg-white shadow-lg">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-tvk-black hover:bg-tvk-red/5 hover:text-tvk-red'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }
                    : undefined
                }
              >
                <Icon className="w-4 h-4" strokeWidth={2.2} />
                {label}
              </NavLink>
            ))}
            {!user && (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-1 px-4 py-3 rounded-xl text-sm font-semibold text-tvk-black bg-tvk-red/5 text-center hover:bg-tvk-red/10 transition-colors"
              >
                Log In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
