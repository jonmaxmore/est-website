/**
 * ═══ Cookie Consent (PDPA / GDPR) ═══
 * Track marketing-cookie consent so the tracking plugin can gate GA/GTM/Meta
 * Pixel injection on explicit user opt-in.
 *
 * Storage: a first-party cookie `__ets_consent` with values 'accepted' | 'rejected'.
 * Cookie is 1-year max-age; banner re-prompts only if absent.
 *
 * Why a cookie (and not localStorage): we want the value reflected in SSR so
 * the layout can decide whether to render the banner without a hydration flash.
 */
export type ConsentStatus = 'accepted' | 'rejected' | 'unset'

const COOKIE_NAME = '__ets_consent'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function useConsent() {
  const cookie = useCookie<'accepted' | 'rejected' | null>(COOKIE_NAME, {
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    default: () => null,
  })

  const status = computed<ConsentStatus>(() => cookie.value || 'unset')
  const accepted = computed(() => status.value === 'accepted')
  const decided = computed(() => status.value !== 'unset')

  function accept() {
    cookie.value = 'accepted'
    if (import.meta.client) {
      window.dispatchEvent(new CustomEvent('ets:consent', { detail: { status: 'accepted' } }))
    }
  }

  function reject() {
    cookie.value = 'rejected'
    if (import.meta.client) {
      window.dispatchEvent(new CustomEvent('ets:consent', { detail: { status: 'rejected' } }))
    }
  }

  function reset() {
    cookie.value = null
  }

  return { status, accepted, decided, accept, reject, reset }
}
