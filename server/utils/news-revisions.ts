/**
 * ═══ News Article Revisions ═══
 * Snapshot-on-update content history. Called from
 * server/api/admin/news/[id].put.ts AFTER a successful update so the
 * revision row records the post-update state. Reverting = copying a
 * snapshot back into the article (admin-only endpoint to be added).
 *
 * Audit-2 (M-4): closes "no content history / no revert capability".
 *
 * Fire-and-forget — a missed revision is preferable to blocking the editor's
 * save. Logged via the structured logger.
 */
import type { H3Event } from 'h3'
import type { NewsArticle } from '@prisma/client'
import { logger } from './logger'

const log = logger.child({ scope: 'news.revision' })

export function recordNewsRevision(
  event: H3Event,
  article: NewsArticle,
  options?: { changeNote?: string },
): void {
  void (async () => {
    try {
      const session = await getUserSession(event)
      const user = session?.user as { id: string; displayName: string } | undefined
      if (!user) return

      // Strip volatile timestamps from the snapshot so revisions diff cleanly.
      const { id, createdAt, updatedAt, ...rest } = article
      const snapshot = { id, ...rest }

      await prisma.newsArticleRevision.create({
        data: {
          articleId: article.id,
          snapshot,
          editorId: user.id,
          editorName: user.displayName || 'Unknown',
          changeNote: options?.changeNote ?? null,
        },
      })
    } catch (err) {
      log.error('write.failed', { reason: (err as Error).message, articleId: article.id })
    }
  })()
}
