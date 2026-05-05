<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">{{ t('admin.appearance.title') }}</h2>
      <p class="mt-1 text-sm text-white/50">{{ t('admin.appearance.subtitle') }}</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Hero Settings -->
      <div class="panel">
        <h3 class="panel-title">Hero Section</h3>
        <AdminMediaPicker v-model="appearance.heroBg" label="Hero Background Image" />
        <div class="mt-4">
          <AdminMediaPicker v-model="appearance.logo" label="Logo Image" />
        </div>
        <UFormField label="Tagline" class="mt-4">
          <UInput v-model="appearance.tagline" />
        </UFormField>
        <UFormField label="CTA Button Text" class="mt-3">
          <UInput v-model="appearance.ctaText" />
        </UFormField>

        <!-- Preview -->
        <div class="mt-5 overflow-hidden rounded-lg border border-white/6">
          <div class="relative flex h-40 items-center justify-center" :style="{ backgroundImage: `url(${appearance.heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
            <div class="absolute inset-0 bg-black/60" />
            <div class="relative text-center">
              <img :src="appearance.logo" class="mx-auto mb-2 h-12 object-contain" />
              <p class="text-xs text-white/60">{{ appearance.tagline }}</p>
              <div class="mx-auto mt-2 inline-block rounded-full bg-gradient-to-r from-[#d4a843] to-[#e8c468] px-4 py-1 text-xs font-bold text-black">{{ appearance.ctaText }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Brand Colors + Social -->
      <div class="panel">
        <h3 class="panel-title">Brand Colors</h3>
        <div class="flex flex-col gap-4">
          <div v-for="color in colorFields" :key="color.key" class="flex items-center gap-4">
            <label class="flex-1 text-sm font-medium text-white/60">{{ color.label }}</label>
            <input type="color" v-model="(appearance as Record<string, string>)[color.key]" class="h-10 w-16 cursor-pointer rounded border border-white/10 bg-transparent" />
            <span class="w-16 text-xs text-white/30 font-mono">{{ (appearance as Record<string, string>)[color.key] }}</span>
          </div>
        </div>

        <h3 class="panel-title mt-8">Social Links</h3>
        <div class="flex flex-col gap-3">
          <div v-for="social in socialFields" :key="social.key">
            <UFormField :label="social.label">
              <UInput v-model="(appearance as Record<string, string>)[social.key]" :placeholder="social.placeholder" />
            </UFormField>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex gap-3">
      <button @click="save" class="gold-btn">Save Appearance</button>
      <button @click="load" class="ghost-btn">Reset</button>
    </div>

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { t } = useI18n()

const appearance = ref({
  heroBg: '/images/hero-bg.webp', logo: '/images/logo.webp',
  tagline: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย', ctaText: 'ลงทะเบียนล่วงหน้าเลย',
  colorPrimary: '#d4a843', colorBg: '#0a0a0f', colorAccent: '#b8922e',
  facebook: '', twitter: '', youtube: '', discord: '', line: '',
})

const colorFields = [
  { key: 'colorPrimary', label: 'Primary (Gold)' },
  { key: 'colorBg', label: 'Background' },
  { key: 'colorAccent', label: 'Accent' },
]

const socialFields = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
  { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/...' },
  { key: 'line', label: 'LINE', placeholder: 'https://line.me/...' },
]

async function load() {
  try {
    const data = await $fetch<Record<string, unknown>>('/api/admin/config?key=appearance')
    if (data && typeof data === 'object') Object.assign(appearance.value, data)
  } catch { /* keep defaults */ }
}

const { toast, showToast } = useAdminToast()

async function save() {
  try {
    await $fetch('/api/admin/config', { method: 'PUT', body: { key: 'appearance', value: appearance.value } })
    showToast('Appearance saved!')
  } catch { showToast('Failed to save appearance', 'error') }
}

onMounted(load)
</script>

<style scoped>
.panel { border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03); padding: 24px; }
.panel-title { margin-bottom: 20px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.4); }
.gold-btn { padding: 10px 28px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }
.ghost-btn { padding: 10px 20px; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; background: transparent; color: rgba(255,255,255,0.5); font-size: 0.875rem; cursor: pointer; transition: all 0.15s; }
.ghost-btn:hover { color: white; border-color: rgba(255,255,255,0.2); }
</style>
