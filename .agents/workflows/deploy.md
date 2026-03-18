---
description: Deploy latest changes to the production server (178.128.127.161)
---

# Deploy to Production

// turbo-all

## Prerequisites
- SSH access to `root@178.128.127.161`
- Changes committed and pushed to `main` branch on GitHub

## Steps

1. SSH into the production server:
```bash
ssh root@178.128.127.161
```
Password: `wErew@lf17john`

2. Navigate to the project directory:
```bash
cd /root/est-website
```

3. Pull latest changes:
```bash
git pull origin main
```

4. Install dependencies:
```bash
npm install --legacy-peer-deps
```

5. Build the project:
```bash
npm run build
```

6. Restart the application:
```bash
pm2 restart all
```

7. Verify the deployment:
```bash
pm2 status
curl -s http://localhost:3000 | head -20
```

## Quick One-Liner (after SSH)
```bash
cd /root/est-website && git pull origin main && npm install --legacy-peer-deps && npm run build && pm2 restart all && pm2 status
```
