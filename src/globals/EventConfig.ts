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
          name: 'countMultiplier',
          type: 'number',
          defaultValue: 1,
          label: 'Count Multiplier',
          admin: {
            width: '33%',
            description: 'Multiply real registration count (e.g. 2 = double). Set to 1 for real count.',
          },
        },
        {
          name: 'countOffset',
          type: 'number',
          defaultValue: 0,
          label: 'Count Offset',
          admin: {
            width: '33%',
            description: 'Add this number to the multiplied count. Set to 0 for no offset.',
          },
        },
        {
          name: 'countOverride',
          type: 'number',
          label: 'Count Override (optional)',
          admin: {
            width: '33%',
            description: 'If set, this exact number will be displayed instead of the calculated count. Leave blank to use formula.',
          },
        },
      ],
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
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Event Hero Image (optional)',
      admin: { description: 'Displayed in the event hero section' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'badgeTextEn',
          type: 'text',
          defaultValue: 'PRE-REGISTER',
          label: 'Badge Text (English)',
          admin: { width: '50%' },
        },
        {
          name: 'badgeTextTh',
          type: 'text',
          defaultValue: 'ลงทะเบียนล่วงหน้า',
          label: 'Badge Text (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'milestoneBadgeEn',
          type: 'text',
          defaultValue: 'MILESTONE REWARDS',
          label: 'Milestone Badge (English)',
          admin: { width: '50%' },
        },
        {
          name: 'milestoneBadgeTh',
          type: 'text',
          defaultValue: 'รางวัลสะสม',
          label: 'Milestone Badge (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'milestoneTitleEn',
          type: 'text',
          defaultValue: 'Milestone Rewards',
          label: 'Milestone Title (English)',
          admin: { width: '50%' },
        },
        {
          name: 'milestoneTitleTh',
          type: 'text',
          defaultValue: 'รางวัลสะสม Pre-Register',
          label: 'Milestone Title (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'footerText',
      type: 'text',
      defaultValue: '© 2026 Eternal Tower Saga. All rights reserved.',
      label: 'Footer Text',
    },
    {
      name: 'contentSections',
      type: 'array',
      label: 'Content Sections',
      admin: { description: 'Flexible content blocks — text or image' },
      fields: [
        {
          name: 'contentType',
          type: 'select',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Image', value: 'image' },
          ],
          defaultValue: 'text',
          label: 'Content Type',
        },
        {
          type: 'row',
          fields: [
            { name: 'textEn', type: 'textarea', label: 'Text (English)', admin: { width: '50%', condition: (_, siblingData) => siblingData?.contentType === 'text' } },
            { name: 'textTh', type: 'textarea', label: 'Text (Thai)', admin: { width: '50%', condition: (_, siblingData) => siblingData?.contentType === 'text' } },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Image',
          admin: { condition: (_, siblingData) => siblingData?.contentType === 'image' },
        },
      ],
    },
  ],
}
