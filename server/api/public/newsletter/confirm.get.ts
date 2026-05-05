/**
 * GET /api/public/newsletter/confirm?token=...
 *
 * Step 2 of the double-opt-in flow. Validates the 24h confirm token, flips
 * status PENDING → CONFIRMED, issues a permanent unsubscribeToken, and
 * redirects to a friendly confirmation page on the public site.
 */
import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const token = String(getQuery(event).token || '')
  if (!token || token.length < 32) {
    return sendRedirect(event, '/?newsletter=invalid', 302)
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { confirmToken: token } })
  if (!subscriber || !subscriber.confirmTokenExp || subscriber.confirmTokenExp < new Date()) {
    return sendRedirect(event, '/?newsletter=expired', 302)
  }

  const unsubscribeToken = randomBytes(32).toString('hex')
  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
      confirmToken: null,
      confirmTokenExp: null,
      unsubscribeToken,
    },
  })

  return sendRedirect(event, '/?newsletter=confirmed', 302)
})
