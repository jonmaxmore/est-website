export const DEFAULT_GAME_GUIDE_FEATURES = [
  {
    icon: 'swords',
    titleEn: 'Fast class identity',
    titleTh: 'อาชีพเด่นชัด เล่นแล้วรู้สึกต่าง',
    descriptionEn: 'Choose a battle style that immediately feels distinct, from aggressive frontliners to ranged support and spell-focused roles.',
    descriptionTh: 'เลือกสายการเล่นที่ให้จังหวะต่างกันชัดเจน ตั้งแต่แนวหน้าโจมตีหนัก ไปจนถึงสายสนับสนุนและเวทมนตร์ระยะไกล',
  },
  {
    icon: 'map',
    titleEn: 'Adventure routes that stay readable',
    titleTh: 'เส้นทางผจญภัยที่ตามง่าย',
    descriptionEn: 'Follow campaign chapters, side goals, and progression checkpoints in a structure that keeps new players moving without confusion.',
    descriptionTh: 'เดินตาม chapter ภารกิจเสริม และจุดปลดล็อกต่าง ๆ ได้ง่ายขึ้น ช่วยให้ผู้เล่นใหม่ไม่หลงทิศทางระหว่างเก็บเลเวล',
  },
  {
    icon: 'castle',
    titleEn: 'Tower and dungeon loops',
    titleTh: 'การไต่หอคอยและลงดันเจียน',
    descriptionEn: 'Alternate between story progress, resource runs, and harder tower floors to keep the core progression loop rewarding.',
    descriptionTh: 'สลับระหว่างเนื้อเรื่อง ฟาร์มทรัพยากร และด่านหอคอยที่ยากขึ้น เพื่อให้การเติบโตของตัวละครรู้สึกคุ้มค่าต่อเนื่อง',
  },
  {
    icon: 'shield',
    titleEn: 'Clear gear progression',
    titleTh: 'อัปเกรดอุปกรณ์แบบเข้าใจง่าย',
    descriptionEn: 'Strengthen weapons, armor, and key stats with a progression path that highlights what matters most for your role.',
    descriptionTh: 'อัปเกรดอาวุธ เกราะ และค่าสำคัญตามบทบาทของตัวละครได้ชัดเจนขึ้น ไม่ต้องเดาว่าควรพัฒนาจุดไหนก่อน',
  },
  {
    icon: 'sparkles',
    titleEn: 'Daily systems worth returning to',
    titleTh: 'ระบบประจำวันที่คุ้มกับการกลับมาเล่น',
    descriptionEn: 'Log in for rotating activities, quick tasks, and reward loops that support long-term progression without needless grind.',
    descriptionTh: 'มีกิจกรรมหมุนเวียน ภารกิจสั้น และรางวัลประจำวันที่ช่วยให้ความคืบหน้าต่อเนื่อง โดยไม่ทำให้รู้สึกฝืนฟาร์มเกินไป',
  },
  {
    icon: 'users',
    titleEn: 'Guild and social play',
    titleTh: 'เล่นกับเพื่อนและระบบกิลด์',
    descriptionEn: 'Coordinate for bosses, guild goals, and shared progress so the cooperative side of the game feels meaningful from the start.',
    descriptionTh: 'ร่วมมือกับเพื่อนเพื่อจัดการบอส เป้าหมายกิลด์ และการเติบโตร่วมกัน ทำให้การเล่นแบบทีมมีบทบาทตั้งแต่ช่วงแรกของเกม',
  },
] as const;

export const DEFAULT_GAME_GUIDE_PAGE_COPY = {
  badgeEn: 'GAME GUIDE',
  badgeTh: 'แนะนำเกม',
  titleEn: 'Game Guide',
  titleTh: 'แนะนำเกม',
  subtitleEn:
    'A practical walkthrough of Eternal Tower Saga, with clearer visual examples for the systems players ask about most.',
  subtitleTh:
    'ทำความเข้าใจระบบหลักของ Eternal Tower Saga ได้เร็วขึ้น พร้อมดูภาพตัวอย่างของแต่ละหัวข้อได้ชัดเจนกว่าเดิม',
  heroPanelLabelEn: 'Starter overview',
  heroPanelLabelTh: 'ภาพรวมสำหรับผู้เล่นใหม่',
  heroPanelCopyEn:
    'A cleaner path from your first steps and upgrades into co-op content, arranged so the important parts are easier to grasp.',
  heroPanelCopyTh:
    'เรียงเส้นทางการเล่นตั้งแต่เริ่มต้น เก็บทรัพยากร อัปเกรดอุปกรณ์ ไปจนถึงคอนเทนต์ร่วมทีมในมุมที่ตามได้ง่ายขึ้น',
  systemsBadgeEn: 'Core systems',
  systemsBadgeTh: 'ฟีเจอร์เกม',
  systemsTitleEn: 'Game systems to explore',
  systemsTitleTh: 'ไฮไลท์เกม',
  systemsCopyEn:
    'Pick a topic from the right rail to preview the visual and read a more focused explanation.',
  systemsCopyTh:
    'เลือกหัวข้อด้านขวาเพื่อดูภาพตัวอย่างและคำอธิบายที่เจาะจงขึ้นทางฝั่งซ้าย',
} as const;

export const GAME_GUIDE_PILLARS = {
  th: [
    'เริ่มเล่นได้ไวด้วย flow ที่ชัด',
    'เข้าใจระบบหลักก่อนลงคอนเทนต์ยาก',
    'ต่อยอดสู่การเล่นร่วมกับเพื่อนได้ลื่น',
  ],
  en: [
    'Start fast with a clear onboarding flow',
    'Understand the core systems before harder content',
    'Move naturally into co-op and guild play',
  ],
} as const;
