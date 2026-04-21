# EST-Website — Project Architecture Mindmap

## System Overview

```mermaid
mindmap
  root((EST Website))
    Frontend
      Public Pages
        Homepage
        Event Registration
        News
        Weapons
        FAQ
        Terms/Privacy
        Game Guide
        Gallery
      Admin Panel
        Dashboard
        Analytics
        Content Management
          News Editor
          Features
          Highlights
          Weapons
          Events
          FAQ
          Pages
        Media Library
        Homepage Builder
        Registration Data
        Settings
          Navigation
          SEO
          Social Links
          Maintenance
        Users
        Integrations
        Backup/Import
        Activity Log
    Backend API
      Auth
        POST /api/auth/login
        POST /api/auth/logout
      Public
        GET /api/public/stats
        GET /api/public/features
        GET /api/public/highlights
        GET /api/public/site
        POST /api/register
      Admin CRUD
        News
        Features
        Highlights
        Weapons
        Events
        Media
        Users
        Pages
        Registrations
        Config
        Analytics
        Activity
        Backup
      Middleware
        admin-auth
        track-pageview
    Database
      PostgreSQL
        AdminUser
        PreRegistration
        NewsArticle
        MediaAsset
        Weapon
        Feature
        Highlight
        GameEvent
        PageContent
        SiteConfig
        Milestone
        PageView
        ConversionEvent
        ActivityLog
    Infrastructure
      Docker Compose
      Nginx Reverse Proxy
      Redis Session Store
      DigitalOcean Droplet
```

---

## API Endpoint Matrix

```mermaid
graph TB
    subgraph "Auth"
        A1[POST /api/auth/login]
        A2[POST /api/auth/logout]
    end

    subgraph "Public API"
        P1[GET /api/public/stats]
        P2[GET /api/public/features]
        P3[GET /api/public/highlights]
        P4[GET /api/public/site]
        P5[POST /api/register]
    end

    subgraph "Admin API — Protected by admin-auth middleware"
        subgraph "Content CRUD"
            N1[GET/POST /api/admin/news]
            N2[PUT/DELETE /api/admin/news/:id]
            F1[GET/POST /api/admin/features]
            F2[PUT/DELETE /api/admin/features/:id]
            H1[GET/POST /api/admin/highlights]
            H2[PUT/DELETE /api/admin/highlights/:id]
            W1[GET/POST /api/admin/weapons]
            W2[PUT/DELETE /api/admin/weapons/:id]
            E1[GET/POST /api/admin/events]
            E2[PUT/DELETE /api/admin/events/:id]
        end

        subgraph "Media"
            M1[GET /api/admin/media]
            M2[POST /api/admin/media/upload]
            M3[DELETE /api/admin/media/:id]
        end

        subgraph "System"
            S1[GET/PUT /api/admin/config]
            S2[GET /api/admin/stats]
            S3[GET /api/admin/analytics]
            S4[GET /api/admin/activity]
            S5[GET /api/admin/registrations]
            S6[GET /api/admin/registrations/export]
        end

        subgraph "Users — SUPER_ADMIN only"
            U1[GET/POST /api/admin/users]
            U2[PUT/DELETE /api/admin/users/:id]
        end

        subgraph "Backup — SUPER_ADMIN only"
            B1[POST /api/admin/backup/export]
            B2[POST /api/admin/backup/import]
            B3[POST /api/admin/backup/import-wp]
        end

        subgraph "Pages"
            PG1[GET /api/admin/pages/:key]
            PG2[PUT /api/admin/pages/:key]
        end
    end
```

---

## Data Flow

```mermaid
flowchart LR
    Browser["Browser Client"]
    Nginx["Nginx :80/:443"]
    Nuxt["Nuxt SSR :3000"]
    Prisma["Prisma ORM"]
    PG[("PostgreSQL")]
    Redis[("Redis")]
    Uploads["File System /uploads"]

    Browser -->|HTTP| Nginx
    Nginx -->|Proxy| Nuxt
    Nuxt -->|Session| Redis
    Nuxt -->|Query| Prisma
    Prisma -->|SQL| PG
    Nuxt -->|File Write| Uploads
    Nginx -->|Static| Uploads
```

---

## Admin Frontend Architecture

| Page | Route | API Endpoint | DB Model | Actions |
|------|-------|-------------|----------|---------|
| Dashboard | `/admin` | `/admin/stats` | Multiple | View stats, charts |
| Analytics | `/admin/analytics` | `/admin/analytics` | PageView, ConversionEvent | View traffic |
| News | `/admin/news` | `/admin/news` | NewsArticle | CRUD + Rich Editor |
| Features | `/admin/features` | `/admin/features` | Feature | CRUD + MediaPicker |
| Highlights | `/admin/highlights` | `/admin/highlights` | Highlight | CRUD + MediaPicker |
| Weapons | `/admin/weapons` | `/admin/weapons` | Weapon | CRUD + MediaPicker + Stats |
| Events | `/admin/events` | `/admin/events` | GameEvent | CRUD + Hot Time |
| FAQ | `/admin/faq` | `/admin/pages/faq` | PageContent (JSON) | CRUD items |
| Pages | `/admin/pages` | `/admin/pages/:key` | PageContent | CMS static pages |
| Media | `/admin/media` | `/admin/media` | MediaAsset | Upload + Delete |
| Homepage | `/admin/homepage` | `/admin/config` | SiteConfig | Section builder |
| Registrations | `/admin/registrations` | `/admin/registrations` | PreRegistration | View + Export CSV |
| Users | `/admin/users` | `/admin/users` | AdminUser | CRUD (SUPER_ADMIN) |
| Settings | `/admin/settings` | `/admin/config` | SiteConfig | Nav, SEO, Social |
| Activity | `/admin/activity` | `/admin/activity` | ActivityLog | Audit trail |
| Backup | `/admin/backup` | `/admin/backup/*` | All tables | Export/Import JSON |
| Integrations | `/admin/integrations` | — | — | Configuration UI |
| SEO | `/admin/seo` | `/admin/config` | SiteConfig | Meta tags |
| Navigation | `/admin/menus` | `/admin/config` | SiteConfig | Menu builder |
| Theme | `/admin/appearance` | `/admin/config` | SiteConfig | Theme settings |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Nuxt 3, Vue 3, Tailwind CSS 4, @nuxt/ui (Lucide icons) |
| **Backend** | Nitro (Node.js), H3 handlers |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth** | nuxt-auth-utils (cookie sessions) |
| **Cache** | Redis |
| **i18n** | @nuxtjs/i18n (TH/EN) |
| **Rich Text** | TipTap editor |
| **Deploy** | Docker Compose + Nginx |
| **Server** | DigitalOcean Droplet (178.128.127.161) |
