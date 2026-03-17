import type { CollectionConfig } from 'payload'

export const Milestones: CollectionConfig = {
  slug: 'milestones',
  admin: {
    useAsTitle: 'rewardEn',
    description: 'Pre-registration milestone rewards',
    group: 'Game Content',
    defaultColumns: ['threshold', 'rewardEn', 'unlocked', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'threshold',
      type: 'number',
      required: true,
      label: 'Registration Count Threshold',
      admin: { description: 'Number of registrations needed to unlock' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rewardEn',
          type: 'text',
          required: true,
          label: 'Reward (English)',
          admin: { width: '50%' },
        },
        {
          name: 'rewardTh',
          type: 'text',
          required: true,
          label: 'Reward (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'icon',
      type: 'text',
      defaultValue: '🎁',
      label: 'Icon (emoji or URL)',
    },
    {
      name: 'rewardImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Reward Image',
    },
    {
      name: 'unlocked',
      type: 'checkbox',
      defaultValue: false,
      label: 'Unlocked',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
