/**
 * ═══ Structured Logger ═══
 * Lightweight structured JSON logger ใช้แทน console.log/console.warn ในส่วน server
 *
 * ทำไมไม่ใช้ pino?
 *  - pino เพิ่ม dependency + cold-start
 *  - JSON.stringify เร็วพอสำหรับ workload ปัจจุบัน
 *  - ถ้าโต ค่อย swap เป็น pino โดยไม่ต้องแก้ caller (interface เดียวกัน)
 *
 * ใช้:
 *   import { logger } from '../utils/logger'  // or auto-import (Nuxt server auto-imports utils/)
 *   logger.info('login.attempt', { email: 'a@b.com' })
 *   logger.error('webhook.failed', { reason: err.message })
 *
 * Levels: debug | info | warn | error
 *   PROD: log level = info ขึ้นไป
 *   DEV:  log level = debug
 *
 * Request context: ใช้ logger.child({ requestId, ip }) ใน middleware
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function currentLevel(): LogLevel {
  const env = (process.env.LOG_LEVEL || '').toLowerCase()
  if (env === 'debug' || env === 'info' || env === 'warn' || env === 'error') return env
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel()]
}

function output(level: LogLevel, msg: string, context: Record<string, unknown> = {}) {
  if (!shouldLog(level)) return

  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...context,
  }

  // PROD: JSON for log aggregation; DEV: prettier
  if (process.env.NODE_ENV === 'production') {
    process.stdout.write(JSON.stringify(entry) + '\n')
  } else {
    const prefix =
      level === 'error'
        ? '\x1b[31m[ERROR]\x1b[0m'
        : level === 'warn'
          ? '\x1b[33m[WARN]\x1b[0m'
          : level === 'info'
            ? '\x1b[36m[INFO]\x1b[0m'
            : '\x1b[90m[DEBUG]\x1b[0m'
    const ctx = Object.keys(context).length ? ' ' + JSON.stringify(context) : ''
    process.stdout.write(`${prefix} ${msg}${ctx}\n`)
  }
}

type Logger = {
  debug: (msg: string, context?: Record<string, unknown>) => void
  info: (msg: string, context?: Record<string, unknown>) => void
  warn: (msg: string, context?: Record<string, unknown>) => void
  error: (msg: string, context?: Record<string, unknown>) => void
  child: (bindings: Record<string, unknown>) => Logger
}

function createLogger(bindings: Record<string, unknown> = {}): Logger {
  return {
    debug: (msg, ctx) => output('debug', msg, { ...bindings, ...ctx }),
    info: (msg, ctx) => output('info', msg, { ...bindings, ...ctx }),
    warn: (msg, ctx) => output('warn', msg, { ...bindings, ...ctx }),
    error: (msg, ctx) => output('error', msg, { ...bindings, ...ctx }),
    child: (b) => createLogger({ ...bindings, ...b }),
  }
}

export const logger = createLogger()
