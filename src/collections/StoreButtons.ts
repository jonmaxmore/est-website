import type { CollectionConfig } from 'payload'

export const StoreButtons: CollectionConfig = {
  slug: 'store-buttons',
  admin: {
    useAsTitle: 'platform',
    description: 'App store download buttons',
    group: 'Content',
    defaultColumns: ['platform', 'label', 'url', 'visible'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'platform',
      type: 'select',
      required: true,
      options: [
        { label: 'App Store (iOS)', value: 'ios' },
        { label: 'Google Play', value: 'android' },
        { label: 'Windows PC', value: 'pc' },
        { label: 'Steam', value: 'steam' },
      ],
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Button Label',
      admin: { description: 'e.g. "App Store", "Google Play"' },
    },
    {
      name: 'sublabel',
      type: 'text',
      label: 'Sub Label',
      admin: { description: 'e.g. "Pre-order on the", "PRE-REGISTER ON"' },
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
      label: 'Custom Icon',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
