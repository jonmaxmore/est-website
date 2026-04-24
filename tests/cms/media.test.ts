import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ALLOWED_MEDIA_MIME_TYPES,
  MAX_MEDIA_UPLOAD_BYTES,
  buildMediaUploadError,
  getMediaAssetKind,
  isAllowedMediaExtension,
  isAllowedMediaMimeType,
  isAllowedMediaUpload,
  matchesMediaPickerAccept,
  resolveMediaInputAccept,
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

  it('accepts supported file extensions when mime types are missing', () => {
    assert.equal(isAllowedMediaExtension('hero-banner.webp'), true)
    assert.equal(isAllowedMediaExtension('document.pdf'), false)
    assert.equal(isAllowedMediaUpload('hero-banner.webp', ''), true)
  })

  it('uses a 100MB shared upload limit', () => {
    assert.equal(MAX_MEDIA_UPLOAD_BYTES, 100 * 1024 * 1024)
    assert.ok(ALLOWED_MEDIA_MIME_TYPES.length >= 6)
  })

  it('creates structured upload errors', () => {
    assert.deepEqual(
      buildMediaUploadError('UNSUPPORTED_TYPE', 'Unsupported file type', 'file'),
      { code: 'UNSUPPORTED_TYPE', message: 'Unsupported file type', field: 'file' },
    )
  })
})

describe('media asset kind helpers', () => {
  it('classifies video mime types as video', () => {
    assert.equal(getMediaAssetKind('video/mp4'), 'video')
    assert.equal(getMediaAssetKind('video/webm'), 'video')
  })

  it('classifies image mime types as image', () => {
    assert.equal(getMediaAssetKind('image/jpeg'), 'image')
    assert.equal(getMediaAssetKind('image/png'), 'image')
  })

  it('matches picker accept correctly', () => {
    assert.equal(matchesMediaPickerAccept('image/jpeg', 'image'), true)
    assert.equal(matchesMediaPickerAccept('video/mp4', 'image'), false)
    assert.equal(matchesMediaPickerAccept('video/mp4', 'video'), true)
    assert.equal(matchesMediaPickerAccept('image/jpeg', 'video'), false)
    assert.equal(matchesMediaPickerAccept('video/mp4', 'all'), true)
    assert.equal(matchesMediaPickerAccept('image/png', 'all'), true)
  })

  it('resolves input accept attribute', () => {
    assert.equal(resolveMediaInputAccept('image'), 'image/*')
    assert.equal(resolveMediaInputAccept('video'), 'video/*')
    assert.equal(resolveMediaInputAccept('all'), 'image/*,video/*')
  })
})
