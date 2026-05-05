/**
 * ═══ Sentry — Client-side error tracking ═══
 *
 * Activated by NUXT_PUBLIC_SENTRY_DSN. When unset, this plugin no-ops so the
 * site renders cleanly without a Sentry account. Pairs with the Nitro-side
 * plugin in server/plugins/sentry.ts.
 *
 * Console errors and unhandled promise rejections in the browser are forwarded
 * to Sentry. Vue render errors are also captured via Vue's app.config.errorHandler.
 */
import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const dsn = (config.public as { sentryDsn?: string }).sentryDsn
  if (!dsn) return

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn,
    environment: (config.public as { env?: string }).env || 'development',
    release: (config.public as { gitCommit?: string }).gitCommit,
    tracesSampleRate: 0.1,
    // Don't auto-attach replay/profiling — cost-sensitive defaults
    integrations: [],
  })
})
