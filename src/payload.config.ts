import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

// Collections
import { Media } from './collections/Media'
import { Characters } from './collections/Characters'
import { News } from './collections/News'
import { Milestones } from './collections/Milestones'
import { StoreButtons } from './collections/StoreButtons'
import { Registrations } from './collections/Registrations'
import { Gallery } from './collections/Gallery'
import { Users } from './collections/Users'

// Globals
import { SiteSettings } from './globals/SiteSettings'
import { EventConfig } from './globals/EventConfig'
import { HeroSection } from './globals/HeroSection'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — EST CMS',
      description: 'Eternal Tower Saga Content Management',
    },
  },
  collections: [
    Users,
    Media,
    Characters,
    News,
    Milestones,
    StoreButtons,
    Registrations,
    Gallery,
  ],
  globals: [
    SiteSettings,
    EventConfig,
    HeroSection,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || (() => { throw new Error('PAYLOAD_SECRET environment variable is required') })(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
    },
    push: true,
  }),
  sharp,
  upload: {
    limits: {
      fileSize: 100000000, // 100MB — allows video uploads
    },
  },
})
