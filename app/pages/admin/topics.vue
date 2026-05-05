<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">{{ t('admin.topics.title') }}</h2>
        <p class="mt-1 text-sm text-white/50">{{ t('admin.topics.subtitle') }}</p>
      </div>
      <button class="gold-btn" @click="openNewTopic">+ New Topic</button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/6 bg-white/2">
            <th class="th-cell">Topic</th>
            <th class="th-cell">Key</th>
            <th class="th-cell">Slug</th>
            <th class="th-cell">Visibility</th>
            <th class="th-cell w-[120px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="topic in topics" :key="topic.key" class="border-b border-white/3 transition-colors hover:bg-white/2">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <span class="h-3 w-3 rounded-full" :style="{ background: topic.color || '#d4a843' }" />
                <div>
                  <p class="font-medium">{{ topic.labelEn || topic.key }}</p>
                  <p class="text-xs text-white/30">{{ topic.descriptionEn || 'No description' }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-white/45">{{ topic.key }}</td>
            <td class="px-4 py-3 font-mono text-xs text-white/45">/news/topic/{{ topic.slug }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs font-bold" :class="topic.visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'">
                {{ topic.visible ? 'Visible' : 'Hidden' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-1">
                <button class="icon-btn" @click="openEditTopic(topic)"><UIcon name="i-lucide-pencil" class="h-4 w-4" /></button>
                <button class="icon-btn danger" @click="deleteTopic(topic)"><UIcon name="i-lucide-trash-2" class="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="topics.length === 0">
            <td colspan="5">
              <AdminEmptyState icon="i-lucide-tags" title="No topics yet" message="Create the first controlled webzine topic." action-label="+ New Topic" @action="openNewTopic" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UModal v-model:open="editorOpen" :title="editingKey ? 'Edit Topic' : 'New Topic'" class="sm:max-w-2xl">
      <template #body>
        <div class="grid gap-4">
          <div v-if="formError" class="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{{ formError }}</div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="topic-key" class="field-label">Key *</label>
              <input id="topic-key" v-model="form.key" class="field-input font-mono" placeholder="getting-started" :disabled="!!editingKey" />
            </div>
            <div>
              <label for="topic-slug" class="field-label">Slug</label>
              <input id="topic-slug" v-model="form.slug" class="field-input font-mono" placeholder="getting-started" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="topic-label-en" class="field-label">Label (EN) *</label>
              <input id="topic-label-en" v-model="form.labelEn" class="field-input" placeholder="Getting Started" />
            </div>
            <div>
              <label for="topic-label-th" class="field-label">Label (TH)</label>
              <input id="topic-label-th" v-model="form.labelTh" class="field-input" placeholder="Getting Started" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="topic-description-en" class="field-label">Description (EN)</label>
              <textarea id="topic-description-en" v-model="form.descriptionEn" class="field-input min-h-24" />
            </div>
            <div>
              <label for="topic-description-th" class="field-label">Description (TH)</label>
              <textarea id="topic-description-th" v-model="form.descriptionTh" class="field-input min-h-24" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label for="topic-icon" class="field-label">Icon</label>
              <input id="topic-icon" v-model="form.icon" class="field-input" placeholder="i-lucide-compass" />
            </div>
            <div>
              <label for="topic-color" class="field-label">Color</label>
              <input id="topic-color" v-model="form.color" type="color" class="h-10 w-full rounded-lg border border-white/10 bg-white/4 p-1" />
            </div>
            <label class="mt-7 flex items-center gap-3 text-sm text-white/60">
              <input v-model="form.visible" type="checkbox" class="h-4 w-4 accent-[#d4a843]" />
              Visible to editors and public pages
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
            <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="commitTopic">Save Topic</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <AdminConfirmDialog
      v-model="deleteDialogOpen"
      title="Delete topic?"
      :message="deleteTarget ? `Delete topic &quot;${deleteTarget.labelEn || deleteTarget.key}&quot;? Articles using this topic will lose their primary topic reference.` : 'Delete this topic?'"
      confirm-text="Delete"
      variant="danger"
      @confirm="confirmDelete"
    />
    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { t } = useI18n()

type Topic = {
  key: string
  slug: string
  labelEn: string
  labelTh: string
  descriptionEn: string
  descriptionTh: string
  icon: string
  color: string
  visible: boolean
}

const topics = ref<Topic[]>([])
const editorOpen = ref(false)
const editingKey = ref('')
const saving = ref(false)
const formError = ref('')
const deleteDialogOpen = ref(false)
const deleteTarget = ref<Topic | null>(null)
const { toast, showToast } = useAdminToast()

const form = reactive<Topic>({
  key: '',
  slug: '',
  labelEn: '',
  labelTh: '',
  descriptionEn: '',
  descriptionTh: '',
  icon: '',
  color: '#d4a843',
  visible: true,
})

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function normalizeTopic(topic: Topic): Topic {
  const key = topic.key.trim()
  const labelEn = topic.labelEn.trim()
  const labelTh = topic.labelTh.trim() || labelEn
  return {
    ...topic,
    key,
    slug: slugify(topic.slug || key || labelEn),
    labelEn,
    labelTh,
    descriptionEn: topic.descriptionEn.trim(),
    descriptionTh: topic.descriptionTh.trim(),
    icon: topic.icon.trim(),
    color: topic.color || '#d4a843',
  }
}

async function loadTopics() {
  try {
    const data = await $fetch<Topic[]>('/api/admin/config?key=webzine_topics')
    topics.value = Array.isArray(data) ? data : []
  } catch {
    topics.value = []
  }
}

async function saveTopics() {
  await $fetch('/api/admin/config', {
    method: 'PUT',
    body: { key: 'webzine_topics', value: topics.value },
  })
}

function resetForm() {
  Object.assign(form, {
    key: '',
    slug: '',
    labelEn: '',
    labelTh: '',
    descriptionEn: '',
    descriptionTh: '',
    icon: '',
    color: '#d4a843',
    visible: true,
  })
}

function openNewTopic() {
  formError.value = ''
  editingKey.value = ''
  resetForm()
  editorOpen.value = true
}

function openEditTopic(topic: Topic) {
  formError.value = ''
  editingKey.value = topic.key
  Object.assign(form, topic)
  editorOpen.value = true
}

async function commitTopic() {
  const next = normalizeTopic(form)
  if (!next.key || !next.labelEn) {
    formError.value = 'Key and Label (EN) are required.'
    return
  }

  saving.value = true
  try {
    const duplicate = topics.value.find((topic) => topic.key === next.key && topic.key !== editingKey.value)
    if (duplicate) throw new Error('Topic key already exists.')

    const index = topics.value.findIndex((topic) => topic.key === editingKey.value || topic.key === next.key)
    if (index >= 0) topics.value[index] = next
    else topics.value.push(next)

    await saveTopics()
    editorOpen.value = false
    showToast('Topic saved')
  } catch (error: any) {
    formError.value = error?.data?.message || error?.message || 'Failed to save topic'
  } finally {
    saving.value = false
  }
}

function deleteTopic(topic: Topic) {
  deleteTarget.value = topic
  deleteDialogOpen.value = true
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target) return
  const previous = [...topics.value]
  topics.value = topics.value.filter((item) => item.key !== target.key)
  try {
    await saveTopics()
    showToast('Topic deleted')
  } catch (error: any) {
    topics.value = previous
    showToast(error?.data?.message || error?.message || 'Failed to delete topic', 'error')
  } finally {
    deleteTarget.value = null
  }
}

// SSR-safe: admin auth is client-cookie based, so fetch on client only
onMounted(loadTopics)
</script>

<style scoped>
.th-cell { padding: 12px 16px; text-align: left; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.3); }
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }
.icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; color: rgba(255, 255, 255, 0.45); transition: background 0.15s, color 0.15s; }
.icon-btn:hover { background: rgba(255, 255, 255, 0.08); color: white; }
.icon-btn.danger:hover { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.field-label { margin-bottom: 6px; display: block; font-size: 0.8125rem; font-weight: 600; color: rgba(255, 255, 255, 0.6); }
.field-input { width: 100%; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.04); padding: 9px 12px; font-size: 0.875rem; color: white; outline: none; }
.field-input:focus { border-color: rgba(212, 168, 67, 0.5); }
</style>
