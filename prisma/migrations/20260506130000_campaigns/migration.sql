-- First-class Campaign entity (audit-2 finding C-5).
-- Adds the campaigns table + nullable FK from MarketingBanner + NewsArticle.
-- Existing campaignCode columns are kept as a denormalized free-text fallback
-- (so legacy queries / external imports still work) and as a backfill source
-- for the new campaign rows.
--
-- Forward-only. No data backfill in this migration — operators can run a
-- one-time admin script to create Campaign rows from distinct campaignCode
-- values, then attach articles + banners. Until that runs, campaignId is
-- NULL on every existing row, which is the safe default.

CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

CREATE TABLE "campaigns" (
  "id"          TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "description" TEXT,
  "ownerEmail"  TEXT,
  "startsAt"    TIMESTAMP(3),
  "endsAt"      TIMESTAMP(3),
  "kpis"        JSONB,
  "status"      "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "campaigns_slug_key" ON "campaigns"("slug");
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");
CREATE INDEX "campaigns_startsAt_idx" ON "campaigns"("startsAt");

ALTER TABLE "news_articles" ADD COLUMN "campaignId" TEXT;
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "news_articles_campaignId_idx" ON "news_articles"("campaignId");

ALTER TABLE "marketing_banners" ADD COLUMN "campaignId" TEXT;
ALTER TABLE "marketing_banners" ADD CONSTRAINT "marketing_banners_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "marketing_banners_campaignId_idx" ON "marketing_banners"("campaignId");
