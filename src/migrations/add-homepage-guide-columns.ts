import type { Migration, Payload } from 'payload'

interface ExecutableDb {
  drizzle: unknown
  execute: (args: { drizzle: unknown; raw: string }) => Promise<unknown>
}

function hasExecutableDb(db: unknown): db is ExecutableDb {
  return Boolean(
    db &&
    typeof db === 'object' &&
    'drizzle' in db &&
    typeof (db as { execute?: unknown }).execute === 'function',
  )
}

async function executeRaw(payload: Payload, raw: string) {
  if (!hasExecutableDb(payload.db)) {
    throw new Error('Database adapter does not support raw SQL execution')
  }

  await payload.db.execute({
    drizzle: payload.db.drizzle,
    raw,
  })
}

const ADD_GUIDE_COLUMNS_SQL = `
DO $$
BEGIN
  -- Add guide scalar columns to homepage table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage' AND column_name = 'guide_badge_en') THEN
    ALTER TABLE homepage ADD COLUMN guide_badge_en varchar;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage' AND column_name = 'guide_badge_th') THEN
    ALTER TABLE homepage ADD COLUMN guide_badge_th varchar;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage' AND column_name = 'guide_title_en') THEN
    ALTER TABLE homepage ADD COLUMN guide_title_en varchar;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage' AND column_name = 'guide_title_th') THEN
    ALTER TABLE homepage ADD COLUMN guide_title_th varchar;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage' AND column_name = 'guide_intro_en') THEN
    ALTER TABLE homepage ADD COLUMN guide_intro_en varchar;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homepage' AND column_name = 'guide_intro_th') THEN
    ALTER TABLE homepage ADD COLUMN guide_intro_th varchar;
  END IF;
END $$;

-- Create homepage_guide_cards table
CREATE TABLE IF NOT EXISTS homepage_guide_cards (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id serial PRIMARY KEY,
  icon varchar,
  image_id integer,
  title_en varchar,
  title_th varchar,
  description_en varchar,
  description_th varchar,
  href varchar DEFAULT '#'
);

-- Add foreign key (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'homepage_guide_cards_parent_id_fk'
  ) THEN
    ALTER TABLE homepage_guide_cards
    ADD CONSTRAINT homepage_guide_cards_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES homepage(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index
CREATE INDEX IF NOT EXISTS homepage_guide_cards_order_idx
ON homepage_guide_cards (_parent_id, _order);
`

export const addHomepageGuideColumnsMigration: Migration = {
  name: '20260403_add_homepage_guide_columns',
  up: async (args) => {
    const { payload } = args as { payload: Payload }
    await executeRaw(payload, ADD_GUIDE_COLUMNS_SQL)
  },
  down: async () => {
    // Dropping is intentionally skipped for safety
  },
}
