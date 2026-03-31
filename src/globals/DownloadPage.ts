import type { GlobalConfig } from 'payload'
import { allowPublicRead, isAdminOrEditor } from '@/lib/cms-access'

export const DownloadPage: GlobalConfig = {
  slug: 'download-page',
  admin: {
    description: 'Manage Download page — hero copy, CTA text, and system requirements',
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
        { name: 'badgeEn', type: 'text', defaultValue: 'DOWNLOAD', label: 'Badge (EN)', admin: { width: '50%' } },
        { name: 'badgeTh', type: 'text', defaultValue: 'ดาวน์โหลด', label: 'Badge (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'titleEn', type: 'text', defaultValue: 'Download', label: 'Title (EN)', admin: { width: '50%' } },
        { name: 'titleTh', type: 'text', defaultValue: 'ดาวน์โหลด', label: 'Title (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtitleEn', type: 'text', defaultValue: 'Choose your platform and start your adventure', label: 'Subtitle (EN)', admin: { width: '50%' } },
        { name: 'subtitleTh', type: 'text', defaultValue: 'เลือกแพลตฟอร์มของคุณ แล้วเริ่มผจญภัยได้เลย', label: 'Subtitle (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'ctaCopyEn', type: 'textarea', defaultValue: 'Game not out yet? Pre-register first to lock in your launch rewards.', label: 'CTA Copy (EN)', admin: { width: '50%' } },
        { name: 'ctaCopyTh', type: 'textarea', defaultValue: 'เกมยังไม่เปิดให้ดาวน์โหลด? ลงทะเบียนล่วงหน้าเพื่อรับรางวัลพิเศษ!', label: 'CTA Copy (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'ctaButtonEn', type: 'text', defaultValue: 'Pre-register now', label: 'CTA Button (EN)', admin: { width: '50%' } },
        { name: 'ctaButtonTh', type: 'text', defaultValue: 'ลงทะเบียนล่วงหน้า', label: 'CTA Button (TH)', admin: { width: '50%' } },
      ],
    },
  ],
}
