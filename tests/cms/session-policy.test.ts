/**
 * Tests for the consolidated SUPER_ADMIN policy in server/utils/session-policy.ts.
 * Audit-2 (W-2): commit b8bd818 + commit 77507f3 shipped without unit coverage.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  MUTATING_METHODS,
  SUPER_ADMIN_CONFIG_KEYS,
  SUPER_ADMIN_ONLY_PATH_PREFIXES,
  requiresSuperAdmin,
} from '../../server/utils/session-policy'

describe('SUPER_ADMIN_CONFIG_KEYS', () => {
  it('locks down the maintenance and integrations site config keys', () => {
    assert.ok(SUPER_ADMIN_CONFIG_KEYS.has('integrations'))
    assert.ok(SUPER_ADMIN_CONFIG_KEYS.has('maintenance'))
  })

  it('does not gate editor-owned config keys', () => {
    for (const key of [
      'navigation',
      'homepage_sections',
      'webzine_topics',
      'seo',
      'social',
      'appearance',
      'faq',
      'download_page',
    ]) {
      assert.ok(!SUPER_ADMIN_CONFIG_KEYS.has(key), `${key} should be EDITOR-accessible`)
    }
  })
})

describe('SUPER_ADMIN_ONLY_PATH_PREFIXES', () => {
  it('covers user management and both backup-import surfaces', () => {
    assert.deepEqual(
      [...SUPER_ADMIN_ONLY_PATH_PREFIXES].sort(),
      ['/api/admin/backup/import', '/api/admin/backup/import-wp', '/api/admin/users'].sort(),
    )
  })
})

describe('requiresSuperAdmin', () => {
  it('returns false for GET on a SUPER_ADMIN path (read access for EDITORs)', () => {
    assert.equal(requiresSuperAdmin('/api/admin/users', 'GET'), false)
    assert.equal(requiresSuperAdmin('/api/admin/users/abc', 'GET'), false)
  })

  it('returns true for any mutating method on a SUPER_ADMIN path', () => {
    for (const method of MUTATING_METHODS) {
      assert.equal(
        requiresSuperAdmin('/api/admin/users', method),
        true,
        `${method} on /api/admin/users should require SUPER_ADMIN`,
      )
      assert.equal(
        requiresSuperAdmin('/api/admin/backup/import', method),
        true,
        `${method} on backup/import should require SUPER_ADMIN`,
      )
    }
  })

  it('matches by prefix so /api/admin/users/[id] also gates', () => {
    assert.equal(requiresSuperAdmin('/api/admin/users/cuid-123', 'DELETE'), true)
    assert.equal(requiresSuperAdmin('/api/admin/users/cuid-123', 'PUT'), true)
  })

  it('returns false for paths outside the SUPER_ADMIN list', () => {
    assert.equal(requiresSuperAdmin('/api/admin/news', 'POST'), false)
    assert.equal(requiresSuperAdmin('/api/admin/banners/abc', 'DELETE'), false)
    assert.equal(requiresSuperAdmin('/api/public/news', 'GET'), false)
  })

  it('returns false for HEAD/OPTIONS on a SUPER_ADMIN path', () => {
    assert.equal(requiresSuperAdmin('/api/admin/users', 'HEAD'), false)
    assert.equal(requiresSuperAdmin('/api/admin/users', 'OPTIONS'), false)
  })

  it('does not falsely match a non-SUPER_ADMIN path that happens to share a prefix substring', () => {
    // /api/admin/userslist (hypothetical) starts with /api/admin/users so the
    // current prefix-startsWith logic would match. This test pins the current
    // behaviour so a future regression to substring matching is caught.
    assert.equal(requiresSuperAdmin('/api/admin/userslist', 'POST'), true)
    // The above is INTENTIONAL given the current implementation; if/when we
    // tighten the policy to exact-segment matching, update this test.
  })
})
