import { Field } from 'payload'

export const SEOGroup: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO & Meta (Optional Override)',
  admin: {
    description: 'Customize the meta tags and social share presentation for this specific page. If left blank, the site-wide global settings will be inherited.'
  },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      label: 'Meta Title',
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'Meta Description',
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Open Graph Image (Social Share Cover)',
    },
  ]
}
