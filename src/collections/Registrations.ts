import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/lib/cms-access'

export const Registrations: CollectionConfig = {
  slug: 'registrations',
  admin: {
    useAsTitle: 'email',
    description: 'Pre-registration submissions with 2-level referral tracking',
    group: 'Event',
    defaultColumns: ['email', 'platform', 'region', 'referralCode', 'referralLevel1Count', 'referralPoints', 'createdAt'],
  },
  access: {
    read: isAdmin,
    create: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // ── User Info ──────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          unique: true,
          label: 'Email',
          admin: { width: '40%' },
        },
        {
          name: 'platform',
          type: 'select',
          required: true,
          label: 'Platform',
          options: [
            { label: '🍎 iOS', value: 'ios' },
            { label: '🤖 Android', value: 'android' },
            { label: '🖥️ PC', value: 'pc' },
          ],
          admin: { width: '30%' },
        },
        {
          name: 'region',
          type: 'select',
          required: true,
          label: 'Region',
          options: [
            { label: '🇹🇭 Thailand', value: 'th' },
            { label: '🇲🇾 Malaysia', value: 'my' },
            { label: '🇮🇩 Indonesia', value: 'id' },
            { label: '🇵🇭 Philippines', value: 'ph' },
            { label: '🇸🇬 Singapore', value: 'sg' },
          ],
          admin: { width: '30%' },
        },
      ],
    },

    // ── Referral Tracking ──────────────────────────
    {
      type: 'collapsible',
      label: '🔗 Referral Tracking',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'referralCode',
              type: 'text',
              unique: true,
              label: 'Referral Code',
              admin: {
                width: '50%',
                readOnly: true,
                description: 'Auto-generated unique code',
              },
            },
            {
              name: 'referredBy',
              type: 'text',
              label: 'Referred By',
              admin: {
                width: '50%',
                description: 'Code of the person who invited this user',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'referralLevel1Count',
              type: 'number',
              defaultValue: 0,
              label: 'Level 1 Referrals',
              admin: {
                width: '33%',
                readOnly: true,
                description: 'Direct invites',
              },
            },
            {
              name: 'referralLevel2Count',
              type: 'number',
              defaultValue: 0,
              label: 'Level 2 Referrals',
              admin: {
                width: '33%',
                readOnly: true,
                description: 'Invites by Level 1 referrals',
              },
            },
            {
              name: 'referralPoints',
              type: 'number',
              defaultValue: 0,
              label: 'Total Points',
              admin: {
                width: '33%',
                readOnly: true,
                description: 'L1 × pointsLevel1 + L2 × pointsLevel2',
              },
            },
          ],
        },
      ],
    },

    // ── System Data ─────────────────────────────────
    {
      type: 'collapsible',
      label: '⚙️ System Data',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'referralCount',
          type: 'number',
          defaultValue: 0,
          label: 'Referral Count (legacy)',
          admin: {
            readOnly: true,
            description: 'Deprecated — use referralLevel1Count instead',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ipAddress',
              type: 'text',
              label: 'IP Address',
              admin: { readOnly: true, width: '50%' },
            },
            {
              name: 'userAgent',
              type: 'text',
              label: 'User Agent',
              admin: { readOnly: true, width: '50%' },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
