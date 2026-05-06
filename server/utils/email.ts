/**
 * ═══ Email Sender (Resend) ═══
 * Single point of egress for transactional email. Activated by RESEND_API_KEY;
 * when unset, the helper logs the message to the structured logger and
 * returns success — useful in dev where you want to see what would be sent
 * without actually sending it.
 *
 * Audit-2 (C-4): the codebase had no email infra at all. This is the minimal
 * primitive needed for double-opt-in newsletter confirmation, password
 * reset, etc. Resend is chosen because:
 *   - 100/day free tier covers small-site launch traffic
 *   - REST API only — no SDK dependency, no SMTP queues
 *   - DNS verification model maps cleanly to a single sender domain
 *
 * If/when volume exceeds Resend free tier, swap the implementation here —
 * callers (newsletter signup endpoint, etc.) only see sendEmail().
 */
import { logger } from './logger'

const log = logger.child({ scope: 'email' })

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export type EmailMessage = {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendEmail(msg: EmailMessage): Promise<{ id: string | null }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_ADDRESS
  if (!apiKey || !from) {
    // In production, a missing key is a real misconfiguration — fail loudly so
    // the operator notices. In dev/CI, log and no-op so the codebase remains
    // runnable without an account (audit-3 FullStack-1 M2).
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[Email] RESEND_API_KEY and RESEND_FROM_ADDRESS must be set in production')
    }
    log.warn('skipped', {
      reason: 'RESEND_API_KEY or RESEND_FROM_ADDRESS not set (dev no-op)',
      to: msg.to,
      subject: msg.subject,
    })
    return { id: null }
  }

  try {
    const response = await $fetch<{ id?: string }>(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      },
      signal: AbortSignal.timeout(10_000),
    })
    return { id: response.id ?? null }
  } catch (err) {
    log.error('send.failed', { reason: (err as Error).message, to: msg.to, subject: msg.subject })
    throw err
  }
}
