import type { GlobalConfig } from 'payload'
import { allowPublicRead, isAdminOrEditor } from '@/lib/cms-access'

export const GameGuidePage: GlobalConfig = {
  slug: 'game-guide-page',
  admin: {
    description: 'Manage Game Guide page - hero, narrative copy, and feature items',
    group: 'Pages',
  },
  access: {
    read: allowPublicRead,
    update: isAdminOrEditor,
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
        { name: 'subtitleEn', type: 'text', defaultValue: 'A practical guide to Eternal Tower Saga, from weapon choice to the systems that shape each fight', label: 'Subtitle (EN)', admin: { width: '50%' } },
        { name: 'subtitleTh', type: 'text', defaultValue: 'สัมผัสประสบการณ์ใหม่ใน Eternal Tower Saga - อาวุธเปลี่ยน เกมเปลี่ยน', label: 'Subtitle (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'heroPanelLabelEn', type: 'text', label: 'Hero Panel Label (EN)', admin: { width: '50%' } },
        { name: 'heroPanelLabelTh', type: 'text', label: 'Hero Panel Label (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'heroPanelCopyEn', type: 'textarea', label: 'Hero Panel Copy (EN)', admin: { width: '50%' } },
        { name: 'heroPanelCopyTh', type: 'textarea', label: 'Hero Panel Copy (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'systemsBadgeEn', type: 'text', label: 'Systems Badge (EN)', admin: { width: '50%' } },
        { name: 'systemsBadgeTh', type: 'text', label: 'Systems Badge (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'systemsTitleEn', type: 'text', label: 'Systems Title (EN)', admin: { width: '50%' } },
        { name: 'systemsTitleTh', type: 'text', label: 'Systems Title (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'systemsCopyEn', type: 'textarea', label: 'Systems Intro Copy (EN)', admin: { width: '50%' } },
        { name: 'systemsCopyTh', type: 'textarea', label: 'Systems Intro Copy (TH)', admin: { width: '50%' } },
      ],
    },
    {
      name: 'systemsBackgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Systems Section Background',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pillarsEn',
          type: 'array',
          label: 'Guide Pillars (EN)',
          admin: { width: '50%' },
          fields: [{ name: 'label', type: 'text', required: true }],
        },
        {
          name: 'pillarsTh',
          type: 'array',
          label: 'Guide Pillars (TH)',
          admin: { width: '50%' },
          fields: [{ name: 'label', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      label: 'Game Guide Feature Items',
      admin: { description: 'Features displayed on the Game Guide page' },
      fields: [
        { name: 'icon', type: 'text', required: true, label: 'Icon (Lucide icon name)', admin: { description: 'e.g. swords, map, castle, shield, sparkles, users' } },
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
}
