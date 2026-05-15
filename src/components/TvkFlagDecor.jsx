/**
 * TvkFlagDecor — Subtle 3D TVK flag watermark for section backgrounds.
 *
 * Props:
 *   position : 'top-right' (default) | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
 *   variant  : 'light' (default, for white/light bg) | 'dark' (for dark bg, uses screen blend)
 *   size     : tailwind size class for the image (e.g. 'h-64', 'h-80'); default 'h-72'
 *   opacity  : decimal opacity (0–1); default 0.07 for light, 0.18 for dark
 */
export default function TvkFlagDecor({
  position = 'top-right',
  variant = 'light',
  size = 'h-72',
  opacity,
}) {
  const positionClass =
    position === 'top-left'     ? 'top-4 -left-10' :
    position === 'bottom-right' ? '-bottom-10 -right-10' :
    position === 'bottom-left'  ? '-bottom-10 -left-10' :
    position === 'center'       ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                                   '-top-10 -right-10' // top-right default

  const op = opacity ?? (variant === 'dark' ? 0.18 : 0.07)
  const blend = variant === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply'

  return (
    <img
      src="/9a355bb7-ad98-488e-8575-f587165170ac.png"
      alt=""
      aria-hidden="true"
      className={`absolute ${positionClass} ${size} w-auto max-w-none object-contain pointer-events-none select-none z-0 ${blend}`}
      style={{ opacity: op }}
      loading="lazy"
    />
  )
}
