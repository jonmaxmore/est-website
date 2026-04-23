-- CreateEnum
CREATE TYPE "WebzineContentType" AS ENUM ('ANNOUNCEMENT', 'EVENT', 'PATCH_NOTES', 'GUIDE', 'LORE', 'DEV_BLOG');

-- CreateEnum
CREATE TYPE "MarketingBannerPlacement" AS ENUM ('popup', 'floating', 'announcement_bar', 'homepage_inline', 'sidebar', 'article_inline', 'footer_strip');

-- CreateEnum
CREATE TYPE "MarketingBannerStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'LIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MarketingBannerScope" AS ENUM ('global', 'homepage', 'news_index', 'article_detail', 'topic_page', 'event_page', 'specific_article', 'specific_topic');

-- CreateEnum
CREATE TYPE "MarketingBannerTargetType" AS ENUM ('article', 'page', 'event', 'url');

-- AlterTable
ALTER TABLE "news_articles" ADD COLUMN     "campaignCode" TEXT,
ADD COLUMN     "contentType" "WebzineContentType" NOT NULL DEFAULT 'ANNOUNCEMENT',
ADD COLUMN     "isEvergreen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedEventId" TEXT,
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "primaryTopicKey" TEXT,
ADD COLUMN     "readingTimeMinutes" INTEGER;

-- AlterTable
ALTER TABLE "game_events" ADD COLUMN     "campaignCode" TEXT,
ADD COLUMN     "linkedArticleId" INTEGER;

-- CreateTable
CREATE TABLE "marketing_banners" (
    "id" TEXT NOT NULL,
    "placement" "MarketingBannerPlacement" NOT NULL,
    "status" "MarketingBannerStatus" NOT NULL DEFAULT 'DRAFT',
    "scope" "MarketingBannerScope" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "campaignCode" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "badgeEn" TEXT,
    "badgeTh" TEXT,
    "titleEn" TEXT NOT NULL,
    "titleTh" TEXT NOT NULL,
    "bodyEn" TEXT,
    "bodyTh" TEXT,
    "desktopImage" TEXT,
    "mobileImage" TEXT,
    "targetType" "MarketingBannerTargetType" NOT NULL,
    "targetArticleId" INTEGER,
    "targetPageKey" TEXT,
    "targetEventId" TEXT,
    "targetTopicKey" TEXT,
    "targetUrl" TEXT,
    "targetNewTab" BOOLEAN NOT NULL DEFAULT false,
    "dismissible" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketing_banners_placement_isActive_status_idx" ON "marketing_banners"("placement", "isActive", "status");

-- CreateIndex
CREATE INDEX "marketing_banners_scope_placement_idx" ON "marketing_banners"("scope", "placement");

-- CreateIndex
CREATE INDEX "marketing_banners_campaignCode_idx" ON "marketing_banners"("campaignCode");

-- CreateIndex
CREATE INDEX "marketing_banners_targetArticleId_idx" ON "marketing_banners"("targetArticleId");

-- CreateIndex
CREATE INDEX "marketing_banners_targetPageKey_idx" ON "marketing_banners"("targetPageKey");

-- CreateIndex
CREATE INDEX "marketing_banners_targetEventId_idx" ON "marketing_banners"("targetEventId");

-- CreateIndex
CREATE INDEX "marketing_banners_targetTopicKey_idx" ON "marketing_banners"("targetTopicKey");

-- CreateIndex
CREATE INDEX "news_articles_contentType_status_publishedAt_idx" ON "news_articles"("contentType", "status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "news_articles_primaryTopicKey_status_publishedAt_idx" ON "news_articles"("primaryTopicKey", "status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "news_articles_campaignCode_idx" ON "news_articles"("campaignCode");

-- CreateIndex
CREATE INDEX "news_articles_linkedEventId_idx" ON "news_articles"("linkedEventId");

-- CreateIndex
CREATE UNIQUE INDEX "game_events_linkedArticleId_key" ON "game_events"("linkedArticleId");

-- CreateIndex
CREATE INDEX "game_events_campaignCode_idx" ON "game_events"("campaignCode");

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_linkedEventId_fkey" FOREIGN KEY ("linkedEventId") REFERENCES "game_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_events" ADD CONSTRAINT "game_events_linkedArticleId_fkey" FOREIGN KEY ("linkedArticleId") REFERENCES "news_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_banners" ADD CONSTRAINT "marketing_banners_targetArticleId_fkey" FOREIGN KEY ("targetArticleId") REFERENCES "news_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_banners" ADD CONSTRAINT "marketing_banners_targetPageKey_fkey" FOREIGN KEY ("targetPageKey") REFERENCES "page_contents"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_banners" ADD CONSTRAINT "marketing_banners_targetEventId_fkey" FOREIGN KEY ("targetEventId") REFERENCES "game_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
