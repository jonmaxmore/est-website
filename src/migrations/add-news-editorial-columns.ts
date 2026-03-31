import type { Migration, Payload } from 'payload'
import { dropNewsEditorialColumns, ensureNewsEditorialColumns } from '@/lib/cms-maintenance'

export const addNewsEditorialColumnsMigration: Migration = {
  name: '20260326_add_news_editorial_columns',
  up: async (args) => {
    const { payload } = args as { payload: Payload }
    await ensureNewsEditorialColumns(payload)
  },
  down: async (args) => {
    const { payload } = args as { payload: Payload }
    await dropNewsEditorialColumns(payload)
  },
}
