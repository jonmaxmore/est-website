import { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  imageURL: '/payload/blocks/hero.jpg',
  imageAltText: 'Hero Section',
  fields: [
    { name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Desktop Background KV', required: true },
    { name: 'mobileCrop', type: 'upload', relationTo: 'media', label: 'Mobile Background KV (Optional Crop)', admin: { position: 'sidebar' } },
    { name: 'backgroundVideo', type: 'upload', relationTo: 'media', label: 'Background Video (Optional)' },
    { name: 'characterOverlay', type: 'upload', relationTo: 'media', label: 'Hero Character Overlay (Transparent PNG)' },
    { name: 'kvLogo', type: 'upload', relationTo: 'media', label: 'Game Logo / KV Typography (Transparent PNG)' },
    { name: 'particlesEnabled', type: 'checkbox', label: 'Enable Floating Particles FX', defaultValue: true },
    { name: 'taglineEn', type: 'text', required: true },
    { name: 'taglineTh', type: 'text', required: true },
    { name: 'ctaTextEn', type: 'text', required: true },
    { name: 'ctaTextTh', type: 'text', required: true },
    { name: 'ctaLink', type: 'text', required: true },
  ]
}

export const WeaponsShowcaseBlock: Block = {
  slug: 'weaponsShowcase',
  imageURL: '/payload/blocks/weapons.jpg',
  imageAltText: 'Weapons Showcase',
  fields: [
    { name: 'titleEn', type: 'text', required: true },
    { name: 'titleTh', type: 'text', required: true },
    { name: 'introEn', type: 'textarea' },
    { name: 'introTh', type: 'textarea' },
  ]
}

export const GameFeaturesBlock: Block = {
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
}

export const NewsTickerBlock: Block = {
  slug: 'newsTicker',
  imageURL: '/payload/blocks/news.jpg',
  imageAltText: 'News Section',
  fields: [
    { name: 'titleEn', type: 'text', required: true },
    { name: 'titleTh', type: 'text', required: true },
    { 
      name: 'featuredArticles', 
      type: 'relationship', 
      relationTo: 'news', 
      hasMany: true, 
      maxRows: 3, 
      label: 'Featured News Pinned Slots (Optional Override)',
      admin: {
        description: 'Select up to 3 specific news articles to feature on the page. If left empty, the latest published news will be used automatically.'
      }
    },
  ]
}

export const GameGuideBlock: Block = {
  slug: 'gameGuide',
  imageURL: '/payload/blocks/guide.jpg',
  imageAltText: 'Game Guide',
  fields: [
    { name: 'badgeEn', type: 'text' },
    { name: 'badgeTh', type: 'text' },
    { name: 'titleEn', type: 'text', required: true },
    { name: 'titleTh', type: 'text', required: true },
    { name: 'introEn', type: 'textarea' },
    { name: 'introTh', type: 'textarea' },
    {
      name: 'cards',
      type: 'array',
      fields: [
        { name: 'icon', type: 'select', options: ['BookOpen', 'Swords', 'Shield', 'Wrench'], defaultValue: 'BookOpen' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'titleEn', type: 'text', required: true },
        { name: 'titleTh', type: 'text', required: true },
        { name: 'descriptionEn', type: 'textarea' },
        { name: 'descriptionTh', type: 'textarea' },
        { name: 'href', type: 'text', required: true, defaultValue: '/guide' },
      ],
    },
  ]
}

export const PageBlocksArray: Block[] = [
  HeroBlock,
  WeaponsShowcaseBlock,
  GameFeaturesBlock,
  NewsTickerBlock,
  GameGuideBlock
]
