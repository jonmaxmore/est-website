import type { GlobalConfig } from 'payload'
import { allowPublicRead, isAdminOrEditor } from '@/lib/cms-access'

export const GalleryPage: GlobalConfig = {
  slug: 'gallery-page',
  admin: {
    description: 'Manage Gallery page — hero copy and tab labels',
    group: 'Pages',
  },
  access: {
    read: allowPublicRead,
    update: isAdminOrEditor,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'badgeEn', type: 'text', defaultValue: 'GALLERY', label: 'Badge (EN)', admin: { width: '50%' } },
        { name: 'badgeTh', type: 'text', defaultValue: 'แกลเลอรี่', label: 'Badge (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'titleEn', type: 'text', defaultValue: 'Gallery', label: 'Title (EN)', admin: { width: '50%' } },
        { name: 'titleTh', type: 'text', defaultValue: 'แกลเลอรี่', label: 'Title (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtitleEn', type: 'text', defaultValue: 'Images and wallpapers from the world of Arcatea', label: 'Subtitle (EN)', admin: { width: '50%' } },
        { name: 'subtitleTh', type: 'text', defaultValue: 'ภาพและวอลเปเปอร์จากโลกของ Arcatea', label: 'Subtitle (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'emptyMessageEn', type: 'text', defaultValue: 'More images coming soon. Stay tuned.', label: 'Empty Message (EN)', admin: { width: '50%' } },
        { name: 'emptyMessageTh', type: 'text', defaultValue: 'ภาพเพิ่มเติมจะอัปเดตเร็ว ๆ นี้ ติดตามข่าวสารไว้ได้เลย', label: 'Empty Message (TH)', admin: { width: '50%' } },
      ],
    },
  ],
}
