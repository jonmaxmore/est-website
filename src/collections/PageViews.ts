import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/lib/cms-access'

export const PageViews: CollectionConfig = {
  slug: 'page-views',
  admin: {
    group: 'Analytics',
    description: 'Server-side page view tracking — real user visits with bot filtering',
    useAsTitle: 'path',
    defaultColumns: ['path', 'ip', 'deviceType', 'createdAt'],
  },
  access: {
    read: isAdmin,
    create: () => true,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    // ── Core Info ───────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'path',
          type: 'text',
          required: true,
          index: true,
          label: 'Page Path',
          admin: { width: '33%', readOnly: true },
        },
        {
          name: 'sessionId',
          type: 'text',
          index: true,
          label: 'Session ID',
          admin: { width: '33%', readOnly: true },
        },
        {
          name: 'visitorId',
          type: 'text',
          index: true,
          label: 'Visitor ID',
          admin: { width: '33%', readOnly: true },
        },
      ],
    },

    // ── Device & Browser ───────────────────────────
    {
      type: 'collapsible',
      label: '📱 Device & Browser',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'deviceType', type: 'text', label: 'Device Type', defaultValue: 'desktop', index: true, admin: { width: '33%', readOnly: true } },
            { name: 'browser', type: 'text', index: true, label: 'Browser', admin: { width: '33%', readOnly: true } },
            { name: 'browserVersion', type: 'text', label: 'Browser Version', admin: { width: '33%', readOnly: true } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'os', type: 'text', index: true, label: 'Operating System', admin: { width: '33%', readOnly: true } },
            { name: 'osVersion', type: 'text', label: 'OS Version', admin: { width: '33%', readOnly: true } },
            { name: 'language', type: 'text', label: 'Browser Language', admin: { width: '33%', readOnly: true } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'screenWidth', type: 'number', label: 'Screen Width', admin: { width: '50%', readOnly: true } },
            { name: 'screenHeight', type: 'number', label: 'Screen Height', admin: { width: '50%', readOnly: true } },
          ],
        },
      ],
    },

    // ── Traffic Source ──────────────────────────────
    {
      type: 'collapsible',
      label: '🔗 Traffic Source',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'referrer', type: 'text', label: 'Referrer URL', admin: { width: '50%', readOnly: true } },
            {
              name: 'channel', type: 'select', index: true, label: 'Traffic Channel',
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
              admin: { width: '50%', readOnly: true },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'utmSource', type: 'text', index: true, label: 'UTM Source', admin: { width: '33%', readOnly: true } },
            { name: 'utmMedium', type: 'text', label: 'UTM Medium', admin: { width: '33%', readOnly: true } },
            { name: 'utmCampaign', type: 'text', index: true, label: 'UTM Campaign', admin: { width: '33%', readOnly: true } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'utmTerm', type: 'text', label: 'UTM Term', admin: { width: '50%', readOnly: true } },
            { name: 'utmContent', type: 'text', label: 'UTM Content', admin: { width: '50%', readOnly: true } },
          ],
        },
      ],
    },

    // ── System ──────────────────────────────────────
    {
      type: 'collapsible',
      label: '⚙️ System',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'ip', type: 'text', index: true, label: 'IP Address', admin: { width: '33%', readOnly: true } },
            { name: 'country', type: 'text', index: true, label: 'Country Code', admin: { width: '33%', readOnly: true } },
            { name: 'userAgent', type: 'text', label: 'User Agent', admin: { width: '33%', readOnly: true } },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
