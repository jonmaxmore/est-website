import type { CollectionConfig } from 'payload'
import { allowPublicRead, isAdmin, isAdminOrEditor } from '@/lib/cms-access'

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
    read: allowPublicRead,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    // ── Settings Row ───────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'threshold',
          type: 'number',
          required: true,
          label: 'Registration Threshold',
          admin: {
            width: '40%',
            description: 'Number of registrations needed to unlock',
          },
        },
        {
          name: 'icon',
          type: 'text',
          defaultValue: '🎁',
          label: 'Emoji Fallback',
          admin: {
            width: '20%',
            description: 'Used when no image uploaded',
          },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          label: 'Sort Order',
          admin: {
            width: '40%',
            description: 'Lower = appears first',
          },
        },
      ],
    },

    // ── Reward Info (EN/TH) ────────────────────────
    {
      type: 'collapsible',
      label: '🏆 Reward Info',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'rewardEn',
              type: 'text',
              required: true,
              label: 'Reward Title (EN)',
              admin: { width: '50%' },
            },
            {
              name: 'rewardTh',
              type: 'text',
              required: true,
              label: 'Reward Title (TH)',
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
              label: 'Description (EN)',
              admin: {
                width: '50%',
                description: 'Reward items — one per line',
              },
            },
            {
              name: 'rewardDescriptionTh',
              type: 'textarea',
              label: 'Description (TH)',
              admin: {
                width: '50%',
                description: 'รายละเอียดรางวัล — แต่ละบรรทัดเป็นหนึ่งไอเทม',
              },
            },
          ],
        },
      ],
    },

    // ── Images ──────────────────────────────────────
    {
      type: 'collapsible',
      label: '🖼️ Images',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'rewardImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Reward Image',
              admin: {
                width: '50%',
                description: 'Milestone card image (recommended: 200×200px)',
              },
            },
            {
              name: 'lockedImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Locked Image (optional)',
              admin: {
                width: '50%',
                description: 'Shown when locked. Falls back to lock icon.',
              },
            },
          ],
        },
      ],
    },
  ],
}
