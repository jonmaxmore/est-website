import type { GlobalConfig } from 'payload'

export const HeroSection: GlobalConfig = {
  slug: 'hero-section',
  admin: {
    description: 'Manage all homepage sections — Hero, Characters, Highlights, News',
    group: 'Homepage Sections',
  },
  access: {
    read: () => true,
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
      label: '2️⃣ Characters Section — Background, Title, Badge',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'charactersBgImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Characters Background Image',
          admin: { description: 'Background image for Characters section. If empty, uses default gradient.' },
        },
        {
          type: 'row',
          fields: [
            { name: 'charactersBadgeEn', type: 'text', defaultValue: 'CHOOSE YOUR HERO', label: 'Badge (English)', admin: { width: '50%' } },
            { name: 'charactersBadgeTh', type: 'text', defaultValue: 'เลือกฮีโร่ของคุณ', label: 'Badge (Thai)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'charactersTitleEn', type: 'text', defaultValue: 'Heroes of Arcatea', label: 'Title (English)', admin: { width: '50%' } },
            { name: 'charactersTitleTh', type: 'text', defaultValue: 'ฮีโร่แห่ง Arcatea', label: 'Title (Thai)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'voiceButtonEn', type: 'text', defaultValue: 'Listen to Voice Line', label: 'Voice Button (EN)', admin: { width: '50%' } },
            { name: 'voiceButtonTh', type: 'text', defaultValue: 'ฟังเสียงตัวละคร', label: 'Voice Button (TH)', admin: { width: '50%' } },
          ],
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
            { name: 'icon', type: 'text', required: true, label: 'Icon (emoji)' },
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
      label: '4️⃣ News Section — Badge, Title',
      admin: { initCollapsed: true },
      fields: [
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
    /* ═══════════════════════════════════════════════
       SECTION 5: STORY PAGE
       ═══════════════════════════════════════════════ */
    {
      type: 'collapsible',
      label: '5️⃣ Story Page — Hero, Sections',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'storyPageHeroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Story Page Hero Background',
        },
        {
          type: 'row',
          fields: [
            { name: 'storyPageBadgeEn', type: 'text', defaultValue: 'LORE', label: 'Badge (EN)', admin: { width: '50%' } },
            { name: 'storyPageBadgeTh', type: 'text', defaultValue: 'เนื้อเรื่อง', label: 'Badge (TH)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'storyPageTitleEn', type: 'text', defaultValue: 'Story', label: 'Title (EN)', admin: { width: '50%' } },
            { name: 'storyPageTitleTh', type: 'text', defaultValue: 'เนื้อเรื่อง', label: 'Title (TH)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'storyPageSubtitleEn', type: 'text', defaultValue: 'The tale of Arcatéa and The Boundless Spire', label: 'Subtitle (EN)', admin: { width: '50%' } },
            { name: 'storyPageSubtitleTh', type: 'text', defaultValue: 'เรื่องราวแห่งดินแดน Arcatéa และหอคอยไร้ขอบเขต', label: 'Subtitle (TH)', admin: { width: '50%' } },
          ],
        },
        {
          name: 'storySections',
          type: 'array',
          label: 'Story Sections',
          admin: { description: 'Chapters/sections of the story narrative' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'titleEn', type: 'text', required: true, label: 'Title (EN)', admin: { width: '50%' } },
                { name: 'titleTh', type: 'text', required: true, label: 'Title (TH)', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'contentEn', type: 'textarea', required: true, label: 'Content (EN)', admin: { width: '50%' } },
                { name: 'contentTh', type: 'textarea', required: true, label: 'Content (TH)', admin: { width: '50%' } },
              ],
            },
          ],
        },
      ],
    },

    /* ═══════════════════════════════════════════════
       SECTION 6: GAME GUIDE PAGE
       ═══════════════════════════════════════════════ */
    {
      type: 'collapsible',
      label: '6️⃣ Game Guide Page — Hero, Features',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'gameGuideHeroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Game Guide Hero Background',
        },
        {
          type: 'row',
          fields: [
            { name: 'gameGuideBadgeEn', type: 'text', defaultValue: 'GAME GUIDE', label: 'Badge (EN)', admin: { width: '50%' } },
            { name: 'gameGuideBadgeTh', type: 'text', defaultValue: 'แนะนำเกม', label: 'Badge (TH)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'gameGuideTitleEn', type: 'text', defaultValue: 'Game Guide', label: 'Title (EN)', admin: { width: '50%' } },
            { name: 'gameGuideTitleTh', type: 'text', defaultValue: 'แนะนำเกม', label: 'Title (TH)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'gameGuideSubtitleEn', type: 'text', defaultValue: 'Experience the new era of Eternal Tower Saga — Switch your weapon, shift the battlefield', label: 'Subtitle (EN)', admin: { width: '50%' } },
            { name: 'gameGuideSubtitleTh', type: 'text', defaultValue: 'สัมผัสประสบการณ์ใหม่ใน Eternal Tower Saga — อาวุธเปลี่ยน เกมเปลี่ยน', label: 'Subtitle (TH)', admin: { width: '50%' } },
          ],
        },
        {
          name: 'gameGuideFeatures',
          type: 'array',
          label: 'Game Guide Feature Items',
          admin: { description: 'Features displayed on the Game Guide page' },
          fields: [
            { name: 'icon', type: 'text', required: true, label: 'Icon (Lucide icon name)', admin: { description: 'e.g. swords, map, castle, shield, sparkles, users' } },
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
  ],
}
