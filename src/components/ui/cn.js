// Tiny class-name joiner used by all UI primitives.
// Filters out falsy values so `cn('a', cond && 'b')` works cleanly.
export function cn(...args) {
  return args.filter(Boolean).join(' ')
}
