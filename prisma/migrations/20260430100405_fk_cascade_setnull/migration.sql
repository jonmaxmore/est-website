-- Drop existing FK constraints (default RESTRICT) and recreate with ON DELETE SET NULL.
-- Prevents orphan/integrity errors when admin deletes a NewsArticle, PageContent,
-- or GameEvent that is still referenced by MarketingBanners or other GameEvents.

-- ── game_events.linkedArticleId → news_articles.id ──
ALTER TABLE "game_events" DROP CONSTRAINT IF EXISTS "game_events_linkedArticleId_fkey";
ALTER TABLE "game_events"
  ADD CONSTRAINT "game_events_linkedArticleId_fkey"
  FOREIGN KEY ("linkedArticleId") REFERENCES "news_articles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ── marketing_banners.targetArticleId → news_articles.id ──
ALTER TABLE "marketing_banners" DROP CONSTRAINT IF EXISTS "marketing_banners_targetArticleId_fkey";
ALTER TABLE "marketing_banners"
  ADD CONSTRAINT "marketing_banners_targetArticleId_fkey"
  FOREIGN KEY ("targetArticleId") REFERENCES "news_articles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ── marketing_banners.targetPageKey → page_contents.key ──
ALTER TABLE "marketing_banners" DROP CONSTRAINT IF EXISTS "marketing_banners_targetPageKey_fkey";
ALTER TABLE "marketing_banners"
  ADD CONSTRAINT "marketing_banners_targetPageKey_fkey"
  FOREIGN KEY ("targetPageKey") REFERENCES "page_contents"("key")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ── marketing_banners.targetEventId → game_events.id ──
ALTER TABLE "marketing_banners" DROP CONSTRAINT IF EXISTS "marketing_banners_targetEventId_fkey";
ALTER TABLE "marketing_banners"
  ADD CONSTRAINT "marketing_banners_targetEventId_fkey"
  FOREIGN KEY ("targetEventId") REFERENCES "game_events"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
