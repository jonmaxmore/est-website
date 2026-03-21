import type { CollectionConfig } from 'payload'

export const Characters: CollectionConfig = {
  slug: 'characters',
  admin: {
    useAsTitle: 'name',
    description: 'อาวุธในเกม — แต่ละอาวุธใช้ 4 รูป: ตัวละคร, ข้อความ, แบคกราว, ไอคอน',
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
      label: 'Weapon Name (Admin Only)',
      admin: { description: 'ชื่ออาวุธสำหรับจัดการใน CMS เช่น SWORD, BOW, CRYSTAL_ORB, WAND' },
    },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      label: 'Weapon Portrait (60% ของหน้าจอ)',
      admin: { description: 'รูปตัวละครถืออาวุธแบบ full-body — แสดงทางซ้าย 60% ของหน้าจอ' },
    },
    {
      name: 'infoImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Weapon Info Image (ข้อความแนะนำ)',
      admin: { description: 'รูปข้อความอาวุธ เช่น "Weapon: BOW" — แสดงด้านล่างซ้าย' },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image (แบคกราว)',
      admin: { description: 'รูปแบคกราวเต็มจอเมื่อเลือกอาวุธนี้' },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Selector Icon (ไอคอนเปลี่ยนแทป)',
      admin: { description: 'รูปไอคอนวงกลมสำหรับเลือกอาวุธ' },
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
