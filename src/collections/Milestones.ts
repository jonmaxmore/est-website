import type { CollectionConfig } from 'payload'

export const Milestones: CollectionConfig = {
  slug: 'milestones',
  admin: {
    useAsTitle: 'rewardEn',
    description: 'Pre-registration milestone rewards — auto lock/unlock based on registration count',
    group: 'Event',
    listSearchableFields: ['rewardEn', 'rewardTh'],
    defaultColumns: ['threshold', 'rewardEn', 'rewardDescriptionEn', 'sortOrder'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'threshold',
      type: 'number',
      required: true,
      label: 'Registration Count Threshold',
      admin: { description: 'Number of registrations needed to unlock this milestone' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rewardEn',
          type: 'text',
          required: true,
          label: 'Reward Title (English)',
          admin: { width: '50%' },
        },
        {
          name: 'rewardTh',
          type: 'text',
          required: true,
          label: 'Reward Title (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rewardDescriptionEn',
          type: 'textarea',
          label: 'Reward Description (English)',
          admin: {
            width: '50%',
            description: 'Detailed reward items — one per line',
          },
        },
        {
          name: 'rewardDescriptionTh',
          type: 'textarea',
          label: 'Reward Description (Thai)',
          admin: {
            width: '50%',
            description: 'รายละเอียดรางวัล — แต่ละบรรทัดเป็นหนึ่งไอเทม',
          },
        },
      ],
    },
    {
      name: 'icon',
      type: 'text',
      defaultValue: '🎁',
      label: 'Icon (emoji fallback)',
      admin: { description: 'Used only when no reward image is uploaded' },
    },
    {
      name: 'rewardImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Reward Image',
      admin: { description: 'Image displayed on the milestone card (recommended: 200×200px)' },
    },
    {
      name: 'lockedImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Locked Image (optional)',
      admin: { description: 'Image shown when milestone is still locked. Falls back to lock icon if empty.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
