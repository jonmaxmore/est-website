import type { Migration, Payload } from 'payload'
import { dropNewsExcerptColumns, ensureNewsExcerptColumns } from '@/lib/cms-maintenance'

export const addNewsExcerptColumnsMigration: Migration = {
  name: '20260325_add_news_excerpt_columns',
  up: async (args) => {
    const { payload } = args as { payload: Payload }
    await ensureNewsExcerptColumns(payload)
  },
  down: async (args) => {
    const { payload } = args as { payload: Payload }
    await dropNewsExcerptColumns(payload)
  },
}
