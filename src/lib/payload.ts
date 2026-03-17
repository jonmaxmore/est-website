import { getPayload } from 'payload'
import configPromise from '@payload-config'

let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null

export async function getPayloadClient() {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config: configPromise })
  }
  return payloadInstance
}
