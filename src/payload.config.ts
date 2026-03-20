import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
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
import { PageViews } from './collections/PageViews'
import { PageEvents } from './collections/PageEvents'

// Globals
import { SiteSettings } from './globals/SiteSettings'
import { EventConfig } from './globals/EventConfig'
import { Homepage } from './globals/HeroSection'
import { StoryPage } from './globals/StoryPage'
import { GameGuidePage } from './globals/GameGuidePage'
import { FaqPage } from './globals/FaqPage'

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
    components: {
      afterDashboard: ['@/components/admin/AnalyticsDashboardWidget#default'],
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
    PageViews,
    PageEvents,
  ],
  globals: [
    SiteSettings,
    EventConfig,
    Homepage,
    StoryPage,
    GameGuidePage,
    FaqPage,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? (() => { throw new Error('PAYLOAD_SECRET environment variable is required') })(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? (() => { throw new Error('DATABASE_URI environment variable is required') })(),
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
