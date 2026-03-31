type LexicalNode = {
  text?: string;
  children?: LexicalNode[];
};

type MediaWithSizes = {
  url?: string | null;
  alt?: string | null;
  sizes?: {
    thumbnail?: { url?: string | null };
    card?: { url?: string | null };
    hero?: { url?: string | null };
  };
} | null;

type NewsLocale = 'th' | 'en';
type NewsCategory = 'event' | 'update' | 'media' | 'announcement' | 'maintenance' | string;
type NewsEditorialItem = {
  featureOnHome?: boolean | null;
  homePriority?: number | null;
  publishedAt?: string | null;
  externalUrl?: string | null;
  slug?: string | null;
};

type NewsImageCandidate = {
  alt?: string | null;
  url?: string | null;
  thumbnailUrl?: string | null;
  cardUrl?: string | null;
  heroUrl?: string | null;
} | null | undefined;

const LEGACY_NEWS_SUMMARY_PATTERNS: Record<NewsLocale, RegExp[]> = {
  th: [
    /^หัวข้อ ".+" สะท้อนทิศทางข่าวสารล่าสุด/i,
    /^อ่านรายละเอียด.+Eternal Tower Saga/i,
  ],
  en: [
    /^The article ".+" reflects one of the latest updates/i,
    /^Read the latest .+ update from the Eternal Tower Saga team\./i,
  ],
};

const FALLBACK_NEWS_SUMMARY_COPY: Record<NewsCategory, Record<NewsLocale, (title: string) => string>> = {
  event: {
    th: (title) => `รวมวันเวลา เงื่อนไข และรางวัลของ ${title} แบบอ่านเร็ว เพื่อเตรียมตัวเข้าร่วมได้ไม่พลาด`,
    en: (title) => `A quick look at the schedule, entry rules, and rewards for ${title}, so you know what to prepare before it starts.`,
  },
  update: {
    th: (title) => `สรุปสิ่งที่เปลี่ยนใน ${title} พร้อมผลกับการเล่นจริง เพื่อให้กลับเข้าเกมได้เข้าใจตรงกัน`,
    en: (title) => `A clear rundown of what changed in ${title} and how it affects real play when you log back in.`,
  },
  media: {
    th: (title) => `รวมภาพและสื่อจาก ${title} เพื่อให้เห็นบรรยากาศของ Eternal Tower Saga ชัดขึ้นก่อนอัปเดตรอบถัดไป`,
    en: (title) => `A look through the newest visuals from ${title}, with enough context to see the mood and direction of Eternal Tower Saga more clearly.`,
  },
  announcement: {
    th: (title) => `สรุปสาระสำคัญจาก ${title} แบบตรงประเด็น เพื่อเช็กข้อมูลที่เกี่ยวกับบัญชี การเล่น และประกาศล่าสุดได้เร็วขึ้น`,
    en: (title) => `The key points from ${title}, pulled into one place so players can check service, account, and game notices without digging around.`,
  },
  maintenance: {
    th: (title) => `แจ้งช่วงเวลาปิดปรับปรุงและสิ่งที่ควรเตรียมใน ${title} เพื่อวางแผนการเล่นได้ล่วงหน้า`,
    en: (title) => `The maintenance window and the player notes that matter in ${title}, so you can plan around downtime without surprises.`,
  },
};

const FALLBACK_NEWS_INTRO_COPY: Record<NewsCategory, Record<NewsLocale, (title: string) => string>> = {
  event: {
    th: (title) => `${title} รวบรวมรายละเอียดที่ผู้เล่นควรรู้ก่อนเข้าร่วมกิจกรรมรอบนี้ ทั้งวันเวลา เงื่อนไข และของรางวัลที่เกี่ยวข้อง`,
    en: (title) => `${title} brings together the schedule, entry details, and reward notes players are likely to check first before joining this event.`,
  },
  update: {
    th: (title) => `${title} รวบรวมสิ่งที่เปลี่ยนในระบบหลักของเกม พร้อมผลกับจังหวะการเล่นจริง เพื่อให้ผู้เล่นปรับตัวได้เร็วขึ้น`,
    en: (title) => `${title} gathers the gameplay and system changes that matter most, so players can see the practical impact before they jump back in.`,
  },
  media: {
    th: (title) => `${title} พาไปดูภาพและสื่อชุดใหม่ที่ช่วยให้บรรยากาศของ Eternal Tower Saga ชัดขึ้น ทั้งโทนโลก งานภาพ และทิศทางของเกม`,
    en: (title) => `${title} gathers fresh visuals and showcase material that help players get a better feel for the world, tone, and presentation of Eternal Tower Saga.`,
  },
  announcement: {
    th: (title) => `${title} สรุปข้อมูลสำคัญที่ผู้เล่นควรรู้ในช่วงนี้ เพื่อให้เช็กประกาศที่เกี่ยวกับการเล่นและบริการได้ง่ายขึ้น`,
    en: (title) => `${title} gathers the points players are most likely looking for right now, making service and gameplay notices easier to scan.`,
  },
  maintenance: {
    th: (title) => `${title} ใช้แจ้งช่วงเวลาปิดปรับปรุงและรายละเอียดที่ผู้เล่นควรเตรียมล่วงหน้า เพื่อจัดเวลาเข้าเล่นได้สะดวกขึ้น`,
    en: (title) => `${title} explains the maintenance window and the steps players may want to take before temporary downtime begins.`,
  },
};

const FALLBACK_NEWS_ARTICLE_COPY: Record<NewsCategory, Record<NewsLocale, string[]>> = {
  event: {
    th: [
      'ถ้าคุณตั้งใจจะเล่นกิจกรรมรอบนี้ จุดที่ควรเช็กก่อนคือวันเวลาเปิด เงื่อนไขการเข้าร่วม และรายการรางวัลที่เกี่ยวข้อง',
      'หลายกิจกรรมจะเก็บความคืบหน้าได้ง่ายขึ้นเมื่อวางแผนล่วงหน้า โดยเฉพาะช่วงที่มีภารกิจแยกเป็นรอบหรือมีเวลาจำกัด',
      'ถ้ามีการปรับเวลา กติกา หรือของรางวัลเพิ่มเติม หน้านี้จะถูกอัปเดตตามข้อมูลล่าสุดจากทีมงานอีกครั้ง',
    ],
    en: [
      'If you plan to join this round, the first things worth checking are the start time, entry rules, and reward list.',
      'Most event rewards are easier to claim when you know the schedule ahead of time, especially if tasks unlock in phases or expire quickly.',
      'If the timing, rules, or reward details change, this article will be updated again with the latest information from the team.',
    ],
  },
  update: {
    th: [
      'อัปเดตรอบนี้เน้นเก็บจุดที่ผู้เล่นจะรู้สึกได้จริง ไม่ว่าจะเป็นความลื่นของการเล่น ความชัดของระบบ หรือจังหวะการเติบโตของตัวละคร',
      'ลองอ่านส่วนที่ถูกปรับพร้อมมองผลกับการเล่นประจำวันของคุณไปด้วย จะช่วยให้รู้ว่าควรเปลี่ยนลำดับการอัปเกรดหรือการลงคอนเทนต์ตรงไหนบ้าง',
      'ถ้ามีรายละเอียดเชิงเทคนิคหรือหมายเหตุเพิ่มเติม ทีมงานจะอัปเดตต่อในประกาศถัดไปพร้อมตัวอย่างที่ชัดขึ้น',
    ],
    en: [
      'This update focuses on the parts players are most likely to feel in regular play, from system clarity to pacing and overall flow.',
      'It helps to read each change with your own routine in mind, so you can tell whether your build, upgrade order, or daily priorities should shift.',
      'If more technical notes are needed, the team will follow up with another post and clearer examples.',
    ],
  },
  media: {
    th: [
      'ชุดสื่อนี้ช่วยให้เห็นภาพของโลกเกมชัดขึ้น ทั้งบรรยากาศ สเกลของพื้นที่ และทิศทางงานภาพที่ทีมกำลังวางไว้',
      'บางชิ้นอาจเป็นภาพโปรโมต บางชิ้นอาจเป็นภาพพรีวิวหรือเบื้องหลัง แต่ทั้งหมดช่วยต่อภาพรวมของ Eternal Tower Saga ให้จับต้องได้มากขึ้น',
      'เมื่อมีสื่อใหม่ที่น่าสนใจหรือมีรอบอัปเดตสำคัญ ทีมงานจะนำมารวมไว้ที่นี่เพิ่มเติมอีก',
    ],
    en: [
      'This set of media helps put the game world into clearer view, from atmosphere and environment design to the overall visual tone.',
      'Some pieces may be showcase art, others may be previews or behind-the-scenes material, but together they give a stronger sense of Eternal Tower Saga.',
      'More visuals will be added here as new milestones, campaigns, and showcase beats are ready.',
    ],
  },
  announcement: {
    th: [
      'ประกาศฉบับนี้รวบรวมข้อมูลที่ผู้เล่นควรรู้ในช่วงนี้ไว้ในที่เดียว เพื่อให้เช็กประเด็นสำคัญได้เร็วขึ้น',
      'ถ้าประกาศนี้เกี่ยวข้องกับกิจกรรม ระบบ หรือการเปลี่ยนแปลงอื่น ๆ การเปิดอ่านข่าวที่เกี่ยวข้องควบคู่กันจะช่วยให้เห็นภาพครบกว่าเดิม',
      'หน้า news และประกาศภายในเว็บไซต์ยังเป็นจุดอ้างอิงหลักสำหรับข้อมูลชุดนี้ต่อไป',
    ],
    en: [
      'This notice pulls the important information into one place so players can check the essentials quickly.',
      'If it connects to an event, a system change, or a service update, it is still worth opening the related articles for the full picture.',
      'The news page and official announcement channels on the website remain the main reference point for this information.',
    ],
  },
  maintenance: {
    th: [
      'ประกาศบำรุงรักษานี้มีไว้เพื่อบอกช่วงเวลาที่บริการอาจใช้งานไม่ได้ชั่วคราว และช่วยให้ผู้เล่นจัดตารางเข้าเล่นได้ง่ายขึ้น',
      'ก่อนถึงเวลาปิดปรับปรุง ควรผูกบัญชี เก็บงานสำคัญให้เรียบร้อย และหลีกเลี่ยงกิจกรรมที่ต้องใช้เวลาต่อเนื่องในช่วงใกล้ปิดระบบ',
      'หลังการบำรุงรักษาเสร็จสิ้น ทีมงานจะอัปเดตสถานะเพิ่มเติมผ่านช่องทางข่าวสารอย่างเป็นทางการอีกครั้ง',
    ],
    en: [
      'This maintenance notice is here to make the downtime window easier to plan around.',
      'Before the service goes offline, it is a good idea to secure account progress, finish urgent tasks, and avoid time-sensitive actions near the cutoff.',
      'Once maintenance is complete, the team will share a follow-up status update through the official news channels.',
    ],
  },
};

const PLACEHOLDER_TITLES_BY_CATEGORY: Record<string, Array<{ titleEn: string; titleTh: string }>> = {
  event: [
    {
      titleEn: 'Weekly Adventurer Rally',
      titleTh: 'กิจกรรมรวมพลนักผจญภัยประจำสัปดาห์',
    },
    {
      titleEn: 'Seven-Day Login Campaign',
      titleTh: 'กิจกรรมสะสมการล็อกอิน 7 วัน',
    },
    {
      titleEn: 'Limited-Time Expedition Event',
      titleTh: 'กิจกรรมสำรวจพิเศษระยะเวลาจำกัด',
    },
  ],
  update: [
    {
      titleEn: 'Core System Update Brief',
      titleTh: 'สรุปการอัปเดตระบบหลัก',
    },
    {
      titleEn: 'Gameplay Balance Adjustment Notice',
      titleTh: 'ประกาศปรับสมดุลการเล่น',
    },
    {
      titleEn: 'Tower Progression Update Overview',
      titleTh: 'ภาพรวมการอัปเดตความคืบหน้าหอคอย',
    },
  ],
  media: [
    {
      titleEn: 'World Showcase Media Update',
      titleTh: 'อัปเดตสื่อแนะนำโลกของเกม',
    },
    {
      titleEn: 'Visual Preview From the Tower',
      titleTh: 'ภาพพรีวิวใหม่จากหอคอย',
    },
    {
      titleEn: 'Latest Media Spotlight',
      titleTh: 'สปอตไลต์สื่อชุดล่าสุด',
    },
  ],
  announcement: [
    {
      titleEn: 'Service Notice and Player Advisory',
      titleTh: 'ประกาศแจ้งกำหนดการและคำแนะนำสำหรับผู้เล่น',
    },
  ],
  maintenance: [
    {
      titleEn: 'Weekly Server Maintenance Notice',
      titleTh: 'ประกาศบำรุงรักษาเซิร์ฟเวอร์ประจำสัปดาห์',
    },
  ],
};

export function sanitizeNewsSlug(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0E00-\u0E7F-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function collectLexicalText(node: LexicalNode | null | undefined, parts: string[]) {
  if (!node) return;

  if (typeof node.text === 'string' && node.text.trim()) {
    parts.push(node.text.trim());
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectLexicalText(child, parts);
    }
  }
}

export function extractLexicalPlainText(content: unknown) {
  const root = typeof content === 'object' && content && 'root' in (content as Record<string, unknown>)
    ? (content as { root?: { children?: LexicalNode[] } }).root
    : null;

  if (!root?.children?.length) return '';

  const parts: string[] = [];
  for (const child of root.children) {
    collectLexicalText(child, parts);
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function summarizeNewsContent(content: unknown, maxLength = 160) {
  const plainText = extractLexicalPlainText(content);
  if (!plainText) return null;
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength).trimEnd()}...`;
}

function clampText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function normalizeSummary(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function buildLexicalDocument(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            mode: 'normal',
            text,
            type: 'text',
            style: '',
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
      })),
      direction: 'ltr',
    },
  };
}

export function hasMeaningfulNewsBody(content: unknown, minLength = 80) {
  return extractLexicalPlainText(content).length >= minLength;
}

export function isPlaceholderNewsTitle(value?: string | null) {
  if (!value) return true;

  const normalized = value.toLowerCase().trim();
  const compact = normalized.replace(/\s+/g, '');
  const prefixSample = Array.from(compact.slice(0, 12));
  const uniquePrefixChars = new Set(prefixSample).size;

  if (compact.length < 3) return true;
  if (/(.)\1{3,}/.test(compact)) return true;
  if (/^(.{1,4})\1{2,}/u.test(compact)) return true;
  if (prefixSample.length >= 8 && uniquePrefixChars <= 4) return true;
  if (/(xa|ax){2,}/i.test(compact)) return true;
  if (/^\d+$/.test(compact)) return true;
  if (/\d{3,}/.test(compact) && compact.replace(/\d/g, '').length < 10) return true;
  if (['test', 'untitled', 'placeholder'].includes(compact)) return true;

  return false;
}

export function getPlaceholderTitlePreset(category: string, index = 0) {
  const presets = PLACEHOLDER_TITLES_BY_CATEGORY[category] || [];
  return presets[index] || null;
}

export function summarizeNewsField(summary: unknown, content: unknown, maxLength = 160) {
  if (typeof summary === 'string' && summary.trim()) {
    const trimmed = normalizeSummary(summary);
    if (!isLegacyFallbackNewsSummary(trimmed)) {
      return clampText(trimmed, maxLength);
    }
  }

  const summarizedContent = summarizeNewsContent(content, maxLength);
  if (!summarizedContent) return null;
  if (isLegacyFallbackNewsSummary(summarizedContent)) return null;
  return summarizedContent;
}

export function sanitizeNewsLocaleValue(primary?: string | null, secondary?: string | null) {
  const safePrimary = typeof primary === 'string' && !isPlaceholderNewsTitle(primary) ? primary : null;
  const safeSecondary = typeof secondary === 'string' && !isPlaceholderNewsTitle(secondary) ? secondary : null;

  return {
    primary: safePrimary || safeSecondary || null,
    secondary: safeSecondary || safePrimary || null,
  };
}

export function hasUsableNewsContent(content: unknown) {
  const plainText = extractLexicalPlainText(content);
  return Boolean(plainText && !isPlaceholderNewsTitle(plainText));
}

export function isLegacyFallbackNewsSummary(summary?: string | null) {
  if (!summary) return false;

  const trimmed = normalizeSummary(summary);
  return (Object.keys(LEGACY_NEWS_SUMMARY_PATTERNS) as NewsLocale[]).some((lang) =>
    LEGACY_NEWS_SUMMARY_PATTERNS[lang].some((pattern) => pattern.test(trimmed)),
  );
}

export function isLegacyFallbackNewsBody(content: unknown) {
  const plainText = extractLexicalPlainText(content);
  return isLegacyFallbackNewsSummary(plainText);
}

export function buildFallbackNewsSummary(
  lang: NewsLocale,
  category: NewsCategory,
  title: string,
  maxLength = 180,
) {
  const builder = FALLBACK_NEWS_SUMMARY_COPY[category]?.[lang] || FALLBACK_NEWS_SUMMARY_COPY.announcement[lang];
  return clampText(builder(title), maxLength);
}

function buildFallbackNewsIntro(lang: NewsLocale, category: NewsCategory, title: string) {
  const builder = FALLBACK_NEWS_INTRO_COPY[category]?.[lang] || FALLBACK_NEWS_INTRO_COPY.announcement[lang];
  return builder(title);
}

export function pickNewsSummary(
  lang: NewsLocale,
  summaryTh?: string | null,
  summaryEn?: string | null,
  categoryLabelTh = 'ข่าวสาร',
  categoryLabelEn = 'news',
) {
  const safeSummaryTh = typeof summaryTh === 'string' && !isPlaceholderNewsTitle(summaryTh) ? summaryTh : null;
  const safeSummaryEn = typeof summaryEn === 'string' && !isPlaceholderNewsTitle(summaryEn) ? summaryEn : null;

  if (lang === 'th') {
    return safeSummaryTh || safeSummaryEn || `สรุป${categoryLabelTh}ล่าสุดจาก Eternal Tower Saga แบบสั้น กระชับ และเช็กต่อได้ทันที`;
  }

  return safeSummaryEn || safeSummaryTh || `A short, readable recap of the latest ${categoryLabelEn.toLowerCase()} update from Eternal Tower Saga.`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildFallbackNewsArticleHtml(
  lang: NewsLocale,
  category: NewsCategory,
  title: string,
  summary?: string | null,
) {
  const paragraphs = FALLBACK_NEWS_ARTICLE_COPY[category]?.[lang] || FALLBACK_NEWS_ARTICLE_COPY.announcement[lang];
  const intro = buildFallbackNewsIntro(lang, category, title);
  const closing = lang === 'th'
    ? 'หากมีรายละเอียดเพิ่ม ทีมงานจะอัปเดตต่อผ่านหน้า news และช่องทางประกาศอย่างเป็นทางการ'
    : 'If more details are confirmed, this page and the official news channels will be updated again.';

  const body = [
    summary ? escapeHtml(summary) : escapeHtml(intro),
    ...paragraphs.map((text) => escapeHtml(text)),
    escapeHtml(closing),
  ];

  return body.map((text) => `<p>${text}</p>`).join('');
}

export function buildFallbackNewsArticleParagraphs(
  lang: NewsLocale,
  category: NewsCategory,
  title: string,
  summary?: string | null,
) {
  const paragraphs = FALLBACK_NEWS_ARTICLE_COPY[category]?.[lang] || FALLBACK_NEWS_ARTICLE_COPY.announcement[lang];
  const intro = buildFallbackNewsIntro(lang, category, title);
  const closing = lang === 'th'
    ? 'หากมีรายละเอียดเพิ่ม ทีมงานจะอัปเดตต่อผ่านหน้า news และช่องทางประกาศอย่างเป็นทางการ'
    : 'If more details are confirmed, this page and the official news channels will be updated again.';

  return [
    summary || intro,
    ...paragraphs,
    closing,
  ];
}

export function buildNewsImage(media: MediaWithSizes) {
  if (!media?.url) return null;

  return {
    url: media.url,
    alt: media.alt || null,
    thumbnailUrl: media.sizes?.thumbnail?.url || media.url,
    cardUrl: media.sizes?.card?.url || media.url,
    heroUrl: media.sizes?.hero?.url || media.url,
  };
}

export function hasReliableNewsImage(media: NewsImageCandidate) {
  const imageUrl = media?.heroUrl || media?.cardUrl || media?.thumbnailUrl || media?.url || null;
  const alt = media?.alt?.trim() || '';

  if (!imageUrl) return false;
  if (!alt || alt.length < 3) return false;
  if (isPlaceholderNewsTitle(alt)) return false;

  return true;
}

export function sortNewsForEditorial<T extends NewsEditorialItem>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftFeatured = left.featureOnHome ? 1 : 0;
    const rightFeatured = right.featureOnHome ? 1 : 0;

    if (leftFeatured !== rightFeatured) {
      return rightFeatured - leftFeatured;
    }

    const leftPriority = Number.isFinite(left.homePriority) ? Number(left.homePriority) : Number.MAX_SAFE_INTEGER;
    const rightPriority = Number.isFinite(right.homePriority) ? Number(right.homePriority) : Number.MAX_SAFE_INTEGER;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return new Date(right.publishedAt || 0).getTime() - new Date(left.publishedAt || 0).getTime();
  });
}

export function resolveNewsHref(item: Pick<NewsEditorialItem, 'externalUrl' | 'slug'>) {
  return item.externalUrl || `/news/${item.slug || ''}`;
}

export function isExternalNewsLink(item: Pick<NewsEditorialItem, 'externalUrl'>) {
  return Boolean(item.externalUrl);
}
