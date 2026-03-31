export const NEWS_CATEGORY_META = {
  event: {
    color: '#F5A623',
    labelEn: 'Event',
    labelTh: 'กิจกรรม',
  },
  update: {
    color: '#5BC0EB',
    labelEn: 'Update',
    labelTh: 'อัปเดต',
  },
  media: {
    color: '#9B59B6',
    labelEn: 'Media',
    labelTh: 'สื่อ',
  },
  announcement: {
    color: '#2ECC71',
    labelEn: 'Announcement',
    labelTh: 'ประกาศ',
  },
  maintenance: {
    color: '#E66A6A',
    labelEn: 'Maintenance',
    labelTh: 'บำรุงรักษา',
  },
} as const;

export const NEWS_FILTERS = [
  { key: 'all', labelEn: 'All', labelTh: 'ทั้งหมด' },
  { key: 'event', labelEn: 'Events', labelTh: 'กิจกรรม' },
  { key: 'update', labelEn: 'Updates', labelTh: 'อัปเดต' },
  { key: 'media', labelEn: 'Media', labelTh: 'สื่อ' },
  { key: 'announcement', labelEn: 'Announcements', labelTh: 'ประกาศ' },
  { key: 'maintenance', labelEn: 'Maintenance', labelTh: 'บำรุงรักษา' },
] as const;

export type NewsFilterKey = (typeof NEWS_FILTERS)[number]['key'];
export type NewsCategoryKey = keyof typeof NEWS_CATEGORY_META;
