import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf } from '@/lib/cms-access'

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
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
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
      access: {
        create: isAdmin,
        update: isAdmin,
      },
      admin: {
        description: 'Admin: full access | Editor: content management only',
      },
    },
  ],
}
