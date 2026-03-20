import type { CollectionConfig } from 'payload'

export const PageViews: CollectionConfig = {
  slug: 'page-views',
  admin: {
    group: 'Analytics',
    description: 'Server-side page view tracking — real user visits with bot filtering',
    useAsTitle: 'path',
    defaultColumns: ['path', 'ip', 'deviceType', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: () => true, // Allow API to create
    update: () => false,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'path',
      type: 'text',
      required: true,
      index: true,
      label: 'Page Path',
    },
    {
      name: 'ip',
      type: 'text',
      index: true,
      label: 'IP Address',
    },
    {
      name: 'userAgent',
      type: 'text',
      label: 'User Agent',
    },
    {
      name: 'referrer',
      type: 'text',
      label: 'Referrer URL',
    },
    {
      name: 'sessionId',
      type: 'text',
      index: true,
      label: 'Session ID',
    },
    {
      name: 'language',
      type: 'text',
      label: 'Browser Language',
    },
    {
      name: 'deviceType',
      type: 'select',
      label: 'Device Type',
      options: [
        { label: 'Desktop', value: 'desktop' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Tablet', value: 'tablet' },
      ],
      defaultValue: 'desktop',
      index: true,
      admin: { description: 'Detected from user-agent at tracking time' },
    },
  ],
  timestamps: true,
}
