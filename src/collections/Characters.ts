import type { CollectionConfig } from 'payload'

export const Characters: CollectionConfig = {
  slug: 'characters',
  admin: {
    useAsTitle: 'name',
    description: 'ตัวละครในเกม — อัพโหลดรูปภาพเท่านั้น',
    group: 'Game Content',
    defaultColumns: ['name', 'portrait', 'sortOrder', 'visible'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Character Name (Admin Only)',
      admin: { description: 'ชื่อตัวละครสำหรับจัดการใน CMS' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'descriptionEn',
          type: 'textarea',
          label: 'Description (English)',
          admin: { width: '50%', description: 'Character/weapon description shown on homepage' },
        },
        {
          name: 'descriptionTh',
          type: 'textarea',
          label: 'Description (Thai)',
          admin: { width: '50%', description: 'คำอธิบายตัวละคร/อาวุธที่แสดงหน้าแรก' },
        },
      ],
    },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      label: 'Character Portrait (60% ของหน้าจอ)',
      admin: { description: 'รูปตัวละครแบบ full-body — จะแสดงทางซ้าย 60% ของหน้าจอ' },
    },
    {
      name: 'infoImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Weapon Info Image (ข้อความแนะนำ)',
      admin: { description: 'รูปข้อความอาวุธ เช่น "Weapon: BOW" — จะแสดงทางขวา' },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image (แบคกราว)',
      admin: { description: 'รูปแบคกราวเต็มจอเมื่อเลือกตัวละครนี้' },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Selector Icon (ไอคอนเปลี่ยนแทป)',
      admin: { description: 'รูปไอคอนวงกลมสำหรับเลือกตัวละคร' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'ลำดับ — เลขน้อย = แสดงก่อน' },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Visible on Website',
    },
  ],
}
