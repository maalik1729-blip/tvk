/**
 * TvkWave — Animated wave decoration in TVK colors (red, yellow, orange).
 *
 * Props:
 *   position: 'bottom' (default) | 'top'
 *   variant : 'compact' | 'default' | 'tall'
 *   className: extra classes for the container
 *
 * Usage:
 *   <div className="relative">
 *     <TvkWave />
 *   </div>
 */
export default function TvkWave({ position = 'bottom', variant = 'default', className = '' }) {
  const heightClass =
    variant === 'compact' ? 'tvk-wave-compact'
    : variant === 'tall'  ? 'tvk-wave-tall'
    : ''
  const topClass = position === 'top' ? 'tvk-wave-top' : ''

  return (
    <div className={`tvk-wave-container ${topClass} ${heightClass} ${className}`} aria-hidden="true">
      {/* Wave 1 — TVK red */}
      <svg
        className="tvk-wave-svg-1"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 C1680,100 1920,20 2160,60 C2400,100 2640,20 2880,60 L2880,120 L0,120 Z"
          fill="#C8102E"
        />
      </svg>
      {/* Wave 2 — TVK yellow */}
      <svg
        className="tvk-wave-svg-2"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,80 C240,40 480,110 720,75 C960,40 1200,100 1440,70 C1680,40 1920,110 2160,75 C2400,40 2640,100 2880,75 L2880,120 L0,120 Z"
          fill="#FFCC00"
        />
      </svg>
      {/* Wave 3 — TVK orange */}
      <svg
        className="tvk-wave-svg-3"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,95 C240,75 480,115 720,90 C960,65 1200,110 1440,90 C1680,70 1920,110 2160,90 C2400,70 2640,110 2880,90 L2880,120 L0,120 Z"
          fill="#FF8C00"
        />
      </svg>
    </div>
  )
}
