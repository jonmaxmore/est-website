---
description: Deploy latest changes to the production server (178.128.127.161)
---

# Deploy to Production

// turbo-all

## Prerequisites
- SSH access to `root@178.128.127.161`
- Docker and Docker Compose installed on server
- Changes committed and pushed to `main` branch on GitHub

## Steps

1. SSH into the production server:
```bash
ssh root@178.128.127.161
```

2. Navigate to the project directory:
```bash
cd /var/www/est-website
```

3. Pull latest changes:
```bash
git pull origin main
```

4. Build and restart containers:
```bash
docker compose up -d --build
```

5. Verify the deployment:
```bash
docker compose ps
curl -s http://localhost | head -20
```

6. Seed database (first time only):
```bash
curl -s -X POST http://localhost/api/seed
```

## Quick One-Liner (after SSH)
```bash
cd /var/www/est-website && git pull origin main && docker compose up -d --build && docker compose ps
```

## Useful Commands
```bash
# View logs
docker compose logs app --tail 50 -f

# Restart a service
docker compose restart app

# Full rebuild (no cache)
docker compose build --no-cache && docker compose up -d

# Access PostgreSQL
docker compose exec db psql -U est -d est_db
```
