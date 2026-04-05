import { GlobalConfig } from 'payload'

export const Maintenance: GlobalConfig = {
  slug: 'maintenance',
  label: {
    en: 'Maintenance Mode',
    th: 'โหมดปิดปรับปรุงระบบ',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Enable Global Maintenance Banner',
      defaultValue: false,
      admin: {
        description: 'When enabled, a maintenance or emergency banner will intercept traffic on the frontend.',
      }
    },
    {
      name: 'bannerType',
      type: 'select',
      label: 'Banner Type',
      options: [
        { label: 'Maintenance Mode (Soft Banner)', value: 'maintenance' },
        { label: 'Emergency Intercept (Hard Lock)', value: 'emergency' },
      ],
      defaultValue: 'maintenance',
      admin: {
        condition: (data) => Boolean(data?.isActive),
      }
    },
    {
      name: 'titleEn',
      type: 'text',
      label: 'Title (English)',
      required: true,
      admin: {
        condition: (data) => Boolean(data?.isActive),
      }
    },
    {
      name: 'titleTh',
      type: 'text',
      label: 'Title (Thai)',
      required: true,
      admin: {
        condition: (data) => Boolean(data?.isActive),
      }
    },
    {
      name: 'messageEn',
      type: 'textarea',
      label: 'Message (English)',
      admin: {
        condition: (data) => Boolean(data?.isActive),
      }
    },
    {
      name: 'messageTh',
      type: 'textarea',
      label: 'Message (Thai)',
      admin: {
        condition: (data) => Boolean(data?.isActive),
      }
    },
    {
      name: 'estimatedEndTime',
      type: 'date',
      label: 'Estimated Completion Time',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        condition: (data) => Boolean(data?.isActive),
      }
    }
  ],
}
