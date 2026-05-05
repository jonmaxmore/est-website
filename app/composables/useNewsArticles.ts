/**
 * ═══ useNewsArticles — admin news list state + CRUD ═══
 *
 * Encapsulates list fetching, filters, pagination, debounced search,
 * single-row delete, and bulk delete for /admin/news.
 * Editor lives in components/admin/NewsEditorModal.vue.
 */
import { computed, reactive, ref } from 'vue'

import { useAdminToast } from './useAdminToast'

export interface NewsArticle {
  id: number; slug: string; titleEn: string; titleTh: string
  excerptEn?: string | null; excerptTh?: string | null
  contentEn?: string | null; contentTh?: string | null
  category: string; status: string; featuredImage?: string | null
  contentType?: string; primaryTopicKey?: string | null; campaignCode?: string | null
  linkedEventId?: string | null; pinned?: boolean; isEvergreen?: boolean
  readingTimeMinutes?: number | null
  publishedAt?: string | null; featureOnHome: boolean; homePriority: number
  externalUrl?: string | null; openInNewTab: boolean
  seoTitle?: string | null; seoDesc?: string | null; ogImage?: string | null; createdAt: string
}

export interface TopicOption {
  key: string
  labelEn: string
  visible: boolean
}

export function useNewsArticles() {
  const articles = ref<NewsArticle[]>([])
  const total = ref(0)
  const totalPages = ref(1)
  const page = ref(1)
  const topics = ref<TopicOption[]>([])
  const selectedIds = ref(new Set<number>())

  // Sentinel: 'all' means "no filter applied" — Nuxt UI 4 disallows '' as
  // a USelect item value, so we use 'all' and strip it before sending to
  // the API (the API treats missing/empty fields as no filter).
  const filters = reactive({
    search: '',
    status: 'all',
    category: 'all',
    contentType: 'all',
    topic: 'all',
    campaignCode: '',
  })

  let debounceTimer: ReturnType<typeof setTimeout>
  const { showToast } = useAdminToast()

  const stripAll = (v: string) => (v === 'all' ? '' : v)

  async function loadArticles() {
    try {
      const res = await $fetch<{ data: NewsArticle[]; meta: { total: number; totalPages: number } }>(
        '/api/admin/news',
        {
          query: {
            page: page.value,
            search: filters.search,
            status: stripAll(filters.status),
            category: stripAll(filters.category),
            contentType: stripAll(filters.contentType),
            primaryTopicKey: stripAll(filters.topic),
            campaignCode: filters.campaignCode,
          },
        },
      )
      articles.value = res.data
      total.value = res.meta.total
      totalPages.value = res.meta.totalPages
    } catch {
      articles.value = []
    }
  }

  async function loadTopics() {
    try {
      const data = await $fetch<TopicOption[]>('/api/admin/config?key=webzine_topics')
      topics.value = Array.isArray(data) ? data : []
    } catch {
      topics.value = []
    }
  }

  function debounceLoad() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => loadArticles(), 300)
  }

  async function deleteArticle(id: number): Promise<boolean> {
    try {
      await $fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
      showToast('Article deleted')
      await loadArticles()
      return true
    } catch {
      showToast('Delete failed', 'error')
      return false
    }
  }

  async function bulkDelete() {
    for (const id of selectedIds.value) {
      try { await $fetch(`/api/admin/news/${id}`, { method: 'DELETE' }) } catch { /* skip */ }
    }
    selectedIds.value = new Set()
    showToast('Selected articles deleted')
    await loadArticles()
  }

  function toggleSelect(id: number) {
    if (selectedIds.value.has(id)) selectedIds.value.delete(id)
    else selectedIds.value.add(id)
    selectedIds.value = new Set(selectedIds.value)
  }

  function toggleAllChecked(e: Event) {
    const checked = (e.target as HTMLInputElement).checked
    selectedIds.value = checked ? new Set(articles.value.map((a) => a.id)) : new Set()
  }

  const contentTypeOptions = ['ANNOUNCEMENT', 'EVENT', 'PATCH_NOTES', 'GUIDE', 'LORE', 'DEV_BLOG']
  const contentTypeFilterOptions = computed(() => [
    { label: 'All Types', value: 'all' },
    ...contentTypeOptions.map((value) => ({ label: value.replaceAll('_', ' '), value })),
  ])
  const topicFilterOptions = computed(() => [
    { label: 'All Topics', value: 'all' },
    ...topics.value
      .filter((topic) => topic.visible !== false)
      .map((topic) => ({ label: topic.labelEn || topic.key, value: topic.key })),
  ])

  return {
    articles,
    total,
    totalPages,
    page,
    topics,
    filters,
    selectedIds,
    contentTypeFilterOptions,
    topicFilterOptions,
    loadArticles,
    loadTopics,
    debounceLoad,
    deleteArticle,
    bulkDelete,
    toggleSelect,
    toggleAllChecked,
  }
}
