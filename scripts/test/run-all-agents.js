#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════╗
 * ║       EST WEBSITE — CARPET-BOMB TEST SUITE      ║
 * ║       Orchestrator: run-all-agents.js           ║
 * ╚══════════════════════════════════════════════════╝
 *
 * Usage:
 *   node scripts/test/run-all-agents.js [TARGET_URL]
 *
 * Examples:
 *   node scripts/test/run-all-agents.js                     # localhost:3000
 *   node scripts/test/run-all-agents.js https://example.com # production
 *
 * Zero dependencies — uses only Node.js built-ins.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TARGET = process.argv[2] || 'http://localhost:3000';
const SCRIPT_DIR = __dirname;
const REPORT_FILE = path.join(SCRIPT_DIR, 'carpet-bomb-report.txt');

// ═══════════════════════════════════════════
// AGENT REGISTRY
// ═══════════════════════════════════════════

const AGENTS = [
  { code: 'B', name: 'Backend API',        script: 'agent-backend.js',       emoji: '🔌', resultsFile: 'agent-backend-results.txt' },
  { code: 'F', name: 'Frontend Pages',     script: 'agent-frontend.js',      emoji: '🌐', resultsFile: 'agent-frontend-results.txt' },
  { code: 'D', name: 'Database Integrity', script: 'agent-database.js',      emoji: '🗄️', resultsFile: 'agent-database-results.txt' },
  { code: 'R', name: 'Route Doctor',       script: 'agent-route-doctor.js',  emoji: '🩺', resultsFile: 'agent-route-doctor-results.txt' },
  { code: 'S', name: 'Security',           script: 'agent-security.js',      emoji: '🛡️', resultsFile: 'agent-security-results.txt' },
  { code: 'P', name: 'Performance',        script: 'agent-performance.js',   emoji: '⏱️', resultsFile: 'agent-performance-results.txt' },
  { code: 'E', name: 'Environment Audit',  script: 'agent-environment.js',   emoji: '🔍', resultsFile: 'agent-environment-results.txt' },
];

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

function parseResults(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/Pass:\s*(\d+)\s*\|\s*Fail:\s*(\d+)\s*\|\s*Skip:\s*(\d+)\s*\|\s*Rate:\s*([\d.]+)%/);
    if (match) {
      return { pass: parseInt(match[1]), fail: parseInt(match[2]), skip: parseInt(match[3]), rate: parseFloat(match[4]) };
    }
  } catch {}
  return null;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function padLeft(str, len) {
  return String(str).padStart(len);
}

// ═══════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════

async function main() {
  const startTime = Date.now();

  console.log('');
  console.log('  ╔══════════════════════════════════════════════════╗');
  console.log('  ║     🎯 EST WEBSITE — CARPET-BOMB TEST SUITE     ║');
  console.log('  ╚══════════════════════════════════════════════════╝');
  console.log(`  Target: ${TARGET}`);
  console.log(`  Time:   ${new Date().toISOString()}`);
  console.log(`  Agents: ${AGENTS.length}`);

  // Pre-flight: check if target is reachable
  console.log('\n  ⏳ Pre-flight check...');
  try {
    const r = await fetch(TARGET, { signal: AbortSignal.timeout(10000) });
    console.log(`  ✅ Target reachable (status=${r.status})\n`);
  } catch (e) {
    console.log(`\n  ❌ Target unreachable: ${TARGET}`);
    console.log(`  Error: ${e.message}`);
    console.log('  Aborting. Make sure the server is running.\n');
    process.exit(1);
  }

  // Run each agent sequentially
  const agentResults = [];

  for (const agent of AGENTS) {
    const scriptPath = path.join(SCRIPT_DIR, agent.script);

    if (!fs.existsSync(scriptPath)) {
      console.log(`\n  ⚠️  Agent ${agent.code} (${agent.name}): script not found — ${agent.script}`);
      agentResults.push({ ...agent, result: null, error: 'script not found', elapsed: 0 });
      continue;
    }

    console.log(`\n  ${'═'.repeat(50)}`);
    console.log(`  ▶ Agent ${agent.code}: ${agent.emoji} ${agent.name}`);
    console.log(`  ${'═'.repeat(50)}`);

    const agentStart = Date.now();
    let error = null;

    try {
      execSync(`node "${scriptPath}" "${TARGET}"`, {
        stdio: 'inherit',
        timeout: 120000, // 2 min per agent
        cwd: SCRIPT_DIR,
      });
    } catch (e) {
      error = e.message?.substring(0, 200) || 'unknown error';
    }

    const elapsed = Date.now() - agentStart;
    const resultsPath = path.join(SCRIPT_DIR, agent.resultsFile);
    const result = parseResults(resultsPath);

    agentResults.push({ ...agent, result, error, elapsed });
  }

  // ═══════════════════════════════════════════
  // UNIFIED REPORT
  // ═══════════════════════════════════════════

  const totalElapsed = Date.now() - startTime;

  console.log('\n');
  console.log('  ╔══════════════════════════════════════════════════════════════════╗');
  console.log('  ║                    📊 UNIFIED REPORT                            ║');
  console.log('  ╠══════════════════════════════════════════════════════════════════╣');
  console.log(`  ║  ${pad('Agent', 22)} ${padLeft('Pass', 5)} ${padLeft('Fail', 5)} ${padLeft('Skip', 5)} ${padLeft('Rate', 7)} ${padLeft('Time', 8)} ║`);
  console.log('  ╠══════════════════════════════════════════════════════════════════╣');

  let totalPass = 0;
  let totalFail = 0;
  let totalSkip = 0;

  for (const ar of agentResults) {
    if (ar.result) {
      totalPass += ar.result.pass;
      totalFail += ar.result.fail;
      totalSkip += ar.result.skip;

      const status = ar.result.fail === 0 ? '🟢' : '🔴';
      console.log(
        `  ║  ${status} ${pad(ar.name, 20)} ${padLeft(ar.result.pass, 5)} ${padLeft(ar.result.fail, 5)} ${padLeft(ar.result.skip, 5)} ${padLeft(ar.result.rate + '%', 7)} ${padLeft(Math.round(ar.elapsed / 1000) + 's', 8)} ║`
      );
    } else {
      console.log(
        `  ║  💥 ${pad(ar.name, 20)} ${padLeft('-', 5)} ${padLeft('-', 5)} ${padLeft('-', 5)} ${padLeft('ERR', 7)} ${padLeft(Math.round(ar.elapsed / 1000) + 's', 8)} ║`
      );
    }
  }

  const totalTests = totalPass + totalFail;
  const overallRate = totalTests > 0 ? ((totalPass / totalTests) * 100).toFixed(1) : '0.0';

  console.log('  ╠══════════════════════════════════════════════════════════════════╣');
  console.log(
    `  ║  ${totalFail === 0 ? '🟢' : '🔴'} ${pad('TOTAL', 20)} ${padLeft(totalPass, 5)} ${padLeft(totalFail, 5)} ${padLeft(totalSkip, 5)} ${padLeft(overallRate + '%', 7)} ${padLeft(Math.round(totalElapsed / 1000) + 's', 8)} ║`
  );
  console.log('  ╚══════════════════════════════════════════════════════════════════╝');

  // Grade
  let grade, gradeEmoji;
  if (overallRate >= 95) { grade = 'A+'; gradeEmoji = '🏆'; }
  else if (overallRate >= 90) { grade = 'A'; gradeEmoji = '🌟'; }
  else if (overallRate >= 80) { grade = 'B'; gradeEmoji = '✅'; }
  else if (overallRate >= 70) { grade = 'C'; gradeEmoji = '⚠️'; }
  else if (overallRate >= 60) { grade = 'D'; gradeEmoji = '🟠'; }
  else { grade = 'F'; gradeEmoji = '🔴'; }

  console.log(`\n  ${gradeEmoji} Overall Grade: ${grade} (${overallRate}%)`);
  console.log(`  Total: ${totalTests} tests | ${totalPass} passed | ${totalFail} failed | ${totalSkip} skipped`);
  console.log(`  Duration: ${Math.round(totalElapsed / 1000)}s\n`);

  // Show failures summary
  if (totalFail > 0) {
    console.log('  ─'.repeat(30));
    console.log('  ❌ FAILURES SUMMARY:');
    for (const ar of agentResults) {
      if (ar.result && ar.result.fail > 0) {
        const resultsPath = path.join(SCRIPT_DIR, ar.resultsFile);
        try {
          const content = fs.readFileSync(resultsPath, 'utf8');
          const failures = content.split('\n').filter(l => l.startsWith('[FAIL]'));
          for (const f of failures) {
            console.log(`    ${ar.emoji} ${f}`);
          }
        } catch {}
      }
    }
    console.log('');
  }

  // Write unified report
  const report = [
    '══════════════════════════════════════════════════',
    '   EST WEBSITE — CARPET-BOMB TEST REPORT',
    '══════════════════════════════════════════════════',
    `Target: ${TARGET}`,
    `Timestamp: ${new Date().toISOString()}`,
    `Duration: ${Math.round(totalElapsed / 1000)}s`,
    `Grade: ${grade} (${overallRate}%)`,
    '',
    'SUMMARY:',
    `  Total Tests: ${totalTests}`,
    `  Passed: ${totalPass}`,
    `  Failed: ${totalFail}`,
    `  Skipped: ${totalSkip}`,
    '',
    'PER-AGENT BREAKDOWN:',
    ...agentResults.map(ar => {
      if (ar.result) {
        return `  [${ar.code}] ${ar.name}: ${ar.result.pass}/${ar.result.pass + ar.result.fail} (${ar.result.rate}%) | Skip: ${ar.result.skip} | ${Math.round(ar.elapsed / 1000)}s`;
      }
      return `  [${ar.code}] ${ar.name}: ERROR — ${ar.error}`;
    }),
    '',
    ...(totalFail > 0 ? [
      'FAILURES:',
      ...agentResults.flatMap(ar => {
        if (!ar.result || ar.result.fail === 0) return [];
        const resultsPath = path.join(SCRIPT_DIR, ar.resultsFile);
        try {
          const content = fs.readFileSync(resultsPath, 'utf8');
          return content.split('\n').filter(l => l.startsWith('[FAIL]')).map(f => `  [${ar.code}] ${f}`);
        } catch { return []; }
      }),
    ] : ['NO FAILURES — ALL TESTS PASSED!']),
    '',
    '══════════════════════════════════════════════════',
  ].join('\n');

  fs.writeFileSync(REPORT_FILE, report, 'utf8');
  console.log(`  📄 Full report saved to: ${REPORT_FILE}`);

  // Exit with error code if failures
  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch(e => {
  console.error(`\n  💥 Orchestrator crashed: ${e.message}`);
  process.exit(1);
});
