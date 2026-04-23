# Media Video Upload and Homepage Video Background Design

**Date:** 2026-04-23
**Author:** Codex
**Status:** Approved in conversation, written for implementation planning

## Goal

Add first-class video handling to the CMS so the team can:

- upload video files through the existing media workflow
- browse and preview video assets in the media library and media picker
- use a media-library video as the homepage hero background
- keep homepage hero rendering safe with image fallback behavior

This design is intentionally scoped to a practical v1: `video upload in Media Library + hero background video only`.

## Approved Product Direction

The approved direction in conversation is:

- use `Media Library` as the only source of managed background videos in v1
- support video upload through the existing admin media flow rather than a separate subsystem
- support homepage background video only for the `hero` section in v1
- keep `image` as the default and fallback background mode

## Why This Exists

The current project already has most of the required building blocks:

- `MediaAsset` stores uploaded files, mime types, dimensions, URLs, and metadata
- `Media Library` already accepts `image/*,video/*` in the admin UI
- upload validation already explicitly allows `video/mp4`
- homepage sections already support a section-level `background` image URL
- the hero section already renders a controlled background surface with existing gradient overlays

Current gaps:

1. Video is allowed in parts of the media flow, but the product still behaves like an image-only system.
2. Media detail and picker experiences are still image-centric.
3. Homepage section config has no formal concept of `background mode`.
4. The public hero renderer only knows how to draw a background image.
5. There is no operator-safe fallback strategy for video failure or reduced-motion preference.

## Scope

### In Scope for This Design

- video upload support in the existing `Media Library`
- video preview support in admin media detail views
- video filtering or mode support in `AdminMediaPicker`
- hero-section config for `image` vs `video` background mode
- public homepage hero video rendering with poster and fallback image behavior
- focused unit and e2e coverage for the new flow

### Out of Scope for This Release

- video backgrounds for every homepage section
- general page-builder video blocks
- remote video URLs outside the media library
- adaptive streaming, HLS, or external CDNs
- advanced video transcoding jobs
- per-video poster generation pipelines
- autoplay video support in sections other than hero

## Design Principles

1. Extend current CMS contracts instead of inventing a separate media product.
2. Keep hero video opt-in and explicit, never implied by a background URL alone.
3. Preserve image fallback behavior at every layer.
4. Use the media library as the source of truth for managed assets.
5. Keep validation strict enough to prevent broken hero configurations.
6. Keep release-one file support narrow and operationally predictable.

## Current-System Read

### Media

The current system already contains useful primitives:

- `MediaAsset` persists `mimeType`, `sizeBytes`, `url`, `thumbnailUrl`, `width`, and `height`
- `useAdminMediaUpload` validates upload type and size
- `server/api/admin/media/upload.post.ts` stores uploads in `public/uploads`
- `admin/media.vue` already advertises "Upload images and videos for your content"

However, the admin experience still treats non-image files as stand-ins rather than as first-class editorial assets.

### Homepage

Homepage sections currently use:

- `section.background` for a section-level background image URL
- `hero.config` for hero-specific content such as logo, subtitles, and buttons
- `HeroSection.vue` for the public hero renderer

That means the safest extension path is:

- keep `section.background` as the image fallback or poster
- add explicit video fields to `hero.config`
- teach `HeroSection.vue` to switch between image and video modes

This avoids a wider homepage schema rewrite.

## Proposed Architecture
## A. Media Asset Model

Do not introduce a new Prisma model for video.

Keep using `MediaAsset` and derive asset behavior from `mimeType`.

### V1 Media Rules

- supported image formats remain unchanged
- supported video format in v1 is `video/mp4`
- asset kind is derived:
  - `image` when `mimeType` starts with `image/`
  - `video` when `mimeType` starts with `video/`

### Why No Schema Change

- `mimeType` already tells us what we need for v1
- the upload pipeline already writes video files
- avoiding a DB migration keeps this change narrowly scoped

If a future release needs richer media typing, transcoding status, or poster-job tracking, that can be added later.

## B. Homepage Hero Config

Keep `section.background` as the fallback image and poster source.

Extend `hero.config` with explicit video fields:

```ts
type HeroConfig = {
  logo: string
  subtitleEn: string
  subtitleTh: string
  showSocialLinks: boolean
  buttons: HeroButtonConfig[]
  backgroundMode?: 'image' | 'video'
  backgroundVideo?: string
}
```

### Config Semantics

- `backgroundMode = 'image'`
  - hero uses `section.background` exactly as today
- `backgroundMode = 'video'`
  - hero uses `hero.config.backgroundVideo` as the primary background source
  - `section.background` becomes the required poster and fallback image

This keeps section-level background behavior backward compatible while letting hero gain a richer background contract.

## C. Media Library UX

The media library should behave as a mixed image-and-video asset browser.

### Grid/List Presentation

- show an `image` or `video` badge on each asset
- keep image cards visually unchanged
- for video cards:
  - show a video icon or lightweight still preview
  - show file size and filename the same way as images
  - avoid trying to autoplay videos in the library grid

### Asset Detail Modal

- image assets render with `<img>`
- video assets render with `<video controls preload="metadata">`
- shared metadata remains visible for both:
  - filename
  - mime type
  - size
  - dimensions when known
  - URL copy action

### Alt Text

- keep the field in the current asset detail workflow
- treat it as strongly useful for images
- allow it for videos as optional descriptive metadata in v1

## D. Media Picker Behavior

`AdminMediaPicker` should support a mode or filter contract:

```ts
type MediaPickerAccept = 'image' | 'video' | 'all'
```

### V1 Picker Rules

- `image` mode shows only image assets
- `video` mode shows only video assets
- `all` mode shows every asset

### Homepage Hero Usage

The homepage hero editor should use two separate picker fields:

1. `Background Image / Poster` -> `accept="image"`
2. `Background Video` -> `accept="video"`

This keeps the operator workflow obvious and prevents accidentally choosing a video where an image fallback is expected.

## E. Admin Homepage Builder UX

Only the `hero` section needs video controls in v1.

### Hero Editor Additions

Add these controls to the hero editing surface:

1. `Background Mode`
   - `Image`
   - `Video`
2. `Background Image / Poster`
3. `Background Video`

### Admin Behavior

- when `Background Mode = Image`
  - show current image preview
  - hide video-specific controls
- when `Background Mode = Video`
  - show video picker
  - keep poster picker visible
  - show a warning if no poster image is set

### Why Hero Only

- hero is the most valuable marketing surface on the homepage
- it has the most obvious user benefit for motion
- it avoids widening the new config contract to all section types at once

## F. Public Hero Rendering

`HeroSection.vue` should become mode-aware.

### Image Mode

Render exactly as the current system does:

- full-bleed background image
- existing top and bottom overlay gradients
- existing hero content stack

### Video Mode

Render a background video element:

```html
<video autoplay muted loop playsinline poster="...">
  <source src="..." type="video/mp4" />
</video>
```

### Video Rendering Rules

- `autoplay`
- `muted`
- `loop`
- `playsinline`
- `poster` set from `section.background`
- keep the current overlay gradients on top of the media layer
- keep hero content layering unchanged

### Fallback Rules

If any of the following is true, render the image fallback instead:

- `backgroundMode` is not `video`
- `backgroundVideo` is empty
- browser blocks playback
- video load errors occur
- user prefers reduced motion

This keeps the hero resilient and avoids shipping a blank first viewport.

## G. Validation Rules

### Media Upload Validation

Continue using the shared media validation contract, but keep v1 explicitly narrow:

- allow current image formats
- allow `video/mp4`
- reject unsupported video types
- keep max size rules unless changed intentionally in implementation planning

### Homepage Config Validation

When normalizing homepage sections:

- non-hero sections ignore video-only hero config fields
- hero sections normalize:
  - `backgroundMode` to `image` when absent or invalid
  - `backgroundVideo` to empty string when absent

When `backgroundMode = 'video'`:

- `backgroundVideo` must be present
- `section.background` should be present as fallback image

The admin UI should warn on missing poster image, and the config normalizer should still fall back safely at runtime.

## H. Performance and Safety

### Performance Posture

Release 1 should optimize for predictable hero playback, not for advanced streaming.

Rules:

- do not autoplay video thumbnails in admin grids
- use `preload="metadata"` in admin preview
- use standard hero autoplay only in the public hero surface
- preserve image fallback so the first viewport still paints even if video is slow

### Accessibility and Motion Safety

If the browser reports reduced-motion preference:

- prefer the fallback image over autoplay video

This is the simplest safe behavior for v1 and fits the site's brand-marketing goals without being hostile to motion-sensitive users.

## I. Testing Strategy

### Unit Tests

Add or extend focused tests for:

- media mime validation accepts supported images and `video/mp4`
- homepage hero config normalization for `backgroundMode`
- invalid or partial hero video config falls back to safe defaults

### Admin E2E

Add flows for:

- uploading an `.mp4` file in admin media
- opening a video asset in the media detail modal
- selecting a video asset for hero background
- saving hero background mode as `video`
- reloading admin and confirming the saved state persists

### Public E2E

Add flows for:

- homepage hero renders a `<video>` element when configured for video mode
- the video element includes `muted`, `loop`, `playsinline`, and `poster`
- homepage falls back to image rendering when video mode is not configured

## J. Implementation Success Criteria

This release is successful when all of the following are true:

- admins can upload `mp4` files through the existing media flow
- media library clearly distinguishes image and video assets
- admins can preview uploaded videos in asset detail UI
- the homepage hero editor can choose `image` or `video` background mode
- admins can pick a media-library video for hero background
- the public hero can render background video with poster and gradient overlays
- the public hero falls back safely to image mode when needed
- the change ships without inventing a second media-management system

## Recommended First Implementation Slice

Implement in this order:

1. strengthen shared media typing and validation for video-first admin behavior
2. update media library and media picker for mixed image/video handling
3. extend homepage config normalization for hero video mode
4. update homepage admin editor for hero background mode controls
5. update public hero rendering with video mode and safe fallback behavior
6. add focused unit and e2e coverage

This order keeps the shared contracts stable before touching the public homepage experience.
