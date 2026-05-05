-- Restore UTM columns on analytics tables (audit-2 finding C-3 + M-2).
-- The original release1_baseline had utm_source/utm_medium/utm_campaign on
-- page_views; they were dropped at some point during the brand-webzine
-- foundation refactor. Without them, paid-channel attribution is impossible.
--
-- This migration adds them back to BOTH PageView and ConversionEvent so the
-- request-time tracking middleware (server/middleware/track-pageview.ts) and
-- the admin track endpoint (server/api/track.post.ts) can persist parsed
-- query-string UTM tags. Capped at 64 chars in app code before insert; the
-- column type stays unbounded TEXT for forward compatibility.

ALTER TABLE "page_views"
  ADD COLUMN "utmSource" TEXT,
  ADD COLUMN "utmMedium" TEXT,
  ADD COLUMN "utmCampaign" TEXT;

ALTER TABLE "conversion_events"
  ADD COLUMN "utmSource" TEXT,
  ADD COLUMN "utmMedium" TEXT,
  ADD COLUMN "utmCampaign" TEXT;

CREATE INDEX "page_views_utmCampaign_idx" ON "page_views"("utmCampaign");
CREATE INDEX "conversion_events_utmCampaign_idx" ON "conversion_events"("utmCampaign");
