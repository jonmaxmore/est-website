#!/usr/bin/env node
/**
 * Agent R: Route Doctor — Gap Analysis
 * Verifies all expected routes exist, checks for dead links, and validates redirects.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const API = `${BASE_URL}/api`;
const AGENT_NAME = 'Route Doctor';
const RESULTS_FILE = path.join(__dirname, 'agent-route-doctor-results.txt');

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
    return await fetch(url, { ...options, redirect: 'manual', signal: AbortSignal.timeout(10000) });
  } catch (e) {
    return { ok: false, status: 0, statusText: e.message, headers: new Headers() };
  }
}

// ═══════════════════════════════════════════
// EXPECTED ROUTES
// ═══════════════════════════════════════════

async function testExpectedPages() {
  console.log('\n  📋 Expected Page Routes');

  const expectedPages = [
    '/', '/character', '/news', '/gallery', '/event',
    '/story', '/game-guide', '/download', '/faq',
    '/privacy', '/terms', '/support', '/admin',
  ];

  for (const route of expectedPages) {
    const r = await safeFetch(`${BASE_URL}${route}`);
    // 200, 301, 302, 307 are all acceptable (HTTPS redirect, admin redirects)
    (r.ok || r.status === 301 || r.status === 302 || r.status === 307)
      ? pass(`Page ${route} exists`, `status=${r.status}`)
      : fail(`Page ${route} missing`, `status=${r.status}`);
  }
}

async function testExpectedAPIs() {
  console.log('\n  📋 Expected API Routes');

  const expectedAPIs = [
    { method: 'GET', path: '/api/health' },
    { method: 'GET', path: '/api/settings' },
    { method: 'GET', path: '/api/stats' },
    { method: 'GET', path: '/api/public/characters' },
    { method: 'GET', path: '/api/public/news' },
    { method: 'GET', path: '/api/public/gallery' },
    { method: 'GET', path: '/api/public/milestones' },
    { method: 'POST', path: '/api/register' },
    { method: 'POST', path: '/api/stats/reset' },
    { method: 'POST', path: '/api/graphql' },
  ];

  for (const api of expectedAPIs) {
    const r = await safeFetch(`${BASE_URL}${api.path}`, { method: api.method });
    // Any response that isn't 404/0 means the route exists
    (r.status !== 404 && r.status !== 0)
      ? pass(`${api.method} ${api.path} exists`, `status=${r.status}`)
      : fail(`${api.method} ${api.path} missing (404)`);
  }
}

async function testInternalLinkConsistency() {
  console.log('\n  📋 Internal Link Consistency');

  // Fetch homepage HTML and extract internal links
  const r = await safeFetch(BASE_URL);
  if (!r.ok && r.status !== 301) { fail('Cannot fetch homepage for link analysis'); return; }

  const html = await (await fetch(BASE_URL)).text();
  const linkMatches = html.match(/href="(\/[^"]*?)"/g) || [];
  const internalLinks = [...new Set(
    linkMatches
      .map(m => m.match(/href="([^"]*)"/)?.[1])
      .filter(Boolean)
      .filter(l => l.startsWith('/') && !l.startsWith('/_next') && !l.startsWith('/api'))
  )];

  if (internalLinks.length === 0) {
    skip('Internal link check', 'no links found in homepage');
    return;
  }

  console.log(`    Found ${internalLinks.length} unique internal links`);

  for (const link of internalLinks.slice(0, 20)) { // Cap at 20
    const lr = await safeFetch(`${BASE_URL}${link}`);
    (lr.ok || lr.status === 302 || lr.status === 307)
      ? pass(`Link ${link} resolves`, `status=${lr.status}`)
      : fail(`Dead link: ${link}`, `status=${lr.status}`);
  }
}

async function testAPIResponseConsistency() {
  console.log('\n  📋 API Response Consistency');

  // All public APIs should return JSON
  const jsonAPIs = [
    '/api/health',
    '/api/settings',
    '/api/stats',
    '/api/public/characters',
    '/api/public/news',
    '/api/public/gallery',
    '/api/public/milestones',
  ];

  for (const api of jsonAPIs) {
    const r = await safeFetch(`${BASE_URL}${api}`);
    if (r.ok) {
      const ct = r.headers.get('content-type') || '';
      ct.includes('application/json')
        ? pass(`${api} returns JSON content-type`)
        : fail(`${api} wrong content-type`, ct);
    } else if (r.status === 301 || r.status === 302) {
      pass(`${api} redirects (HTTPS)`, `status=${r.status}`);
    } else {
      fail(`${api} not reachable`, `status=${r.status}`);
    }
  }
}

async function testNewsSlugRouting() {
  console.log('\n  📋 News Dynamic Route');

  // Get a real slug
  const newsR = await safeFetch(`${BASE_URL}/api/public/news?limit=3`);
  if (!newsR.ok) { skip('News slug routing', 'API unavailable'); return; }

  const data = await (await fetch(`${BASE_URL}/api/public/news?limit=3`)).json();

  if (data.articles?.length > 0) {
    for (const article of data.articles) {
      const r = await safeFetch(`${BASE_URL}/news/${article.slug}`);
      r.ok
        ? pass(`/news/${article.slug} resolves`)
        : fail(`/news/${article.slug} broken`, `status=${r.status}`);
    }
  } else {
    skip('News slug routing', 'no articles');
  }
}

async function testTrailingSlashBehavior() {
  console.log('\n  📋 Trailing Slash Behavior');

  const routes = ['/character/', '/news/', '/faq/'];

  for (const route of routes) {
    const r = await safeFetch(`${BASE_URL}${route}`);
    (r.ok || r.status === 308 || r.status === 301)
      ? pass(`${route} handled (no 404)`, `status=${r.status}`)
      : fail(`${route} returns error`, `status=${r.status}`);
  }
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

async function main() {
  console.log(`\n  🩺 Agent R: ${AGENT_NAME}`);
  console.log(`  Target: ${BASE_URL}`);
  console.log('  ─'.repeat(30));

  await testExpectedPages();
  await testExpectedAPIs();
  await testInternalLinkConsistency();
  await testAPIResponseConsistency();
  await testNewsSlugRouting();
  await testTrailingSlashBehavior();

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
  console.error(`  💥 Agent R crashed: ${e.message}`);
  fs.writeFileSync(RESULTS_FILE, `Agent: ${AGENT_NAME}\nPass: 0 | Fail: 1 | Skip: 0 | Rate: 0%\n[FAIL] Agent crashed — ${e.message}`, 'utf8');
  process.exit(1);
});
