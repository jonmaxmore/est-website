# Admin CMS Core Stabilization Design

**Date:** 2026-04-22
**Author:** Codex
**Status:** Approved in conversation, written for implementation planning

## Goal

Stabilize the admin panel so it can reliably operate as a real CMS for the current Nuxt site, with immediate focus on:

- fixing media upload failures and media-library integrity
- making page creation, page editing, and menu management drive the live site without 404s
- ensuring homepage configuration only exposes behaviors the public homepage can actually render
- closing high-risk security gaps in admin-driven content and integrations
- improving the news/content workflow enough to feel like a professional publishing tool rather than a demo surface

This design intentionally prioritizes a production-safe CMS foundation over chasing full WordPress or Wix feature breadth in one pass.

## Scope Decomposition

The user request spans multiple independent subsystems, so the work is decomposed into three releases. This design covers the full direction, but the first implementation plan will target Release 1.

### Release 1: CMS Foundation and Safety

- unify media upload behavior
- harden upload and content security
- replace hard-coded page editing flow with real CMS-backed page rendering
- make menu items route-safe by referencing pages instead of raw strings where possible
- align homepage builder with only supported section types

### Release 2: Professional Publishing and Content Operations

- improve news workflow with stronger validation, preview, scheduling behavior, and editorial metadata
- persist media metadata edits such as alt text
- add reusable content-status indicators and publishing safeguards
- reduce duplicated settings/navigation surfaces

### Release 3: Admin Productization

- redesign dashboard around actionable work queues
- add higher-level site operations patterns comparable to lightweight CMS products
- expand integrations, import/export, and structured content tooling

## Current System Problems

### 1. Media upload is inconsistent

Current behavior is split across:

- `app/pages/admin/media.vue`
- `app/components/admin/MediaPicker.vue`
- `server/api/admin/media/upload.post.ts`
- `app/shared/constants/limits.ts`

Problems:

- file type rules differ between client, shared constants, and server
- one upload surface uses `XMLHttpRequest` with explicit credentials, the other uses `$fetch`, so behavior differs by screen
- upload UI and API error handling are inconsistent
- media metadata editing exists in UI, but alt text is not persisted
- there is no single source of truth for allowed file types, limits, or response shape

### 2. Pages admin does not control many live pages

The admin page editor writes to `SiteConfig` keys like `page_support`, but the public site still hard-codes content in files such as:

- `app/pages/support.vue`
- `app/pages/story.vue`
- `app/pages/terms.vue`
- `app/pages/privacy.vue`
- `app/pages/download.vue`
- `app/pages/game-guide.vue`

The result is a false CMS: the operator can edit content in admin and still see no change on the public site.

### 3. Page creation and menu creation are not route-safe

The current `Pages` screen is a fixed list of predefined pages. New pages are not truly creatable.

The current `Menus` screen allows arbitrary href strings. That means:

- new pages cannot be created from the CMS and automatically linked
- route changes can break existing menus
- admins can save links to non-existent paths and cause 404s

### 4. Homepage builder exposes unsupported section types

`app/pages/admin/homepage.vue` allows `custom_html`, `gallery`, and `video`, but `app/pages/index.vue` only renders a limited set of section types. This creates stored configuration that the public homepage cannot fully use.

`custom_html` also introduces an unnecessary unsafe content path for the first stabilization release.

### 5. Security controls are too loose

The highest-risk issues in the current codebase are:

- `server/api/integration/webhook.post.ts` accepts unauthenticated content mutations
- admin-auth checks session presence, but some admin APIs accept broad arbitrary JSON payloads without key-specific validation
- news and other rich text content are rendered with `v-html` without a sanitizer layer
- integration settings are stored in general config rather than being validated by capability

### 6. Admin IA is duplicated and confusing

Navigation, settings, appearance, homepage, pages, and FAQ all partially overlap. Operators must guess whether to edit a page in `Pages`, `FAQ`, `Settings`, or a hard-coded public file.

## Design Principles

1. Use existing local primitives where they are close to correct.
2. Make stored admin state map directly to live-site rendering.
3. Replace arbitrary text entry with references and registries where possible.
4. Validate by content type, not just by “unknown JSON”.
5. Remove unsupported or unsafe behaviors before adding more power.
6. Make the admin panel feel predictable before making it expansive.

## Proposed Architecture

## A. Content Storage Model

### Canonical page model

Use `PageContent` as the primary store for CMS-managed pages instead of storing page documents under `SiteConfig`.

Extend `PageContent` to support real CMS routing and menu use:

- `slug` string, unique
- `description` nullable string
- `template` enum or string for page presentation type
- `showInHeader` boolean
- `showInFooter` boolean
- `headerOrder` integer
- `footerOrder` integer
- `isSystemPage` boolean

Keep the existing fields:

- `key`
- `titleEn`, `titleTh`
- `seoTitle`, `seoDesc`
- `contentEn`, `contentTh`
- `icon`
- `status`

Why this choice:

- the model already exists in Prisma
- it fits the current codebase better than inventing an entirely new CMS storage layer
- it lets admin pages, public routes, and navigation point to the same records

### Navigation model

Keep `SiteConfig.navigation`, but change the item structure.

Each nav item should be one of:

- internal page reference
- external URL

Proposed shape:

```ts
type NavigationItem = {
  id: string
  type: 'page' | 'custom'
  labelEn: string
  labelTh: string
  pageKey?: string
  href?: string
  target?: '_self' | '_blank'
  visible: boolean
}
```

Rules:

- `type: 'page'` must reference an existing published `PageContent`
- href is derived from the page record slug at read time
- `type: 'custom'` is allowed for external destinations or intentional non-page routes
- admin UI must validate custom internal-looking paths before save

This ensures menus stay valid even if a page slug changes.

### Homepage section model

Keep `SiteConfig.homepage_sections`, but validate it against a registry of supported section types.

Supported for Release 1:

- `hero`
- `weapons`
- `features`
- `highlights`
- `news`
- `cta`

Unsupported types are removed from the editor for now:

- `custom_html`
- `gallery`
- `video`

Those can return later only after public renderers and safe content contracts exist.

## B. Public Rendering Model

### CMS page renderer

Introduce a public catch-all page for CMS-managed routes that only handles unmatched paths after static pages.

Behavior:

- static, hand-authored routes continue to win if they exist
- unknown routes are resolved against published `PageContent.slug`
- if a matching page exists, render it through a shared CMS page component
- if no page exists, return the real 404 page

This avoids the current “admin can save it but public site cannot serve it” problem.

### Shared page presentation

Create a reusable `CmsPageRenderer` component that:

- loads the page record
- renders localized title, SEO, and body content
- uses a consistent hero/header shell for CMS pages
- renders rich HTML through a sanitizer-backed output path

System pages such as support, story, terms, privacy, download, and game-guide should move to this shared renderer unless a page truly requires a unique bespoke application flow.

### FAQ handling

FAQ can remain structured content in `SiteConfig` for Release 1, because it is already a dedicated content type with list behavior. The key change is to make the general `Pages` surface responsible only for page documents and keep FAQ in its own module without pretending the generic page editor controls it.

## C. Media System Design

### Unified upload contract

Create one shared upload configuration module used by both client and server:

- allowed mime types
- allowed extensions
- size limits
- response shape
- user-facing error messages

Server remains the final authority.

### Unified upload client

Extract upload behavior into one client utility or composable used by:

- admin media library
- media picker modal
- any future rich editor image insertion flow

It should support:

- single or multiple files
- upload progress events
- normalized server error parsing
- consistent success payload handling

### Media metadata persistence

Add an admin update endpoint for media metadata so changes made in the media modal are saved to `MediaAsset`.

Release 1 scope:

- alt text

Future-friendly but out of current scope:

- focal point
- caption
- collections
- usage references

## D. Security Design

### Content sanitization

Rich text stored from admin must be sanitized before public rendering. The public site should never trust stored HTML directly.

Approach:

- keep TipTap as the editing surface
- sanitize rendered HTML using a maintained sanitizer library with an allowlist covering the tags the editor actually produces
- use the same sanitizer for preview paths where user content is injected into HTML

Allowed examples:

- paragraphs
- headings
- lists
- blockquotes
- links
- images
- tables
- horizontal rules
- code blocks
- safe iframe/video embeds only if explicitly allowlisted

### Integration webhook authentication

`/api/integration/webhook` must require an integration secret and reject unsigned requests.

Behavior:

- disabled by default
- configured through validated integration settings
- request must include a secret or signature header
- unsupported sources or malformed payloads return explicit 4xx responses
- actions are logged via `ActivityLog`

### Key-specific config validation

Replace the current generic `config.put` acceptance model with per-key validation.

Each supported config key should have a schema, for example:

- `navigation`
- `seo`
- `social`
- `appearance`
- `maintenance`
- `homepage_sections`
- `integrations`
- `faq`

Unknown keys should be rejected in admin-facing config writes unless explicitly registered.

## E. Admin UX Design

### Pages module

Replace the current fixed page card list with a real CMS page manager:

- searchable page table or card list
- create new page
- edit slug
- draft/published state
- menu visibility toggles
- route preview
- duplicate page
- delete page for non-system items

System pages should be locked from deletion but editable.

### Menus module

Menus should be rebuilt around choosing from existing pages plus custom links.

Required behaviors:

- add page to header/footer
- reorder items
- hide/show items
- add external links
- prevent invalid internal references
- reflect slug changes automatically for page-backed menu items

### Homepage module

Homepage builder should show only supported section types and explain section order clearly through labels, previews, and safe toggles.

Required behaviors:

- reorder sections
- show/hide sections
- set supported section-specific options
- preview which sections are currently live

### Dashboard

Release 1 dashboard changes stay focused:

- surface broken content operations first
- show media upload failures, draft count, unpublished scheduled content, and quick links to content queues
- keep analytics summary, but prioritize operator actions over decorative stats

## F. Error Handling

### Media upload

Return structured errors from upload API:

```ts
{
  code: 'FILE_TOO_LARGE' | 'UNSUPPORTED_TYPE' | 'NO_FILE' | 'UPLOAD_WRITE_FAILED',
  message: string,
  field?: string
}
```

### Page and menu operations

Validation errors must tell the operator exactly what failed:

- slug already exists
- page reference missing
- custom path conflicts with a reserved route
- unsupported homepage section type

### Public page rendering

If a CMS page is unpublished, the public route should return 404 instead of rendering stale content.

## G. Testing Strategy

### Unit and integration coverage

Add focused tests around:

- upload validation
- page slug uniqueness
- menu config validation
- homepage section validation
- webhook authentication
- HTML sanitization allowlist behavior

### E2E coverage

Add or expand Playwright flows for:

- admin login
- uploading an image from media library
- uploading from media picker inside content editing
- creating a new CMS page and opening it publicly
- adding the page to header navigation and verifying no 404
- editing homepage sections and seeing supported sections render
- editing a news article with rich text and verifying safe public render

## H. Migration Strategy

### Data migration

1. Add new `PageContent` fields.
2. Backfill slugs for existing system pages.
3. Copy legacy `page_*` `SiteConfig` values into `PageContent` where relevant.
4. Convert navigation items from plain href records into page references where the route matches a known CMS/system page.
5. Remove reliance on `page_*` config reads once public pages use `PageContent`.

### Compatibility strategy

During rollout:

- keep reading legacy navigation arrays in public config read paths
- normalize them into the new shape server-side
- write only the new shape from admin after migration

## I. Out of Scope for Release 1

- full block-based page builder
- revision history UI
- approval workflow or multi-author review flow
- asset usage graph
- true WordPress plugin ecosystem parity
- visual drag-and-drop landing-page composition

These remain valid later goals, but they are not required to make the current system production-usable.

## Implementation Success Criteria

Release 1 is successful when all of the following are true:

- admins can upload allowed files from both media surfaces without silent failure
- alt text edits persist on media assets
- admins can create a new page, publish it, and open it on the live site without adding code
- admins can add that page to header or footer navigation without manual href typing
- menu changes cannot create accidental internal 404s for page-backed items
- homepage editor cannot save unsupported section types
- public rich content is sanitized before render
- integration webhook rejects unauthenticated mutation requests
- system pages edited through admin are reflected on the public site

## Recommended First Implementation Slice

The first implementation plan should target Release 1 in this order:

1. security and upload stabilization
2. page model migration and public CMS rendering
3. menu registry and route-safe navigation editing
4. homepage registry cleanup
5. focused dashboard/admin polish needed to support the new flows

This order fixes the customer-reported failure first, removes exploitable behavior early, and then turns the current admin into a real operating surface instead of a partially disconnected control panel.
