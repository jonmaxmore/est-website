import type { CollectionConfig } from 'payload'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    useAsTitle: 'title',
    description: 'Gallery images — screenshots, wallpapers, concept art',
    group: 'Content',
    defaultColumns: ['title', 'category', 'image', 'order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Image Title',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Category',
      defaultValue: 'screenshots',
      options: [
        { label: 'Screenshots', value: 'screenshots' },
        { label: 'Wallpapers', value: 'wallpapers' },
        { label: 'Concept Art', value: 'concept' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Image',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display Order',
      admin: { description: 'Lower numbers appear first' },
    },
  ],
}
