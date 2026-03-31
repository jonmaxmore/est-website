import type { GlobalConfig } from 'payload'
import { allowPublicRead, isAdminOrEditor } from '@/lib/cms-access'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: {
    description: 'Manage homepage sections - Hero, Weapons, Highlights, and News',
    group: 'Pages',
  },
  access: {
    read: allowPublicRead,
    update: isAdminOrEditor,
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero Section',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Background Image',
        },
        {
          name: 'backgroundVideo',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Background Video',
          admin: { description: 'Displayed behind hero content. Overrides background image if set.' },
        },
        {
          type: 'row',
          fields: [
            { name: 'taglineEn', type: 'text', defaultValue: 'Adventure together, climb higher', label: 'Tagline (EN)', admin: { width: '50%' } },
            { name: 'taglineTh', type: 'text', defaultValue: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย', label: 'Tagline (TH)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'taglineImageEn', type: 'upload', relationTo: 'media', label: 'Tagline Image (EN)', admin: { width: '50%' } },
            { name: 'taglineImageTh', type: 'upload', relationTo: 'media', label: 'Tagline Image (TH)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'ctaTextEn', type: 'text', defaultValue: 'Join the pre-registration', label: 'CTA (EN)', admin: { width: '50%' } },
            { name: 'ctaTextTh', type: 'text', defaultValue: 'ลงทะเบียนล่วงหน้าเลย', label: 'CTA (TH)', admin: { width: '50%' } },
          ],
        },
        { name: 'ctaLink', type: 'text', defaultValue: '/event', label: 'CTA Link' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Weapons Showcase Section',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'weaponsBgImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Section Background Image',
        },
        {
          type: 'row',
          fields: [
            { name: 'weaponsBadgeEn', type: 'text', defaultValue: 'CHOOSE YOUR WEAPON', admin: { width: '50%' } },
            { name: 'weaponsBadgeTh', type: 'text', defaultValue: 'เลือกอาวุธของคุณ', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'weaponsTitleEn', type: 'text', defaultValue: 'Weapons of Arcatea', admin: { width: '50%' } },
            { name: 'weaponsTitleTh', type: 'text', defaultValue: 'อาวุธแห่ง Arcatea', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'weaponsIntroEn', type: 'textarea', label: 'Intro Copy (EN)', admin: { width: '50%' } },
            { name: 'weaponsIntroTh', type: 'textarea', label: 'Intro Copy (TH)', admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Highlights Section',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'highlightsBadgeEn', type: 'text', defaultValue: 'GAME FEATURES', admin: { width: '50%' } },
            { name: 'highlightsBadgeTh', type: 'text', defaultValue: 'ฟีเจอร์เกม', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'highlightsTitleEn', type: 'text', defaultValue: 'Game Highlights', admin: { width: '50%' } },
            { name: 'highlightsTitleTh', type: 'text', defaultValue: 'ไฮไลท์เกม', admin: { width: '50%' } },
          ],
        },
        {
          name: 'highlightsBgImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Highlights Background Image',
        },
        {
          type: 'row',
          fields: [
            { name: 'highlightsIntroEn', type: 'textarea', label: 'Intro Copy (EN)', admin: { width: '50%' } },
            { name: 'highlightsIntroTh', type: 'textarea', label: 'Intro Copy (TH)', admin: { width: '50%' } },
          ],
        },
        {
          name: 'features',
          type: 'array',
          label: 'Feature Items',
          admin: { description: 'Features displayed in the highlights section' },
          fields: [
            { name: 'icon', type: 'text', required: true, label: 'Icon (emoji or lucide icon name)' },
            { name: 'iconImage', type: 'upload', relationTo: 'media', label: 'Custom Icon Image' },
            { name: 'previewImage', type: 'upload', relationTo: 'media', label: 'Preview Image' },
            {
              type: 'row',
              fields: [
                { name: 'titleEn', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'titleTh', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'descriptionEn', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'descriptionTh', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'href', type: 'text', label: 'CTA Link', admin: { width: '50%' } },
                { name: 'ctaLabelEn', type: 'text', label: 'CTA Label (EN)', admin: { width: '25%' } },
                { name: 'ctaLabelTh', type: 'text', label: 'CTA Label (TH)', admin: { width: '25%' } },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'News Section',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'newsBgImage',
          type: 'upload',
          relationTo: 'media',
          label: 'News Background Image',
        },
        {
          type: 'row',
          fields: [
            { name: 'newsBadgeEn', type: 'text', defaultValue: 'LATEST NEWS', admin: { width: '50%' } },
            { name: 'newsBadgeTh', type: 'text', defaultValue: 'ข่าวล่าสุด', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'newsTitleEn', type: 'text', defaultValue: 'News & Updates', admin: { width: '50%' } },
            { name: 'newsTitleTh', type: 'text', defaultValue: 'ข่าวสารและอัปเดต', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'newsIntroEn', type: 'textarea', label: 'Intro Copy (EN)', admin: { width: '50%' } },
            { name: 'newsIntroTh', type: 'textarea', label: 'Intro Copy (TH)', admin: { width: '50%' } },
          ],
        },
      ],
    },
  ],
}
