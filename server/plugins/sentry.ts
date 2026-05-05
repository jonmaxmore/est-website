/**
 * ═══ Sentry — Server-side error tracking ═══
 *
 * Activated by setting SENTRY_DSN in the environment. When unset (the default
 * in dev / unconfigured prod), the plugin no-ops so the codebase stays
 * runnable without any Sentry account.
 *
 * Captures:
 *  - Unhandled errors thrown by event handlers (via Nitro's error hook)
 *  - Manual `Sentry.captureException` calls from request handlers
 *
 * Sample rate is conservative by default (10%) so a traffic spike doesn't
 * blow the Sentry quota; production can override via SENTRY_TRACES_SAMPLE_RATE.
 *
 * Audit-2 (I-5): closes the "no error tracker" finding.
 */
import * as Sentry from '@sentry/node'
import { logger } from '../utils/logger'

const log = logger.child({ scope: 'sentry' })

export default defineNitroPlugin((nitroApp) => {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) {
    log.info('disabled', { reason: 'SENTRY_DSN not set' })
    return
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.GIT_COMMIT_SHA,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
    // Don't ship internal request data we already redact for privacy
    sendDefaultPii: false,
  })

  log.info('initialized', { environment: process.env.NODE_ENV })

  // Hook into Nitro's error pipeline. h3 errors with statusCode < 500 are
  // user-facing (404, 422, etc.) — skip them; only ship genuine 5xx + crashes.
  nitroApp.hooks.hook('error', (error, ctx) => {
    const status = (error as { statusCode?: number }).statusCode
    if (typeof status === 'number' && status < 500) return

    Sentry.withScope((scope) => {
      const requestId = ctx?.event?.context?.requestId
      if (typeof requestId === 'string') scope.setTag('requestId', requestId)
      if (ctx?.event?.path) scope.setTag('path', ctx.event.path)
      Sentry.captureException(error)
    })
  })
})
