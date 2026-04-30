# Security Operations — EST Website

Status as of 2026-04-30. Production at `178.128.127.161` (no domain yet).

## ✅ Active Defenses

### Application layer
- **Auth**: bcryptjs password hash + nuxt-auth-utils session cookie (HttpOnly)
- **RBAC**: single middleware `server/middleware/admin-auth.ts` — SUPER_ADMIN check on every `/api/admin/*`
- **Rate limit on login**: server-side 10 attempts / 5 min per IP (Redis); nginx layer 10 r/min + burst 5
- **Rate limit on tracking**: 10 r/sec + burst 20
- **Rate limit on /api/***: 60 r/sec + burst 120
- **Validation**: Zod schemas on every admin POST/PUT (news, events, banners, weapons, features, highlights, milestones, pages, etc.)
- **XSS defense (3 layers)**:
  1. Tiptap rich-text editor whitelists allowed tags/attrs
  2. Server-side sanitize-html scrubs all rich-text fields before DB write
  3. CSP header blocks any payload that survives steps 1-2 from executing
- **HTTP security headers** (nginx, applies to all responses):
  - `X-Frame-Options: SAMEORIGIN` (clickjacking)
  - `X-Content-Type-Options: nosniff` (MIME sniffing)
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Content-Security-Policy: default-src 'self'; ...`
- **/uploads/* hardening**: `X-Content-Type-Options: nosniff` blocks uploaded HTML/JS from rendering as script
- **Path traversal defense** in `server/routes/uploads/[...path].get.ts` (`normalize()` + prefix check)
- **HMAC webhook signatures** for inbound integrations

### Database layer
- **Postgres + Redis** in internal Docker network only — ports 5432 / 6379 NOT exposed
- **Redis password** required (REDIS_PASSWORD env)
- **Prisma parameterized queries** — no SQL injection surface
- **FK SetNull cascades** prevent orphan records on delete
- **Activity log** captures all admin mutations + LOGIN events (`activity_logs` table, ~500+ entries)
- **Pre-deploy backup**: `pg_dump | gzip` to `/var/backups/est-website/pre-deploy-{commit}-{ts}.sql.gz` runs before every deploy
- **PDPA retention purge**: `scripts/purge-analytics.sh` cron clears stale page_views/conversion_events

### Network layer
- **ufw firewall**: default deny incoming; only 22 (SSH), 80 (HTTP), 443 (HTTPS) allowed
- **fail2ban**: SSH brute-force defense — 5 fails / 10 min → 1 hour ban; uses `aggressive` mode; jail config at `/etc/fail2ban/jail.local`
- **No public DB ports** — admin tunnels via SSH if needed (`ssh -L 5432:localhost:5432 root@...`)

### Operational
- **Pre-deploy validation gate** in `.github/workflows/deploy.yml` (typecheck + build before SSH deploy)
- **Health check + auto-rollback** in `scripts/finish-deploy.sh` — if `/api/public/site` doesn't return 200 within 30 retries, restores previous Docker image
- **Container health checks** every 30s (app + postgres + redis)
- **Code-side `typeCheck: true`** in nuxt.config.ts — vue-tsc errors block build

## ⏳ Pending — needs domain registration

These can't be enabled until the user picks a domain and points DNS at the server:
1. **HTTPS / TLS** — `setup-ssl.sh` is ready (Let's Encrypt + certbot). Needs `DOMAIN` + `EMAIL` env vars and DNS A-record.
2. **Secure cookie flag** — `NUXT_SESSION_COOKIE_SECURE=true` activates after HTTPS is up (auto-detect logic already in nuxt.config.ts).
3. **HSTS header** — add `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` in nginx ssl.conf after HTTPS is verified.
4. **Cloudflare proxy** — DNS-level DDoS shield + global CDN; needs domain on Cloudflare nameservers.
5. **Auto SSL renewal** — certbot cron (already in setup-ssl.sh, runs after first issuance).

## 📊 Recommended monitoring

Free uptime monitoring options that work with bare IP (no domain needed):

### Option A — UptimeRobot (free tier, recommended)
1. Sign up at https://uptimerobot.com
2. Create new monitor:
   - Type: HTTP(s)
   - URL: `http://178.128.127.161/api/public/site`
   - Friendly name: `EST Production Health`
   - Interval: 5 min (free tier minimum)
3. Add alert contacts (email + LINE Notify if Thai team uses it)
4. Optional: 2nd monitor on `http://178.128.127.161/admin/login` (catches admin route breakage)

### Option B — Better Stack (free 10 monitors)
Same setup, 30-second interval (3-min on free).

### Option C — self-hosted (if don't want SaaS)
`docker run --restart=always -p 3001:3001 louislam/uptime-kuma:1` on a separate cheap droplet.

## 🔥 Incident response — common scenarios

### "Site is down"
```bash
ssh -i ~/.ssh/id_ed25519 root@178.128.127.161
cd /root/est-website
docker compose ps                    # Container status
docker compose logs --tail=200 app   # App errors
curl -I http://localhost/api/public/site  # Health check
```

### "Login is being brute-forced"
```bash
fail2ban-client status sshd          # Check if SSH being attacked
fail2ban-client status               # All jails
# Block specific IP manually:
ufw deny from 1.2.3.4
```

### "Database performance degrading"
```bash
docker compose exec postgres psql -U est_admin -d est_website -c "SELECT COUNT(*) FROM page_views;"
# If >1M rows, run purge-analytics.sh manually
bash scripts/purge-analytics.sh
```

### "Need to restore from backup"
```bash
ls -lh /var/backups/est-website/        # List backups
gunzip -c /var/backups/est-website/pre-deploy-{commit}-{ts}.sql.gz \
  | docker compose exec -T postgres psql -U est_admin -d est_website
```

## 🔐 Secret rotation schedule

Manual quarterly rotation:
- `ADMIN_SEED_PASSWORD` (initial admin password — only used on fresh DB)
- `NUXT_SESSION_PASSWORD` (rotates session signing — invalidates all logins on rotation)
- `WEBHOOK_SECRET` (HMAC for inbound webhooks)
- `ANALYTICS_IP_SALT` (salts visitor IPs in page_views — rotate to prevent linkability)
- `REDIS_PASSWORD` (Redis auth — rotate if leaked)
- `POSTGRES_PASSWORD` (DB superuser — rotate if leaked, requires `docker compose down + up`)

## 🚫 Out-of-scope (deferred to post-domain phase)

- 2FA (TOTP) for admin login — code skeleton ready in branch, schema column needed
- WAF (Web Application Firewall) — Cloudflare WAF kicks in once on Cloudflare proxy
- Pen-test by external party — schedule before public PR launch
- Centralized logging (ELK/Loki) — not needed at current traffic level (~50k pageviews); current `docker logs` + activity_logs table sufficient
