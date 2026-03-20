import type { GlobalConfig } from 'payload'

export const EventConfig: GlobalConfig = {
  slug: 'event-config',
  admin: {
    description: 'Pre-registration event settings — countdown, registration toggle',
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user,
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
      type: 'row',
      fields: [
        { name: 'ctaButtonEn', type: 'text', defaultValue: 'Pre-Register Now', label: 'CTA Button (English)', admin: { width: '50%' } },
        { name: 'ctaButtonTh', type: 'text', defaultValue: 'ลงทะเบียนล่วงหน้าเลย', label: 'CTA Button (Thai)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'modalTitleEn', type: 'text', defaultValue: 'Pre-Register', label: 'Modal Title (English)', admin: { width: '50%' } },
        { name: 'modalTitleTh', type: 'text', defaultValue: 'ลงทะเบียนล่วงหน้า', label: 'Modal Title (Thai)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'emailPlaceholderEn', type: 'text', defaultValue: 'Enter your email', label: 'Email Placeholder (EN)', admin: { width: '50%' } },
        { name: 'emailPlaceholderTh', type: 'text', defaultValue: 'กรอก Email ของท่าน', label: 'Email Placeholder (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'storeLabelEn', type: 'text', defaultValue: 'Choose your store', label: 'Store Label (EN)', admin: { width: '50%' } },
        { name: 'storeLabelTh', type: 'text', defaultValue: 'เลือกสโตร์ที่ต้องการ', label: 'Store Label (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'submitButtonEn', type: 'text', defaultValue: 'Register & Go to Store', label: 'Submit Button (EN)', admin: { width: '50%' } },
        { name: 'submitButtonTh', type: 'text', defaultValue: 'ลงทะเบียนและไปที่สโตร์', label: 'Submit Button (TH)', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'successTitleEn', type: 'text', defaultValue: 'Registration Successful!', label: 'Success Title (EN)', admin: { width: '50%' } },
        { name: 'successTitleTh', type: 'text', defaultValue: 'ลงทะเบียนสำเร็จ!', label: 'Success Title (TH)', admin: { width: '50%' } },
      ],
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
    // ── Referral Point Settings ──
    {
      type: 'row',
      fields: [
        {
          name: 'pointsLevel1',
          type: 'number',
          defaultValue: 1,
          label: 'Points per Level 1 Referral',
          admin: {
            width: '50%',
            description: 'Points awarded for each direct invite (Level 1)',
          },
        },
        {
          name: 'pointsLevel2',
          type: 'number',
          defaultValue: 0.5,
          label: 'Points per Level 2 Referral',
          admin: {
            width: '50%',
            description: 'Points awarded for each indirect invite (Level 2 — invitee of your invitee)',
          },
        },
      ],
    },
    // ── Store URLs (CMS-managed) ──
    {
      type: 'row',
      fields: [
        {
          name: 'iosStoreUrl',
          type: 'text',
          defaultValue: 'https://apps.apple.com/us/app/eternal-tower-saga/id6756611023',
          label: 'iOS App Store URL',
          admin: { width: '33%' },
        },
        {
          name: 'androidStoreUrl',
          type: 'text',
          defaultValue: 'https://play.google.com/store/apps/details?id=com.ultimategame.eternaltowersaga',
          label: 'Android Play Store URL',
          admin: { width: '33%' },
        },
        {
          name: 'pcStoreUrl',
          type: 'text',
          defaultValue: '#',
          label: 'PC Store URL',
          admin: {
            width: '33%',
            description: 'Set "#" if PC not yet available',
          },
        },
      ],
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
