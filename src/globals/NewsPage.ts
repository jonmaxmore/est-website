import type { GlobalConfig } from 'payload'
import { allowPublicRead, isAdminOrEditor } from '@/lib/cms-access'
import { SEOGroup } from '../fields/SEOGroup'


export const NewsPage: GlobalConfig = {
  slug: 'news-page',
  admin: {
    description: 'Manage News page hero copy, archive copy, and background media',
    group: 'Pages',
  },
  access: {
    read: allowPublicRead,
    update: isAdminOrEditor,
  },
  fields: [
    SEOGroup,
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Background Image',
    },
    {
      type: 'row',
      fields: [
        { name: 'badgeEn', type: 'text', label: 'Badge (EN)', defaultValue: 'Latest updates', admin: { width: '50%' } },
        { name: 'badgeTh', type: 'text', label: 'Badge (TH)', defaultValue: 'อัปเดตล่าสุด', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'titleEn', type: 'text', label: 'Title (EN)', defaultValue: 'News and announcements', admin: { width: '50%' } },
        { name: 'titleTh', type: 'text', label: 'Title (TH)', defaultValue: 'ข่าวสารและประกาศ', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtitleEn', type: 'textarea', label: 'Subtitle (EN)', admin: { width: '50%' } },
        { name: 'subtitleTh', type: 'textarea', label: 'Subtitle (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'archiveKickerEn', type: 'text', label: 'Archive Kicker (EN)', admin: { width: '33%' } },
        { name: 'archiveKickerTh', type: 'text', label: 'Archive Kicker (TH)', admin: { width: '33%' } },
        { name: 'archiveTitleEn', type: 'text', label: 'Archive Title (EN)', admin: { width: '34%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'archiveTitleTh', type: 'text', label: 'Archive Title (TH)', admin: { width: '50%' } },
        { name: 'archiveIntroEn', type: 'textarea', label: 'Archive Intro (EN)', admin: { width: '25%' } },
        { name: 'archiveIntroTh', type: 'textarea', label: 'Archive Intro (TH)', admin: { width: '25%' } },
      ],
    },
  ],
}
