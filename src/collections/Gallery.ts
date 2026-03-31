import type { CollectionConfig } from 'payload'
import { allowPublicRead, isAdmin, isAdminOrEditor } from '@/lib/cms-access'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    useAsTitle: 'title',
    description: 'Gallery — screenshots, wallpapers, concept art',
    group: 'Content',
    defaultColumns: ['title', 'category', 'image', 'order'],
  },
  access: {
    read: allowPublicRead,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Image Title',
          admin: { width: '40%' },
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          label: 'Category',
          defaultValue: 'screenshots',
          options: [
            { label: '📸 Screenshots', value: 'screenshots' },
            { label: '🖼️ Wallpapers', value: 'wallpapers' },
            { label: '🎨 Concept Art', value: 'concept' },
          ],
          admin: { width: '30%' },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          label: 'Display Order',
          admin: {
            width: '30%',
            description: 'Lower = appears first',
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Image',
    },
  ],
}
