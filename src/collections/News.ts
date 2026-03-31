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
import { allowPublicRead, isAdmin, isAdminOrEditor } from '@/lib/cms-access'
import { evaluateNewsHealth } from '@/lib/content-health'
import { sanitizeNewsSlug, summarizeNewsField } from '@/lib/news-content'

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
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data

        const slugSource = typeof data.slug === 'string'
          ? data.slug
          : typeof data.titleEn === 'string'
            ? data.titleEn
            : typeof data.titleTh === 'string'
              ? data.titleTh
              : typeof originalDoc?.slug === 'string'
                ? originalDoc.slug
                : typeof originalDoc?.titleEn === 'string'
                  ? originalDoc.titleEn
                  : typeof originalDoc?.titleTh === 'string'
                    ? originalDoc.titleTh
                    : ''

        const nextSlug = sanitizeNewsSlug(slugSource)
        const nextData = nextSlug
          ? {
              ...data,
              slug: nextSlug,
            }
          : data

        return {
          ...nextData,
          excerptEn: summarizeNewsField(nextData.excerptEn, nextData.contentEn, 180) || nextData.excerptEn,
          excerptTh: summarizeNewsField(nextData.excerptTh, nextData.contentTh, 180) || nextData.excerptTh,
        }
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        if (!data) return data

        const candidate = {
          ...(originalDoc || {}),
          ...data,
        }

        if (candidate.status !== 'published') {
          return data
        }

        const blockingIssues = evaluateNewsHealth(candidate).filter((issue) => issue.severity === 'error')
        if (blockingIssues.length) {
          throw new Error(`Cannot publish article: ${blockingIssues.map((issue) => issue.message).join(' ')}`)
        }

        return data
      },
    ],
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
          name: 'status',
          type: 'select',
          defaultValue: 'draft',
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          label: 'Category',
          options: [
            { label: 'Event', value: 'event' },
            { label: 'Update', value: 'update' },
            { label: 'Media', value: 'media' },
            { label: 'Maintenance', value: 'maintenance' },
            { label: 'Announcement', value: 'announcement' },
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
    {
      type: 'row',
      fields: [
        {
          name: 'excerptEn',
          type: 'textarea',
          label: 'Summary (English)',
          admin: {
            width: '50%',
            description: 'Used on cards and listing pages. Auto-generated from content when left blank.',
          },
        },
        {
          name: 'excerptTh',
          type: 'textarea',
          label: 'Summary (Thai)',
          admin: {
            width: '50%',
            description: 'Used on cards and listing pages. Auto-generated from content when left blank.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Editorial Controls',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'featureOnHome',
              type: 'checkbox',
              label: 'Feature on Home',
              defaultValue: false,
              admin: { width: '20%' },
            },
            {
              name: 'homePriority',
              type: 'number',
              label: 'Home Priority',
              defaultValue: 0,
              admin: {
                width: '20%',
                description: 'Lower number appears earlier when featured on home.',
              },
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              label: 'Open in New Tab',
              defaultValue: false,
              admin: { width: '20%' },
            },
            {
              name: 'externalUrl',
              type: 'text',
              label: 'External Destination URL',
              admin: {
                width: '40%',
                description: 'Optional: cards can link to an external news source instead of the internal detail page.',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content (English)',
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
          label: 'Content (Thai)',
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
