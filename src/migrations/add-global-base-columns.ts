import type { Migration, Payload } from 'payload'
import { ensureGlobalBaseColumns } from '@/lib/cms-maintenance'

export const addGlobalBaseColumnsMigration: Migration = {
  name: '20260327_add_global_base_columns',
  up: async (args) => {
    const { payload } = args as { payload: Payload }
    await ensureGlobalBaseColumns(payload)
  },
  down: async () => {
    // Intentionally left blank because global base columns are additive repair columns.
  },
}
