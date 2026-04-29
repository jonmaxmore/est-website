# Production Operations Playbook

คู่มือการทำงานบนเครื่อง production (DigitalOcean droplet) — ติดตั้ง, สำรอง, กู้คืน, ตรวจสอบ

---

## 1. การตั้งค่าครั้งแรก

### 1.1 สร้าง .env บนเซิร์ฟเวอร์

```bash
ssh root@<server-ip>
cd /root/est-website
cp .env.production.example .env
nano .env
```

ค่าที่ต้อง generate:

```bash
# Session
openssl rand -hex 32      # NUXT_SESSION_PASSWORD
# Redis password
openssl rand -hex 24      # REDIS_PASSWORD (ใช้ค่าเดียวกันใน REDIS_URL)
# Analytics IP salt
openssl rand -hex 32      # ANALYTICS_IP_SALT
# Webhook signature secret
openssl rand -hex 32      # WEBHOOK_SECRET
```

ค่าที่ต้องตั้งเอง:
- `POSTGRES_PASSWORD` — รหัส DB
- `ADMIN_SEED_EMAIL` + `ADMIN_SEED_PASSWORD` — admin คนแรก (password ≥ 12 chars)

### 1.2 First Deploy

```bash
docker compose up -d
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts
```

### 1.3 ตั้ง SSL

```bash
./setup-ssl.sh
```

---

## 2. Backup & Restore

### 2.1 ติดตั้ง Backup Cron

```bash
chmod +x scripts/backup-db.sh scripts/purge-analytics.sh

# ทดสอบก่อน
./scripts/backup-db.sh

# ติดตั้ง cron — daily 03:00 UTC
crontab -e
```

เพิ่มบรรทัด:

```cron
# Daily DB backup
0 3 * * * /root/est-website/scripts/backup-db.sh >> /var/log/est-backup.log 2>&1

# Daily analytics purge (PDPA retention)
30 3 * * * /root/est-website/scripts/purge-analytics.sh >> /var/log/est-purge.log 2>&1

# SSL renewal (Let's Encrypt — แทน reload เพื่อให้ nginx ใช้ cert ใหม่)
0 4 * * 0 cd /root/est-website && docker compose stop nginx && docker run --rm -v "$(pwd)/certbot/conf:/etc/letsencrypt" -v "$(pwd)/certbot/www:/var/www/certbot" -p 80:80 certbot/certbot renew --quiet && docker compose up -d nginx
```

### 2.2 Off-site Backup (DigitalOcean Spaces)

```bash
# ติดตั้ง awscli
apt-get install -y awscli

# Configure
aws configure --profile do-spaces
# AWS Access Key ID: <Spaces key>
# AWS Secret Access Key: <Spaces secret>
# Default region: sgp1
# Default output: json

# เพิ่มใน .env
echo 'BACKUP_S3_BUCKET=est-backups' >> .env
echo 'S3_ENDPOINT=https://sgp1.digitaloceanspaces.com' >> .env
```

### 2.3 Restore from backup

```bash
# Pull ไฟล์มาตรงๆ
gunzip -c /var/backups/est-website/est-20260101T030000Z.sql.gz \
  | docker compose exec -T postgres psql -U est_admin -d est_website
```

---

## 3. Network Security

### 3.1 ปิด port DB/Redis ออกข้างนอก (compose ทำให้แล้ว)

ตรวจสอบ:

```bash
# ต้องไม่เห็น 5432/6379 ที่ 0.0.0.0
ss -tlnp | grep -E '5432|6379'

# ถ้าเห็น — แสดงว่ายังไม่ได้ recreate compose
docker compose down
docker compose up -d
```

### 3.2 UFW firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw default deny incoming
ufw enable
```

### 3.3 SSH tunnel เข้า DB จากเครื่อง dev

```bash
ssh -L 5432:localhost:5432 root@<server-ip>
# ที่เครื่อง dev: ใช้ DBeaver/psql ต่อที่ localhost:5432
```

---

## 4. Monitoring

### 4.1 ตรวจ container health

```bash
docker compose ps                      # state ของ services
docker compose logs -f --tail=100 app  # tail log
docker stats                           # CPU/RAM realtime
```

### 4.2 ตรวจ DB

```bash
# Active connections + slow queries
docker compose exec postgres psql -U est_admin -d est_website \
  -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"

docker compose exec postgres psql -U est_admin -d est_website \
  -c "SELECT pid, now()-query_start AS dur, query FROM pg_stat_activity WHERE state='active' ORDER BY dur DESC LIMIT 5;"
```

### 4.3 ตรวจ Redis

```bash
# Memory usage
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" INFO memory

# Slowlog
docker compose exec redis redis-cli -a "$REDIS_PASSWORD" SLOWLOG GET 10
```

---

## 5. Rollback

### 5.1 Rollback ผ่าน image tag (ทำอัตโนมัติเมื่อ deploy fail)

```bash
docker tag est-website-app:previous est-website-app:current
docker compose up -d --force-recreate app
```

### 5.2 Rollback ผ่าน commit เก่า + DB backup

```bash
# Restore DB จาก backup ก่อน deploy ที่พัง
gunzip -c /var/backups/est-website/pre-deploy-<sha>-<ts>.sql.gz \
  | docker compose exec -T postgres psql -U est_admin -d est_website

# Reset code
git reset --hard <good-commit>
docker compose build app
docker compose up -d --force-recreate app
```

---

## 6. Disaster Recovery

| Failure | Recovery Steps |
|---|---|
| App crash | `docker compose restart app` |
| DB corruption | restore ล่าสุดจาก S3 (ดู §2.3) |
| Disk full | `docker system prune -af`, ลบ backups เก่า, scale droplet |
| SSL หมดอายุ | run cron ใน §2.1 ด้วยมือ |
| ทั้งเครื่องล่ม | สร้าง droplet ใหม่ → clone repo → คัดลอก .env → restore DB จาก S3 |

---

## 7. Security Checklist (ทำก่อนเปิดบริการจริง)

- [ ] `.env` ทุกค่าใช้ random secrets (ไม่ใช้ค่า example)
- [ ] `ufw` enable + เปิดเฉพาะ 22/80/443
- [ ] DB/Redis ports **ไม่** bind 0.0.0.0 (verify ด้วย §3.1)
- [ ] SSH key-only login (`PasswordAuthentication no` ใน sshd_config)
- [ ] SSL ติดตั้งและ HSTS preload เปิด
- [ ] Backup cron ทำงาน + ทดสอบ restore สำเร็จอย่างน้อย 1 ครั้ง
- [ ] Analytics purge cron ทำงาน (PDPA)
- [ ] Admin password mocking ไม่อยู่ใน .env (ลบ ADMIN_SEED_PASSWORD ออกหลัง first deploy)
