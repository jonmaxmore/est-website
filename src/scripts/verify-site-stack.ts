import { runStackVerification } from '../lib/stack-verification'
import { loadScriptEnv } from './load-script-env'

loadScriptEnv()

function printCheck(status: string, label: string, target: string, detail: string) {
  console.log(`[${status}] ${label} -> ${target}`)
  console.log(`  ${detail}`)
}

async function run() {
  const result = await runStackVerification({
    baseUrl: process.env.STACK_VERIFY_BASE_URL,
    payloadSecret: process.env.PAYLOAD_SECRET || null,
    enableMutation: process.env.STACK_VERIFY_ENABLE_MUTATION === '1',
    mutationPlatform:
      process.env.STACK_VERIFY_TEST_PLATFORM === 'ios'
      || process.env.STACK_VERIFY_TEST_PLATFORM === 'android'
      || process.env.STACK_VERIFY_TEST_PLATFORM === 'pc'
        ? process.env.STACK_VERIFY_TEST_PLATFORM
        : undefined,
    mutationRegion:
      process.env.STACK_VERIFY_TEST_REGION === 'th'
      || process.env.STACK_VERIFY_TEST_REGION === 'my'
      || process.env.STACK_VERIFY_TEST_REGION === 'id'
      || process.env.STACK_VERIFY_TEST_REGION === 'ph'
      || process.env.STACK_VERIFY_TEST_REGION === 'sg'
        ? process.env.STACK_VERIFY_TEST_REGION
        : undefined,
  })

  console.log(`Stack verification base URL: ${result.baseUrl}`)

  for (const check of result.checks) {
    printCheck(check.status.toUpperCase(), check.label, check.target, check.detail)
  }

  console.log(`Passed: ${result.totals.passed}`)
  console.log(`Failed: ${result.totals.failed}`)
  console.log(`Skipped: ${result.totals.skipped}`)

  if (!result.ok) {
    process.exit(1)
  }
}

run().catch((error) => {
  console.error('Failed to verify the site stack:', error)
  process.exit(1)
})
