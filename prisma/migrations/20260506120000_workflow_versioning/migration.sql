-- Workflow + versioning expansion (audit-2 findings M-3 + M-4):
--   1. Add REVIEWER role to AdminUser.role enum (approval workflow)
--   2. Add IN_REVIEW + SCHEDULED to ContentStatus enum (review + scheduled publish)
--   3. Add news_article_revisions table (content history / revert capability)
--
-- Forward-only. Existing rows are unaffected; the new enum values just become
-- available to write paths after this migration runs. Articles already in
-- DRAFT/PUBLISHED/ARCHIVED stay there.

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'REVIEWER';

ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';
ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';

CREATE TABLE "news_article_revisions" (
  "id"          TEXT NOT NULL,
  "articleId"   INTEGER NOT NULL,
  "snapshot"    JSONB NOT NULL,
  "editorId"    TEXT NOT NULL,
  "editorName"  TEXT NOT NULL,
  "changeNote"  TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "news_article_revisions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "news_article_revisions_articleId_createdAt_idx"
  ON "news_article_revisions"("articleId", "createdAt" DESC);

CREATE INDEX "news_article_revisions_createdAt_idx"
  ON "news_article_revisions"("createdAt");

ALTER TABLE "news_article_revisions" ADD CONSTRAINT "news_article_revisions_articleId_fkey"
  FOREIGN KEY ("articleId") REFERENCES "news_articles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
