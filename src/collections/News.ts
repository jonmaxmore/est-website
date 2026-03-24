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

/**
 * Shared Lexical editor config for news content fields.
 * Full-featured WordPress-like editor with fixed toolbar.
 */
const newsEditor = lexicalEditor({
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
})

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
    // ── Sidebar: Publish Settings ──────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'draft',
          label: 'Status',
          options: [
            { label: '📝 Draft', value: 'draft' },
            { label: '✅ Published', value: 'published' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          label: 'Category',
          options: [
            { label: '🎉 Event', value: 'event' },
            { label: '🔄 Update', value: 'update' },
            { label: '📺 Media', value: 'media' },
            { label: '🔧 Maintenance', value: 'maintenance' },
            { label: '📢 Announcement', value: 'announcement' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'publishedAt',
          type: 'date',
          label: 'Publish Date',
          admin: {
            width: '33%',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
      ],
    },

    // ── Titles ──────────────────────────────────────────
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

    // ── Metadata row ────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          label: 'Slug',
          admin: {
            width: '40%',
            description: 'URL-friendly slug (auto-generated from title)',
          },
        },
        {
          name: 'emoji',
          type: 'text',
          label: 'Emoji Icon',
          defaultValue: '📰',
          admin: {
            width: '20%',
            description: 'Fallback when no image',
          },
        },
        {
          name: 'featuredImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Featured Image',
          admin: { width: '40%' },
        },
      ],
    },

    // ── Content Tabs (Full Width) ───────────────────────
    {
      type: 'tabs',
      tabs: [
        {
          label: '🇬🇧 Content (English)',
          fields: [
            {
              name: 'contentEn',
              type: 'richText',
              label: false,
              editor: newsEditor,
            },
          ],
        },
        {
          label: '🇹🇭 Content (Thai)',
          fields: [
            {
              name: 'contentTh',
              type: 'richText',
              label: false,
              editor: newsEditor,
            },
          ],
        },
      ],
    },
  ],
}
