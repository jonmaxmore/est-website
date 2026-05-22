-- Composite index on (resource, action) for the admin Activity page's
-- dominant non-recency filter ("show DELETE on banners", etc.).
-- Concurrent build keeps the live admin from blocking on the index lock.
CREATE INDEX IF NOT EXISTS "activity_logs_resource_action_idx"
  ON "activity_logs" ("resource", "action");
