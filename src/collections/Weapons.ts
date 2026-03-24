import type { CollectionConfig } from 'payload'

export const Weapons: CollectionConfig = {
  slug: 'weapons',
  admin: {
    useAsTitle: 'name',
    description: 'Weapons for the Weapon Showcase section on the homepage',
    group: 'Content',
    defaultColumns: ['name', 'sortOrder', 'visible', 'updatedAt'],
  },
  access: {
    read: () => true,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    // ── Basic Info ──────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Weapon Name',
          admin: {
            width: '40%',
            description: 'Internal name: SWORD, BOW, CRYSTAL_ORB, WAND',
          },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          label: 'Sort Order',
          admin: {
            width: '30%',
            description: 'Lower = appears first',
          },
        },
        {
          name: 'visible',
          type: 'checkbox',
          defaultValue: true,
          label: 'Visible on Website',
          admin: { width: '30%' },
        },
      ],
    },

    // ── Descriptions (EN/TH) ───────────────────────
    {
      type: 'collapsible',
      label: '📝 Descriptions',
      admin: { initCollapsed: false },
      fields: [
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
      ],
    },

    // ── Images ──────────────────────────────────────
    {
      type: 'collapsible',
      label: '🖼️ Images',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'portrait',
              type: 'upload',
              relationTo: 'media',
              label: 'Character Portrait',
              admin: {
                width: '50%',
                description: 'Full-body character holding weapon — left 60% of screen',
              },
            },
            {
              name: 'infoImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Weapon Info Image',
              admin: {
                width: '50%',
                description: 'Weapon name/description overlay — bottom-left area',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'backgroundImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Background Image',
              admin: {
                width: '50%',
                description: 'Full-screen background when this weapon is selected',
              },
            },
            {
              name: 'icon',
              type: 'upload',
              relationTo: 'media',
              label: 'Selector Icon',
              admin: {
                width: '50%',
                description: 'Circle icon for weapon tab selector',
              },
            },
          ],
        },
      ],
    },

    // ── Video ───────────────────────────────────────
    {
      type: 'collapsible',
      label: '🎬 Video (Optional)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'videoType',
          type: 'select',
          options: [
            { label: '🚫 None', value: 'none' },
            { label: '▶️ YouTube', value: 'youtube' },
            { label: '📁 Upload MP4', value: 'upload' },
          ],
          defaultValue: 'none',
          label: 'Video Type',
        },
        {
          name: 'videoUrl',
          type: 'text',
          label: 'YouTube URL or Video ID',
          admin: {
            condition: (data, siblingData) => siblingData.videoType === 'youtube',
            description: 'e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
        },
        {
          name: 'videoUpload',
          type: 'upload',
          relationTo: 'media',
          label: 'Video File',
          admin: {
            condition: (data, siblingData) => siblingData.videoType === 'upload',
            description: 'Upload .mp4 file directly',
          },
        },
      ],
    },
  ],
}
