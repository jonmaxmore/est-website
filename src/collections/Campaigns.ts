import { CollectionConfig } from 'payload'
import { PageBlocksArray } from '../blocks/PageBlocks'

export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status'],
  },
  access: {
    read: () => true, // Make publicly readable
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Campaign Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL Slug',
      admin: {
        description: 'e.g. "spring-update". The page will be accessible at /campaign/spring-update',
      }
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO & Meta',
      fields: [
        { name: 'metaTitle', type: 'text', label: 'Meta Title' },
        { name: 'metaDescription', type: 'textarea', label: 'Meta Description' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Open Graph Image (Social Share)' },
      ]
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Campaign Page Layout (Drag to Reorder)',
      minRows: 1,
      blocks: PageBlocksArray
    }
  ]
}
