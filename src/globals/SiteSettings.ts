import type { GlobalConfig } from 'payload'
import { allowPublicRead, isAdmin } from '@/lib/cms-access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    description: 'Global website settings - brand, navigation, social links, analytics, and footer content',
    group: 'Settings',
  },
  access: {
    read: allowPublicRead,
    update: isAdmin,
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
      defaultValue: 'Eternal Tower Saga - เกมมือถือ RPG ผจญภัยพร้อมสหายร่วมรบ',
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
      name: 'registrationUrl',
      type: 'text',
      label: 'Primary Registration URL',
      defaultValue: '/event',
      admin: {
        description: 'Primary CTA used in the navigation and shared layout surfaces.',
      },
    },
    {
      name: 'navigationLinks',
      type: 'array',
      label: 'Header Navigation Links',
      admin: {
        description: 'Editable top navigation for the website. Order here is the render order.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'labelEn', type: 'text', required: true, admin: { width: '25%' } },
            { name: 'labelTh', type: 'text', required: true, admin: { width: '25%' } },
            { name: 'href', type: 'text', required: true, admin: { width: '25%' } },
            { name: 'sectionId', type: 'text', admin: { width: '15%', description: 'Optional homepage section id for smooth scroll' } },
            { name: 'visible', type: 'checkbox', defaultValue: true, admin: { width: '10%' } },
          ],
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Open in New Tab',
          defaultValue: false,
        },
      ],
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
        { name: 'gaId', type: 'text', label: 'Google Analytics 4 ID', admin: { description: 'e.g. G-XXXXXXXXXX', width: '50%' } },
        { name: 'metaPixelId', type: 'text', label: 'Meta (Facebook) Pixel ID', admin: { width: '50%' } },
        { name: 'gtmId', type: 'text', label: 'Google Tag Manager ID', admin: { width: '50%' } },
        { name: 'adjustAppToken', type: 'text', label: 'Adjust App Token', admin: { description: 'From Adjust dashboard', width: '50%' } },
        {
          name: 'adjustEnvironment',
          type: 'select',
          label: 'Adjust Environment',
          defaultValue: 'production',
          options: [
            { label: 'Production', value: 'production' },
            { label: 'Sandbox', value: 'sandbox' },
          ],
          admin: { width: '50%' },
        },
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
        {
          type: 'row',
          fields: [
            { name: 'brandCopyEn', type: 'textarea', admin: { width: '50%' } },
            { name: 'brandCopyTh', type: 'textarea', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'platformsLabelEn', type: 'text', admin: { width: '50%' } },
            { name: 'platformsLabelTh', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          name: 'groups',
          type: 'array',
          label: 'Footer Link Groups',
          admin: {
            description: 'Editable footer columns, including optional description text per group.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'titleEn', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'titleTh', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'descriptionEn', type: 'textarea', admin: { width: '50%' } },
                { name: 'descriptionTh', type: 'textarea', admin: { width: '50%' } },
              ],
            },
            {
              name: 'links',
              type: 'array',
              label: 'Links',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'labelEn', type: 'text', required: true, admin: { width: '30%' } },
                    { name: 'labelTh', type: 'text', required: true, admin: { width: '30%' } },
                    { name: 'href', type: 'text', required: true, admin: { width: '30%' } },
                    { name: 'openInNewTab', type: 'checkbox', defaultValue: false, admin: { width: '10%' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
