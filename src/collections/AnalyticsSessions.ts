import type { CollectionConfig } from 'payload'

export const AnalyticsSessions: CollectionConfig = {
  slug: 'analytics-sessions',
  admin: {
    group: 'Analytics',
    description: 'Session-level analytics — one row per visitor session with engagement metrics',
    useAsTitle: 'visitorId',
    defaultColumns: ['visitorId', 'landingPage', 'channel', 'device', 'pageCount', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: () => true,
    update: () => true, // Track endpoint updates session on subsequent pageviews
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    // ─── Session Identity ───
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Session ID',
    },
    {
      name: 'visitorId',
      type: 'text',
      index: true,
      label: 'Visitor ID',
      admin: { description: 'Persistent visitor fingerprint (localStorage-based)' },
    },

    // ─── Acquisition ───
    {
      name: 'landingPage',
      type: 'text',
      index: true,
      label: 'Landing Page',
    },
    {
      name: 'referrer',
      type: 'text',
      label: 'Referrer URL',
    },
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
      defaultValue: 'direct',
    },

    // ─── UTM Parameters ───
    { name: 'utmSource', type: 'text', index: true, label: 'UTM Source' },
    { name: 'utmMedium', type: 'text', index: true, label: 'UTM Medium' },
    { name: 'utmCampaign', type: 'text', index: true, label: 'UTM Campaign' },
    { name: 'utmTerm', type: 'text', label: 'UTM Term' },
    { name: 'utmContent', type: 'text', label: 'UTM Content' },

    // ─── Technology ───
    {
      name: 'device',
      type: 'select',
      index: true,
      label: 'Device Type',
      options: [
        { label: 'Desktop', value: 'desktop' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Tablet', value: 'tablet' },
      ],
      defaultValue: 'desktop',
    },
    { name: 'browser', type: 'text', index: true, label: 'Browser' },
    { name: 'browserVersion', type: 'text', label: 'Browser Version' },
    { name: 'os', type: 'text', index: true, label: 'Operating System' },
    { name: 'osVersion', type: 'text', label: 'OS Version' },
    { name: 'screenWidth', type: 'number', label: 'Screen Width' },
    { name: 'screenHeight', type: 'number', label: 'Screen Height' },

    // ─── Geography ───
    { name: 'country', type: 'text', index: true, label: 'Country Code' },
    { name: 'language', type: 'text', label: 'Browser Language' },

    // ─── Engagement ───
    {
      name: 'pageCount',
      type: 'number',
      defaultValue: 1,
      label: 'Pages Viewed',
      admin: { description: 'Total pages viewed in this session' },
    },
    {
      name: 'eventCount',
      type: 'number',
      defaultValue: 0,
      label: 'Events Fired',
    },
    {
      name: 'duration',
      type: 'number',
      defaultValue: 0,
      label: 'Duration (seconds)',
      admin: { description: 'Total session duration in seconds' },
    },
    {
      name: 'maxScrollDepth',
      type: 'number',
      defaultValue: 0,
      label: 'Max Scroll Depth (%)',
    },
    {
      name: 'exitPage',
      type: 'text',
      label: 'Exit Page',
    },
    {
      name: 'isBounce',
      type: 'checkbox',
      defaultValue: true,
      label: 'Bounce',
      admin: { description: 'true if only 1 page viewed' },
    },
    {
      name: 'isConverted',
      type: 'checkbox',
      defaultValue: false,
      label: 'Converted',
      admin: { description: 'true if session triggered a conversion event (e.g. registration)' },
    },

    // ─── IP (for geo-lookup, not displayed) ───
    { name: 'ip', type: 'text', label: 'IP Address' },
  ],
  timestamps: true,
}
