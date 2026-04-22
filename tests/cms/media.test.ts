import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ALLOWED_MEDIA_MIME_TYPES,
  MAX_MEDIA_UPLOAD_BYTES,
  buildMediaUploadError,
  isAllowedMediaMimeType,
} from '../../app/shared/cms/media'

describe('media helpers', () => {
  it('accepts configured image and video mime types', () => {
    for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4']) {
      assert.equal(isAllowedMediaMimeType(mime), true)
    }
  })

  it('rejects unsupported mime types', () => {
    assert.equal(isAllowedMediaMimeType('application/pdf'), false)
  })

  it('uses a single shared upload limit', () => {
    assert.equal(MAX_MEDIA_UPLOAD_BYTES, 10 * 1024 * 1024)
    assert.ok(ALLOWED_MEDIA_MIME_TYPES.length >= 6)
  })

  it('creates structured upload errors', () => {
    assert.deepEqual(
      buildMediaUploadError('UNSUPPORTED_TYPE', 'Unsupported file type', 'file'),
      { code: 'UNSUPPORTED_TYPE', message: 'Unsupported file type', field: 'file' },
    )
  })
})
