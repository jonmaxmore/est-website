import { loadScriptEnv } from './load-script-env'

loadScriptEnv()

const defaultBaseUrl = process.env.CONTENT_HEALTH_BASE_URL
  || process.env.NEXT_PUBLIC_SITE_URL
  || `http://127.0.0.1:${process.env.PORT || '3000'}`

async function run() {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is required to call the internal content health API')
  }

  const response = await fetch(`${defaultBaseUrl.replace(/\/$/, '')}/api/internal/content-health`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYLOAD_SECRET}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Content health request failed with HTTP ${response.status}`)
  }

  const result = await response.json()
  console.log(JSON.stringify(result, null, 2))
}

run().catch((error) => {
  console.error('Failed to report content health:', error)
  process.exit(1)
})
