/** Shared type for CMS page data returned by /api/public/pages/* */
export interface CmsPageData {
  key: string
  slug: string | null
  titleEn: string
  titleTh: string
  description: string | null
  template: string
  seoTitle: string | null
  seoTitleTh: string | null
  seoDesc: string | null
  seoDescTh: string | null
  contentEn: string | null
  contentTh: string | null
  icon: string | null
  status: string
  showInHeader: boolean
  showInFooter: boolean
  headerOrder: number
  footerOrder: number
  isSystemPage: boolean
  updatedAt: string
}
