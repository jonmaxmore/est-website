/**
 * ═══ Feature flags + A/B bucketing ═══
 *
 * Reads the `featureFlags` field from /api/public/site (admin-managed JSON
 * map). A flag value is either a plain boolean or `{ enabled?, rolloutPct? }`
 * for percentage rollouts.
 *
 * Bucketing: each visitor gets a sticky 1-100 cookie `__ets_bucket` (1y,
 * client-readable so the cookie survives across SSR/CSR cleanly via
 * useCookie — Nuxt syncs SSR + CSR for the same name). Flags with
 * rolloutPct return on iff bucket <= pct. Plain booleans ignore the bucket.
 *
 * Sticky across reloads, rotates on cookie clear. Good for non-billing
 * experiments; not authoritative for revenue gates.
 *
 * Audit-3 fix: previously this composable read `useNuxtData('public-site')`
 * but no `useFetch` in the app used that key, so flags were always {} →
 * every flag returned false. Now it does its own keyed fetch and dedupes
 * via Nuxt's payload cache.
 */
type FlagDef = boolean | { enabled?: boolean; rolloutPct?: number }
type FlagMap = Record<string, FlagDef>

const COOKIE_NAME = '__ets_bucket'
const SITE_FETCH_KEY = 'featureFlags:site'

export function useFeatureFlag(name: string) {
  // Sticky bucket via useCookie (SSR+CSR consistent, no hydration mismatch).
  const bucketCookie = useCookie<number | null>(COOKIE_NAME, {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    default: () => null,
  })
  if (bucketCookie.value == null) {
    bucketCookie.value = Math.floor(Math.random() * 100) + 1
  }
  const bucket = computed(() => Math.min(100, Math.max(1, bucketCookie.value || 1)))

  // Reuse a stable key so multiple useFeatureFlag calls share one fetch.
  const { data: site } = useFetch<{ featureFlags?: FlagMap }>('/api/public/site', {
    key: SITE_FETCH_KEY,
    pick: ['featureFlags'],
    default: () => ({ featureFlags: {} }),
  })
  const flags = computed<FlagMap>(() => site.value?.featureFlags ?? {})

  return computed(() => evaluate(flags.value[name], bucket.value))
}

function evaluate(def: FlagDef | undefined, bucket: number): boolean {
  if (def === true) return true
  if (def === false || def == null) return false
  if (def.enabled === false) return false
  if (typeof def.rolloutPct === 'number') {
    return bucket <= Math.min(100, Math.max(0, def.rolloutPct))
  }
  return def.enabled === true
}

/** Pure helper for components that have flags + bucket already in scope. */
export function isFlagEnabled(flags: FlagMap | undefined, name: string, bucket: number): boolean {
  if (!flags) return false
  return evaluate(flags[name], bucket)
}
