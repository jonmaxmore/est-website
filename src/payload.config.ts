import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

// Collections
import { Media } from './collections/Media'
import { Weapons } from './collections/Weapons'
import { News } from './collections/News'
import { Milestones } from './collections/Milestones'
import { StoreButtons } from './collections/StoreButtons'
import { Registrations } from './collections/Registrations'
import { Gallery } from './collections/Gallery'
import { Users } from './collections/Users'
import { PageViews } from './collections/PageViews'
import { PageEvents } from './collections/PageEvents'
import { AnalyticsSessions } from './collections/AnalyticsSessions'
import { AnalyticsDailyRollups } from './collections/AnalyticsDailyRollups'
import { AnalyticsFunnelEvents } from './collections/AnalyticsFunnelEvents'
import { addNewsExcerptColumnsMigration } from './migrations/add-news-excerpt-columns'
import { addNewsEditorialColumnsMigration } from './migrations/add-news-editorial-columns'
import { addGlobalBaseColumnsMigration } from './migrations/add-global-base-columns'
import { addHomepageGuideColumnsMigration } from './migrations/add-homepage-guide-columns'
import { addSupportPageMigration } from './migrations/add-support-page-tables'

// Globals
import { SiteSettings } from './globals/SiteSettings'
import { EventConfig } from './globals/EventConfig'
import { Homepage } from './globals/Homepage'
import { StoryPage } from './globals/StoryPage'
import { GameGuidePage } from './globals/GameGuidePage'
import { FaqPage } from './globals/FaqPage'
import { NewsPage } from './globals/NewsPage'
import { GalleryPage } from './globals/GalleryPage'
import { SupportPage } from './globals/SupportPage'
import { DownloadPage } from './globals/DownloadPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- EST CMS',
      description: 'Eternal Tower Saga Content Management',
    },
    components: {
      afterDashboard: ['@/components/admin/AnalyticsDashboardWidget#default'],
      afterNavLinks: ['@/components/admin/AnalyticsNavLink#default'],
    },
  },
  collections: [
    Users,
    Media,
    Weapons,
    News,
    Milestones,
    StoreButtons,
    Registrations,
    Gallery,
    PageViews,
    PageEvents,
    AnalyticsSessions,
    AnalyticsDailyRollups,
    AnalyticsFunnelEvents,
  ],
  globals: [
    SiteSettings,
    EventConfig,
    Homepage,
    StoryPage,
    GameGuidePage,
    NewsPage,
    FaqPage,
    GalleryPage,
    SupportPage,
    DownloadPage,
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
    prodMigrations: [
      addNewsExcerptColumnsMigration,
      addNewsEditorialColumnsMigration,
      addGlobalBaseColumnsMigration,
      addHomepageGuideColumnsMigration,
      addSupportPageMigration,
    ],
    push: true,
  }),
  sharp,
  upload: {
    limits: {
      fileSize: 100000000, // 100MB - allows video uploads
    },
  },
})
