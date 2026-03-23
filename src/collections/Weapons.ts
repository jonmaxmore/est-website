import { CollectionConfig } from 'payload'

export const Weapons: CollectionConfig = {
  slug: 'weapons',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sortOrder', 'visible', 'updatedAt'],
  },
  access: {
    read: () => true,
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
      name: 'videoType',
      type: 'select',
      options: [
        { label: 'None (ไม่แสดงวิดีโอ)', value: 'none' },
        { label: 'YouTube Video', value: 'youtube' },
        { label: 'Upload MP4', value: 'upload' }
      ],
      defaultValue: 'none',
      label: 'Video Type',
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'YouTube ID or Full URL',
      admin: {
        condition: (data, siblingData) => siblingData.videoType === 'youtube',
        description: 'ตัวอย่าง: https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    },
    {
      name: 'videoUpload',
      type: 'upload',
      relationTo: 'media',
      label: 'Video File Upload',
      admin: {
        condition: (data, siblingData) => siblingData.videoType === 'upload',
        description: 'อัปโหลดไฟล์วิดีโอ (ควรเป็น .mp4)'
      }
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
