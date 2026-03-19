#!/usr/bin/env node
/**
 * Agent F: Frontend Page Tests
 * Tests all page routes for correct HTTP status, HTML response, and critical content.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const AGENT_NAME = 'Frontend Pages';
const RESULTS_FILE = path.join(__dirname, 'agent-frontend-results.txt');

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
    return await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  } catch (e) {
    return { ok: false, status: 0, statusText: e.message, text: async () => '', headers: new Headers() };
  }
}

// ═══════════════════════════════════════════
// PAGE ROUTES
// ═══════════════════════════════════════════

const PAGES = [
  { path: '/', name: 'Homepage', mustContain: ['Eternal Tower Saga'] },
  { path: '/character', name: 'Character Page', mustContain: ['character', 'Characters'] },
  { path: '/news', name: 'News Page', mustContain: [] },
  { path: '/gallery', name: 'Gallery Page', mustContain: [] },
  { path: '/event', name: 'Event Page', mustContain: [] },
  { path: '/story', name: 'Story Page', mustContain: [] },
  { path: '/game-guide', name: 'Game Guide Page', mustContain: [] },
  { path: '/download', name: 'Download Page', mustContain: [] },
  { path: '/faq', name: 'FAQ Page', mustContain: ['FAQ'] },
  { path: '/privacy', name: 'Privacy Policy', mustContain: [] },
  { path: '/terms', name: 'Terms of Service', mustContain: [] },
  { path: '/support', name: 'Support Page', mustContain: [] },
];

async function testPageLoads() {
  console.log('\n  📋 Page Load Tests');

  for (const page of PAGES) {
    const url = `${BASE_URL}${page.path}`;
    const r = await safeFetch(url);

    if (r.ok) {
      pass(`${page.name} (${page.path}) returns 200`);

      const html = await r.text();

      // Check it's actually HTML
      html.includes('<!DOCTYPE html>') || html.includes('<html')
        ? pass(`${page.name} returns HTML`)
        : fail(`${page.name} not HTML`, 'missing DOCTYPE or html tag');

      // Check must-contain strings (case-insensitive)
      for (const str of page.mustContain) {
        html.toLowerCase().includes(str.toLowerCase())
          ? pass(`${page.name} contains "${str}"`)
          : fail(`${page.name} missing "${str}"`);
      }
    } else {
      fail(`${page.name} (${page.path}) returns 200`, `status=${r.status}`);
    }
  }
}

async function test404Page() {
  console.log('\n  📋 404 Handling');

  const r = await safeFetch(`${BASE_URL}/this-page-does-not-exist-xyz`);
  r.status === 404
    ? pass('Non-existent page returns 404')
    : fail('Non-existent page should return 404', `status=${r.status}`);

  if (r.status === 404) {
    const html = await r.text();
    html.length > 100
      ? pass('404 page has custom content')
      : fail('404 page has no content');
  }
}

async function testAdminRoute() {
  console.log('\n  📋 Admin CMS');

  const r = await safeFetch(`${BASE_URL}/admin`);
  // Admin might redirect (302/307) or show login page (200)
  (r.ok || r.status === 302 || r.status === 307)
    ? pass('Admin route accessible', `status=${r.status}`)
    : fail('Admin route broken', `status=${r.status}`);
}

async function testMetaTags() {
  console.log('\n  📋 Meta Tags & SEO');

  const r = await safeFetch(BASE_URL);
  if (!r.ok) { fail('Homepage not reachable for meta tests'); return; }

  const html = await r.text();

  // Essential meta tags
  html.includes('<title') ? pass('Has <title> tag') : fail('Missing <title> tag');
  html.includes('og:title') ? pass('Has og:title meta') : fail('Missing og:title');
  html.includes('og:description') ? pass('Has og:description meta') : fail('Missing og:description');
  html.includes('og:type') ? pass('Has og:type meta') : fail('Missing og:type');
  html.includes('twitter:card') ? pass('Has twitter:card meta') : fail('Missing twitter:card');
  html.includes('viewport') ? pass('Has viewport meta') : fail('Missing viewport meta');

  // JSON-LD structured data
  html.includes('application/ld+json') ? pass('Has JSON-LD structured data') : fail('Missing JSON-LD');

  // Favicon
  html.includes('icon') ? pass('Has favicon reference') : fail('Missing favicon');

  // Language
  html.includes('lang=') ? pass('HTML has lang attribute') : fail('Missing lang attribute');
}

async function testFonts() {
  console.log('\n  📋 Font Loading');

  const r = await safeFetch(BASE_URL);
  if (!r.ok) { fail('Homepage not reachable for font tests'); return; }

  const html = await r.text();

  // Next.js font optimization
  (html.includes('font') || html.includes('Outfit') || html.includes('Noto'))
    ? pass('Font references found in HTML')
    : fail('No font references found');
}

async function testCriticalAssets() {
  console.log('\n  📋 Critical Assets');

  const r = await safeFetch(BASE_URL);
  if (!r.ok) { fail('Homepage not reachable'); return; }

  const html = await r.text();

  // CSS loaded
  (html.includes('.css') || html.includes('<style'))
    ? pass('CSS references found')
    : fail('No CSS references');

  // JS loaded
  (html.includes('.js') || html.includes('<script'))
    ? pass('JS references found')
    : fail('No JS references');

  // Check a few critical JS bundles load
  const scriptMatches = html.match(/src="([^"]*\.js[^"]*)"/g) || [];
  if (scriptMatches.length > 0) {
    // Test first 3 scripts
    for (const match of scriptMatches.slice(0, 3)) {
      const src = match.match(/src="([^"]*)"/)?.[1];
      if (src) {
        const jsUrl = src.startsWith('http') ? src : `${BASE_URL}${src}`;
        const jr = await safeFetch(jsUrl);
        jr.ok ? pass(`JS bundle loads: ${src.substring(0, 60)}...`) : fail(`JS bundle fails: ${src.substring(0, 60)}`, `status=${jr.status}`);
      }
    }
  }
}

async function testDynamicNewsPage() {
  console.log('\n  📋 Dynamic News Routes');

  // Fetch a real news slug
  const newsApi = await safeFetch(`${BASE_URL}/api/public/news?limit=1`);
  if (newsApi.ok) {
    const data = await newsApi.json();
    if (data.articles?.length > 0) {
      const slug = data.articles[0].slug;
      const r = await safeFetch(`${BASE_URL}/news/${slug}`);
      r.ok
        ? pass(`Dynamic news page /news/${slug} loads`, `status=${r.status}`)
        : fail(`Dynamic news page /news/${slug} failed`, `status=${r.status}`);
    } else {
      skip('Dynamic news page test', 'no articles in DB');
    }
  } else {
    skip('Dynamic news page test', 'news API unavailable');
  }

  // Non-existent news slug
  const r2 = await safeFetch(`${BASE_URL}/news/this-slug-does-not-exist-xyz`);
  (r2.status === 404 || r2.ok)
    ? pass('Non-existent news slug handled', `status=${r2.status}`)
    : fail('Non-existent news slug error', `status=${r2.status}`);
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

async function main() {
  console.log(`\n  🌐 Agent F: ${AGENT_NAME}`);
  console.log(`  Target: ${BASE_URL}`);
  console.log('  ─'.repeat(30));

  await testPageLoads();
  await test404Page();
  await testAdminRoute();
  await testMetaTags();
  await testFonts();
  await testCriticalAssets();
  await testDynamicNewsPage();

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
  console.error(`  💥 Agent F crashed: ${e.message}`);
  fs.writeFileSync(RESULTS_FILE, `Agent: ${AGENT_NAME}\nPass: 0 | Fail: 1 | Skip: 0 | Rate: 0%\n[FAIL] Agent crashed — ${e.message}`, 'utf8');
  process.exit(1);
});
