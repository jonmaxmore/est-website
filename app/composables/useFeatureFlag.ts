/**
 * ═══ Feature flags + A/B bucketing (client) ═══
 *
 * Reads the `feature_flags` siteConfig key — a JSON map like
 *   { "newCta": true, "heroVariantB": { "rolloutPct": 25 } }
 * and decides for the current visitor whether the flag is on.
 *
 * Bucketing strategy: visitor gets a stable cookie `__ets_bucket` (1-100,
 * httpOnly: false so the client can read it). For a flag with `rolloutPct`,
 * we return on iff bucket <= rolloutPct. Plain boolean flags ignore the
 * bucket. This is sticky across reloads but rotates if the user clears
 * cookies — good enough for non-billing experiments.
 *
 * Audit-2 (C-1) finding #24 close.
 */
type FlagDef = boolean | { enabled?: boolean; rolloutPct?: number }
type FlagMap = Record<string, FlagDef>

const COOKIE_NAME = '__ets_bucket'

function readBucket(): number {
  if (!import.meta.client) return 1
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=(\\d+)`))
  if (match) return Math.min(100, Math.max(1, Number(match[1]) || 1))
  const fresh = Math.floor(Math.random() * 100) + 1
  document.cookie = `${COOKIE_NAME}=${fresh}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  return fresh
}

function evaluate(def: FlagDef, bucket: number): boolean {
  if (def === true) return true
  if (def === false || def == null) return false
  if (def.enabled === false) return false
  if (typeof def.rolloutPct === 'number') {
    return bucket <= Math.min(100, Math.max(0, def.rolloutPct))
  }
  return def.enabled === true
}

export function useFeatureFlag(name: string) {
  const { data: site } = useNuxtData<{ featureFlags?: FlagMap }>('public-site')
  const flags = computed<FlagMap>(() => site.value?.featureFlags ?? {})
  const bucket = readBucket()
  return computed(() => evaluate(flags.value[name], bucket))
}

/** Helper for components that just need to know "is flag X on right now". */
export function isFlagEnabled(flags: FlagMap | undefined, name: string, bucket: number): boolean {
  if (!flags) return false
  return evaluate(flags[name], bucket)
}
