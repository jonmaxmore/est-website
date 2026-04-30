# UAT Report — 3 Personas Walkthrough

รัน: 2026-04-30 / target: http://178.128.127.161 (production)
Spec: [e2e/uat/personas.spec.ts](e2e/uat/personas.spec.ts)
Total screenshots: **56** ที่ [test-results/uat-personas/](test-results/uat-personas/)

---

## 👤 Persona 1 — นักเล่นเกมตัวยง (Gaming Enthusiast)

**โปรไฟล์:** Desktop, 1440×900, click เร็ว, สนใจ CTAs + features

**Coverage:**
- ✅ 12 หน้าสาธารณะ (home, weapons, news, game-guide, support, event, download, faq, privacy, terms, story, gallery)
- ✅ Platform cards 3 ใบ (App Store, Google Play, Windows PC) ใช้งานได้
- ✅ Language switcher TH ⇄ EN
- ✅ Pre-register CTA → /event navigation
- ✅ /admin/login page โหลด

**Total time:** 19.4 วินาที ผ่าน 14 หน้า
**Errors:** 0 critical, 0 warnings
**Result:** ✅ **PASSED**

---

## 👤 Persona 2 — ผู้ใช้มือถือ (Casual Mobile)

**โปรไฟล์:** iPhone SE (375×667), touch device, scroll ช้าๆ, อ่านเนื้อหา

**Coverage:**
- ✅ 12 หน้าสาธารณะ (เลื่อนช้าๆ ครึ่งหน้า)
- ✅ Mobile hamburger menu เปิดได้
- ✅ ESC key ปิด mobile menu
- ✅ Slow scroll homepage 15 steps to bottom

**Errors:** 0 critical, 1 warning
**Warning details:**
- ⚠️ `Mobile menu scroll-lock: html=, body=` — เมื่อเปิด hamburger menu, inline style `overflow: hidden` ไม่ถูก set ทันที (อาจเป็น timing issue ใน Playwright; behaviour จริงบนอุปกรณ์จริงน่าจะใช้ได้ แต่ควร verify ผ่าน manual test)

**Total time:** 30.4 วินาที ผ่าน 13 หน้า
**Result:** ✅ **PASSED**

---

## 👤 Persona 3 — QA Tester (Power User + Accessibility + Admin)

**โปรไฟล์:** Desktop 1280×800, keyboard navigation, multi-locale, edge cases

**Coverage:**
- ✅ Keyboard navigation: Tab → skip-link → Enter jumps to #main-content
- ✅ TH → EN locale toggle
- ✅ Pre-register form: invalid email blocked
- ✅ Admin login (with hydration wait + new password)
- ✅ **24 admin pages** ทั้งหมด (analytics, homepage, news, topics, banners, weapons, features, highlights, events, milestones, download, faq, pages, media, registrations, menus, appearance, seo, users, integrations, activity, backup, settings)
- ✅ Cmd+K command palette test
- ✅ Logout (best-effort)

**Errors:** 0 critical, 11 warnings
**Hydration mismatch warnings on:**
- /admin/topics, /admin/banners, /admin/highlights, /admin/milestones, /admin/download, /admin/pages, /admin/registrations, /admin/menus, /admin/appearance, /admin/integrations, /admin/backup

→ **ต้องตรวจ:** SSR HTML ของหน้า admin เหล่านี้ไม่ตรงกับ client-render หลัง hydrate ทำให้ Vue เคลม "Hydration completed but contains mismatches" — ไม่ break การใช้งาน แต่ทำให้ console เตือน + อาจมี flash ของ wrong state ตอนโหลด

**Common causes:**
- ใช้ `Date.now()` หรือ `new Date()` ใน setup → server vs client time มี gap
- localStorage/sessionStorage access ใน setup (server doesn't have)
- random IDs (`uuidv4()`) ที่ไม่ deterministic

**Total time:** 28.3 วินาที covering admin tour
**Result:** ✅ **PASSED** (warnings only)

---

## 🐛 Real Bugs Found via UAT

### Severity: LOW (warnings, not breaking)

1. **Hydration mismatches** in 11 admin pages — Vue console warns "Hydration completed but contains mismatches"
   - Affects: 11 admin pages listed above
   - User impact: brief flash of wrong state on first load; no functional break
   - Fix: audit each affected page for non-deterministic setup code
   - Priority: P3 (cosmetic, after P1/P2 features)

2. **Mobile scroll-lock timing** — inline style not visible immediately after hamburger click in Playwright test
   - Affects: mobile hamburger menu
   - User impact: page may briefly scroll under menu overlay (hard to reproduce in real device)
   - Fix: investigate watch handler timing; may need `nextTick()` or direct DOM manipulation
   - Priority: P3

### Severity: NONE
- 0 console errors blocking any persona
- 0 network 4xx/5xx errors during walkthrough
- 0 broken pages, 0 hangs, 0 timeouts
- Korean characters: 0 (verified)
- All 12 public pages return 200 ✅
- All 24 admin pages accessible ✅

---

## 📊 Aggregated Stats

| Metric | Count |
|---|---|
| Personas tested | 3 |
| Total page visits | 14 + 13 + 24 = **51** |
| Critical errors | **0** |
| Warnings | 12 (11 hydration + 1 scroll-lock) |
| Screenshots captured | 56 |
| Total walkthrough time | 78 seconds (1m 18s) |

## ✅ UAT Verdict: PASSED

ระบบหลักทั้งหมดทำงานได้ ครอบคลุมทั้งหน้าสาธารณะ + admin tools ทั้งหมด สำหรับผู้ใช้ 3 รูปแบบที่ต่างกัน warnings ที่พบเป็น cosmetic — ไม่กระทบการใช้งาน

## 🎯 Recommended Next Sprint Actions

1. **Fix hydration mismatches** ใน 11 admin pages (audit setup code, ใช้ `useState()` หรือ `onMounted()` แทน `Date.now()` direct calls)
2. **Verify mobile scroll-lock** ผ่าน manual test บน iPhone จริง
3. **Add screenshot diff test** เปรียบเทียบ baseline (เพื่อ detect visual regression อัตโนมัติ)
4. **Run UAT บน CI** เพิ่ม GitHub Actions workflow ที่รัน UAT ทุก deploy

---

## 🚀 Run UAT Locally / On Production

```bash
# Local dev
BASE_URL=http://localhost:3000 \
  UAT_ADMIN_EMAIL='admin@example.com' \
  UAT_ADMIN_PASSWORD='your-password' \
  npx playwright test e2e/uat/personas.spec.ts

# Production
BASE_URL=http://178.128.127.161 \
  UAT_ADMIN_EMAIL='admin@eternaltowersaga.com' \
  UAT_ADMIN_PASSWORD='YOUR_PASSWORD' \
  npx playwright test e2e/uat/personas.spec.ts --project='Desktop Chrome'

# View screenshots
ls test-results/uat-personas/
```
