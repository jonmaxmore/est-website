import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/lib/cms-access'

export const PageEvents: CollectionConfig = {
  slug: 'page-events',
  admin: {
    group: 'Analytics',
    description: 'Server-side event tracking — button clicks, form submissions, interactions',
    useAsTitle: 'eventName',
    defaultColumns: ['eventName', 'path', 'createdAt'],
  },
  access: {
    read: isAdmin,
    create: () => true, // Allow API to create
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'eventName',
      type: 'text',
      required: true,
      index: true,
      label: 'Event Name',
      admin: { description: 'e.g. store_click, cta_click, registration, referral_copy' },
    },
    {
      name: 'eventData',
      type: 'json',
      label: 'Event Data',
      admin: { description: 'Structured event parameters as JSON' },
    },
    {
      name: 'path',
      type: 'text',
      index: true,
      label: 'Page Path',
    },
    {
      name: 'ip',
      type: 'text',
      label: 'IP Address',
    },
    {
      name: 'sessionId',
      type: 'text',
      label: 'Session ID',
    },
  ],
  timestamps: true,
}
