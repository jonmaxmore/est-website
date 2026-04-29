/**
 * ═══ HTML Sanitizer ═══
 * sanitize content จาก rich-text editor (Tiptap) ก่อนเก็บลง DB
 * ป้องกัน stored XSS — defense at the source
 *
 * Whitelist: tags + attributes ที่ Tiptap ของโปรเจคใช้งานจริง
 *   (ดูได้จาก app/components/admin/RichTextEditor.vue)
 *
 * ⚠️ อย่าให้ผ่าน <script>, on*= handlers, javascript: URLs
 */
import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = [
  // Block
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'hr',
  // List
  'ul', 'ol', 'li',
  // Inline
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
  'mark', 'sub', 'sup', 'code', 'br', 'span',
  // Link & media
  'a', 'img', 'figure', 'figcaption',
  // Table
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  // Embeds (Tiptap YouTube extension)
  'iframe', 'div',
]

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
  '*': ['class', 'style', 'data-type', 'data-id'],
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  iframe: [
    'src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow',
    'data-youtube-video', 'title',
  ],
  table: ['style'],
  th: ['colspan', 'rowspan', 'style'],
  td: ['colspan', 'rowspan', 'style'],
  span: ['style'],
}

const ALLOWED_STYLES: sanitizeHtml.IOptions['allowedStyles'] = {
  '*': {
    'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i],
    'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i],
    'text-align': [/^left$/, /^center$/, /^right$/, /^justify$/],
    'width': [/^\d+(?:\.\d+)?(?:px|%|em|rem)$/],
  },
}

const ALLOWED_IFRAME_HOSTNAMES = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
]

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedStyles: ALLOWED_STYLES,
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
  allowProtocolRelative: false,
  enforceHtmlBoundary: true,
  transformTags: {
    // บังคับ rel="noopener noreferrer" ทุกลิงก์ที่ target=_blank
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') {
        attribs.rel = 'noopener noreferrer'
      }
      return { tagName, attribs }
    },
  },
}

/**
 * sanitize HTML content (จาก Tiptap) — return string ที่ปลอดภัย
 * @param html  raw HTML จาก editor
 * @returns sanitized HTML
 */
export function sanitizeRichText(html: string): string {
  if (!html) return ''
  return sanitizeHtml(html, sanitizeOptions)
}

/**
 * sanitize content แบบ optional/nullable
 * คืน null ถ้า input เป็น null/undefined; คืน '' ถ้า input เป็น empty string
 */
export function sanitizeRichTextOptional<T extends string | null | undefined>(
  value: T,
): T extends string ? string : null {
  if (value === null || value === undefined) {
    return null as never
  }
  return sanitizeRichText(value) as never
}

/**
 * Strip HTML ออกหมด (สำหรับ excerpt, plain-text fields)
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim()
}
