/**
 * ═══ Prisma Client (Singleton) ═══
 * เชื่อมต่อ PostgreSQL ผ่าน Prisma ORM + pg.Pool
 *
 * Production tuning:
 * - PG_POOL_MAX: connection ต่อ instance (ดู §production: pool × instance ≤ pg max_connections)
 * - timeouts: รอบ idle และเปิด connection ใหม่ — ป้องกัน connection ค้าง
 * - statement_timeout: ตัด query ที่ run นานเกินไป (10 วินาที)
 * - application_name: ปรากฏใน pg_stat_activity → debug ง่าย
 *
 * Lifecycle:
 * - dev mode → เก็บใน globalThis ป้องกันสร้างซ้ำตอน HMR
 * - SIGTERM → $disconnect() + pool.end() อย่าง graceful
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

import { resolvePgConnectionString } from './database-url'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pgPool?: pg.Pool
  shutdownRegistered?: boolean
}

function num(env: string | undefined, fallback: number): number {
  const n = Number(env)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function createPool(): pg.Pool {
  return new pg.Pool({
    connectionString: resolvePgConnectionString(process.env.DATABASE_URL),
    max: num(process.env.PG_POOL_MAX, 10),
    idleTimeoutMillis: num(process.env.PG_POOL_IDLE_TIMEOUT_MS, 30_000),
    connectionTimeoutMillis: num(process.env.PG_POOL_CONNECTION_TIMEOUT_MS, 10_000),
    statement_timeout: num(process.env.PG_STATEMENT_TIMEOUT_MS, 10_000),
    application_name: `est-website${process.env.NODE_ENV ? `-${process.env.NODE_ENV}` : ''}`,
  })
}

function createPrismaClient(): { client: PrismaClient; pool: pg.Pool } {
  const pool = createPool()
  pool.on('error', (err) => {
    console.error('[pg.Pool] Idle client error:', err.message)
  })
  const adapter = new PrismaPg(pool)
  const client = new PrismaClient({ adapter } as never)
  return { client, pool }
}

const { client, pool } =
  globalForPrisma.prisma && globalForPrisma.pgPool
    ? { client: globalForPrisma.prisma, pool: globalForPrisma.pgPool }
    : createPrismaClient()

export const prisma = client

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = client
  globalForPrisma.pgPool = pool
}

// ── Graceful shutdown ──
// ป้องกันการลงทะเบียน listener ซ้ำใน dev (HMR)
if (!globalForPrisma.shutdownRegistered) {
  const shutdown = async (signal: NodeJS.Signals) => {
    console.info(`[Prisma] Received ${signal} — closing connections`)
    try {
      await client.$disconnect()
      await pool.end()
    } catch (err) {
      console.error('[Prisma] Error during shutdown:', err)
    }
  }

  process.once('SIGTERM', () => void shutdown('SIGTERM'))
  process.once('SIGINT', () => void shutdown('SIGINT'))
  globalForPrisma.shutdownRegistered = true
}
