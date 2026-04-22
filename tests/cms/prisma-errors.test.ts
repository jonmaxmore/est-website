import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { toDuplicateConflictError } from '../../server/utils/prisma-errors'

describe('toDuplicateConflictError', () => {
  it('maps Prisma unique constraint errors to 409 conflicts', () => {
    const error = toDuplicateConflictError(
      { code: 'P2002', meta: { target: ['key'] } },
      { resource: 'Feature' },
    )

    assert.ok(error)
    assert.equal(error.statusCode, 409)
    assert.equal(error.statusMessage, 'Conflict')
    assert.match(error.message, /Feature already exists/i)
  })

  it('includes duplicate field names when Prisma provides them', () => {
    const error = toDuplicateConflictError(
      { code: 'P2002', meta: { target: ['slug'] } },
      { resource: 'News article' },
    )

    assert.ok(error)
    assert.match(error.message, /slug/i)
  })

  it('returns null for non-duplicate errors', () => {
    const error = toDuplicateConflictError(
      { code: 'P2025', meta: { target: ['key'] } },
      { resource: 'Feature' },
    )

    assert.equal(error, null)
  })
})
