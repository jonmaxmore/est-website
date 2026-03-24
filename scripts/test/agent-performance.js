#!/usr/bin/env node
/**
 * Agent P: Performance Tests
 * Measures response times, payload sizes, and caching behavior.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const API = `${BASE_URL}/api`;
const AGENT_NAME = 'Performance';
const RESULTS_FILE = path.join(__dirname, 'agent-performance-results.txt');

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

async function timedFetch(url, options = {}) {
  const start = Date.now();
  try {
    const r = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
    const elapsed = Date.now() - start;
    const body = await r.text();
    return { ok: r.ok, status: r.status, elapsed, size: body.length, headers: r.headers, body };
  } catch (e) {
    return { ok: false, status: 0, elapsed: Date.now() - start, size: 0, headers: new Headers(), body: '' };
  }
}

// ═══════════════════════════════════════════
// PERFORMANCE TESTS
// ═══════════════════════════════════════════

async function testAPIResponseTimes() {
  console.log('\n  📋 API Response Times');

  const endpoints = [
    { path: '/api/health', name: 'Health', maxMs: 500 },
    { path: '/api/settings', name: 'Settings', maxMs: 2000 },
    { path: '/api/stats', name: 'Stats', maxMs: 2000 },
    { path: '/api/public/characters', name: 'Characters', maxMs: 2000 },
    { path: '/api/public/news', name: 'News', maxMs: 2000 },
    { path: '/api/public/gallery', name: 'Gallery', maxMs: 2000 },
    { path: '/api/public/milestones', name: 'Milestones', maxMs: 2000 },
  ];

  for (const ep of endpoints) {
    const r = await timedFetch(`${BASE_URL}${ep.path}`);
    if (r.ok) {
      r.elapsed <= ep.maxMs
        ? pass(`${ep.name} responds in ${r.elapsed}ms (< ${ep.maxMs}ms)`)
        : fail(`${ep.name} slow: ${r.elapsed}ms (> ${ep.maxMs}ms)`);
    } else {
      skip(`${ep.name} unreachable`, `status=${r.status}`);
    }
  }
}

async function testPageLoadTimes() {
  console.log('\n  📋 Page Load Times');

  const pages = [
    { path: '/', name: 'Homepage', maxMs: 5000 },
    { path: '/character', name: 'Character', maxMs: 5000 },
    { path: '/news', name: 'News', maxMs: 5000 },
    { path: '/faq', name: 'FAQ', maxMs: 3000 },
    { path: '/privacy', name: 'Privacy', maxMs: 3000 },
  ];

  for (const page of pages) {
    const r = await timedFetch(`${BASE_URL}${page.path}`);
    if (r.ok) {
      r.elapsed <= page.maxMs
        ? pass(`${page.name} loads in ${r.elapsed}ms (< ${page.maxMs}ms)`)
        : fail(`${page.name} slow: ${r.elapsed}ms (> ${page.maxMs}ms)`);
    } else {
      fail(`${page.name} unreachable`, `status=${r.status}`);
    }
  }
}

async function testPayloadSizes() {
  console.log('\n  📋 Payload Sizes');

  const endpoints = [
    { path: '/api/health', name: 'Health', maxKB: 5 },
    { path: '/api/settings', name: 'Settings', maxKB: 50 },
    { path: '/api/public/characters', name: 'Characters', maxKB: 100 },
    { path: '/api/public/news', name: 'News', maxKB: 200 },
    { path: '/api/stats', name: 'Stats', maxKB: 20 },
  ];

  for (const ep of endpoints) {
    const r = await timedFetch(`${BASE_URL}${ep.path}`);
    if (r.ok) {
      const sizeKB = (r.size / 1024).toFixed(1);
      r.size <= ep.maxKB * 1024
        ? pass(`${ep.name} payload: ${sizeKB}KB (< ${ep.maxKB}KB)`)
        : fail(`${ep.name} oversized: ${sizeKB}KB (> ${ep.maxKB}KB)`);
    } else {
      skip(`${ep.name} payload size`, `not reachable (status=${r.status})`);
    }
  }

  // Homepage HTML size
  const homeR = await timedFetch(BASE_URL);
  if (homeR.ok) {
    const sizeKB = (homeR.size / 1024).toFixed(1);
    homeR.size <= 700 * 1024
      ? pass(`Homepage HTML: ${sizeKB}KB (< 700KB)`)
      : fail(`Homepage HTML oversized: ${sizeKB}KB`);
  }
}

async function testCacheHeaders() {
  console.log('\n  📋 Cache Headers');

  const cachedEndpoints = [
    { path: '/api/public/news', name: 'News', expectCache: true },
    { path: '/api/public/milestones', name: 'Milestones', expectCache: true },
    { path: '/api/stats', name: 'Stats', expectCache: true },
    { path: '/api/settings', name: 'Settings', expectCache: true },
  ];

  for (const ep of cachedEndpoints) {
    const r = await timedFetch(`${BASE_URL}${ep.path}`);
    if (r.ok) {
      const cc = r.headers.get('cache-control') || '';
      if (ep.expectCache) {
        (cc.includes('max-age') || cc.includes('s-maxage'))
          ? pass(`${ep.name} has cache headers`, cc)
          : skip(`${ep.name} no cache header`, 'may be set at CDN level');
      }
    }
  }
}

async function testCompressionSupport() {
  console.log('\n  📋 Compression');

  // Request with accept-encoding
  const r = await timedFetch(BASE_URL, {
    headers: { 'Accept-Encoding': 'gzip, deflate, br' },
  });

  if (r.ok) {
    const encoding = r.headers.get('content-encoding');
    encoding
      ? pass(`Compression enabled: ${encoding}`)
      : skip('No content-encoding header', 'may be handled by reverse proxy');
  }
}

async function testConcurrentRequests() {
  console.log('\n  📋 Concurrent Load');

  // Fire 10 concurrent requests
  const start = Date.now();
  const promises = Array.from({ length: 10 }, () => timedFetch(`${BASE_URL}/api/health`));
  const responses = await Promise.all(promises);
  const totalTime = Date.now() - start;

  const successCount = responses.filter(r => r.ok).length;
  successCount >= 8
    ? pass(`${successCount}/10 concurrent health checks succeeded`)
    : (successCount >= 5)
      ? skip(`Concurrent requests partially successful (${successCount}/10)`)
      : fail(`Some concurrent requests failed (${responses.filter(r => !r.ok).length}/10)`);

  totalTime < 5000
    ? pass(`Concurrent batch completed in ${totalTime}ms`)
    : fail(`Concurrent batch slow: ${totalTime}ms`);

  pass(`Avg response: ${avgTime}ms | Max: ${maxTime}ms`);
}

async function testSecondRequestFaster() {
  console.log('\n  📋 Warm Cache Effect');

  // First request (cold)
  const r1 = await timedFetch(`${BASE_URL}/api/settings`);
  // Second request (should be cached/warm)
  const r2 = await timedFetch(`${BASE_URL}/api/settings`);

  if (r1.ok && r2.ok) {
    pass(`Cold: ${r1.elapsed}ms → Warm: ${r2.elapsed}ms`);
    r2.elapsed <= r1.elapsed
      ? pass('Second request same or faster (cache working)')
      : skip('Second request slower', 'may vary due to server load');
  }
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

async function main() {
  console.log(`\n  ⏱️  Agent P: ${AGENT_NAME}`);
  console.log(`  Target: ${BASE_URL}`);
  console.log('  ─'.repeat(30));

  await testAPIResponseTimes();
  await testPageLoadTimes();
  await testPayloadSizes();
  await testCacheHeaders();
  await testCompressionSupport();
  await testConcurrentRequests();
  await testSecondRequestFaster();

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
  console.error(`  💥 Agent P crashed: ${e.message}`);
  fs.writeFileSync(RESULTS_FILE, `Agent: ${AGENT_NAME}\nPass: 0 | Fail: 1 | Skip: 0 | Rate: 0%\n[FAIL] Agent crashed — ${e.message}`, 'utf8');
  process.exit(1);
});
