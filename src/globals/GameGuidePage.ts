import type { GlobalConfig } from 'payload'

export const GameGuidePage: GlobalConfig = {
  slug: 'game-guide-page',
  admin: {
    description: 'Manage Game Guide page — Hero banner, feature items',
    group: 'Pages',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Game Guide Hero Background',
    },
    {
      type: 'row',
      fields: [
        { name: 'badgeEn', type: 'text', defaultValue: 'GAME GUIDE', label: 'Badge (EN)', admin: { width: '50%' } },
        { name: 'badgeTh', type: 'text', defaultValue: 'แนะนำเกม', label: 'Badge (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'titleEn', type: 'text', defaultValue: 'Game Guide', label: 'Title (EN)', admin: { width: '50%' } },
        { name: 'titleTh', type: 'text', defaultValue: 'แนะนำเกม', label: 'Title (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtitleEn', type: 'text', defaultValue: 'Experience the new era of Eternal Tower Saga — Switch your weapon, shift the battlefield', label: 'Subtitle (EN)', admin: { width: '50%' } },
        { name: 'subtitleTh', type: 'text', defaultValue: 'สัมผัสประสบการณ์ใหม่ใน Eternal Tower Saga — อาวุธเปลี่ยน เกมเปลี่ยน', label: 'Subtitle (TH)', admin: { width: '50%' } },
      ],
    },
    {
      name: 'features',
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
}
