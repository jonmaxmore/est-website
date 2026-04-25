/**
 * ═══ Prisma Client (Singleton) ═══
 * เชื่อมต่อ PostgreSQL ผ่าน Prisma ORM
 *
 * สำคัญ:
 * - ใช้ PrismaPg adapter เพื่อ connect ผ่าน pg.Pool (connection pooling)
 * - ใน dev mode → เก็บไว้ใน globalThis เพื่อไม่ให้สร้างใหม่ตอน HMR
 * - ใน production → สร้างครั้งเดียวแล้วใช้ตลอด
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

import { resolvePgConnectionString } from './database-url'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  const pool = new pg.Pool({
    connectionString: resolvePgConnectionString(process.env.DATABASE_URL),
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter } as never)
}

// ใช้ singleton pattern — ป้องกันสร้าง connection ซ้ำ
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
