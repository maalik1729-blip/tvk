import { useNavigate, useLocation } from 'react-router-dom'
import { FileText, HelpCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'

/**
 * Floating action button — quick access to "File a Grievance" for signed-in
 * users, or "Get Help" (login) for guests. Hidden on the file-grievance page
 * itself to avoid redundancy.
 */
export default function HelpFab() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()

  if (pathname === '/grievance' || pathname === '/login' || pathname === '/register') return null

  const onClick = () => navigate(user ? '/grievance' : '/login')
  const Icon = user ? FileText : HelpCircle
  const label = user ? 'File a Grievance' : 'Get Help'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="tvk-fab ripple group md:hidden"
    >
      <Icon className="w-6 h-6" strokeWidth={2.2} />
      <span className="sr-only">{label}</span>
    </button>
  )
}
