-- ──────────────────────────────────────────────────────────────────────────
-- Remove Event system + Pre-registration (entering official launch)
-- ──────────────────────────────────────────────────────────────────────────
--
-- This migration drops:
--   * model GameEvent  (table game_events) + its FK dependents
--   * model PreRegistration (table pre_registrations)
--   * enum EventType, EventStatus, Platform, Region (orphaned after drops)
--   * enum value EVENT from NewsCategory + WebzineContentType
--   * enum value event_page from MarketingBannerScope
--   * enum value event from MarketingBannerTargetType
--
-- Dropping a value from a postgres enum isn't supported in-place — the canon
-- pattern is rename-to-old, create new, alter columns to new, drop old. Steps
-- below follow that pattern after first remapping any rows that hold a value
-- that won't exist in the new enum.

-- Step 1 ── Remap rows so subsequent enum reshapes don't fail on cast.
UPDATE "news_articles"     SET "category"    = 'ANNOUNCEMENT' WHERE "category"    = 'EVENT';
UPDATE "news_articles"     SET "contentType" = 'ANNOUNCEMENT' WHERE "contentType" = 'EVENT';
UPDATE "marketing_banners" SET "isActive"    = false,        "scope"      = 'global' WHERE "scope"      = 'event_page';
UPDATE "marketing_banners" SET "isActive"    = false,        "targetType" = 'url'    WHERE "targetType" = 'event';

-- Step 2 ── Drop FK columns that reference game_events. Indexes go with them.
ALTER TABLE "news_articles"     DROP COLUMN IF EXISTS "linkedEventId";
ALTER TABLE "marketing_banners" DROP COLUMN IF EXISTS "targetEventId";

-- Step 3 ── Drop the tables.
DROP TABLE IF EXISTS "game_events";
DROP TABLE IF EXISTS "pre_registrations";

-- Step 4 ── Drop enums that are now orphaned (only used by the dropped tables).
DROP TYPE IF EXISTS "EventType";
DROP TYPE IF EXISTS "EventStatus";
DROP TYPE IF EXISTS "Platform";
DROP TYPE IF EXISTS "Region";

-- Step 5 ── Reshape NewsCategory (drop EVENT).
ALTER TYPE "NewsCategory" RENAME TO "NewsCategory_old";
CREATE TYPE "NewsCategory" AS ENUM ('ANNOUNCEMENT', 'UPDATE', 'MEDIA', 'MAINTENANCE');
ALTER TABLE "news_articles"
  ALTER COLUMN "category" TYPE "NewsCategory"
  USING "category"::text::"NewsCategory";
DROP TYPE "NewsCategory_old";

-- Step 6 ── Reshape WebzineContentType (drop EVENT).
ALTER TYPE "WebzineContentType" RENAME TO "WebzineContentType_old";
CREATE TYPE "WebzineContentType" AS ENUM ('ANNOUNCEMENT', 'PATCH_NOTES', 'GUIDE', 'LORE', 'DEV_BLOG');
ALTER TABLE "news_articles"
  ALTER COLUMN "contentType" DROP DEFAULT;
ALTER TABLE "news_articles"
  ALTER COLUMN "contentType" TYPE "WebzineContentType"
  USING "contentType"::text::"WebzineContentType";
ALTER TABLE "news_articles"
  ALTER COLUMN "contentType" SET DEFAULT 'ANNOUNCEMENT';
DROP TYPE "WebzineContentType_old";

-- Step 7 ── Reshape MarketingBannerScope (drop event_page).
ALTER TYPE "MarketingBannerScope" RENAME TO "MarketingBannerScope_old";
CREATE TYPE "MarketingBannerScope" AS ENUM (
  'global', 'homepage', 'news_index', 'article_detail', 'topic_page',
  'specific_article', 'specific_topic'
);
ALTER TABLE "marketing_banners"
  ALTER COLUMN "scope" TYPE "MarketingBannerScope"
  USING "scope"::text::"MarketingBannerScope";
DROP TYPE "MarketingBannerScope_old";

-- Step 8 ── Reshape MarketingBannerTargetType (drop event).
ALTER TYPE "MarketingBannerTargetType" RENAME TO "MarketingBannerTargetType_old";
CREATE TYPE "MarketingBannerTargetType" AS ENUM ('article', 'page', 'url');
ALTER TABLE "marketing_banners"
  ALTER COLUMN "targetType" TYPE "MarketingBannerTargetType"
  USING "targetType"::text::"MarketingBannerTargetType";
DROP TYPE "MarketingBannerTargetType_old";
