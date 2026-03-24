import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  AlignFeature,
  BlockquoteFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  LinkFeature,
  OrderedListFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'titleEn',
    description: 'News articles, updates, and announcements',
    group: 'Content',
    defaultColumns: ['titleEn', 'category', 'publishedAt', 'status'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'titleEn',
          type: 'text',
          required: true,
          label: 'Title (English)',
          admin: { width: '50%' },
        },
        {
          name: 'titleTh',
          type: 'text',
          required: true,
          label: 'Title (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL-friendly slug (auto-generated from title)' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Event', value: 'event' },
        { label: 'Update', value: 'update' },
        { label: 'Media', value: 'media' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Announcement', value: 'announcement' },
      ],
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
    },
    {
      name: 'emoji',
      type: 'text',
      label: 'Emoji Icon',
      defaultValue: '📰',
      admin: { description: 'Displayed as fallback when no featured image' },
    },
    {
      name: 'contentEn',
      type: 'richText',
      label: 'Content (English)',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          AlignFeature(),
          BlockquoteFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
          HorizontalRuleFeature(),
          IndentFeature(),
          LinkFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: 'caption',
                    type: 'text',
                  },
                ],
              },
            },
          }),
        ],
      }),
    },
    {
      name: 'contentTh',
      type: 'richText',
      label: 'Content (Thai)',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          AlignFeature(),
          BlockquoteFeature(),
          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
          HorizontalRuleFeature(),
          IndentFeature(),
          LinkFeature(),
          OrderedListFeature(),
          UnorderedListFeature(),
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: 'caption',
                    type: 'text',
                  },
                ],
              },
            },
          }),
        ],
      }),
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publish Date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
}
