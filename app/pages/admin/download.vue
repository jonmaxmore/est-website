<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">{{ t('admin.download.title') }}</h2>
        <p class="mt-1 text-sm text-white/50">{{ t('admin.download.subtitle') }}</p>
      </div>
      <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="save">
        Save Download Page
      </UButton>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Hero Copy</h3>
        <AdminContentLanguageTabs :th-filled="!!form.heroTitleTh" :en-filled="!!form.heroTitleEn">
          <template #th>
            <UFormField label="Title (TH)" class="mb-3"><UInput v-model="form.heroTitleTh" /></UFormField>
            <UFormField label="Subtitle (TH)" class="mb-3"><UTextarea v-model="form.heroSubtitleTh" :rows="2" /></UFormField>
            <UFormField label="Official note (TH)"><UTextarea v-model="form.primaryNoteTh" :rows="2" /></UFormField>
          </template>
          <template #en>
            <UFormField label="Title (EN)" class="mb-3"><UInput v-model="form.heroTitleEn" /></UFormField>
            <UFormField label="Subtitle (EN)" class="mb-3"><UTextarea v-model="form.heroSubtitleEn" :rows="2" /></UFormField>
            <UFormField label="Official note (EN)"><UTextarea v-model="form.primaryNoteEn" :rows="2" /></UFormField>
          </template>
        </AdminContentLanguageTabs>
        <div class="mt-5">
          <AdminMediaPicker v-model="form.backgroundImage" label="Background Image" />
        </div>
      </section>

      <section class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Preview</h3>
        <div class="overflow-hidden rounded-xl border border-white/8 bg-black/30">
          <div class="h-36 bg-cover bg-center" :style="{ backgroundImage: `url(${form.backgroundImage})` }" />
          <div class="p-4">
            <p class="text-lg font-extrabold">{{ form.heroTitleEn }}</p>
            <p class="mt-1 text-xs leading-5 text-white/45">{{ form.heroSubtitleEn }}</p>
          </div>
        </div>
      </section>
    </div>

    <section class="mt-6 rounded-2xl border border-white/6 bg-white/4 p-6">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-white/40">Platform Buttons</h3>
        <button class="rounded-lg border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold" @click="addPlatform">+ Add Platform</button>
      </div>

      <div class="flex flex-col gap-3">
        <div v-for="(platform, index) in form.platforms" :key="platform.id" class="rounded-xl border border-white/6 bg-black/20 p-4">
          <div class="grid gap-3 lg:grid-cols-[1fr_160px_1.4fr]">
            <UInput v-model="platform.label" placeholder="Button label" />
            <USelect v-model="platform.platform" :items="platformOptions" value-key="value" />
            <UInput v-model="platform.url" placeholder="https://..." class="font-mono" />
          </div>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <UInput v-model="platform.helperTextTh" placeholder="Helper text TH" />
            <UInput v-model="platform.helperTextEn" placeholder="Helper text EN" />
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <label class="flex items-center gap-2 text-xs text-white/50">
              <input v-model="platform.visible" type="checkbox" class="accent-gold" />
              Visible
            </label>
            <button class="text-xs text-white/35 hover:text-gold" :disabled="index === 0" @click="movePlatform(index, -1)">Move up</button>
            <button class="text-xs text-white/35 hover:text-gold" :disabled="index === form.platforms.length - 1" @click="movePlatform(index, 1)">Move down</button>
            <button class="ml-auto text-xs text-red-400/70 hover:text-red-400" @click="removePlatform(index)">Remove</button>
          </div>
        </div>
      </div>
    </section>

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { t } = useI18n()

interface DownloadPlatform {
  id: string
  label: string
  platform: string
  url: string
  helperTextEn: string
  helperTextTh: string
  visible: boolean
  order: number
}

interface DownloadPageForm {
  heroTitleEn: string
  heroTitleTh: string
  heroSubtitleEn: string
  heroSubtitleTh: string
  backgroundImage: string
  primaryNoteEn: string
  primaryNoteTh: string
  platforms: DownloadPlatform[]
}

const defaultForm = (): DownloadPageForm => ({
  heroTitleEn: 'Download Eternal Tower Saga',
  heroTitleTh: 'Download Eternal Tower Saga',
  heroSubtitleEn: 'Choose your platform and start your climb.',
  heroSubtitleTh: 'Choose your platform and start your climb.',
  backgroundImage: '/images/hero-bg.webp',
  primaryNoteEn: 'Use official links only. Progress syncs through your game account.',
  primaryNoteTh: 'Use official links only. Progress syncs through your game account.',
  platforms: [
    { id: 'ios', label: 'App Store', platform: 'ios', url: '', helperTextEn: 'iPhone and iPad', helperTextTh: 'iPhone and iPad', visible: true, order: 0 },
    { id: 'android', label: 'Google Play', platform: 'android', url: '', helperTextEn: 'Android phones and tablets', helperTextTh: 'Android phones and tablets', visible: true, order: 1 },
    { id: 'pc', label: 'Windows PC', platform: 'pc', url: '', helperTextEn: 'Standalone PC launcher', helperTextTh: 'Standalone PC launcher', visible: true, order: 2 },
  ],
})

const form = reactive<DownloadPageForm>(defaultForm())
const saving = ref(false)
const { toast, showToast } = useAdminToast()
const platformOptions = [
  { label: 'App Store', value: 'ios' },
  { label: 'Google Play', value: 'android' },
  { label: 'Windows PC', value: 'pc' },
  { label: 'macOS', value: 'mac' },
  { label: 'Steam', value: 'steam' },
  { label: 'Epic Games Store', value: 'epic' },
  { label: 'APK', value: 'apk' },
]

function normalizeOrder() {
  form.platforms.forEach((platform, index) => { platform.order = index })
}

function addPlatform() {
  form.platforms.push({
    id: `platform-${Date.now()}`,
    label: 'New Platform',
    platform: 'pc',
    url: '',
    helperTextEn: '',
    helperTextTh: '',
    visible: true,
    order: form.platforms.length,
  })
}

function removePlatform(index: number) {
  form.platforms.splice(index, 1)
  normalizeOrder()
}

function movePlatform(index: number, direction: -1 | 1) {
  const next = index + direction
  if (next < 0 || next >= form.platforms.length) return
  const a = form.platforms[index]; const b = form.platforms[next]
  if (a && b) { form.platforms[index] = b; form.platforms[next] = a }
  normalizeOrder()
}

async function load() {
  try {
    const data = await $fetch<DownloadPageForm>('/api/admin/config?key=download_page')
    Object.assign(form, data)
  } catch {
    showToast('Failed to load download page settings', 'error')
  }
}

async function save() {
  saving.value = true
  normalizeOrder()
  try {
    await $fetch('/api/admin/config', { method: 'PUT', body: { key: 'download_page', value: form } })
    showToast('Download page saved')
  } catch (error: any) {
    showToast(error?.data?.message || 'Failed to save download page', 'error')
  } finally {
    saving.value = false
  }
}

// SSR-safe: admin auth is client-cookie based, so fetch on client only
onMounted(load)
</script>
