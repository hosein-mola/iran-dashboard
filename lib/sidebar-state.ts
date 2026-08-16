export const SIDEBAR_COOKIE_NAME = 'sidebar_state'
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export function getSidebarOpenFromCookie(
  value: string | undefined,
  fallback = true
) {
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}
