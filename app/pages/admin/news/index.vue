<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div><h2 class="text-2xl font-bold">News Articles</h2><p class="mt-1 text-sm text-white/50">{{ total }} articles total</p></div>
      <UButton color="primary" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="openEditor(null)">+ New Article</UButton>
    </div>
    <!-- Filters -->
    <div class="mb-4 flex flex-wrap gap-3 rounded-2xl border border-white/6 bg-white/4 p-4">
      <UInput v-model="search" placeholder="Search articles..." class="min-w-[200px] flex-1" @input="debounceLoad" />
      <USelect v-model="filterStatus" :items="[{ label: 'All Status', value: '' }, { label: 'Draft', value: 'DRAFT' }, { label: 'Published', value: 'PUBLISHED' }, { label: 'Archived', value: 'ARCHIVED' }]" value-key="value" class="w-36" @update:model-value="loadArticles" />
      <USelect v-model="filterCategory" :items="[{ label: 'All Categories', value: '' }, { label: 'Announcement', value: 'ANNOUNCEMENT' }, { label: 'Event', value: 'EVENT' }, { label: 'Update', value: 'UPDATE' }, { label: 'Media', value: 'MEDIA' }]" value-key="value" class="w-40" @update:model-value="loadArticles" />
    </div>
    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-white/6 bg-white/2"><th class="w-10 px-4 py-3"><input type="checkbox" @change="toggleAllChecked" /></th><th class="px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Title</th><th class="px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Category</th><th class="px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Status</th><th class="px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Published</th><th class="w-[120px] px-4 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Actions</th></tr></thead>
          <tbody>
            <tr v-for="article in articles" :key="article.id" class="border-b border-white/3 transition-colors hover:bg-white/2">
              <td class="px-4 py-3"><input type="checkbox" :checked="selectedIds.has(article.id)" @change="toggleSelect(article.id)" /></td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3"><img v-if="article.featuredImage" :src="article.featuredImage" class="h-8 w-12 flex-shrink-0 rounded object-cover" /><div><p class="max-w-[250px] truncate font-medium">{{ article.titleEn }}</p><p class="text-[0.6875rem] text-white/30">{{ article.slug }}</p></div></div>
              </td>
              <td class="px-4 py-3"><span class="rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.625rem] font-semibold text-amber-400">{{ article.category }}</span></td>
              <td class="px-4 py-3"><span class="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold" :class="article.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : article.status === 'DRAFT' ? 'bg-gray-500/10 text-gray-400' : 'bg-red-500/10 text-red-400'">{{ article.status }}</span></td>
              <td class="px-4 py-3 text-white/30 whitespace-nowrap">{{ article.publishedAt ? formatDate(article.publishedAt) : '—' }}</td>
              <td class="px-4 py-3"><div class="flex gap-1"><button class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/8" @click="openEditor(article)">✏️</button><button class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-red-500/15" @click="confirmDelete(article)">🗑️</button></div></td>
            </tr>
            <tr v-if="articles.length === 0"><td colspan="6" class="px-4 py-12 text-center text-white/30">No articles found</td></tr>
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
    <!-- Editor Modal -->
    <UModal v-model:open="editorOpen" :title="editorMode === 'create' ? 'Create Article' : 'Edit Article'" class="sm:max-w-4xl">
      <template #body>
        <div class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div class="flex flex-col gap-4">
            <UFormField label="Title (EN) *"><UInput v-model="form.titleEn" placeholder="English title" /></UFormField>
            <UFormField label="Title (TH) *"><UInput v-model="form.titleTh" placeholder="ชื่อภาษาไทย" /></UFormField>
            <UFormField label="Slug *"><UInput v-model="form.slug" placeholder="url-slug" /></UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Excerpt (EN)"><UTextarea v-model="form.excerptEn" :rows="2" /></UFormField>
              <UFormField label="Excerpt (TH)"><UTextarea v-model="form.excerptTh" :rows="2" /></UFormField>
            </div>
            <UFormField label="Content (EN)"><UTextarea v-model="form.contentEn" :rows="6" class="font-mono text-sm" /></UFormField>
            <UFormField label="Content (TH)"><UTextarea v-model="form.contentTh" :rows="6" class="font-mono text-sm" /></UFormField>
          </div>
          <div class="flex flex-col gap-4">
            <div class="rounded-xl border border-white/6 bg-white/4 p-5">
              <h4 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Publishing</h4>
              <UFormField label="Status"><USelect v-model="form.status" :items="['DRAFT', 'PUBLISHED', 'ARCHIVED']" /></UFormField>
              <UFormField label="Category" class="mt-3"><USelect v-model="form.category" :items="['ANNOUNCEMENT', 'EVENT', 'UPDATE', 'MEDIA', 'MAINTENANCE']" /></UFormField>
              <UFormField label="Publish Date" class="mt-3"><UInput v-model="form.publishedAt" type="datetime-local" /></UFormField>
            </div>
            <div class="rounded-xl border border-white/6 bg-white/4 p-5">
              <h4 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Featured</h4>
              <UFormField label="Image URL"><UInput v-model="form.featuredImage" placeholder="/images/..." /></UFormField>
              <label class="mt-3 flex items-center gap-2 text-sm text-white/50"><input v-model="form.featureOnHome" type="checkbox" /> Show on homepage</label>
            </div>
            <div class="rounded-xl border border-white/6 bg-white/4 p-5">
              <h4 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">SEO</h4>
              <UFormField label="SEO Title"><UInput v-model="form.seoTitle" /></UFormField>
              <UFormField label="SEO Description" class="mt-3"><UTextarea v-model="form.seoDesc" :rows="2" /></UFormField>
            </div>
          </div>
        </div>
        <p v-if="formError" class="mt-4 text-center text-sm text-red-400">{{ formError }}</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
          <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveArticle">{{ editorMode === 'create' ? 'Create' : 'Save' }}</UButton>
        </div>
      </template>
    </UModal>
    <!-- Delete Confirm -->
    <UModal v-model:open="deleteModalOpen">
      <template #body>
        <div class="p-8 text-center">
          <h3 class="mb-3 text-xl font-bold">Delete Article?</h3>
          <p class="mb-6 text-sm text-white/50">Are you sure you want to delete "<strong>{{ deleteTarget?.titleEn }}</strong>"?<br/>This cannot be undone.</p>
          <div class="flex justify-center gap-3">
            <UButton variant="ghost" @click="deleteModalOpen = false">Cancel</UButton>
            <UButton color="error" @click="doDelete">Delete</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
interface Article { id: number; slug: string; titleEn: string; titleTh: string; excerptEn?: string | null; excerptTh?: string | null; contentEn?: string | null; contentTh?: string | null; category: string; status: string; featuredImage?: string | null; publishedAt?: string | null; featureOnHome: boolean; homePriority: number; externalUrl?: string | null; openInNewTab: boolean; seoTitle?: string | null; seoDesc?: string | null; ogImage?: string | null; createdAt: string }
const articles = ref<Article[]>([]); const total = ref(0); const totalPages = ref(1); const page = ref(1); const search = ref(''); const filterStatus = ref(''); const filterCategory = ref(''); const selectedIds = ref(new Set<number>()); const editorOpen = ref(false); const editorMode = ref<'create' | 'edit'>('create'); const editingId = ref<number | null>(null); const saving = ref(false); const formError = ref(''); const deleteTarget = ref<Article | null>(null); const deleteModalOpen = ref(false)
let debounceTimer: ReturnType<typeof setTimeout>
const form = reactive({ titleEn: '', titleTh: '', slug: '', excerptEn: '', excerptTh: '', contentEn: '', contentTh: '', category: 'ANNOUNCEMENT', status: 'DRAFT', featuredImage: '', publishedAt: '', featureOnHome: false, homePriority: 0, externalUrl: '', openInNewTab: false, seoTitle: '', seoDesc: '' })
async function loadArticles() { try { const res = await $fetch<{ data: Article[]; meta: { total: number; totalPages: number } }>('/api/admin/news', { query: { page: page.value, search: search.value, status: filterStatus.value, category: filterCategory.value } }); articles.value = res.data; total.value = res.meta.total; totalPages.value = res.meta.totalPages } catch { articles.value = [] } }
function debounceLoad() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadArticles(), 300) }
function openEditor(article: Article | null) { formError.value = ''; if (article) { editorMode.value = 'edit'; editingId.value = article.id; Object.assign(form, { titleEn: article.titleEn, titleTh: article.titleTh, slug: article.slug, excerptEn: article.excerptEn || '', excerptTh: article.excerptTh || '', contentEn: article.contentEn || '', contentTh: article.contentTh || '', category: article.category, status: article.status, featuredImage: article.featuredImage || '', publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 16) : '', featureOnHome: article.featureOnHome, homePriority: article.homePriority, externalUrl: article.externalUrl || '', openInNewTab: article.openInNewTab, seoTitle: article.seoTitle || '', seoDesc: article.seoDesc || '' }) } else { editorMode.value = 'create'; editingId.value = null; Object.assign(form, { titleEn: '', titleTh: '', slug: '', excerptEn: '', excerptTh: '', contentEn: '', contentTh: '', category: 'ANNOUNCEMENT', status: 'DRAFT', featuredImage: '', publishedAt: '', featureOnHome: false, homePriority: 0, externalUrl: '', openInNewTab: false, seoTitle: '', seoDesc: '' }) }; editorOpen.value = true }
async function saveArticle() { if (!form.titleEn || !form.titleTh || !form.slug) { formError.value = 'Title (EN), Title (TH), and Slug are required.'; return }; saving.value = true; formError.value = ''; try { const payload = { ...form, publishedAt: form.publishedAt || null, featuredImage: form.featuredImage || null, externalUrl: form.externalUrl || null, seoTitle: form.seoTitle || null, seoDesc: form.seoDesc || null }; if (editorMode.value === 'create') { await $fetch('/api/admin/news', { method: 'POST', body: payload }) } else { await $fetch(`/api/admin/news/${editingId.value}`, { method: 'PUT', body: payload }) }; editorOpen.value = false; await loadArticles() } catch (e: unknown) { const err = e as { data?: { message?: string } }; formError.value = err?.data?.message || 'Save failed' } finally { saving.value = false } }
function confirmDelete(article: Article) { deleteTarget.value = article; deleteModalOpen.value = true }
async function doDelete() { if (!deleteTarget.value) return; try { await $fetch(`/api/admin/news/${deleteTarget.value.id}`, { method: 'DELETE' }); deleteModalOpen.value = false; deleteTarget.value = null; await loadArticles() } catch {} }
async function bulkDelete() { for (const id of selectedIds.value) { try { await $fetch(`/api/admin/news/${id}`, { method: 'DELETE' }) } catch {} }; selectedIds.value = new Set(); await loadArticles() }
function toggleSelect(id: number) { selectedIds.value.has(id) ? selectedIds.value.delete(id) : selectedIds.value.add(id); selectedIds.value = new Set(selectedIds.value) }
function toggleAllChecked(e: Event) { const checked = (e.target as HTMLInputElement).checked; selectedIds.value = checked ? new Set(articles.value.map((a) => a.id)) : new Set() }
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
await loadArticles()
</script>
