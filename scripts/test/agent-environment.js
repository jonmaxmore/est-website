#!/usr/bin/env node
/**
 * Agent E: Environment & Config Audit
 * Validates server configuration, environment setup, and deployment readiness.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const API = `${BASE_URL}/api`;
const AGENT_NAME = 'Environment Audit';
const RESULTS_FILE = path.join(__dirname, 'agent-environment-results.txt');

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
    return { ok: false, status: 0, json: async () => ({}), text: async () => '', headers: new Headers() };
  }
}

// ═══════════════════════════════════════════
// ENVIRONMENT TESTS
// ═══════════════════════════════════════════

async function testServerHealth() {
  console.log('\n  📋 Server Health');

  const r = await safeFetch(`${API}/health`);
  if (!r.ok) { fail('Health endpoint unreachable'); return; }

  const data = await r.json();

  data.status === 'ok' ? pass('Server status: ok') : fail('Server status not ok', data.status);
  data.environment ? pass(`Environment: ${data.environment}`) : skip('Environment not reported');
  data.version ? pass(`Version: ${data.version}`) : skip('Version not reported');
  typeof data.uptime === 'number' ? pass(`Uptime: ${Math.round(data.uptime)}s`) : skip('Uptime not reported');
}

async function testDatabaseConnection() {
  console.log('\n  📋 Database Connection');

  // If health endpoint includes DB status, use it
  const r = await safeFetch(`${API}/health`);
  if (r.ok) {
    const data = await r.json();
    if (data.database) {
      data.database === 'connected' ? pass('Database connected') : fail('Database not connected', data.database);
    } else {
      // Try to infer from data endpoints
      const charR = await safeFetch(`${API}/public/characters`);
      charR.ok ? pass('Database reachable (characters API works)') : fail('Database may be down (characters API failed)');
    }
  } else {
    fail('Cannot verify DB connection (health endpoint down)');
  }

  // Test write path via stats
  const statsR = await safeFetch(`${API}/stats`);
  statsR.ok ? pass('Database read path works (stats)') : fail('Database read path broken (stats)');
}

async function testCMSAdmin() {
  console.log('\n  📋 CMS Admin Panel');

  const r = await safeFetch(`${BASE_URL}/admin`, { redirect: 'manual' });
  (r.ok || r.status === 302 || r.status === 307)
    ? pass('CMS admin panel accessible', `status=${r.status}`)
    : fail('CMS admin panel broken', `status=${r.status}`);

  // GraphQL endpoint
  const gql = await safeFetch(`${API}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ __typename }' }),
  });
  gql.ok ? pass('GraphQL endpoint operational') : fail('GraphQL endpoint down', `status=${gql.status}`);
}

async function testGlobalsConfigured() {
  console.log('\n  📋 Globals Configuration');

  const r = await safeFetch(`${API}/settings`);
  if (!r.ok) { fail('Settings endpoint unreachable'); return; }

  const data = await r.json();

  // Site settings
  data.site?.name ? pass(`Site name configured: "${data.site.name}"`) : fail('Site name not set');
  data.site?.description ? pass('Site description set') : skip('Site description empty');
  data.site?.logo ? pass('Site logo configured') : skip('Site logo not set');

  // Social links
  const socials = data.site?.socialLinks || {};
  const socialCount = Object.values(socials).filter(Boolean).length;
  socialCount > 0 ? pass(`${socialCount} social links configured`) : skip('No social links configured');

  // Footer
  data.site?.footer?.copyrightText ? pass('Footer copyright set') : skip('Footer copyright not set');
  data.site?.footer?.termsUrl ? pass('Terms URL configured') : skip('Terms URL not set');
  data.site?.footer?.privacyUrl ? pass('Privacy URL configured') : skip('Privacy URL not set');

  // Hero section
  data.hero?.taglineEn ? pass(`Hero tagline: "${data.hero.taglineEn}"`) : skip('Hero tagline not set');
  data.hero?.ctaTextEn ? pass('Hero CTA configured') : skip('Hero CTA not set');
  data.hero?.backgroundImage ? pass('Hero background image set') : skip('Hero background not set');

  // Event config
  if (data.event) {
    pass(`Event enabled: ${data.event.enabled}`);
  } else {
    skip('Event config not loaded');
  }

  // Characters section
  data.characters ? pass('Characters section config loaded') : skip('Characters section config missing');

  // Store buttons
  if (Array.isArray(data.storeButtons)) {
    data.storeButtons.length > 0
      ? pass(`${data.storeButtons.length} store buttons configured`)
      : skip('No store buttons configured');
  }
}

async function testCollectionCounts() {
  console.log('\n  📋 Collection Data Counts');

  const endpoints = [
    { path: '/api/public/characters', key: 'characters', name: 'Characters' },
    { path: '/api/public/news?limit=50', key: 'articles', name: 'News Articles' },
    { path: '/api/public/milestones', key: 'milestones', name: 'Milestones' },
  ];

  for (const ep of endpoints) {
    const r = await safeFetch(`${BASE_URL}${ep.path}`);
    if (r.ok) {
      const data = await r.json();
      const items = data[ep.key] || [];
      items.length > 0
        ? pass(`${ep.name}: ${items.length} items`)
        : skip(`${ep.name}: empty collection`);
    } else {
      fail(`${ep.name} endpoint unreachable`);
    }
  }
}

async function testI18nSupport() {
  console.log('\n  📋 i18n (Bilingual) Support');

  // Check if settings have both TH and EN fields
  const r = await safeFetch(`${API}/settings`);
  if (!r.ok) { skip('i18n check', 'settings unavailable'); return; }

  const data = await r.json();

  // Hero bilingual
  if (data.hero) {
    (data.hero.taglineEn && data.hero.taglineTh)
      ? pass('Hero tagline bilingual (EN + TH)')
      : skip('Hero tagline not fully bilingual');
    (data.hero.ctaTextEn && data.hero.ctaTextTh)
      ? pass('Hero CTA bilingual')
      : skip('Hero CTA not fully bilingual');
  }

  // News bilingual
  const newsR = await safeFetch(`${API}/public/news?limit=1`);
  if (newsR.ok) {
    const newsData = await newsR.json();
    if (newsData.articles?.length > 0) {
      const a = newsData.articles[0];
      (a.titleEn && a.titleTh)
        ? pass('News articles bilingual')
        : skip('News article not fully bilingual');
    }
  }
}

async function testHTTPSReadiness() {
  console.log('\n  📋 HTTPS Readiness');

  const r = await safeFetch(BASE_URL);
  if (!r.ok) { fail('Site unreachable for HTTPS checks'); return; }

  // HSTS header
  const hsts = r.headers.get('strict-transport-security');
  if (BASE_URL.startsWith('https://')) {
    hsts
      ? pass('HSTS enabled', hsts)
      : fail('HSTS not set on HTTPS');
  } else {
    hsts
      ? pass('HSTS configured (will apply in production)')
      : skip('HSTS not set', 'expected on localhost');
  }

  // Check for mixed content in homepage HTML
  const html = await (await fetch(BASE_URL)).text();
  const httpRefs = html.match(/http:\/\/(?!localhost)/g) || [];
  httpRefs.length === 0
    ? pass('No mixed content (http://) references')
    : fail(`Mixed content detected: ${httpRefs.length} http:// references`);
}

async function testSEOReadiness() {
  console.log('\n  📋 SEO Readiness');

  const r = await safeFetch(BASE_URL);
  if (!r.ok) { fail('Homepage unreachable for SEO checks'); return; }

  const html = await (await fetch(BASE_URL)).text();

  // Robots
  const robotsR = await safeFetch(`${BASE_URL}/robots.txt`);
  robotsR.ok ? pass('robots.txt accessible') : skip('robots.txt not found');

  // Sitemap
  const sitemapR = await safeFetch(`${BASE_URL}/sitemap.xml`);
  sitemapR.ok ? pass('sitemap.xml accessible') : skip('sitemap.xml not found');

  // Canonical
  html.includes('canonical') ? pass('Canonical link present') : skip('No canonical link');

  // JSON-LD
  html.includes('application/ld+json') ? pass('JSON-LD structured data present') : fail('Missing JSON-LD structured data');

  // Heading hierarchy
  html.includes('<h1') ? pass('Page has <h1> tag') : fail('Missing <h1> tag');
}

async function testAnalyticsSetup() {
  console.log('\n  📋 Analytics');

  const r = await safeFetch(BASE_URL);
  if (!r.ok) { skip('Analytics check', 'homepage unreachable'); return; }

  const html = await (await fetch(BASE_URL)).text();

  // Google Analytics
  (html.includes('gtag') || html.includes('GA4') || html.includes('googletagmanager'))
    ? pass('Google Analytics/GTM detected')
    : skip('No Google Analytics detected');

  // Meta Pixel
  html.includes('fbq') || html.includes('facebook')
    ? pass('Meta Pixel detected')
    : skip('No Meta Pixel detected');
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

async function main() {
  console.log(`\n  🔍 Agent E: ${AGENT_NAME}`);
  console.log(`  Target: ${BASE_URL}`);
  console.log('  ─'.repeat(30));

  await testServerHealth();
  await testDatabaseConnection();
  await testCMSAdmin();
  await testGlobalsConfigured();
  await testCollectionCounts();
  await testI18nSupport();
  await testHTTPSReadiness();
  await testSEOReadiness();
  await testAnalyticsSetup();

  const total = passCount + failCount;
  const rate = total > 0 ? ((passCount / total) * 100).toFixed(1) : '0.0';

  console.log('\n  ─'.repeat(30));
  console.log(`  ${failCount === 0 ? '🟢' : '🔴'} ${AGENT_NAME}: ${passCount}/${total} passed (${rate}%) | ${skipCount} skipped`);

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
  console.error(`  💥 Agent E crashed: ${e.message}`);
  fs.writeFileSync(RESULTS_FILE, `Agent: ${AGENT_NAME}\nPass: 0 | Fail: 1 | Skip: 0 | Rate: 0%\n[FAIL] Agent crashed — ${e.message}`, 'utf8');
  process.exit(1);
});
