/**
 * GET /api/public/newsletter/unsubscribe?token=...
 *
 * RFC 8058 one-click unsubscribe. The token is permanent (no expiry) so
 * mailing-list links never break, even years later. Idempotent — repeated
 * unsubscribes are no-ops.
 */
export default defineEventHandler(async (event) => {
  const token = String(getQuery(event).token || '')
  if (!token || token.length < 32) {
    return sendRedirect(event, '/?newsletter=invalid', 302)
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } })
  if (!subscriber) {
    return sendRedirect(event, '/?newsletter=invalid', 302)
  }

  if (subscriber.status !== 'UNSUBSCRIBED') {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
    })
  }

  return sendRedirect(event, '/?newsletter=unsubscribed', 302)
})
