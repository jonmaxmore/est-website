import type { CollectionConfig } from 'payload'
import { allowPublicRead, isAdmin, isAdminOrEditor } from '@/lib/cms-access'

export const StoreButtons: CollectionConfig = {
  slug: 'store-buttons',
  admin: {
    useAsTitle: 'platform',
    description: 'App store download buttons — iOS, Android, PC, Steam',
    group: 'Event',
    defaultColumns: ['platform', 'label', 'url', 'visible'],
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
          name: 'platform',
          type: 'select',
          required: true,
          label: 'Platform',
          options: [
            { label: '🍎 App Store (iOS)', value: 'ios' },
            { label: '🤖 Google Play', value: 'android' },
            { label: '🖥️ Windows PC', value: 'pc' },
            { label: '🎮 Steam', value: 'steam' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          label: 'Sort Order',
          admin: { width: '33%' },
        },
        {
          name: 'visible',
          type: 'checkbox',
          defaultValue: true,
          label: 'Visible',
          admin: { width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Button Label',
          admin: {
            width: '50%',
            description: 'e.g. "App Store", "Google Play"',
          },
        },
        {
          name: 'sublabel',
          type: 'text',
          label: 'Sub Label',
          admin: {
            width: '50%',
            description: 'e.g. "Pre-order on the", "Register on"',
          },
        },
      ],
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Store URL',
      admin: { description: 'Tracking link (AppsFlyer/Adjust) or direct store URL' },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Custom Icon (optional)',
      admin: { description: 'Overrides default platform icon' },
    },
  ],
}
