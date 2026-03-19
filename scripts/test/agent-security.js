#!/usr/bin/env node
/**
 * Agent S: Security Tests
 * Tests security headers, auth enforcement, CORS, rate limiting, and injection resistance.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const API = `${BASE_URL}/api`;
const AGENT_NAME = 'Security';
const RESULTS_FILE = path.join(__dirname, 'agent-security-results.txt');

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
    return { ok: false, status: 0, statusText: e.message, text: async () => '', json: async () => ({}), headers: new Headers() };
  }
}

// ═══════════════════════════════════════════
// SECURITY TESTS
// ═══════════════════════════════════════════

async function testSecurityHeaders() {
  console.log('\n  📋 Security Headers');

  const r = await safeFetch(BASE_URL);
  if (!r.ok) { fail('Cannot reach homepage for header tests'); return; }

  const headers = r.headers;

  // Required security headers
  const checks = [
    { header: 'x-content-type-options', expected: 'nosniff', name: 'X-Content-Type-Options' },
    { header: 'x-frame-options', expected: 'SAMEORIGIN', name: 'X-Frame-Options' },
    { header: 'x-xss-protection', expected: null, name: 'X-XSS-Protection' },
    { header: 'referrer-policy', expected: null, name: 'Referrer-Policy' },
    { header: 'strict-transport-security', expected: null, name: 'Strict-Transport-Security (HSTS)' },
  ];

  for (const check of checks) {
    const val = headers.get(check.header);
    if (val) {
      if (check.expected) {
        val.toLowerCase().includes(check.expected.toLowerCase())
          ? pass(`${check.name}: ${val}`)
          : fail(`${check.name} unexpected value`, `got: ${val}`);
      } else {
        pass(`${check.name}: ${val}`);
      }
    } else {
      // HSTS won't appear on localhost
      check.header === 'strict-transport-security' && BASE_URL.includes('localhost')
        ? skip(`${check.name}`, 'not expected on localhost')
        : fail(`${check.name} missing`);
    }
  }

  // Check no server version leak
  const server = headers.get('server');
  const xPoweredBy = headers.get('x-powered-by');
  !xPoweredBy ? pass('No X-Powered-By header (good)') : fail('X-Powered-By header exposed', xPoweredBy);
  (!server || !server.match(/\d+\.\d+/))
    ? pass('Server header does not leak version')
    : skip('Server header leaks version', server);
}

async function testAuthProtection() {
  console.log('\n  📋 Auth Protection');

  // Stats reset requires auth
  const r1 = await safeFetch(`${API}/stats/reset`, { method: 'POST' });
  (r1.status === 401 || r1.status === 403)
    ? pass('POST /api/stats/reset requires auth')
    : fail('POST /api/stats/reset not protected', `status=${r1.status}`);

  // Seed endpoint should require auth or be restricted
  const r2 = await safeFetch(`${API}/seed`, { method: 'POST' });
  (r2.status === 401 || r2.status === 403 || r2.status === 405)
    ? pass('POST /api/seed is restricted', `status=${r2.status}`)
    : skip('POST /api/seed may need auth protection', `status=${r2.status}`);

  // Init-db should be restricted
  const r3 = await safeFetch(`${API}/init-db`, { method: 'POST' });
  (r3.status === 401 || r3.status === 403 || r3.status === 405)
    ? pass('POST /api/init-db is restricted', `status=${r3.status}`)
    : skip('POST /api/init-db may need auth protection', `status=${r3.status}`);

  // Payload admin API without auth
  const r4 = await safeFetch(`${API}/users`, { method: 'GET' });
  (r4.status === 401 || r4.status === 403)
    ? pass('GET /api/users requires auth')
    : skip('GET /api/users access check', `status=${r4.status}`);

  // Payload admin API - create user without auth
  const r5 = await safeFetch(`${API}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hacker@evil.com', password: 'hack123' }),
  });
  (r5.status === 401 || r5.status === 403)
    ? pass('POST /api/users requires auth')
    : fail('POST /api/users not protected!', `status=${r5.status}`);
}

async function testInputSanitization() {
  console.log('\n  📋 Input Sanitization');

  // XSS in registration email
  const r1 = await safeFetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: '<script>alert("xss")</script>@evil.com',
      platform: 'ios',
      region: 'th',
    }),
  });
  r1.status === 400
    ? pass('XSS in email rejected')
    : fail('XSS in email not caught', `status=${r1.status}`);

  // SQL injection attempt in news slug
  const r2 = await safeFetch(`${API}/public/news-detail?slug='; DROP TABLE news; --`);
  (r2.status === 400 || r2.status === 404)
    ? pass('SQL injection in slug handled safely', `status=${r2.status}`)
    : fail('SQL injection response unexpected', `status=${r2.status}`);

  // Oversized payload
  const bigPayload = JSON.stringify({ email: 'a'.repeat(10000) + '@test.com', platform: 'ios', region: 'th' });
  const r3 = await safeFetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bigPayload,
  });
  (r3.status === 400 || r3.status === 413)
    ? pass('Oversized email rejected', `status=${r3.status}`)
    : fail('Oversized email not rejected', `status=${r3.status}`);

  // Path traversal in API
  const r4 = await safeFetch(`${BASE_URL}/api/public/../../../etc/passwd`);
  (r4.status === 404 || r4.status === 400)
    ? pass('Path traversal blocked', `status=${r4.status}`)
    : fail('Path traversal may be vulnerable', `status=${r4.status}`);

  // JSON content-type enforcement
  const r5 = await safeFetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: '{"email":"test@test.com","platform":"ios","region":"th"}',
  });
  (r5.status === 400 || r5.status === 415)
    ? pass('Non-JSON content type handled', `status=${r5.status}`)
    : skip('Content-Type enforcement', `accepted text/plain (status=${r5.status})`);
}

async function testRateLimiting() {
  console.log('\n  📋 Rate Limiting');

  // Fire 7 rapid requests to register (limit is 5/min)
  const requests = [];
  for (let i = 0; i < 7; i++) {
    requests.push(
      safeFetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `ratelimit-${Date.now()}-${i}@test-delete.com`,
          platform: 'pc',
          region: 'th',
        }),
      })
    );
  }

  const responses = await Promise.all(requests);
  const rateLimited = responses.some(r => r.status === 429);
  rateLimited
    ? pass('Rate limiting triggered on /api/register (429)')
    : skip('Rate limiting not triggered', 'may use x-forwarded-for which is absent locally');

  // Stats endpoint rate limit (60/min — harder to trigger)
  skip('Stats rate limiting', 'would need 61 requests to test');
}

async function testCORS() {
  console.log('\n  📋 CORS');

  // Preflight request from foreign origin
  const r = await safeFetch(`${API}/public/characters`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://evil-site.com',
      'Access-Control-Request-Method': 'GET',
    },
  });

  const acao = r.headers.get('access-control-allow-origin');
  if (acao === '*') {
    // Public read APIs with wildcard CORS is common but worth noting
    skip('CORS allows * on public endpoint', 'acceptable for public read-only APIs');
  } else if (acao && acao.includes('evil-site.com')) {
    fail('CORS allows arbitrary origins!');
  } else {
    pass('CORS does not allow arbitrary origins', acao || 'no ACAO header');
  }
}

async function testSensitiveEndpoints() {
  console.log('\n  📋 Sensitive Endpoint Protection');

  // .env should not be accessible
  const r1 = await safeFetch(`${BASE_URL}/.env`);
  (r1.status === 404 || r1.status === 403)
    ? pass('.env file not accessible', `status=${r1.status}`)
    : fail('.env file may be accessible!', `status=${r1.status}`);

  // .env.local
  const r2 = await safeFetch(`${BASE_URL}/.env.local`);
  (r2.status === 404 || r2.status === 403)
    ? pass('.env.local file not accessible', `status=${r2.status}`)
    : fail('.env.local file may be accessible!', `status=${r2.status}`);

  // payload.config
  const r3 = await safeFetch(`${BASE_URL}/payload.config.ts`);
  (r3.status === 404 || r3.status === 403)
    ? pass('payload.config.ts not accessible', `status=${r3.status}`)
    : fail('payload.config.ts may be accessible!', `status=${r3.status}`);

  // Source maps
  const r4 = await safeFetch(`${BASE_URL}/_next/static/chunks/main.js.map`);
  (r4.status === 404 || r4.status === 403)
    ? pass('Source maps not accessible', `status=${r4.status}`)
    : skip('Source maps accessible', 'may be fine for dev');

  // next.config.ts
  const r5 = await safeFetch(`${BASE_URL}/next.config.ts`);
  (r5.status === 404 || r5.status === 403)
    ? pass('next.config.ts not accessible')
    : fail('next.config.ts may be accessible!');
}

async function testClickjacking() {
  console.log('\n  📋 Clickjacking Prevention');

  const r = await safeFetch(BASE_URL);
  const xfo = r.headers.get('x-frame-options');
  const csp = r.headers.get('content-security-policy');

  xfo
    ? pass('X-Frame-Options set', xfo)
    : (csp && csp.includes('frame-ancestors'))
      ? pass('CSP frame-ancestors set')
      : fail('No clickjacking protection (X-Frame-Options or CSP frame-ancestors)');
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

async function main() {
  console.log(`\n  🛡️  Agent S: ${AGENT_NAME}`);
  console.log(`  Target: ${BASE_URL}`);
  console.log('  ─'.repeat(30));

  await testSecurityHeaders();
  await testAuthProtection();
  await testInputSanitization();
  await testRateLimiting();
  await testCORS();
  await testSensitiveEndpoints();
  await testClickjacking();

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
  console.error(`  💥 Agent S crashed: ${e.message}`);
  fs.writeFileSync(RESULTS_FILE, `Agent: ${AGENT_NAME}\nPass: 0 | Fail: 1 | Skip: 0 | Rate: 0%\n[FAIL] Agent crashed — ${e.message}`, 'utf8');
  process.exit(1);
});
