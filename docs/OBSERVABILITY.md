# Observability Setup Guide

Audience: ops engineer wiring the production stack. Goal: take the
already-shipped logger / health endpoint / Sentry SDK and connect them to
external services so production isn't blind.

The application code already provides:
- Structured JSON logger (`server/utils/logger.ts`) — emits to stdout/stderr
- Request correlation IDs (`server/middleware/request-id.ts`) — `X-Request-Id`
- Health endpoint (`/api/health` shallow + `/api/health?deep=1` deep)
- Sentry SDKs (`server/plugins/sentry.ts` + `app/plugins/sentry.client.ts`) —
  dormant until `SENTRY_DSN` / `NUXT_PUBLIC_SENTRY_DSN` is set
- Slack alerts util (`server/utils/alerts.ts`) — dormant until
  `SLACK_ALERT_WEBHOOK_URL` is set

What you wire externally:

---

## 1. Log shipper

The Docker logging driver is `json-file` with 50 MB rolling per service —
fine for ad-hoc `docker compose logs`, useless for cross-request search.
Pick one of:

### Option A — Vector → Loki (recommended, self-hosted, ~$10/mo droplet)

Install Vector on the host:

```bash
curl -sSfL https://sh.vector.dev | bash
```

Drop a config at `/etc/vector/vector.yaml`:

```yaml
sources:
  docker_app:
    type: docker_logs
    include_containers:
      - est-website-app-1
      - est-website-nginx-1

transforms:
  parse_json:
    type: remap
    inputs: [docker_app]
    source: |
      structured = parse_json(.message) ?? {}
      . |= structured

sinks:
  loki:
    type: loki
    inputs: [parse_json]
    endpoint: https://logs.example.com
    encoding:
      codec: json
    labels:
      service: "{{ container_name }}"
      level: "{{ level }}"
```

Loki retention is bucket-driven; 30 days is reasonable for a small site.

### Option B — Datadog / Better Stack / Papertrail (managed, ~$15-50/mo)

Install the agent per vendor docs. Same idea: the agent tails Docker JSON
files, parses the JSON the app already emits, and ships to the SaaS.

### Verifying

After config, look at one log line like the analytics dashboard hit:

```bash
docker compose exec app curl -s http://localhost:3000/api/admin/analytics
```

The Vector → Loki path should surface a `{"scope":"admin.analytics","msg":...}`
record within ~10 seconds.

---

## 2. Uptime monitor

Wire an external probe to `/api/health`. Two probes recommended:

- **Shallow** (`/api/health`) — every 1 minute. Confirms the Node process
  is up. Use as the alerting trigger.
- **Deep** (`/api/health?deep=1`) — every 5 minutes. Confirms DB +
  optionally Redis. Use as a slower but more rigorous health metric.

### Vendor options

- **UptimeRobot** (free tier 50 monitors) — fastest to set up
- **BetterStack / Better Uptime** ($20/mo) — bundles status page
- **Pingdom** (~$15/mo) — granular geographic checks
- **Cron + curl + Slack webhook** (free) — the lowest-tech option:

```bash
*/2 * * * * curl -sf https://yoursite.com/api/health || \
  curl -X POST -H 'content-type: application/json' \
    -d '{"text":":rotating_light: EST health check failed"}' \
    "$SLACK_ALERT_WEBHOOK_URL"
```

---

## 3. Sentry

Already wired in code. To activate:

1. Create a Sentry project (Node + Vue runtimes) — free tier covers small sites
2. Copy the two DSNs (server + browser are separate keys)
3. Set in production `.env`:

   ```
   SENTRY_DSN=https://...@sentry.io/...
   NUXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   GIT_COMMIT_SHA=$(git rev-parse HEAD)
   ```

4. Restart the app: `docker compose up -d app`

Verify with a synthetic error:

```bash
curl -sf https://yoursite.com/api/this-route-does-not-exist
# Should appear in Sentry as a 404 — wait, we filter < 500 — try a server crash
# instead, e.g. by setting a broken DB password and hitting /api/health?deep=1
```

The `requestId` tag should be visible on every Sentry event so you can
cross-reference with the Loki logs.

---

## 4. Slack alerts

`server/utils/alerts.ts` provides `sendSlackAlert(severity, title, details)`.
It's no-op unless `SLACK_ALERT_WEBHOOK_URL` is set.

Where it's used (will grow):

| Caller | Trigger |
|---|---|
| Backup script (recommended add) | `scripts/backup-db.sh` non-zero exit |
| Cert expiry cron (recommended add) | < 14 days remaining |
| Nightly health check | health endpoint deep mode failing |

### Wiring a Slack incoming webhook

1. Slack admin → "Apps" → "Custom Integrations" → "Incoming Webhooks"
2. Choose a channel (recommend `#prod-alerts` separate from general chat)
3. Copy the webhook URL into prod `.env`: `SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/...`

---

## 5. Cert expiry monitoring

`setup-ssl.sh` echoes the renewal cron line but doesn't install it. Quick
fix until a proper renewal automation lands:

```bash
# Run once on the host:
echo "0 3 * * 0 /root/est-website/scripts/renew-cert.sh" | crontab -

# scripts/renew-cert.sh:
docker run --rm \
  -v /root/est-website/certbot/conf:/etc/letsencrypt \
  -v /root/est-website/certbot/www:/var/www/certbot \
  certbot/certbot renew && \
  docker compose -f /root/est-website/docker-compose.yml exec nginx nginx -s reload
```

For expiry alerting, add a daily check using openssl:

```bash
DAYS=$(openssl x509 -enddate -noout \
  -in /root/est-website/certbot/conf/live/yourdomain.com/cert.pem \
  | sed 's/.*=//' | xargs -I{} date -d '{}' +%s \
  | awk '{ print int(($0 - systime()) / 86400) }')
[ "$DAYS" -lt 14 ] && curl -X POST -d "{\"text\":\"Cert expires in $DAYS days\"}" "$SLACK_ALERT_WEBHOOK_URL"
```

---

## What's still pending

These need product / financial decisions, not code:

- [ ] Pick + provision Loki (or a managed log alternative)
- [ ] Pick + provision uptime monitor
- [ ] Create Sentry project + add DSNs to prod `.env`
- [ ] Create Slack channel + webhook + add URL to prod `.env`
- [ ] Schedule a quarterly DR drill per `docs/RESTORE-RUNBOOK.md`
