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

const ADD_SUPPORT_PAGE_SQL = `
-- Create support_page global table if not exists
CREATE TABLE IF NOT EXISTS support_page (
  id serial PRIMARY KEY,
  badge_en varchar,
  badge_th varchar,
  title_en varchar,
  title_th varchar,
  subtitle_en varchar,
  subtitle_th varchar,
  support_email varchar,
  contact_badge_en varchar,
  contact_badge_th varchar,
  contact_label_en varchar,
  contact_label_th varchar,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Insert default row if empty
INSERT INTO support_page (id, badge_en, badge_th, title_en, title_th, subtitle_en, subtitle_th, support_email, contact_badge_en, contact_badge_th, contact_label_en, contact_label_th)
SELECT 1, 'SUPPORT', 'ช่วยเหลือ', 'Support Center', 'ศูนย์ช่วยเหลือ', 'Need help? Our team is here for you.', 'มีคำถามหรือต้องการความช่วยเหลือ? ทีมงานพร้อมดูแลคุณ', 'support@eternaltowersaga.com', 'DIRECT CONTACT', 'ติดต่อโดยตรง', 'Support team email', 'อีเมลทีมซัพพอร์ต'
WHERE NOT EXISTS (SELECT 1 FROM support_page LIMIT 1);

-- Create support_page_channels array table
CREATE TABLE IF NOT EXISTS support_page_channels (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id serial PRIMARY KEY,
  icon varchar,
  title_en varchar,
  title_th varchar,
  desc_en text,
  desc_th text,
  action_label_en varchar,
  action_label_th varchar,
  action_href varchar,
  external boolean DEFAULT false
);

-- Add foreign key for channels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'support_page_channels_parent_id_fk'
  ) THEN
    ALTER TABLE support_page_channels
    ADD CONSTRAINT support_page_channels_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES support_page(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for channels
CREATE INDEX IF NOT EXISTS support_page_channels_order_idx
ON support_page_channels (_parent_id, _order);

-- Create support_page_info_items array table
CREATE TABLE IF NOT EXISTS support_page_info_items (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id serial PRIMARY KEY,
  icon varchar,
  title_en varchar,
  title_th varchar,
  desc_en varchar,
  desc_th varchar
);

-- Add foreign key for info_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'support_page_info_items_parent_id_fk'
  ) THEN
    ALTER TABLE support_page_info_items
    ADD CONSTRAINT support_page_info_items_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES support_page(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for info_items
CREATE INDEX IF NOT EXISTS support_page_info_items_order_idx
ON support_page_info_items (_parent_id, _order);
`

export const addSupportPageMigration: Migration = {
  name: '20260403_add_support_page_tables',
  up: async (args) => {
    const { payload } = args as { payload: Payload }
    await executeRaw(payload, ADD_SUPPORT_PAGE_SQL)
  },
  down: async () => {
    // Dropping is intentionally skipped for safety
  },
}
