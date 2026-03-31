import type { GlobalConfig } from 'payload'
import { allowPublicRead, isAdminOrEditor } from '@/lib/cms-access'

export const SupportPage: GlobalConfig = {
  slug: 'support-page',
  admin: {
    description: 'Manage Support page — hero copy, support channels, and contact info',
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
        { name: 'badgeEn', type: 'text', defaultValue: 'SUPPORT', label: 'Badge (EN)', admin: { width: '50%' } },
        { name: 'badgeTh', type: 'text', defaultValue: 'ช่วยเหลือ', label: 'Badge (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'titleEn', type: 'text', defaultValue: 'Support Center', label: 'Title (EN)', admin: { width: '50%' } },
        { name: 'titleTh', type: 'text', defaultValue: 'ศูนย์ช่วยเหลือ', label: 'Title (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtitleEn', type: 'text', defaultValue: 'Need help? Our team is here for you.', label: 'Subtitle (EN)', admin: { width: '50%' } },
        { name: 'subtitleTh', type: 'text', defaultValue: 'มีคำถามหรือต้องการความช่วยเหลือ? ทีมงานพร้อมดูแลคุณ', label: 'Subtitle (TH)', admin: { width: '50%' } },
      ],
    },
    {
      name: 'supportEmail',
      type: 'text',
      defaultValue: 'support@eternaltowersaga.com',
      label: 'Support Email Address',
    },
    {
      type: 'row',
      fields: [
        { name: 'contactBadgeEn', type: 'text', defaultValue: 'DIRECT CONTACT', label: 'Contact Badge (EN)', admin: { width: '50%' } },
        { name: 'contactBadgeTh', type: 'text', defaultValue: 'ติดต่อโดยตรง', label: 'Contact Badge (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'contactLabelEn', type: 'text', defaultValue: 'Support team email', label: 'Contact Label (EN)', admin: { width: '50%' } },
        { name: 'contactLabelTh', type: 'text', defaultValue: 'อีเมลทีมซัพพอร์ต', label: 'Contact Label (TH)', admin: { width: '50%' } },
      ],
    },
    {
      name: 'channels',
      type: 'array',
      label: 'Support Channels',
      admin: { description: 'Cards displayed on the support page' },
      fields: [
        { name: 'icon', type: 'text', required: true, label: 'Icon (lucide name)', admin: { description: 'e.g. mail, message-circle, file-question, book-open' } },
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
            { name: 'descEn', type: 'textarea', required: true, label: 'Description (EN)', admin: { width: '50%' } },
            { name: 'descTh', type: 'textarea', required: true, label: 'Description (TH)', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'actionLabelEn', type: 'text', required: true, label: 'Button Label (EN)', admin: { width: '25%' } },
            { name: 'actionLabelTh', type: 'text', required: true, label: 'Button Label (TH)', admin: { width: '25%' } },
            { name: 'actionHref', type: 'text', required: true, label: 'Button URL', admin: { width: '35%' } },
            { name: 'external', type: 'checkbox', label: 'External?', admin: { width: '15%' } },
          ],
        },
      ],
    },
    {
      name: 'infoItems',
      type: 'array',
      label: 'Info Items',
      admin: { description: 'Small info cards at the bottom' },
      fields: [
        { name: 'icon', type: 'text', required: true, label: 'Icon (lucide name)' },
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
            { name: 'descEn', type: 'text', required: true, label: 'Desc (EN)', admin: { width: '50%' } },
            { name: 'descTh', type: 'text', required: true, label: 'Desc (TH)', admin: { width: '50%' } },
          ],
        },
      ],
    },
  ],
}
