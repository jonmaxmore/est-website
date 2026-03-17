import type { GlobalConfig } from 'payload'

export const EventConfig: GlobalConfig = {
  slug: 'event-config',
  admin: {
    description: 'Pre-registration event settings — countdown, registration toggle',
    group: 'Settings',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Event Active',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'titleEn',
          type: 'text',
          defaultValue: 'Pre-Register Now',
          label: 'Event Title (English)',
          admin: { width: '50%' },
        },
        {
          name: 'titleTh',
          type: 'text',
          defaultValue: 'ลงทะเบียนล่วงหน้า',
          label: 'Event Title (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'descriptionEn',
          type: 'textarea',
          label: 'Description (English)',
          admin: { width: '50%' },
        },
        {
          name: 'descriptionTh',
          type: 'textarea',
          label: 'Description (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'countdownTarget',
      type: 'date',
      required: true,
      label: 'Countdown Target Date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'The date/time the countdown counts down to',
      },
    },
    {
      name: 'registrationOpen',
      type: 'checkbox',
      defaultValue: true,
      label: 'Registration Open',
      admin: { description: 'If unchecked, registration form is disabled' },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Event Page Background',
    },
  ],
}
