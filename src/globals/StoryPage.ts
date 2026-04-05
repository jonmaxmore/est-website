import type { GlobalConfig } from 'payload'
import { allowPublicRead, isAdminOrEditor } from '@/lib/cms-access'
import { SEOGroup } from '../fields/SEOGroup'


export const StoryPage: GlobalConfig = {
  slug: 'story-page',
  admin: {
    description: 'Manage Story page — Hero banner, narrative sections',
    group: 'Pages',
  },
  access: {
    read: allowPublicRead,
    update: isAdminOrEditor,
  },
  fields: [
    SEOGroup,
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Story Page Hero Background',
    },
    {
      type: 'row',
      fields: [
        { name: 'badgeEn', type: 'text', defaultValue: 'LORE', label: 'Badge (EN)', admin: { width: '50%' } },
        { name: 'badgeTh', type: 'text', defaultValue: 'เนื้อเรื่อง', label: 'Badge (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'titleEn', type: 'text', defaultValue: 'Story', label: 'Title (EN)', admin: { width: '50%' } },
        { name: 'titleTh', type: 'text', defaultValue: 'เนื้อเรื่อง', label: 'Title (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtitleEn', type: 'text', defaultValue: 'The tale of Arcatéa and The Boundless Spire', label: 'Subtitle (EN)', admin: { width: '50%' } },
        { name: 'subtitleTh', type: 'text', defaultValue: 'เรื่องราวแห่งดินแดน Arcatéa และหอคอยไร้ขอบเขต', label: 'Subtitle (TH)', admin: { width: '50%' } },
      ],
    },
    {
      name: 'sections',
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
}
