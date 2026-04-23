import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { resolvePgConnectionString } from '../../server/utils/database-url'

describe('resolvePgConnectionString', () => {
  it('returns plain postgres URLs unchanged', () => {
    const value = 'postgres://postgres:postgres@localhost:5432/template1?sslmode=disable'

    assert.equal(resolvePgConnectionString(value), value)
  })

  it('decodes prisma+postgres URLs into the underlying TCP postgres URL', () => {
    const tcpUrl = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable'
    const prismaUrl = `prisma+postgres://localhost:51213/?api_key=${Buffer.from(
      JSON.stringify({ databaseUrl: tcpUrl, name: 'default' }),
    ).toString('base64')}`

    assert.equal(resolvePgConnectionString(prismaUrl), tcpUrl)
  })
})
