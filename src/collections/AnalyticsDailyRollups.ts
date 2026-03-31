import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/lib/cms-access'

export const AnalyticsDailyRollups: CollectionConfig = {
  slug: 'analytics-daily-rollups',
  admin: {
    group: 'Analytics',
    description: 'Pre-aggregated daily metrics by dimension — powers the analytics dashboard without scanning raw events',
    useAsTitle: 'date',
    defaultColumns: ['date', 'dimension', 'dimensionValue', 'pageviews', 'sessions'],
  },
  access: {
    read: isAdmin,
    create: () => true,
    update: () => true, // Rollup job upserts
    delete: isAdmin,
  },
  fields: [
    // ─── Time Key ───
    {
      name: 'date',
      type: 'text',
      required: true,
      index: true,
      label: 'Date (YYYY-MM-DD)',
      admin: { description: 'Aggregation date key' },
    },

    // ─── Dimension ───
    {
      name: 'dimension',
      type: 'select',
      required: true,
      index: true,
      label: 'Dimension',
      options: [
        { label: 'Overall', value: 'overall' },
        { label: 'Page Path', value: 'path' },
        { label: 'Channel', value: 'channel' },
        { label: 'Device', value: 'device' },
        { label: 'Browser', value: 'browser' },
        { label: 'OS', value: 'os' },
        { label: 'Country', value: 'country' },
        { label: 'UTM Source', value: 'utm_source' },
        { label: 'UTM Campaign', value: 'utm_campaign' },
        { label: 'Referrer Domain', value: 'referrer_domain' },
      ],
    },
    {
      name: 'dimensionValue',
      type: 'text',
      required: true,
      index: true,
      label: 'Dimension Value',
      admin: { description: 'e.g. "/event", "mobile", "Chrome", "direct"' },
    },

    // ─── Metrics ───
    { name: 'pageviews', type: 'number', defaultValue: 0, label: 'Page Views' },
    { name: 'sessions', type: 'number', defaultValue: 0, label: 'Sessions' },
    { name: 'uniqueVisitors', type: 'number', defaultValue: 0, label: 'Unique Visitors' },
    { name: 'bounces', type: 'number', defaultValue: 0, label: 'Bounces' },
    { name: 'conversions', type: 'number', defaultValue: 0, label: 'Conversions' },
    { name: 'totalEvents', type: 'number', defaultValue: 0, label: 'Total Events' },
    { name: 'totalDuration', type: 'number', defaultValue: 0, label: 'Total Duration (sec)', admin: { description: 'Sum of session durations — divide by sessions for avg' } },
    { name: 'avgScrollDepth', type: 'number', defaultValue: 0, label: 'Avg Scroll Depth (%)' },

    // ─── Compound index key for upsert lookup ───
    {
      name: 'rollupKey',
      type: 'text',
      unique: true,
      index: true,
      label: 'Rollup Key',
      admin: { description: 'Composite key: date|dimension|dimensionValue — for upsert dedup' },
    },
  ],
  timestamps: true,
}
