import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'Admin users who can manage website content',
    group: 'System',
    defaultColumns: ['email', 'role', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: '👑 Admin', value: 'admin' },
        { label: '✏️ Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
      label: 'Role',
      admin: {
        description: 'Admin: full access | Editor: content management only',
      },
    },
  ],
}
