import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    description: 'Global website settings — logo, social links, analytics, SEO defaults',
    group: 'Settings',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Eternal Tower Saga',
      required: true,
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      defaultValue: 'Eternal Tower Saga — เกมมือถือ RPG ผจญภัยพร้อมสหายร่วมรบ',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Site Logo',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: 'Favicon',
    },
    {
      type: 'group',
      name: 'socialLinks',
      label: 'Social Media Links',
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook URL' },
        { name: 'tiktok', type: 'text', label: 'TikTok URL' },
        { name: 'youtube', type: 'text', label: 'YouTube URL' },
        { name: 'discord', type: 'text', label: 'Discord URL' },
        { name: 'twitter', type: 'text', label: 'Twitter/X URL' },
        { name: 'line', type: 'text', label: 'LINE Official URL' },
      ],
    },
    {
      type: 'group',
      name: 'analytics',
      label: 'Analytics & Tracking',
      fields: [
        { name: 'gaId', type: 'text', label: 'Google Analytics 4 ID', admin: { description: 'e.g. G-XXXXXXXXXX' } },
        { name: 'metaPixelId', type: 'text', label: 'Meta (Facebook) Pixel ID' },
        { name: 'gtmId', type: 'text', label: 'Google Tag Manager ID' },
      ],
    },
    {
      type: 'group',
      name: 'seo',
      label: 'Default SEO',
      fields: [
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Default OG Image' },
        { name: 'keywords', type: 'text', label: 'Default Keywords' },
        { name: 'twitterHandle', type: 'text', label: 'Twitter Handle' },
      ],
    },
    {
      type: 'group',
      name: 'footer',
      label: 'Footer Settings',
      fields: [
        { name: 'copyrightText', type: 'text', defaultValue: '© 2026 Eternal Tower Saga. All rights reserved.' },
        { name: 'termsUrl', type: 'text', defaultValue: '/terms' },
        { name: 'privacyUrl', type: 'text', defaultValue: '/privacy' },
        { name: 'supportUrl', type: 'text', defaultValue: '#' },
      ],
    },
  ],
}
