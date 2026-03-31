import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_ENV_FILES = [
  '.env.production.local',
  '.env.local',
  '.env.production',
  '.env',
]

export function loadScriptEnv(cwd = process.cwd()) {
  for (const fileName of DEFAULT_ENV_FILES) {
    const filePath = path.join(cwd, fileName)
    if (!fs.existsSync(filePath)) continue

    process.loadEnvFile(filePath)
  }
}
