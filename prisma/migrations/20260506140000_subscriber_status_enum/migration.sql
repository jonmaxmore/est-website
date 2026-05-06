-- Convert Subscriber.status from String to enum (audit-3 DB-1 M3).
-- Forward-only. The column already contains exactly 3 string values
-- ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED') so the cast is safe.

CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED');

ALTER TABLE "subscribers"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "SubscriberStatus" USING "status"::"SubscriberStatus",
  ALTER COLUMN "status" SET DEFAULT 'PENDING';
