/**
 * ═══ Session + RBAC policy constants ═══
 *
 * Centralised so login + middleware + config endpoint all agree on
 * the same numbers and key lists.
 */

/** Session expires after 12 hours of inactivity. */
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000

/**
 * On admin requests we slide the session forward, but re-encrypting the
 * cookie on every read is wasteful — only re-issue when this much time
 * has passed since the last refresh. Keeps the worst-case "session
 * recently extended" lag under 5 min while keeping per-request cost
 * basically free.
 */
export const SESSION_SLIDE_INTERVAL_MS = 5 * 60 * 1000

/**
 * SUPER_ADMIN-only siteConfig keys. EDITOR can edit content + appearance
 * (navigation, seo, social, appearance, homepage_sections, webzine_topics,
 * faq, download_page) but not these system-level toggles.
 */
export const SUPER_ADMIN_CONFIG_KEYS: ReadonlySet<string> = new Set([
  'integrations',
  'maintenance',
])

/**
 * Path prefixes that require SUPER_ADMIN role for mutating methods. The
 * middleware uses prefix-startsWith matching, so '/api/admin/users' covers
 * '/api/admin/users/[id]' too. Add new SUPER_ADMIN-only resources here — this
 * is the single source of truth, paired with SUPER_ADMIN_CONFIG_KEYS for the
 * per-key /api/admin/config gate.
 */
export const SUPER_ADMIN_ONLY_PATH_PREFIXES: readonly string[] = [
  '/api/admin/users',
  '/api/admin/backup/import',
  '/api/admin/backup/import-wp',
]

/** Methods that mutate state and therefore must respect SUPER_ADMIN gates. */
export const MUTATING_METHODS: ReadonlySet<string> = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/** True when the given (path, method) combination requires SUPER_ADMIN. */
export function requiresSuperAdmin(path: string, method: string): boolean {
  if (!MUTATING_METHODS.has(method)) return false
  return SUPER_ADMIN_ONLY_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
}
