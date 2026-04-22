/**
 * Shared utilities for AI Agent Teams
 */
const BASE = 'http://178.128.127.161'
let cookie = ''
let results = []

export { BASE, results }

export async function login() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@eternaltowersaga.com', password: 'wErew@lf17john' }),
  })
  const setCookie = res.headers.get('set-cookie')
  if (setCookie) cookie = setCookie.split(';')[0]
  if (!res.ok) throw new Error(`Login failed: ${res.status}`)
  const data = await res.json()
  console.log(`✓ Login OK: ${data.user?.displayName}`)
  return cookie
}

export async function adminFetch(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json', Cookie: cookie } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  return { ok: res.ok, status: res.status, data }
}

export async function publicFetch(path) {
  const res = await fetch(`${BASE}${path}`)
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

export function record(agent, module, test, pass, detail = '') {
  const icon = pass ? '✅' : '❌'
  results.push({ agent, module, test, pass, detail })
  console.log(`  ${icon} [${agent}] ${module} → ${test}${detail ? ': ' + detail : ''}`)
}

export function printReport() {
  const total = results.length
  const passed = results.filter(r => r.pass).length
  const failed = total - passed
  console.log('\n' + '═'.repeat(60))
  console.log('  AI AGENT TEAM — CONSOLIDATED REPORT')
  console.log('═'.repeat(60))
  console.log(`  Total: ${total} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`)
  console.log(`  Pass Rate: ${((passed / total) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log('\n  ── FAILURES ──')
    results.filter(r => !r.pass).forEach(r => {
      console.log(`  ❌ [${r.agent}] ${r.module} → ${r.test}: ${r.detail}`)
    })
  }

  // Per-agent summary
  const agents = [...new Set(results.map(r => r.agent))]
  console.log('\n  ── PER-AGENT SUMMARY ──')
  for (const a of agents) {
    const ar = results.filter(r => r.agent === a)
    const ap = ar.filter(r => r.pass).length
    console.log(`  ${a}: ${ap}/${ar.length} passed`)
  }
  console.log('═'.repeat(60))
}
