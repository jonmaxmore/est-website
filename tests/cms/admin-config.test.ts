import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  normalizeDownloadPageConfig,
  normalizeEventPageConfig,
  normalizeHeroSectionConfig,
  normalizeIntegrationsConfig,
  parseAdminConfigWrite,
} from '../../server/utils/admin-config'

describe('admin config validation', () => {
  it('accepts supported homepage sections only', () => {
    const result = parseAdminConfigWrite({
      key: 'homepage_sections',
      value: { sections: [{ id: 'hero', type: 'hero', visible: true, order: 0, background: '', config: {} }] },
    })

    assert.equal(result.key, 'homepage_sections')
  })

  it('rejects unknown config keys', () => {
    assert.throws(() => parseAdminConfigWrite({ key: 'totally_unknown', value: {} }))
  })

  it('rejects unsupported homepage section types', () => {
    assert.throws(() =>
      parseAdminConfigWrite({
        key: 'homepage_sections',
        value: { sections: [{ id: 'bad', type: 'custom_html', visible: true, order: 0, background: '', config: {} }] },
      }),
    )
  })

  it('accepts the controlled webzine topic registry', () => {
    const result = parseAdminConfigWrite({
      key: 'webzine_topics',
      value: [
        {
          key: 'getting-started',
          slug: 'getting-started',
          labelEn: 'Getting Started',
          labelTh: 'Getting Started',
          visible: true,
        },
      ],
    })

    assert.equal(result.key, 'webzine_topics')
    assert.equal(Array.isArray(result.value), true)
  })

  it('rejects topic records without a key', () => {
    assert.throws(() =>
      parseAdminConfigWrite({
        key: 'webzine_topics',
        value: [{ slug: 'broken', labelEn: 'Broken', labelTh: 'Broken', visible: true }],
      }),
    )
  })

  it('rejects page-backed navigation items without a page key', () => {
    assert.throws(() =>
      parseAdminConfigWrite({
        key: 'navigation',
        value: {
          main: [{ id: 'nav-missing', type: 'page', labelEn: 'Missing', labelTh: 'Missing', visible: true }],
          footer: [],
        },
      }),
    )
  })

  it('normalizes homepage hero buttons for admin-controlled CTAs', () => {
    const result = normalizeHeroSectionConfig({
      subtitleEn: 'Cross-platform fantasy RPG',
      subtitleTh: 'เกมแฟนตาซีเล่นได้หลายแพลตฟอร์ม',
      buttons: [
        { id: 'secondary', labelEn: 'Download', labelTh: 'ดาวน์โหลด', href: '/download', variant: 'secondary', visible: false, order: 2 },
        { id: 'primary', labelEn: 'Pre-register', labelTh: 'ลงทะเบียนล่วงหน้า', href: '/event', variant: 'primary', visible: true, order: 1 },
      ],
      showSocialLinks: true,
    })

    assert.equal(result.buttons.length, 2)
    assert.deepEqual(result.buttons.map((button) => button.id), ['primary', 'secondary'])
    assert.equal(result.showSocialLinks, true)
  })

  it('normalizes event landing controls with real and marketing registration counts', () => {
    const result = normalizeEventPageConfig({
      targetDate: '2026-10-01T00:00:00+07:00',
      registrationDisplayMode: 'actual_plus_manual',
      manualRegistrationCount: 5000,
      baseRewards: [
        { id: 'sr-box', titleEn: 'SR Weapon Box', titleTh: 'กล่องอาวุธ SR', descriptionEn: 'Choose one SR weapon', descriptionTh: 'เลือกอาวุธ SR ได้หนึ่งชิ้น', order: 2, visible: true },
        { id: 'gems', titleEn: 'Gems x1000', titleTh: 'เจม x1000', descriptionEn: 'Premium currency', descriptionTh: 'สกุลเงินพรีเมียม', order: 1, visible: true },
      ],
    })

    assert.equal(result.registrationDisplayMode, 'actual_plus_manual')
    assert.equal(result.manualRegistrationCount, 5000)
    assert.deepEqual(result.baseRewards.map((reward) => reward.id), ['gems', 'sr-box'])
  })

  it('normalizes cross-platform download buttons', () => {
    const result = normalizeDownloadPageConfig({
      heroTitleEn: 'Download Eternal Tower Saga',
      platforms: [
        { id: 'pc', label: 'Windows PC', url: 'https://example.com/installer.exe', platform: 'pc', order: 3, visible: true },
        { id: 'ios', label: 'App Store', url: 'https://apps.apple.com/app/example', platform: 'ios', order: 1, visible: true },
        { id: 'android', label: 'Google Play', url: 'https://play.google.com/store/apps/details?id=example', platform: 'android', order: 2, visible: true },
      ],
    })

    assert.deepEqual(result.platforms.map((platform) => platform.id), ['ios', 'android', 'pc'])
  })

  it('keeps public tracking IDs while protecting server-side tracking secrets', () => {
    const result = normalizeIntegrationsConfig({
      analytics: {
        enabled: true,
        googleAnalyticsId: 'G-ABC1234567',
        googleTagManagerId: 'GTM-ABC1234',
        metaPixelId: '1234567890',
        metaConversionsApiToken: 'secret-token',
      },
    })

    assert.equal(result.analytics.enabled, true)
    assert.equal(result.analytics.googleAnalyticsId, 'G-ABC1234567')
    assert.equal(result.analytics.metaConversionsApiToken, 'secret-token')
  })
})
