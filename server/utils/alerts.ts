/**
 * ═══ Slack Alert Helper ═══
 * Send a one-shot alert to a Slack incoming webhook. Activated by
 * SLACK_ALERT_WEBHOOK_URL; no-ops when unset (so dev / unconfigured prod
 * doesn't error out).
 *
 * Use sparingly — Slack rate-limits per-webhook to ~1 req/sec. Wrap with
 * cooldown logic at the call site if the trigger could fire repeatedly.
 *
 * Audit-2 (I-5): closes the "no alerting channels" finding for the
 * smallest-blast-radius cases (deploy failure, backup failure, cert
 * expiry near). Larger-scale alerting (PagerDuty, on-call rotations)
 * stays out of scope here.
 */
import { logger } from './logger'

const log = logger.child({ scope: 'alerts' })

export type AlertSeverity = 'info' | 'warn' | 'error'

const SEVERITY_EMOJI: Record<AlertSeverity, string> = {
  info: ':information_source:',
  warn: ':warning:',
  error: ':rotating_light:',
}

export async function sendSlackAlert(
  severity: AlertSeverity,
  title: string,
  details?: Record<string, string | number | boolean>,
): Promise<void> {
  const url = process.env.SLACK_ALERT_WEBHOOK_URL
  if (!url) {
    log.debug('skipped', { reason: 'SLACK_ALERT_WEBHOOK_URL not set', title })
    return
  }

  const lines = [`${SEVERITY_EMOJI[severity]} *${title}*`]
  if (details) {
    for (const [k, v] of Object.entries(details)) {
      lines.push(`• \`${k}\`: ${v}`)
    }
  }

  try {
    await $fetch(url, {
      method: 'POST',
      body: { text: lines.join('\n') },
      signal: AbortSignal.timeout(5000),
    })
  } catch (err) {
    // Never let alerting failure cascade into an outage of the caller —
    // the alert is the LAST line of defence, not a critical path.
    log.error('slack.failed', { reason: (err as Error).message, title })
  }
}
