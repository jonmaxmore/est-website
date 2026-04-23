type PrismaPostgresApiKey = {
  databaseUrl?: string
}

function decodePrismaPostgresApiKey(apiKey: string) {
  try {
    return JSON.parse(Buffer.from(apiKey, 'base64').toString('utf8')) as PrismaPostgresApiKey
  } catch {
    return null
  }
}

export function resolvePgConnectionString(connectionString: string | null | undefined) {
  if (!connectionString) {
    return ''
  }

  try {
    const url = new URL(connectionString)

    if (url.protocol !== 'prisma+postgres:') {
      return connectionString
    }

    const apiKey = url.searchParams.get('api_key')
    if (!apiKey) {
      return connectionString
    }

    const decoded = decodePrismaPostgresApiKey(apiKey)
    return decoded?.databaseUrl || connectionString
  } catch {
    return connectionString
  }
}
