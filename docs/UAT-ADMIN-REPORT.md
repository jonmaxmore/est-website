# UAT Admin Report — 3 Employee Personas

รัน: 2026-04-30 / target: production
Spec: [e2e/uat/admin-personas.spec.ts](e2e/uat/admin-personas.spec.ts)
Total screenshots: **47** ที่ [test-results/uat-admin-personas/](test-results/uat-admin-personas/)

---

## 👤 Persona A — Content Editor (Junior, ระมัดระวัง)

**โปรไฟล์:** บรรณาธิการเนื้อหา ใช้งานอย่างละเอียด อ่านทุกหน้า

**Workflow:**
- คลิก sidebar ทีละ link 24 หน้า admin (อ่านละเอียด, pause 400ms ต่อหน้า)
- เปิดหน้า /admin/news → filter dropdown
- เปิดหน้า /admin/topics → คลิก edit pencil → ดู modal → กด ESC ปิด
- Hover sidebar items (ดู tooltip)

**Stats:**
- **24 admin pages** ทั้งหมด
- 26 screenshots
- **24.1 วินาที**
- ✅ **Zero errors**

---

## 👤 Persona B — Marketing Manager (Power User, เร็ว)

**โปรไฟล์:** ผู้จัดการการตลาด ใช้ shortcuts + วิเคราะห์ KPI เร็ว

**Workflow:**
- เปิด `Cmd+K` command palette → พิมพ์ "news" → ESC ปิด
- /admin/analytics — ดู KPI cards (page views, today, registrations, downloads, social)
- /admin/banners — list view
- /admin/events — list view
- /admin/registrations — เห็น export button (hover, ไม่กดจริง)
- /admin/homepage — section builder
- เปิดหน้าเร็วๆ: highlights, features, weapons, milestones, media, news, pages, topics

**Stats:**
- Cmd+K palette + 8 priority pages + 8 fast-tour
- 7 screenshots
- **16.9 วินาที** (เร็วที่สุด)
- ✅ **Zero errors**

---

## 👤 Persona C — Site Admin / SuperAdmin (System + RBAC)

**โปรไฟล์:** ผู้ดูแลระบบ มุมมอง ops + security

**Workflow:**
- 8 system pages: users, integrations, activity, backup, settings, seo, menus, appearance
- /admin/activity — verify activity log มี LOGIN entries (ผ่าน API)
- **RBAC check #1**: ตรวจ `/api/admin/stats` ด้วย admin cookie → ต้อง 200
- **RBAC check #2**: ตรวจ `/api/admin/stats` **ไม่มี cookie** → ต้อง 401 (auth ทำงาน)
- /admin/backup — verify export controls present
- /admin/seo — verify canonical URL + meta fields
- /admin/users — verify user list ≥1 row
- /admin/integrations — webhook secret field
- Logout (best-effort)

**Stats:**
- 8 system pages + 4 deeper checks
- 14 screenshots
- **23.1 วินาที**
- ✅ **Zero errors** (RBAC 401 verified, activity log ≥1)

---

## 📊 Total Stats

| Metric | Value |
|---|---|
| Personas | **3** |
| Total admin pages visited | 24 + 16 + 12 = **52 visits** |
| Critical errors | **0** |
| Warnings | **0** (after fixes) |
| Screenshots | **47** |
| Total time | 64.4s (1m 4s) |

---

## 🛡️ RBAC Verification (Persona C)

| Check | Expected | Actual | Pass |
|---|---|---|---|
| Authenticated `GET /api/admin/stats` | 200 | 200 | ✅ |
| Unauthenticated `GET /api/admin/stats` | 401 | 401 | ✅ |
| Activity log captures LOGIN | ≥1 entry | ≥1 entry | ✅ |
| Users list visible to SuperAdmin | ≥1 row | populated | ✅ |

---

## 🎯 Coverage Matrix — Admin Tools

| Section | Persona A | Persona B | Persona C |
|---|---|---|---|
| Dashboard / | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ deep | — |
| Homepage builder | ✅ | ✅ | — |
| News | ✅ filter | ✅ | — |
| Topics | ✅ editor | ✅ | — |
| Banners | ✅ | ✅ | — |
| Weapons / Features / Highlights | ✅ | ✅ | — |
| Events / Milestones / Download / FAQ / Pages / Media | ✅ | ✅ | — |
| Registrations | ✅ | ✅ export | — |
| Menus / Appearance | ✅ | — | ✅ |
| SEO | ✅ | — | ✅ |
| Users | ✅ | — | ✅ verify |
| Integrations | ✅ | — | ✅ webhook |
| Activity Log | ✅ | — | ✅ + API |
| Backup | ✅ | — | ✅ |
| Settings | ✅ | — | ✅ |
| **Cmd+K palette** | — | ✅ tested | — |
| **RBAC 401 check** | — | — | ✅ tested |

ทุกหน้าถูกครอบคลุม โดยอย่างน้อย 1 persona แต่ละ persona ทดสอบ feature ต่างกัน

---

## ✅ Verdict: PASSED

ระบบ Admin Tools รองรับทั้ง 3 รูปแบบการใช้งาน (cautious/fast/system-ops) ครบทุก 24 หน้า — ไม่มี critical errors, RBAC ทำงานถูกต้อง, Activity log capture LOGIN events ถูกต้อง, Cmd+K palette ทำงาน

---

## 🚀 Run UAT Admin Locally / On Production

```bash
# Production
BASE_URL=http://178.128.127.161 \
  UAT_ADMIN_EMAIL='admin@eternaltowersaga.com' \
  UAT_ADMIN_PASSWORD='EstAdminP0vWfjw7yY17!' \
  npx playwright test e2e/uat/admin-personas.spec.ts --project='Desktop Chrome'

# Local dev
BASE_URL=http://localhost:3000 \
  UAT_ADMIN_EMAIL='admin@example.com' \
  UAT_ADMIN_PASSWORD='your-dev-password' \
  npx playwright test e2e/uat/admin-personas.spec.ts

# Specific persona
... -g "Persona A"   # Editor
... -g "Persona B"   # Marketing
... -g "Persona C"   # SuperAdmin

# View screenshots
ls test-results/uat-admin-personas/
```

## 📅 Auto-runs in CI

[`.github/workflows/uat.yml`](.github/workflows/uat.yml) runs **both** suites:
- Public UAT (3 personas, 51 page visits)
- Admin UAT (3 personas, 52 admin visits) — *added this sprint*

**Triggers:**
- Manual dispatch
- Daily 06:00 UTC
- After Production Deploy succeeds

Update workflow to include both:
```yaml
- run: |
    npx playwright test \
      e2e/smoke/production.spec.ts \
      e2e/uat/personas.spec.ts \
      e2e/uat/admin-personas.spec.ts \
      --project='Desktop Chrome'
```
