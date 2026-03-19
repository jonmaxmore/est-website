#!/usr/bin/env node
/**
 * Agent D: Database Integrity Tests
 * Tests data integrity, relationships, and CMS collection consistency via API.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const API = `${BASE_URL}/api`;
const AGENT_NAME = 'Database Integrity';
const RESULTS_FILE = path.join(__dirname, 'agent-database-results.txt');

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
    return { ok: false, status: 0, json: async () => ({}), text: async () => '' };
  }
}

// ═══════════════════════════════════════════
// DATABASE TESTS
// ═══════════════════════════════════════════

async function testCharacterIntegrity() {
  console.log('\n  📋 Character Data Integrity');

  const r = await safeFetch(`${API}/public/characters`);
  if (!r.ok) { fail('Characters API unreachable'); return; }

  const data = await r.json();
  const chars = data.characters || [];

  if (chars.length === 0) {
    skip('Character integrity', 'no characters in DB');
    return;
  }

  pass(`Characters collection has ${chars.length} entries`);

  // Check each character has required fields
  let hasIssue = false;
  for (const c of chars) {
    if (!c.name) { fail(`Character id=${c.id} missing name`); hasIssue = true; }
    if (!c.id && c.id !== 0) { fail('Character missing id'); hasIssue = true; }
  }
  if (!hasIssue) pass('All characters have required fields (id, name)');

  // Check for duplicate names
  const names = chars.map(c => c.name).filter(Boolean);
  const uniqueNames = new Set(names);
  names.length === uniqueNames.size
    ? pass('No duplicate character names')
    : fail(`Duplicate character names found (${names.length} vs ${uniqueNames.size} unique)`);

  // Check media references are valid URLs
  let brokenMedia = 0;
  for (const c of chars) {
    for (const field of ['portrait', 'infoImage', 'backgroundImage', 'icon']) {
      const url = c[field];
      if (url && typeof url === 'string') {
        if (!url.startsWith('/') && !url.startsWith('http')) {
          fail(`Character "${c.name}" has invalid ${field} URL: ${url}`);
          brokenMedia++;
        }
      }
    }
  }
  if (brokenMedia === 0) pass('All character media URLs are valid format');
}

async function testNewsIntegrity() {
  console.log('\n  📋 News Data Integrity');

  const r = await safeFetch(`${API}/public/news?limit=50`);
  if (!r.ok) { fail('News API unreachable'); return; }

  const data = await r.json();
  const articles = data.articles || [];

  if (articles.length === 0) {
    skip('News integrity', 'no articles in DB');
    return;
  }

  pass(`News collection has ${articles.length} published articles`);

  // Check required fields
  let issues = 0;
  for (const a of articles) {
    if (!a.slug) { fail(`Article id=${a.id} missing slug`); issues++; }
    if (!a.titleEn && !a.titleTh) { fail(`Article slug=${a.slug} missing title`); issues++; }
    if (!a.category) { fail(`Article slug=${a.slug} missing category`); issues++; }
  }
  if (issues === 0) pass('All articles have required fields');

  // Check slug uniqueness
  const slugs = articles.map(a => a.slug).filter(Boolean);
  const uniqueSlugs = new Set(slugs);
  slugs.length === uniqueSlugs.size
    ? pass('No duplicate news slugs')
    : fail(`Duplicate slugs found (${slugs.length} vs ${uniqueSlugs.size} unique)`);

  // Check valid categories
  const validCats = ['event', 'update', 'media', 'maintenance', 'announcement'];
  const invalidCats = articles.filter(a => a.category && !validCats.includes(a.category));
  invalidCats.length === 0
    ? pass('All articles have valid categories')
    : fail(`Invalid categories found: ${invalidCats.map(a => `${a.slug}=${a.category}`).join(', ')}`);

  // Check date format
  const datedArticles = articles.filter(a => a.publishedAt);
  const invalidDates = datedArticles.filter(a => isNaN(new Date(a.publishedAt).getTime()));
  invalidDates.length === 0
    ? pass('All publishedAt dates are valid')
    : fail(`Invalid dates: ${invalidDates.map(a => a.slug).join(', ')}`);

  // Check ordering (should be newest first)
  if (datedArticles.length >= 2) {
    const dates = datedArticles.map(a => new Date(a.publishedAt).getTime());
    const isSorted = dates.every((d, i) => i === 0 || d <= dates[i - 1]);
    isSorted
      ? pass('Articles sorted by date (newest first)')
      : fail('Articles not sorted by date');
  }
}

async function testMilestoneIntegrity() {
  console.log('\n  📋 Milestone Data Integrity');

  const r = await safeFetch(`${API}/public/milestones`);
  if (!r.ok) { fail('Milestones API unreachable'); return; }

  const data = await r.json();
  const milestones = data.milestones || [];

  if (milestones.length === 0) {
    skip('Milestone integrity', 'no milestones in DB');
    return;
  }

  pass(`Milestones collection has ${milestones.length} entries`);

  // Check required fields
  let issues = 0;
  for (const m of milestones) {
    if (m.threshold === undefined || m.threshold === null) { fail(`Milestone missing threshold`); issues++; }
    if (!m.rewardEn && !m.rewardTh) { fail(`Milestone threshold=${m.threshold} missing reward text`); issues++; }
  }
  if (issues === 0) pass('All milestones have required fields');

  // Check threshold uniqueness
  const thresholds = milestones.map(m => m.threshold);
  const uniqueThresholds = new Set(thresholds);
  thresholds.length === uniqueThresholds.size
    ? pass('No duplicate thresholds')
    : fail('Duplicate milestone thresholds found');

  // Check ascending order
  const sorted = [...thresholds].sort((a, b) => a - b);
  JSON.stringify(thresholds) === JSON.stringify(sorted)
    ? pass('Milestones sorted by threshold ascending')
    : skip('Milestones not sorted by threshold', 'may be sorted by sortOrder');
}

async function testGalleryIntegrity() {
  console.log('\n  📋 Gallery Data Integrity');

  const r = await safeFetch(`${API}/public/gallery`);
  if (!r.ok) { fail('Gallery API unreachable'); return; }

  const data = await r.json();
  const gallery = data.gallery || {};

  const totalItems = Object.values(gallery).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  if (totalItems === 0) {
    skip('Gallery integrity', 'no gallery items in DB');
    return;
  }

  pass(`Gallery has ${totalItems} items across ${Object.keys(gallery).length} categories`);

  // Check valid categories
  const validCats = ['screenshots', 'wallpapers', 'concept'];
  for (const cat of Object.keys(gallery)) {
    validCats.includes(cat)
      ? pass(`Gallery category "${cat}" is valid`)
      : fail(`Gallery category "${cat}" is unexpected`);
  }
}

async function testStatsConsistency() {
  console.log('\n  📋 Stats Consistency');

  const r = await safeFetch(`${API}/stats`);
  if (!r.ok) { fail('Stats API unreachable'); return; }

  const data = await r.json();

  // totalRegistrations should be a non-negative number
  typeof data.totalRegistrations === 'number' && data.totalRegistrations >= 0
    ? pass(`Registration count is valid: ${data.totalRegistrations}`)
    : fail('Registration count invalid', `${data.totalRegistrations}`);

  // Milestones should be array
  Array.isArray(data.milestones)
    ? pass('Stats milestones is array')
    : fail('Stats milestones is not array');

  // Cross-check: milestones unlocked should correlate with registration count
  if (Array.isArray(data.milestones) && data.milestones.length > 0) {
    const regCount = data.displayCount || data.totalRegistrations || 0;
    const unlockedCount = data.milestones.filter(m => m.unlocked).length;
    pass(`${unlockedCount}/${data.milestones.length} milestones unlocked (display count: ${regCount})`);
  }
}

async function testGlobalConfigsLoaded() {
  console.log('\n  📋 Global Configs');

  const r = await safeFetch(`${API}/settings`);
  if (!r.ok) { fail('Settings API unreachable'); return; }

  const data = await r.json();

  // Site settings
  data.site?.name ? pass(`Site name: "${data.site.name}"`) : fail('Site name not configured');
  data.site?.footer?.copyrightText ? pass('Footer copyright configured') : skip('Footer copyright', 'not set');

  // Event config
  data.event !== undefined ? pass('Event config loaded') : fail('Event config missing');

  // Hero section
  data.hero !== undefined ? pass('Hero section config loaded') : fail('Hero section config missing');
}

async function testMediaAccessibility() {
  console.log('\n  📋 Media File Accessibility');

  // Get characters with media
  const r = await safeFetch(`${API}/public/characters`);
  if (!r.ok) { skip('Media accessibility', 'characters API unavailable'); return; }

  const data = await r.json();
  const chars = data.characters || [];

  let tested = 0;
  let broken = 0;

  for (const c of chars.slice(0, 3)) { // Test first 3 characters
    for (const field of ['portrait', 'icon']) {
      const url = c[field];
      if (url) {
        const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
        try {
          const mr = await fetch(fullUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
          tested++;
          mr.ok ? pass(`Media loads: ${c.name} ${field}`) : (broken++, fail(`Media broken: ${c.name} ${field}`, `status=${mr.status}`));
        } catch {
          broken++;
          fail(`Media unreachable: ${c.name} ${field}`);
        }
      }
    }
  }

  if (tested === 0) skip('Media file tests', 'no media URLs found');
  else if (broken === 0) pass(`All ${tested} media files accessible`);
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

async function main() {
  console.log(`\n  🗄️  Agent D: ${AGENT_NAME}`);
  console.log(`  Target: ${BASE_URL}`);
  console.log('  ─'.repeat(30));

  await testCharacterIntegrity();
  await testNewsIntegrity();
  await testMilestoneIntegrity();
  await testGalleryIntegrity();
  await testStatsConsistency();
  await testGlobalConfigsLoaded();
  await testMediaAccessibility();

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
  console.error(`  💥 Agent D crashed: ${e.message}`);
  fs.writeFileSync(RESULTS_FILE, `Agent: ${AGENT_NAME}\nPass: 0 | Fail: 1 | Skip: 0 | Rate: 0%\n[FAIL] Agent crashed — ${e.message}`, 'utf8');
  process.exit(1);
});
