<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">News Articles</h2>
        <p class="mt-1 text-sm text-white/50">{{ total }} articles total</p>
      </div>
      <button class="gold-btn" @click="openEditor(null)">+ New Article</button>
    </div>

    <div class="mb-4 flex flex-wrap gap-3 rounded-2xl border border-white/6 bg-white/4 p-4">
      <UInput v-model="filters.search" placeholder="Search articles..." class="min-w-[200px] flex-1" @input="debounceLoad" />
      <USelect v-model="filters.status" :items="[{ label: 'All Status', value: 'all' }, { label: 'Draft', value: 'DRAFT' }, { label: 'Published', value: 'PUBLISHED' }, { label: 'Archived', value: 'ARCHIVED' }]" value-key="value" class="w-36" @update:model-value="loadArticles" />
      <USelect v-model="filters.category" :items="[{ label: 'All Categories', value: 'all' }, { label: 'Announcement', value: 'ANNOUNCEMENT' }, { label: 'Update', value: 'UPDATE' }, { label: 'Media', value: 'MEDIA' }]" value-key="value" class="w-40" @update:model-value="loadArticles" />
      <USelect v-model="filters.contentType" :items="contentTypeFilterOptions" value-key="value" class="w-44" @update:model-value="loadArticles" />
      <USelect v-model="filters.topic" :items="topicFilterOptions" value-key="value" class="w-44" @update:model-value="loadArticles" />
      <UInput v-model="filters.campaignCode" placeholder="Campaign code" class="w-44" @input="debounceLoad" />
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/6 bg-white/2">
              <th class="w-10 px-4 py-3"><input type="checkbox" @change="toggleAllChecked" /></th>
              <th class="th-cell">Title</th>
              <th class="th-cell">Category</th>
              <th class="th-cell">Webzine</th>
              <th class="th-cell">Status</th>
              <th class="th-cell">Published</th>
              <th class="th-cell w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in articles" :key="article.id" class="border-b border-white/3 transition-colors hover:bg-white/2">
              <td class="px-4 py-3"><input type="checkbox" :checked="selectedIds.has(article.id)" @change="toggleSelect(article.id)" /></td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img v-if="article.featuredImage" :src="article.featuredImage" class="h-8 w-12 flex-shrink-0 rounded object-cover" />
                  <div>
                    <p class="max-w-[250px] truncate font-medium">{{ article.titleTh || article.titleEn }}</p>
                    <p class="text-[0.6875rem] text-white/30">{{ article.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3"><AdminStatusBadge :status="article.category" /></td>
              <td class="px-4 py-3">
                <p class="text-xs font-semibold text-white/60">{{ article.contentType?.replaceAll('_', ' ') || 'ANNOUNCEMENT' }}</p>
                <p class="text-[0.625rem] text-white/25">{{ article.primaryTopicKey || 'No topic' }}</p>
              </td>
              <td class="px-4 py-3"><AdminStatusBadge :status="article.status" /></td>
              <td class="px-4 py-3 text-white/30 whitespace-nowrap">{{ article.publishedAt ? formatDate(article.publishedAt) : '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-1">
                  <button class="icon-btn" @click="openEditor(article)"><UIcon name="i-lucide-pencil" class="w-4 h-4" /></button>
                  <button class="icon-btn danger" @click="confirmDelete(article)"><UIcon name="i-lucide-trash-2" class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="articles.length === 0">
              <td colspan="6">
                <AdminEmptyState icon="i-lucide-newspaper" title="No articles found" message="Create your first news article to get started." action-label="+ Create Article" @action="openEditor(null)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="selectedIds.size > 0" class="flex items-center justify-between border-t border-blue-500/20 bg-blue-500/8 px-4 py-3 text-sm text-blue-400">
        <span>{{ selectedIds.size }} selected</span>
        <UButton size="xs" color="error" variant="soft" @click="bulkDelete">Delete Selected</UButton>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 border-t border-white/6 p-4">
        <UButton variant="ghost" size="sm" :disabled="page <= 1" @click="page--; loadArticles()">← Prev</UButton>
        <span class="text-sm text-white/30">Page {{ page }} of {{ totalPages }}</span>
        <UButton variant="ghost" size="sm" :disabled="page >= totalPages" @click="page++; loadArticles()">Next →</UButton>
      </div>
    </div>

    <AdminNewsEditorModal
      v-model:open="editorOpen"
      :article="editingArticle"
      :topics="topics"
      @saved="loadArticles"
    />

    <AdminConfirmDialog
      v-model="deleteModalOpen"
      title="Delete Article?"
      :message="`Are you sure you want to delete '${deleteTarget?.titleEn || deleteTarget?.titleTh}'? This cannot be undone.`"
      confirm-text="Delete"
      variant="danger"
      @confirm="doDelete"
    />

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
import type { NewsArticle } from '../../../composables/useNewsArticles'

definePageMeta({ layout: 'admin' })

const {
  articles, total, totalPages, page, topics, filters, selectedIds,
  contentTypeFilterOptions, topicFilterOptions,
  loadArticles, loadTopics, debounceLoad, deleteArticle, bulkDelete,
  toggleSelect, toggleAllChecked,
} = useNewsArticles()

const editorOpen = ref(false)
const editingArticle = ref<NewsArticle | null>(null)
const deleteTarget = ref<NewsArticle | null>(null)
const deleteModalOpen = ref(false)
const { toast } = useAdminToast()

function openEditor(article: NewsArticle | null) {
  editingArticle.value = article
  editorOpen.value = true
}

function confirmDelete(article: NewsArticle) {
  deleteTarget.value = article
  deleteModalOpen.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  await deleteArticle(deleteTarget.value.id)
  deleteTarget.value = null
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  loadArticles()
  loadTopics()
})
</script>

<style scoped>
.th-cell { padding: 12px 16px; text-align: left; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.3); }
.icon-btn { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; cursor: pointer; transition: background 0.15s; }
.icon-btn:hover { background: rgba(255, 255, 255, 0.08); }
.icon-btn.danger:hover { background: rgba(239, 68, 68, 0.15); }
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }
</style>
