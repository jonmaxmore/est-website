#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 *  AI AGENT DEPLOYMENT — EST Website
 *  Team 1: Content Team (seed all admin modules)
 *  Team 2: QA Team (3 agents: Kira/Ryu/Nari)
 * ═══════════════════════════════════════════════════════════════
 */
import { login, printReport } from './agents/utils.mjs'
import { runContentTeam } from './agents/content-team.mjs'
import { runQATeam } from './agents/qa-team.mjs'

console.log('╔════════════════════════════════════════════════╗')
console.log('║  🤖 AI AGENT TEAMS — FULL DEPLOYMENT          ║')
console.log('║  Content Team + QA Team (3 Agents)            ║')
console.log('║  Target: http://178.128.127.161               ║')
console.log('╚════════════════════════════════════════════════╝')
console.log(`  Started: ${new Date().toISOString()}\n`)

try {
  // Phase 0: Authenticate
  await login()

  // Phase 1: Content Team — Seed data via Admin API
  await runContentTeam()

  // Phase 2: QA Team — Test everything
  await runQATeam()

  // Phase 3: Report
  printReport()

  console.log(`\n  Finished: ${new Date().toISOString()}`)
} catch (err) {
  console.error('\n💥 FATAL ERROR:', err.message)
  console.error(err.stack)
  process.exit(1)
}
