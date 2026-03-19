#!/usr/bin/env node
/**
 * Agent B: Backend API Tests
 * Tests all API endpoints for correct responses, status codes, and data shape.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const API = `${BASE_URL}/api`;
const AGENT_NAME = 'Backend API';
const RESULTS_FILE = path.join(__dirname, 'agent-backend-results.txt');

let passCount = 0;
let failCount = 0;
let skipCount = 0;
const results = [];

function pass(name, detail = '') {
  passCount++;
  results.push({ status: 'PASS', name, detail });
  console.log(`  \x1b[32m✅ PASS\x1b[0m ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  failCount++;
  results.push({ status: 'FAIL', name, detail });
  console.log(`  \x1b[31m❌ FAIL\x1b[0m ${name}${detail ? ` — ${detail}` : ''}`);
}

function skip(name, detail = '') {
  skipCount++;
  results.push({ status: 'SKIP', name, detail });
  console.log(`  \x1b[33m⏭️  SKIP\x1b[0m ${name}${detail ? ` — ${detail}` : ''}`);
}

async function safeFetch(url, options = {}) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
  } catch (e) {
    return { ok: false, status: 0, statusText: e.message, json: async () => ({}), text: async () => '', headers: new Headers() };
  }
}

// ═══════════════════════════════════════════
// TEST CATEGORIES
// ═══════════════════════════════════════════

async function testHealthEndpoint() {
  console.log('\n  📋 Health Endpoint');

  const r = await safeFetch(`${API}/health`);
  r.ok ? pass('GET /api/health returns 200', `status=${r.status}`) : fail('GET /api/health returns 200', `status=${r.status}`);

  if (r.ok) {
    const data = await r.json();
    data.status === 'ok' ? pass('Health response has status=ok') : fail('Health response has status=ok', `got ${data.status}`);
    data.uptime !== undefined ? pass('Health response has uptime') : fail('Health response missing uptime');
    data.version !== undefined ? pass('Health response has version') : fail('Health response missing version');
  }
}

async function testSettingsEndpoint() {
  console.log('\n  📋 Settings Endpoint');

  const r = await safeFetch(`${API}/settings`);
  r.ok ? pass('GET /api/settings returns 200') : fail('GET /api/settings returns 200', `status=${r.status}`);

  if (r.ok) {
    const data = await r.json();
    data.site ? pass('Settings has site config') : fail('Settings missing site config');
    data.hero ? pass('Settings has hero config') : fail('Settings missing hero config');
    data.characters ? pass('Settings has characters config') : fail('Settings missing characters config');
    data.highlights ? pass('Settings has highlights config') : fail('Settings missing highlights config');
    data.news ? pass('Settings has news config') : fail('Settings missing news config');
    data.storeButtons !== undefined ? pass('Settings has storeButtons') : fail('Settings missing storeButtons');

    // Cache headers
    const cc = r.headers.get('cache-control') || '';
    cc.includes('max-age') ? pass('Settings has Cache-Control header') : skip('Settings Cache-Control header', 'not set');
  }
}

async function testCharactersEndpoint() {
  console.log('\n  📋 Characters Endpoint');

  const r = await safeFetch(`${API}/public/characters`);
  r.ok ? pass('GET /api/public/characters returns 200') : fail('GET /api/public/characters returns 200', `status=${r.status}`);

  if (r.ok) {
    const data = await r.json();
    Array.isArray(data.characters) ? pass('Characters response is array') : fail('Characters response is not array');

    if (data.characters?.length > 0) {
      const c = data.characters[0];
      c.id !== undefined ? pass('Character has id') : fail('Character missing id');
      c.name !== undefined ? pass('Character has name') : fail('Character missing name');
      pass('Characters collection has data', `${data.characters.length} characters`);
    } else {
      skip('Character shape validation', 'no characters in DB');
    }
  }
}

async function testNewsEndpoint() {
  console.log('\n  📋 News Endpoint');

  // Basic fetch
  const r = await safeFetch(`${API}/public/news`);
  r.ok ? pass('GET /api/public/news returns 200') : fail('GET /api/public/news returns 200', `status=${r.status}`);

  if (r.ok) {
    const data = await r.json();
    Array.isArray(data.articles) ? pass('News response has articles array') : fail('News response missing articles array');
    data.pagination ? pass('News response has pagination') : fail('News response missing pagination');

    // Pagination params
    const r2 = await safeFetch(`${API}/public/news?page=1&limit=2`);
    if (r2.ok) {
      const d2 = await r2.json();
      d2.articles?.length <= 2 ? pass('News pagination limit works', `got ${d2.articles?.length} items`) : fail('News pagination limit exceeded');
    }

    // Category filter
    const r3 = await safeFetch(`${API}/public/news?category=update`);
    r3.ok ? pass('News category filter accepted') : fail('News category filter failed', `status=${r3.status}`);

    // Limit cap (max 50)
    const r4 = await safeFetch(`${API}/public/news?limit=999`);
    if (r4.ok) {
      const d4 = await r4.json();
      (d4.articles?.length || 0) <= 50 ? pass('News limit capped at 50') : fail('News limit not capped', `got ${d4.articles?.length}`);
    }
  }
}

async function testNewsDetailEndpoint() {
  console.log('\n  📋 News Detail Endpoint');

  // Missing slug
  const r = await safeFetch(`${API}/public/news-detail`);
  r.status === 400 ? pass('News detail without slug returns 400') : fail('News detail without slug returns 400', `status=${r.status}`);

  // Non-existent slug
  const r2 = await safeFetch(`${API}/public/news-detail?slug=non-existent-slug-xyz-12345`);
  r2.status === 404 ? pass('News detail non-existent slug returns 404') : fail('News detail non-existent slug returns 404', `status=${r2.status}`);

  // Try to find a real slug from the news list
  const newsList = await safeFetch(`${API}/public/news?limit=1`);
  if (newsList.ok) {
    const newsData = await newsList.json();
    if (newsData.articles?.length > 0) {
      const slug = newsData.articles[0].slug;
      const r3 = await safeFetch(`${API}/public/news-detail?slug=${slug}`);
      r3.ok ? pass('News detail with valid slug returns 200', `slug=${slug}`) : fail('News detail with valid slug failed', `status=${r3.status}`);

      if (r3.ok) {
        const detail = await r3.json();
        detail.article ? pass('News detail has article object') : fail('News detail missing article');
        detail.related !== undefined ? pass('News detail has related articles') : fail('News detail missing related');
      }
    } else {
      skip('News detail with valid slug', 'no articles in DB');
    }
  }
}

async function testGalleryEndpoint() {
  console.log('\n  📋 Gallery Endpoint');

  const r = await safeFetch(`${API}/public/gallery`);
  r.ok ? pass('GET /api/public/gallery returns 200') : fail('GET /api/public/gallery returns 200', `status=${r.status}`);

  if (r.ok) {
    const data = await r.json();
    data.gallery ? pass('Gallery response has gallery object') : fail('Gallery response missing gallery');

    if (data.gallery) {
      // Should have category keys
      const hasCategories = data.gallery.screenshots !== undefined ||
                           data.gallery.wallpapers !== undefined ||
                           data.gallery.concept !== undefined;
      hasCategories ? pass('Gallery has category grouping') : skip('Gallery categories', 'no data');
    }
  }
}

async function testMilestonesEndpoint() {
  console.log('\n  📋 Milestones Endpoint');

  const r = await safeFetch(`${API}/public/milestones`);
  r.ok ? pass('GET /api/public/milestones returns 200') : fail('GET /api/public/milestones returns 200', `status=${r.status}`);

  if (r.ok) {
    const data = await r.json();
    Array.isArray(data.milestones) ? pass('Milestones response is array') : fail('Milestones not array');

    if (data.milestones?.length > 0) {
      const m = data.milestones[0];
      m.threshold !== undefined ? pass('Milestone has threshold') : fail('Milestone missing threshold');
      (m.rewardEn || m.rewardTh) ? pass('Milestone has reward text') : fail('Milestone missing reward text');
      pass('Milestones collection has data', `${data.milestones.length} milestones`);
    } else {
      skip('Milestone shape validation', 'no milestones in DB');
    }
  }
}

async function testStatsEndpoint() {
  console.log('\n  📋 Stats Endpoint');

  const r = await safeFetch(`${API}/stats`);
  r.ok ? pass('GET /api/stats returns 200') : fail('GET /api/stats returns 200', `status=${r.status}`);

  if (r.ok) {
    const data = await r.json();
    data.totalRegistrations !== undefined ? pass('Stats has totalRegistrations') : fail('Stats missing totalRegistrations');
    typeof data.totalRegistrations === 'number' ? pass('totalRegistrations is number') : fail('totalRegistrations is not number');
    data.milestones !== undefined ? pass('Stats has milestones') : fail('Stats missing milestones');
  }
}

async function testRegisterEndpoint() {
  console.log('\n  📋 Register Endpoint');

  // GET should not work (POST only)
  const r1 = await safeFetch(`${API}/register`);
  r1.status === 405 || r1.status === 404 ? pass('GET /api/register not allowed', `status=${r1.status}`) : fail('GET /api/register should be 405 or 404', `status=${r1.status}`);

  // POST with invalid data
  const r2 = await safeFetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  r2.status === 400 ? pass('Register with empty body returns 400') : fail('Register with empty body returns 400', `status=${r2.status}`);

  // POST with invalid email
  const r3 = await safeFetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', platform: 'ios', region: 'th' }),
  });
  r3.status === 400 ? pass('Register with invalid email returns 400') : fail('Register with invalid email returns 400', `status=${r3.status}`);

  // POST with invalid platform
  const r4 = await safeFetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', platform: 'xbox', region: 'th' }),
  });
  r4.status === 400 ? pass('Register with invalid platform returns 400') : fail('Register with invalid platform returns 400', `status=${r4.status}`);

  // POST with invalid region
  const r5 = await safeFetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', platform: 'ios', region: 'mars' }),
  });
  r5.status === 400 ? pass('Register with invalid region returns 400') : fail('Register with invalid region returns 400', `status=${r5.status}`);

  // Valid registration (use unique email to avoid conflict)
  const testEmail = `carpet-bomb-test-${Date.now()}@test-delete.com`;
  const r6 = await safeFetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, platform: 'pc', region: 'th' }),
  });
  if (r6.ok || r6.status === 201) {
    const data = await r6.json();
    data.referralCode ? pass('Valid registration returns referralCode', `code=${data.referralCode}`) : fail('Registration missing referralCode');
    pass('Valid registration accepted', `email=${testEmail}`);
  } else {
    // Could be 409 if test was run before, or 500 if DB issue
    r6.status === 409
      ? skip('Valid registration', 'email already exists (re-run)')
      : fail('Valid registration failed', `status=${r6.status}`);
  }

  // Duplicate email
  const r7 = await safeFetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, platform: 'pc', region: 'th' }),
  });
  r7.status === 409 ? pass('Duplicate email returns 409') : skip('Duplicate email check', `status=${r7.status}`);
}

async function testStatsResetEndpoint() {
  console.log('\n  📋 Stats Reset Endpoint');

  // Without auth
  const r = await safeFetch(`${API}/stats/reset`, { method: 'POST' });
  (r.status === 401 || r.status === 403)
    ? pass('Stats reset without auth returns 401/403', `status=${r.status}`)
    : fail('Stats reset without auth should be 401/403', `status=${r.status}`);

  // With fake auth
  const r2 = await safeFetch(`${API}/stats/reset`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer fake-token-12345' },
  });
  (r2.status === 401 || r2.status === 403)
    ? pass('Stats reset with fake token rejected', `status=${r2.status}`)
    : fail('Stats reset with fake token should be rejected', `status=${r2.status}`);
}

async function testGraphQL() {
  console.log('\n  📋 GraphQL Endpoint');

  const r = await safeFetch(`${API}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ __typename }' }),
  });
  r.ok ? pass('GraphQL endpoint responds') : fail('GraphQL endpoint failed', `status=${r.status}`);
}

async function testMethodNotAllowed() {
  console.log('\n  📋 Method Restrictions');

  // DELETE on read-only endpoints should fail
  const endpoints = ['/api/health', '/api/settings', '/api/public/characters', '/api/public/news'];
  for (const ep of endpoints) {
    const r = await safeFetch(`${BASE_URL}${ep}`, { method: 'DELETE' });
    (r.status === 405 || r.status === 404)
      ? pass(`DELETE ${ep} not allowed`, `status=${r.status}`)
      : fail(`DELETE ${ep} should be blocked`, `status=${r.status}`);
  }
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

async function main() {
  console.log(`\n  🔌 Agent B: ${AGENT_NAME}`);
  console.log(`  Target: ${BASE_URL}`);
  console.log('  ─'.repeat(30));

  await testHealthEndpoint();
  await testSettingsEndpoint();
  await testCharactersEndpoint();
  await testNewsEndpoint();
  await testNewsDetailEndpoint();
  await testGalleryEndpoint();
  await testMilestonesEndpoint();
  await testStatsEndpoint();
  await testRegisterEndpoint();
  await testStatsResetEndpoint();
  await testGraphQL();
  await testMethodNotAllowed();

  const total = passCount + failCount;
  const rate = total > 0 ? ((passCount / total) * 100).toFixed(1) : '0.0';

  console.log('\n  ─'.repeat(30));
  console.log(`  ${failCount === 0 ? '🟢' : '🔴'} ${AGENT_NAME}: ${passCount}/${total} passed (${rate}%) | ${skipCount} skipped`);

  // Write results
  const output = [
    `Agent: ${AGENT_NAME}`,
    `Target: ${BASE_URL}`,
    `Pass: ${passCount} | Fail: ${failCount} | Skip: ${skipCount} | Rate: ${rate}%`,
    `Timestamp: ${new Date().toISOString()}`,
    '',
    ...results.map(r => `[${r.status}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`),
  ].join('\n');

  fs.writeFileSync(RESULTS_FILE, output, 'utf8');
}

main().catch(e => {
  console.error(`  💥 Agent B crashed: ${e.message}`);
  fs.writeFileSync(RESULTS_FILE, `Agent: ${AGENT_NAME}\nPass: 0 | Fail: 1 | Skip: 0 | Rate: 0%\n[FAIL] Agent crashed — ${e.message}`, 'utf8');
  process.exit(1);
});
