-- Subscribers table for newsletter retention (audit-2 finding C-4).
-- Double-opt-in flow: signup → email with confirmToken (24h TTL) → click →
-- status flips PENDING → CONFIRMED + unsubscribeToken issued. Unsubscribe link
-- never expires (RFC 8058 one-click).

CREATE TABLE "subscribers" (
  "id"                TEXT NOT NULL,
  "email"             TEXT NOT NULL,
  "locale"            TEXT NOT NULL DEFAULT 'th',
  "status"            TEXT NOT NULL DEFAULT 'PENDING',
  "confirmedAt"       TIMESTAMP(3),
  "unsubscribedAt"    TIMESTAMP(3),
  "confirmToken"      TEXT,
  "confirmTokenExp"   TIMESTAMP(3),
  "unsubscribeToken"  TEXT,
  "utmSource"         TEXT,
  "utmMedium"         TEXT,
  "utmCampaign"       TEXT,
  "ipHash"            TEXT,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,

  CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");
CREATE UNIQUE INDEX "subscribers_confirmToken_key" ON "subscribers"("confirmToken");
CREATE UNIQUE INDEX "subscribers_unsubscribeToken_key" ON "subscribers"("unsubscribeToken");
CREATE INDEX "subscribers_status_idx" ON "subscribers"("status");
CREATE INDEX "subscribers_createdAt_idx" ON "subscribers"("createdAt");
