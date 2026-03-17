import type { CollectionConfig } from 'payload'

export const Characters: CollectionConfig = {
  slug: 'characters',
  admin: {
    useAsTitle: 'nameEn',
    description: 'Game characters for the character showcase',
    group: 'Game Content',
    defaultColumns: ['nameEn', 'nameTh', 'weaponClass', 'faction', 'sortOrder', 'visible'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'nameEn',
          type: 'text',
          required: true,
          label: 'Name (English)',
          admin: { width: '50%' },
        },
        {
          name: 'nameTh',
          type: 'text',
          required: true,
          label: 'Name (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'classEn',
          type: 'text',
          required: true,
          label: 'Class (English)',
          admin: { width: '50%' },
        },
        {
          name: 'classTh',
          type: 'text',
          required: true,
          label: 'Class (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'weaponClass',
      type: 'select',
      required: true,
      label: 'Weapon Class',
      options: [
        { label: 'Sword', value: 'SWORD' },
        { label: 'Bow', value: 'BOW' },
        { label: 'Crystal Orb', value: 'CRYSTAL_ORB' },
        { label: 'Wand', value: 'WAND' },
        { label: 'Axe', value: 'AXE' },
        { label: 'Spear', value: 'SPEAR' },
      ],
    },
    {
      name: 'faction',
      type: 'select',
      required: true,
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Nature', value: 'nature' },
        { label: 'Water', value: 'water' },
        { label: 'Fire', value: 'fire' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'descriptionEn',
          type: 'textarea',
          label: 'Description (English)',
          admin: { width: '50%' },
        },
        {
          name: 'descriptionTh',
          type: 'textarea',
          label: 'Description (Thai)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      label: 'Character Portrait',
    },
    {
      name: 'accentColor',
      type: 'text',
      label: 'Accent Color (hex)',
      defaultValue: '#FFD700',
      admin: { description: 'Used for character glow and UI accents' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower number = appears first' },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Visible on Website',
    },
  ],
}
