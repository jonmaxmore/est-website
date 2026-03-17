import type { CollectionConfig } from 'payload'

export const Registrations: CollectionConfig = {
  slug: 'registrations',
  admin: {
    useAsTitle: 'email',
    description: 'Pre-registration submissions',
    group: 'Data',
    defaultColumns: ['email', 'platform', 'region', 'referralCode', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => !!user, // Admin only
    create: () => true, // Public can create (register)
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
        { label: 'Southeast Asia', value: 'sea' },
        { label: 'Global', value: 'global' },
      ],
    },
    {
      name: 'referralCode',
      type: 'text',
      unique: true,
      label: 'Referral Code',
      admin: { description: 'Auto-generated unique referral code' },
    },
    {
      name: 'referredBy',
      type: 'text',
      label: 'Referred By (code)',
    },
    {
      name: 'referralCount',
      type: 'number',
      defaultValue: 0,
      label: 'Referral Count',
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
