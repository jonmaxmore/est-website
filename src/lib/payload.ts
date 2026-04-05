import { getPayload } from 'payload'
import configPromise from '@payload-config'

let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null

export async function getPayloadClient() {
  if (!payloadInstance) {
    if (process.env.npm_lifecycle_event === 'build' || process.env.NEXT_PHASE === 'phase-production-build') {
      try {
        payloadInstance = await getPayload({ config: configPromise })
      } catch (e) {
        console.warn('⚠️ [Build] Payload Postgres connection bypassed. Using empty static mock.');
        return {
          find: async () => ({ docs: [], totalDocs: 0 }),
          findGlobal: async () => ({}),
          count: async () => ({ totalDocs: 0 }),
          create: async () => ({}),
          update: async () => ({}),
          delete: async () => ({}),
        } as unknown as Awaited<ReturnType<typeof getPayload>>
      }
    } else {
      payloadInstance = await getPayload({ config: configPromise })
    }
  }
  return payloadInstance
}
