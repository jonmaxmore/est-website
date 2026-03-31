import type { CollectionConfig } from 'payload'
import path from 'path'
import { allowPublicRead, isAdmin, isAdminOrEditor } from '@/lib/cms-access'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: path.resolve(process.cwd(), 'public/media'),
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 432, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/*'],
  },
  admin: {
    useAsTitle: 'alt',
    description: 'Upload and manage all website images and videos',
    group: 'System',
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
          name: 'alt',
          type: 'text',
          required: true,
          label: 'Alt Text (SEO)',
          admin: {
            width: '50%',
            description: 'Descriptive text for accessibility and search engines',
          },
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
          admin: {
            width: '50%',
            description: 'Optional caption displayed below the image',
          },
        },
      ],
    },
  ],
}
