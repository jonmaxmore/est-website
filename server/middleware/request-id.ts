/**
 * ═══ Request ID Middleware ═══
 * ใส่ X-Request-Id ทุก response (ใช้ track logs ข้าม services)
 *
 * - ถ้า client ส่ง X-Request-Id มา → reuse (สำหรับ trace propagation)
 * - ถ้าไม่มี → generate UUID v4
 * - เก็บไว้ใน event.context.requestId ให้ downstream handler ใช้ได้
 */
import { randomUUID } from 'node:crypto'

export default defineEventHandler((event) => {
  const incoming = getRequestHeader(event, 'x-request-id')
  const requestId = incoming && /^[a-zA-Z0-9-]{8,128}$/.test(incoming) ? incoming : randomUUID()

  event.context.requestId = requestId
  setResponseHeader(event, 'x-request-id', requestId)
})
