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
