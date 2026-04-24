-- AlterTable: Add duration column to media_assets for video support
ALTER TABLE "media_assets" ADD COLUMN "duration" DOUBLE PRECISION;
