import { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: {
    en: 'Homepage (Page Builder)',
    th: 'หน้าแรก (Page Builder)',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page Blocks (Drag to Reorder)',
      minRows: 1,
      blocks: [
        {
          slug: 'hero',
          imageURL: '/payload/blocks/hero.jpg',
          imageAltText: 'Hero Section',
          fields: [
            { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
            { name: 'backgroundVideo', type: 'upload', relationTo: 'media' },
            { name: 'taglineEn', type: 'text', required: true },
            { name: 'taglineTh', type: 'text', required: true },
            { name: 'ctaTextEn', type: 'text', required: true },
            { name: 'ctaTextTh', type: 'text', required: true },
            { name: 'ctaLink', type: 'text', required: true },
          ]
        },
        {
          slug: 'weaponsShowcase',
          imageURL: '/payload/blocks/weapons.jpg',
          imageAltText: 'Weapons Showcase',
          fields: [
            { name: 'titleEn', type: 'text', required: true },
            { name: 'titleTh', type: 'text', required: true },
            { name: 'introEn', type: 'textarea' },
            { name: 'introTh', type: 'textarea' },
          ]
        },
        {
          slug: 'gameFeatures',
          imageURL: '/payload/blocks/features.jpg',
          imageAltText: 'Game Features',
          fields: [
            { name: 'titleEn', type: 'text', required: true },
            { name: 'titleTh', type: 'text', required: true },
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'icon', type: 'text' },
                { name: 'titleEn', type: 'text' },
                { name: 'titleTh', type: 'text' },
                { name: 'descriptionEn', type: 'textarea' },
                { name: 'descriptionTh', type: 'textarea' },
              ]
            }
          ]
        },
        {
          slug: 'newsTicker',
          imageURL: '/payload/blocks/news.jpg',
          imageAltText: 'News Section',
          fields: [
            { name: 'titleEn', type: 'text', required: true },
            { name: 'titleTh', type: 'text', required: true },
          ]
        }
      ]
    }
  ]
}
