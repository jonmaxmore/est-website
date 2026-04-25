/**
 * ═══ Database URL Resolver ═══
 * แปลง connection string ให้ใช้งานได้กับ pg.Pool
 *
 * รองรับ 2 รูปแบบ:
 * 1. postgres://... → ใช้ตรงๆ ได้เลย
 * 2. prisma+postgres://...?api_key=xxx → ถอดรหัส API key เพื่อดึง URL จริง
 *    (กรณีใช้ Prisma Data Platform)
 */
type PrismaPostgresApiKey = {
  databaseUrl?: string
}

/** ถอดรหัส API key ที่เป็น base64 JSON */
function decodePrismaPostgresApiKey(apiKey: string) {
  try {
    return JSON.parse(Buffer.from(apiKey, 'base64').toString('utf8')) as PrismaPostgresApiKey
  } catch {
    return null
  }
}

/**
 * แปลง connection string ให้พร้อมใช้กับ pg.Pool
 * - ถ้าเป็น postgres:// ธรรมดา → คืนค่าเดิม
 * - ถ้าเป็น prisma+postgres:// → ดึง URL จริงจาก API key
 */
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
