import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: {
    description: 'Manage homepage sections — Hero, Weapons, Highlights, News',
    group: 'Pages',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user,
  },
  fields: [
    /* ═══════════════════════════════════════════════
       SECTION 1: HERO
       ═══════════════════════════════════════════════ */
    {
      type: 'collapsible',
      label: '1️⃣ Hero Section — Background, Tagline, CTA',
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
          label: 'Hero Background Video (MP4/WebM)',
          admin: { description: 'Displays behind hero content. Overrides background image if set.' },
        },
        {
          type: 'row',
          fields: [
            { name: 'taglineEn', type: 'text', defaultValue: 'Adventure together, conquer the tower', label: 'Tagline (English)', admin: { width: '50%' } },
            { name: 'taglineTh', type: 'text', defaultValue: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย', label: 'Tagline (Thai)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'taglineImageEn', type: 'upload', relationTo: 'media', label: 'Tagline Image — EN (optional)', admin: { width: '50%', description: 'Replaces text tagline with image' } },
            { name: 'taglineImageTh', type: 'upload', relationTo: 'media', label: 'Tagline Image — TH (optional)', admin: { width: '50%', description: 'Replaces text tagline with image' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'ctaTextEn', type: 'text', defaultValue: 'Pre-Register Now', label: 'CTA Button (English)', admin: { width: '50%' } },
            { name: 'ctaTextTh', type: 'text', defaultValue: 'ลงทะเบียนล่วงหน้าเลย', label: 'CTA Button (Thai)', admin: { width: '50%' } },
          ],
        },
        { name: 'ctaLink', type: 'text', defaultValue: '/event', label: 'CTA Button Link' },

      ],
    },

    /* ═══════════════════════════════════════════════
       SECTION 2: CHARACTERS
       ═══════════════════════════════════════════════ */
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
          admin: { description: 'Background image for Weapons section. If empty, uses default gradient.' },
        },
        {
          name: 'weaponsBadgeEn',
          type: 'text',
          label: 'Badge Text (English)',
          defaultValue: 'CHOOSE YOUR WEAPON',
          admin: { width: '50%' },
        },
        {
          name: 'weaponsBadgeTh',
          type: 'text',
          label: 'Badge Text (Thai)',
          defaultValue: 'เลือกอาวุธของคุณ',
          admin: { width: '50%' },
        },
        {
          name: 'weaponsTitleEn',
          type: 'text',
          label: 'Section Title (English)',
          defaultValue: 'Weapons of Arcatea',
          admin: { width: '50%' },
        },
        {
          name: 'weaponsTitleTh',
          type: 'text',
          label: 'Section Title (Thai)',
          defaultValue: 'อาวุธแห่ง Arcatea',
          admin: { width: '50%' },
        },
      ],
    },

    /* ═══════════════════════════════════════════════
       SECTION 3: GAME HIGHLIGHTS / FEATURES
       ═══════════════════════════════════════════════ */
    {
      type: 'collapsible',
      label: '3️⃣ Highlights Section — Badge, Title, Features',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'highlightsBadgeEn', type: 'text', defaultValue: 'GAME FEATURES', label: 'Badge (English)', admin: { width: '50%' } },
            { name: 'highlightsBadgeTh', type: 'text', defaultValue: 'ฟีเจอร์เกม', label: 'Badge (Thai)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'highlightsTitleEn', type: 'text', defaultValue: 'Game Highlights', label: 'Title (English)', admin: { width: '50%' } },
            { name: 'highlightsTitleTh', type: 'text', defaultValue: 'ไฮไลท์เกม', label: 'Title (Thai)', admin: { width: '50%' } },
          ],
        },
        {
          name: 'highlightsBgImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Highlights Background Image (optional)',
        },
        {
          name: 'features',
          type: 'array',
          label: 'Feature Items',
          admin: { description: 'Features displayed in the highlights grid' },
          fields: [
            { name: 'icon', type: 'text', required: true, label: 'Icon (emoji or lucide icon name)' },
            { name: 'iconImage', type: 'upload', relationTo: 'media', label: 'Custom Icon Image (Overrides default icon)' },
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
          ],
        },
      ],
    },

    /* ═══════════════════════════════════════════════
       SECTION 4: NEWS
       ═══════════════════════════════════════════════ */
    {
      type: 'collapsible',
      label: '4️⃣ News Section — Badge, Title, Background',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'newsBgImage',
          type: 'upload',
          relationTo: 'media',
          label: 'News Background Image (optional)',
        },
        {
          type: 'row',
          fields: [
            { name: 'newsBadgeEn', type: 'text', defaultValue: 'LATEST NEWS', label: 'Badge (English)', admin: { width: '50%' } },
            { name: 'newsBadgeTh', type: 'text', defaultValue: 'ข่าวล่าสุด', label: 'Badge (Thai)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'newsTitleEn', type: 'text', defaultValue: 'News & Updates', label: 'Title (English)', admin: { width: '50%' } },
            { name: 'newsTitleTh', type: 'text', defaultValue: 'ข่าวสารและอัพเดท', label: 'Title (Thai)', admin: { width: '50%' } },
          ],
        },
      ],
    },
  ],
}
