# Database Restore Runbook

Audience: on-call operator. Goal: restore PostgreSQL from a `pg_dump` backup
produced by `scripts/backup-db.sh`. Tested cadence: quarterly drill against
a non-production target.

---

## When to use this runbook

- Pre-deploy snapshot was taken but a migration broke production schema
- Disk failure / volume corruption on the production host
- Verified data loss / accidental DELETE WHERE without WHERE clause
- DR drill (planned)

---

## Backup locations

| Location | Path / URI | Retention |
|---|---|---|
| Same-host disk | `/var/backups/est-website/est-<TIMESTAMP>.sql.gz[.enc]` | `BACKUP_RETENTION_DAYS` (default 30) |
| Off-site (REQUIRED) | `s3://${BACKUP_S3_BUCKET}/est-<TIMESTAMP>.sql.gz[.enc]` | Set bucket lifecycle in S3 console (recommend 90 days) |

`.enc` suffix = AES-256-CBC encrypted with `BACKUP_GPG_PASSPHRASE`.

---

## Step 1 — Identify the right backup

```bash
# Local
ls -lh /var/backups/est-website/ | tail -10

# Off-site (DigitalOcean Spaces example)
aws s3 ls "s3://${BACKUP_S3_BUCKET}/" --endpoint-url "$S3_ENDPOINT" \
  | grep est- | tail -10
```

Pick the most recent backup that pre-dates the failure. ISO-8601 UTC
timestamps are encoded in the filename so chronological sort = lexicographic
sort.

---

## Step 2 — Download (off-site case only)

```bash
aws s3 cp "s3://${BACKUP_S3_BUCKET}/est-20260506T030000Z.sql.gz.enc" \
  /tmp/restore.sql.gz.enc \
  --endpoint-url "$S3_ENDPOINT"
```

---

## Step 3 — Decrypt (if backup is `.enc`)

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 -salt \
  -pass env:BACKUP_GPG_PASSPHRASE \
  -in /tmp/restore.sql.gz.enc \
  -out /tmp/restore.sql.gz
```

Verify the file is valid gzip:

```bash
gzip -t /tmp/restore.sql.gz && echo OK
```

---

## Step 4 — Stop the application (avoid concurrent writes)

```bash
cd /root/est-website
docker compose stop app
# Postgres + Redis stay running; app writes are halted.
```

---

## Step 5 — Restore into PostgreSQL

```bash
# Stream-decompress straight into psql inside the postgres container.
gunzip -c /tmp/restore.sql.gz \
  | docker compose exec -T postgres \
      psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" --single-transaction
```

`--clean --if-exists` is already baked into the dump (`backup-db.sh:36`),
so the script DROPs each object before re-creating it. Wrapping in a
single transaction ensures the DB is either fully restored or untouched
on error.

---

## Step 6 — Sanity check

```bash
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
  SELECT 'admin_users' AS t, COUNT(*) FROM admin_users UNION ALL
  SELECT 'news_articles', COUNT(*) FROM news_articles UNION ALL
  SELECT 'marketing_banners', COUNT(*) FROM marketing_banners UNION ALL
  SELECT 'page_contents', COUNT(*) FROM page_contents;
"
```

Expected: row counts that match what the backup snapshotted (cross-check
with the most recent good metric in the admin dashboard).

---

## Step 7 — Restart the application

```bash
docker compose up -d app
```

Wait for the `/api/health?deep=1` probe to return `{"db":{"status":"ok"}}`.
Then monitor the runtime logs for ~15 minutes:

```bash
docker compose logs -f --tail=50 app
```

---

## Step 8 — Post-restore checklist

- [ ] Login at `/admin` with seed admin credentials succeeds
- [ ] Public homepage renders without 5xx
- [ ] Marketing banners reconcile (visit `/admin/banners` once to trigger
      throttled `reconcileBannerStatuses()`)
- [ ] Run a fresh backup IMMEDIATELY (`scripts/backup-db.sh`) so the next
      midnight cron isn't relying on the now-stale pre-restore one
- [ ] Post a status update to the operations channel with: timestamp of
      the original failure, timestamp of the restored backup, reason

---

## DR drill checklist (quarterly)

Run this in a non-production environment to keep the runbook honest:

1. Spin up an empty Postgres 16 container with the same major version as prod
2. Pull the most recent off-site backup
3. Run Steps 3–6 against the empty DB
4. Diff row counts vs the prod admin dashboard at the time the backup was
   taken; record any drift
5. Confirm `prisma migrate status` reports zero pending migrations
6. Tear down the drill environment

The drill should complete in under 30 minutes. If it exceeds that, the
operator should investigate before the real RTO budget is consumed.
