import type { GlobalConfig } from 'payload'

export const HeroSection: GlobalConfig = {
  slug: 'hero-section',
  admin: {
    description: 'Landing page hero section — background, tagline, CTA',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Background Image',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'taglineEn',
          type: 'text',
          defaultValue: 'Adventure together, conquer the tower',
          label: 'Tagline (English)',
          admin: { width: '50%' },
        },
        {
          name: 'taglineTh',
          type: 'text',
          defaultValue: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย',
          label: 'Tagline (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'taglineImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Tagline Image (optional)',
      admin: {
        description: 'Upload an image to replace the text tagline. If set, the image will be displayed instead of the text above.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaTextEn',
          type: 'text',
          defaultValue: 'Pre-Register Now',
          label: 'CTA Button (English)',
          admin: { width: '50%' },
        },
        {
          name: 'ctaTextTh',
          type: 'text',
          defaultValue: 'ลงทะเบียนล่วงหน้าเลย',
          label: 'CTA Button (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'ctaLink',
      type: 'text',
      defaultValue: '/event',
      label: 'CTA Button Link',
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Background Video URL (optional)',
      admin: { description: 'YouTube/Vimeo embed or MP4 URL for hero video background' },
    },
    {
      type: 'group',
      name: 'mercenarySection',
      label: 'Mercenary Companion Section',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'titleEn', type: 'text', defaultValue: 'Mercenary Companion System', admin: { width: '50%' } },
            { name: 'titleTh', type: 'text', defaultValue: 'ระบบเมอร์เซนารี คอมพาเนียน', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'subtitleEn', type: 'text', defaultValue: 'Battle Companions — Not Just Pets', admin: { width: '50%' } },
            { name: 'subtitleTh', type: 'text', defaultValue: 'สหายร่วมรบ — ไม่ใช่แค่สัตว์เลี้ยง', admin: { width: '50%' } },
          ],
        },
        {
          name: 'artImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Mercenary Art Image',
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      label: 'Game Features',
      admin: { description: 'Features displayed in the grid section' },
      fields: [
        { name: 'icon', type: 'text', required: true, label: 'Icon (emoji)' },
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
            { name: 'descriptionEn', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'descriptionTh', type: 'text', required: true, admin: { width: '50%' } },
          ],
        },
      ],
    },
  ],
}
