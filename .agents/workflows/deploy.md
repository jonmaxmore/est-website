---
description: Deploy latest changes to the production server (178.128.127.161)
---

# Deploy to Production

// turbo-all

## One Best Way — Single Command Deploy

1. SSH into server and run the deploy script:
```bash
ssh root@178.128.127.161 "bash /var/www/est-website/deploy.sh"
```

> This single script handles everything: Docker cleanup → Git pull → Build → Health check → Verify

## Manual Deploy (step-by-step)

If the script fails, run each step manually:

1. SSH into the production server:
```bash
ssh root@178.128.127.161
```

2. Clean Docker to free disk space:
```bash
docker system prune -af
```

3. Pull latest code:
```bash
cd /var/www/est-website && git pull origin main
```

4. Build and restart containers:
```bash
docker compose up -d --build
```

5. Verify the deployment:
```bash
docker compose ps
curl -s http://localhost/api/health | python3 -m json.tool
```

## First-Time Setup

```bash
# Clone the repo
git clone https://github.com/jonmaxmore/est-website.git /var/www/est-website
cd /var/www/est-website

# Copy and edit environment variables
cp .env.example .env
nano .env  # Fill in PAYLOAD_SECRET, DATABASE_URI, NEXT_PUBLIC_SITE_URL

# Deploy
bash deploy.sh
```

## Useful Commands

```bash
# View app logs
docker compose logs app --tail 50 -f

# Restart app only
docker compose restart app

# Full rebuild (no cache)
docker compose build --no-cache && docker compose up -d

# Access database
docker compose exec db psql -U est -d est_db

# Check disk usage (common bottleneck on small droplets)
df -h && docker system df
```
