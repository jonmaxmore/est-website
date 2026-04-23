# Brand Webzine and Centralized Banner Control Design

**Date:** 2026-04-23
**Author:** Codex
**Status:** Approved in conversation, written for implementation planning

## Goal

Turn the current news and campaign surfaces into a real brand webzine backed by a centralized banner-control system, so the team can:

- publish brand editorial content in a structured, discoverable way
- run marketing campaigns across all major web placements from one admin surface
- connect articles, events, and promotional banners without inventing a separate enterprise campaign suite
- improve SEO, on-site discovery, and repeat visits through evergreen guides, patch notes, lore, and dev updates

This design intentionally focuses on a production-usable v1 for the existing Nuxt CMS rather than a full media-company publishing stack.

## Product Direction

The approved product direction for this work is:

- **Webzine type:** brand webzine
- **Banner model:** one banner per placement
- **Initial banner placements:** popup, floating, announcement bar, homepage inline, sidebar, article inline, footer strip
- **Initial content pillars:** News and Announcements, Events and Campaigns, Patch Notes and Updates, Guides and How to Play, Lore and World, Dev Blog and Behind the Scenes

## Why This Exists

The current repo already contains strong building blocks:

- `NewsArticle` with bilingual content, featured image, SEO fields, and publish state
- `GameEvent` with scheduling, visibility, and event-landing controls
- `PageContent`, `MediaAsset`, `SiteConfig`, and `ActivityLog` for CMS support

But those pieces currently act like separate admin features rather than one operating model for brand publishing and campaign delivery.

Current gaps:

1. `NewsArticle` is still treated mostly as a news list, not a full webzine article model.
2. Campaign messaging is split across event controls, homepage sections, and manual page edits.
3. Banner surfaces are not centrally managed, so operators cannot reliably control what appears where and when.
4. Public content discovery is weak compared with modern game sites and official brand hubs.
5. Articles, events, and marketing placements are related in practice but not linked cleanly in the system.

## Research Summary

Reviewing current game-media and official game-site patterns on April 23, 2026 shows a consistent structure:

- `PC Gamer` separates latest streams from evergreen hubs and makes category navigation like News, Reviews, Guides, and Video prominent.
- `GameSpot` organizes content around clear content families such as Reviews, News and Features, Videos, and Cheats and Guides.
- `Warframe` uses an official brand-site structure that combines Latest News, Patch Notes, Guides, Community, and Download surfaces in one ecosystem.

For this project, the implication is clear:

- the site should not stay as a simple news list
- the site should not become a general gaming magazine
- the correct product is a brand webzine with campaign distribution built into the CMS

References:

- [PC Gamer: Welcome to the new PC Gamer](https://www.pcgamer.com/welcome-to-the-new-pc-gamer/)
- [PC Gamer Guides](https://www.pcgamer.com/guides/)
- [GameSpot game content hub example](https://www.gamespot.com/games/sigma-star-saga/)
- [Warframe official site structure](https://www.warframe.com/en/game/warframes)

## Scope Decomposition

This work spans multiple related areas, but they should ship as one coherent v1 release because they depend on each other:

### Release 1: Brand Webzine Foundation and Banner Control

- upgrade `NewsArticle` into a structured webzine article model
- add centralized banner management with placement-based control
- add topic registry and public content discovery surfaces
- connect articles, events, and banners through lightweight campaign linking
- add public banner resolution and related-content behavior

### Release 2: Editorial and Campaign Operations

- richer editorial workflow and scheduling views
- stronger homepage and topic merchandising
- better campaign reporting and banner performance tracking
- newsletter and subscription surfaces if desired

### Release 3: Productization and Growth

- revisions and approval workflow
- advanced segmentation and personalization
- deeper search, archive, and recommendation tooling
- stronger analytics and cross-channel automation

This design covers the whole direction, but the first implementation plan should target Release 1 only.

## Design Principles

1. Extend the existing schema and admin patterns where possible.
2. Keep content, events, and banners distinct, but make them easy to link.
3. Favor controlled registries over free-form taxonomy in v1.
4. Make banner delivery deterministic: one winning banner per placement per context.
5. Preserve current public routes where they already work.
6. Optimize for operator clarity before editorial sophistication.

## Proposed Architecture

## A. Content Model

### Webzine article model

Keep `NewsArticle` as the main v1 article store, but reinterpret it as a generic brand-webzine article model rather than a narrow news-only type.

Recommended additions:

- `contentType`: `ANNOUNCEMENT | EVENT | PATCH_NOTES | GUIDE | LORE | DEV_BLOG`
- `primaryTopicKey`: string reference to topic registry
- `campaignCode`: nullable string
- `linkedEventId`: nullable event reference
- `pinned`: boolean
- `isEvergreen`: boolean
- `readingTimeMinutes`: nullable integer

Keep existing useful fields:

- `slug`
- bilingual title, excerpt, and content
- `featuredImage`
- `seoTitle`, `seoDesc`, `ogImage`
- `status`
- `publishedAt`
- homepage feature flags already in use

Why this approach:

- it keeps migration scope reasonable
- it fits the current admin UI better than inventing a whole new article table
- it lets the site graduate from "news page" to "webzine" without route churn

### Event model

Keep `GameEvent` as a distinct operational model.

It should remain the source of truth for:

- time windows
- event status and visibility
- hot-time and multiplier behavior
- event landing-page controls

Recommended additions:

- `campaignCode`
- `linkedArticleId` nullable reference

Why it stays separate:

- event scheduling behavior is operational, not editorial
- event lifecycle and validation differ from article publishing
- merging articles and events would blur two different workflows

### Topic model

Do not introduce free-form tags in v1.

Instead, create a controlled topic registry stored under `SiteConfig.webzine_topics` with items shaped like:

```ts
type WebzineTopic = {
  key: string
  slug: string
  labelEn: string
  labelTh: string
  descriptionEn?: string
  descriptionTh?: string
  icon?: string
  color?: string
  visible: boolean
}
```

Rules:

- article `primaryTopicKey` must reference a known topic
- topic pages are generated from this registry
- topics are managed centrally in admin

Why a registry:

- it prevents taxonomy drift
- it keeps IA and SEO clean
- it is enough for v1 without introducing a full taxonomy subsystem

## B. Marketing Banner Model

Add a dedicated `MarketingBanner` model.

One record equals one banner for one placement.

Recommended shape:

```ts
type MarketingBanner = {
  id: string
  placement: 'popup' | 'floating' | 'announcement_bar' | 'homepage_inline' | 'sidebar' | 'article_inline' | 'footer_strip'
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'EXPIRED'
  scope: 'global' | 'homepage' | 'news_index' | 'article_detail' | 'topic_page' | 'event_page' | 'specific_article' | 'specific_topic'
  priority: number
  campaignCode?: string | null
  startsAt?: Date | null
  endsAt?: Date | null
  badgeEn?: string | null
  badgeTh?: string | null
  titleEn: string
  titleTh: string
  bodyEn?: string | null
  bodyTh?: string | null
  desktopImage?: string | null
  mobileImage?: string | null
  targetType: 'article' | 'page' | 'event' | 'url'
  targetArticleId?: number | null
  targetPageKey?: string | null
  targetEventId?: string | null
  targetUrl?: string | null
  targetNewTab: boolean
  dismissible: boolean
  isActive: boolean
  config: Json
  createdAt: Date
  updatedAt: Date
}
```

Placement-specific config examples:

- `popup`: delay seconds, frequency cap, mobile enablement
- `floating`: corner, compact mode, icon style
- `announcement_bar`: tone, sticky behavior, close button
- `article_inline`: insertion position strategy

Why a dedicated model:

- banners are not pages and not articles
- placement, scope, and resolver logic need a clean contract
- operators need one obvious place to manage campaign surfaces

## C. Campaign Linking Strategy

Do not introduce a full `Campaign` model in Release 1.

Use `campaignCode` as a lightweight linking key across:

- `NewsArticle`
- `GameEvent`
- `MarketingBanner`

This enables practical campaign grouping without building a full campaign-management system yet.

Examples:

- a launch campaign can link one guide, one announcement article, one event landing setup, one popup, and one announcement bar
- an anniversary campaign can link a lore article, a time-limited event, and a homepage inline banner

Future releases can replace or augment `campaignCode` with a real `Campaign` model if the workflows justify it.

## D. Admin Information Architecture

Release 1 should introduce or reshape these admin modules:

### 1. Webzine Articles

This is the main editorial work surface.

Required capabilities:

- create and edit article records
- filter by `contentType`, topic, status, evergreen, pinned, and `campaignCode`
- preview public article presentation
- assign linked event and featured media
- manage SEO and publication controls

### 2. Topics

This manages the `webzine_topics` registry.

Required capabilities:

- create, edit, hide, and reorder topics
- define bilingual labels and descriptions
- set icon and color tokens
- preview topic listing labels

### 3. Banner Control

This is the centralized marketing surface.

Required capabilities:

- create one banner per placement
- view grouped by placement
- filter by status, scope, schedule window, and `campaignCode`
- preview target and timing
- warn when scope and schedule overlap another banner in the same placement

### 4. Events

Keep the existing event module, but add campaign and article linking.

Required capabilities:

- assign `campaignCode`
- optionally link to article detail pages
- surface active campaign relationships in the editor

### 5. Dashboard

Add practical work queues, not decorative statistics.

Suggested panels:

- live banners by placement
- banners scheduled for today
- drafts pending publish
- active campaigns
- articles without topic or featured image

## E. Public Information Architecture

### Main route strategy

Keep `/news` as the primary public route for Release 1, but expand it into the brand webzine landing page.

Why keep the route:

- preserves existing SEO history
- avoids needless migration and navigation churn
- lets the product evolve without retraining operators or users

### Public routes

Release 1 public structure:

- `/news` - main webzine landing
- `/news/[slug]` - article detail
- `/news/type/[contentType]` - content-type listings
- `/news/topic/[topicKey]` - topic landing pages

### `/news` landing behavior

The landing page should graduate from a simple latest-news grid into a real brand-webzine hub with:

- featured or pinned story
- latest stream
- content-pillar rows such as Patch Notes, Guides, Lore, and Dev Blog
- active event or campaign module
- optional sidebar banner and article recommendations

### Article detail behavior

Article detail pages should support:

- clean bilingual content rendering
- related content
- article-inline banners
- sidebar banner placement where layout permits
- linked event or campaign context when applicable

### Related-content strategy

Recommended ranking order:

1. same `campaignCode`
2. same linked event
3. same `primaryTopicKey`
4. same `contentType`
5. most recent published articles

This avoids dead-end reading paths and makes the site behave more like a real webzine.

## F. Banner Resolver Design

Add a shared banner resolver that determines the single winning banner for each placement in a given request context.

It should exist as:

- a server-side utility for public API responses
- a shared type contract for client composables
- optional admin preview helper

### Input context

The resolver should consider:

- current route type
- article ID or slug when relevant
- topic key when relevant
- current time
- device form factor if mobile-specific behavior matters

### Matching rules

A banner qualifies only if:

- `isActive` is true
- status is appropriate for live delivery
- current time falls inside `startsAt` and `endsAt` when set
- scope matches the current route context
- its target reference is valid

### Winner rules

If more than one banner qualifies in a placement:

1. highest `priority` wins
2. if tied, the most recently updated banner wins
3. if still tied, stable ID ordering wins to avoid nondeterminism

### Placement contract

Release 1 placements:

- `announcement_bar`
- `popup`
- `floating`
- `homepage_inline`
- `sidebar`
- `article_inline`
- `footer_strip`

This should guarantee one live banner per placement per context.

## G. Banner Scope Rules

Release 1 scope options:

- `global`
- `homepage`
- `news_index`
- `article_detail`
- `topic_page`
- `event_page`
- `specific_article`
- `specific_topic`

Rules:

- `specific_article` requires `targetArticleId` or article reference metadata
- `specific_topic` requires a valid topic key
- `event_page` requires route mapping for the event surface
- internal target types must point to existing records

## H. Validation and Safety

### Article validation

- published articles must contain sufficient content in at least one language
- slug must remain unique
- `contentType` must come from the registry
- `primaryTopicKey` must reference a valid topic
- linked event must exist if set

### Banner validation

- every banner must have exactly one placement
- every banner must have exactly one target type
- internal target references must exist
- scheduled and live banners must have valid time windows when scheduling is used
- scope-specific required fields must be present
- placement-specific config must be schema-validated

### Operator safeguards

- explicit preview before publish
- overlap warnings for conflicting live or scheduled banners in one placement
- activity logging for create, update, publish, unpublish, and delete actions
- visible status badges for `DRAFT`, `SCHEDULED`, `LIVE`, and `EXPIRED`

## I. Editorial Workflow

### Article workflow

1. Create article in `Webzine Articles`.
2. Select content type, topic, and optional `campaignCode`.
3. Attach featured image, excerpt, SEO, and optional linked event.
4. Mark as pinned or evergreen when relevant.
5. Publish or schedule.

### Banner workflow

1. Create banner in `Banner Control`.
2. Choose placement and scope.
3. Choose target: article, page, event, or URL.
4. Set language copy, media, and placement-specific config.
5. Set schedule and priority.
6. Preview and activate.

### Event workflow

1. Create or edit event in `Events`.
2. Assign `campaignCode`.
3. Optionally link related article.
4. Use event page and banners together when the campaign needs a landing surface.

## J. Testing Strategy

### Unit and helper tests

Add focused tests for:

- banner scope matching
- banner priority resolution
- topic registry normalization
- content-type validation
- related-content ranking

### API and integration tests

Add coverage for:

- article create and update validation
- topic registry validation
- banner create and update validation
- internal target verification
- resolver output for scoped and overlapping banners

### E2E tests

Add or expand flows for:

- creating a webzine article and seeing it on `/news`
- creating a topic and seeing topic filter pages work
- creating announcement-bar, popup, and floating banners
- scheduling overlapping banners and verifying the resolver picks the correct winner
- showing article-inline banners and related content on article pages

## K. Out of Scope for Release 1

- full revision history
- multi-step approval workflow
- real-time banner analytics dashboards
- personalization by audience segment
- email newsletter management
- full-text editorial search engine
- a dedicated `Campaign` model with its own admin suite

These are valid later investments, but they are not required for a strong first release.

## Implementation Success Criteria

Release 1 is successful when all of the following are true:

- `/news` functions as a usable brand webzine landing, not just a basic news list
- articles can be categorized by the approved content pillars
- topics are managed through a controlled registry
- operators can create banners from a centralized admin surface
- the system resolves no more than one live banner per placement per context
- banners can safely target articles, pages, events, or external URLs
- article pages show related content based on topic, type, or campaign relationships
- operators can understand live, scheduled, draft, and expired states at a glance
- the solution builds on existing `NewsArticle`, `GameEvent`, `SiteConfig`, `MediaAsset`, and `ActivityLog` rather than bypassing them

## Recommended First Implementation Slice

The first implementation plan should target Release 1 in this order:

1. article model uplift and topic registry
2. `MarketingBanner` model plus validation
3. banner resolver and public placement rendering
4. `/news` landing and article-detail upgrades
5. admin IA updates for webzine articles, topics, and banner control

This order establishes the data contracts first, then delivery logic, then public presentation, and finally the operator-facing admin workflows.
