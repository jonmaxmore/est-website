import type { CollectionConfig } from 'payload'

export const Registrations: CollectionConfig = {
  slug: 'registrations',
  admin: {
    useAsTitle: 'email',
    description: 'Pre-registration submissions with 2-level referral tracking',
    group: 'Data',
    defaultColumns: ['email', 'platform', 'region', 'referralCode', 'referralLevel1Count', 'referralPoints', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: () => true,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'platform',
      type: 'select',
      required: true,
      options: [
        { label: 'iOS', value: 'ios' },
        { label: 'Android', value: 'android' },
        { label: 'PC', value: 'pc' },
      ],
    },
    {
      name: 'region',
      type: 'select',
      required: true,
      options: [
        { label: 'Thailand', value: 'th' },
        { label: 'Malaysia', value: 'my' },
        { label: 'Indonesia', value: 'id' },
        { label: 'Philippines', value: 'ph' },
        { label: 'Singapore', value: 'sg' },
      ],
    },
    {
      name: 'referralCode',
      type: 'text',
      unique: true,
      label: 'Referral Code',
      admin: { description: 'Auto-generated unique referral code for this user' },
    },
    {
      name: 'referredBy',
      type: 'text',
      label: 'Referred By (code)',
      admin: { description: 'The referral code of the person who invited this user (Level 1 parent)' },
    },
    // ── 2-Level Referral Tracking ──
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
            description: 'Invites by your Level 1 referrals',
          },
        },
        {
          name: 'referralPoints',
          type: 'number',
          defaultValue: 0,
          label: 'Total Referral Points',
          admin: {
            width: '33%',
            description: 'L1 × pointsLevel1 + L2 × pointsLevel2',
          },
        },
      ],
    },
    // Legacy field — kept for backward compat
    {
      name: 'referralCount',
      type: 'number',
      defaultValue: 0,
      label: 'Referral Count (legacy)',
      admin: { description: 'Deprecated — use referralLevel1Count instead' },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
