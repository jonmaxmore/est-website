import type { CollectionConfig } from 'payload'

export const AnalyticsFunnelEvents: CollectionConfig = {
  slug: 'analytics-funnel-events',
  admin: {
    group: 'Analytics',
    description: 'Ordered funnel step events — tracks user journey from landing to conversion',
    useAsTitle: 'step',
    defaultColumns: ['sessionId', 'step', 'stepOrder', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: () => true,
    update: () => false,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      index: true,
      label: 'Session ID',
    },
    {
      name: 'visitorId',
      type: 'text',
      index: true,
      label: 'Visitor ID',
    },
    {
      name: 'step',
      type: 'select',
      required: true,
      index: true,
      label: 'Funnel Step',
      options: [
        { label: '1. Landing', value: 'landing' },
        { label: '2. Page Engagement', value: 'engagement' },
        { label: '3. Event Page Visit', value: 'event_page' },
        { label: '4. Form Interaction', value: 'form_interaction' },
        { label: '5. Registration Complete', value: 'registration' },
        { label: '6. Store Click', value: 'store_click' },
        { label: '7. Referral Share', value: 'referral_share' },
      ],
    },
    {
      name: 'stepOrder',
      type: 'number',
      required: true,
      index: true,
      label: 'Step Order',
      admin: { description: '1-7 matching the funnel step' },
    },
    {
      name: 'path',
      type: 'text',
      label: 'Page Path',
    },
    {
      name: 'metadata',
      type: 'json',
      label: 'Step Metadata',
      admin: { description: 'Additional context for this funnel step' },
    },
  ],
  timestamps: true,
}
