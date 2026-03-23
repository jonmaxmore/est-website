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
      type: 'text',
      label: 'Device Type',
      defaultValue: 'desktop',
      index: true,
      admin: { description: 'Detected from user-agent: desktop, mobile, or tablet' },
    },

    // ─── Enhanced fields (Sprint 1) ───
    { name: 'visitorId', type: 'text', index: true, label: 'Visitor ID' },
    { name: 'browser', type: 'text', index: true, label: 'Browser' },
    { name: 'browserVersion', type: 'text', label: 'Browser Version' },
    { name: 'os', type: 'text', index: true, label: 'Operating System' },
    { name: 'osVersion', type: 'text', label: 'OS Version' },
    { name: 'screenWidth', type: 'number', label: 'Screen Width' },
    { name: 'screenHeight', type: 'number', label: 'Screen Height' },
    { name: 'country', type: 'text', index: true, label: 'Country Code' },
    {
      name: 'channel',
      type: 'select',
      index: true,
      label: 'Traffic Channel',
      options: [
        { label: 'Direct', value: 'direct' },
        { label: 'Organic Search', value: 'organic' },
        { label: 'Social', value: 'social' },
        { label: 'Referral', value: 'referral' },
        { label: 'Paid Search', value: 'paid_search' },
        { label: 'Paid Social', value: 'paid_social' },
        { label: 'Email', value: 'email' },
        { label: 'Display', value: 'display' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'utmSource', type: 'text', index: true, label: 'UTM Source' },
    { name: 'utmMedium', type: 'text', label: 'UTM Medium' },
    { name: 'utmCampaign', type: 'text', index: true, label: 'UTM Campaign' },
    { name: 'utmTerm', type: 'text', label: 'UTM Term' },
    { name: 'utmContent', type: 'text', label: 'UTM Content' },
  ],
  timestamps: true,
}
