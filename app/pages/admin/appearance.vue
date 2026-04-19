<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Theme & Appearance</h2>
      <p class="mt-1 text-sm text-white/50">Customize hero section, logo, and branding</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Hero Settings -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Hero Section</h3>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">Hero Background Image URL</label>
          <input v-model="appearance.heroBg" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" placeholder="/images/hero-bg.webp" />
        </div>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">Logo Image URL</label>
          <input v-model="appearance.logo" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" placeholder="/images/logo.webp" />
        </div>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">Tagline</label>
          <input v-model="appearance.tagline" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
        </div>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">CTA Button Text</label>
          <input v-model="appearance.ctaText" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
        </div>
        <!-- Preview -->
        <div class="mt-4 overflow-hidden rounded-lg border border-white/6">
          <div class="relative flex h-40 items-center justify-center" :style="{ backgroundImage: `url(${appearance.heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
            <div class="absolute inset-0 bg-black/60" />
            <div class="relative text-center">
              <img :src="appearance.logo" class="mx-auto mb-2 h-12 object-contain" />
              <p class="text-xs text-white/60">{{ appearance.tagline }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Brand Colors -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Brand Colors</h3>
        <div class="mb-4 flex items-center gap-4">
          <label class="flex-1 text-sm font-medium text-white/60">Primary (Gold)</label>
          <input type="color" v-model="appearance.colorPrimary" class="h-10 w-16 cursor-pointer rounded border border-white/10 bg-transparent" />
          <span class="text-xs text-white/30 font-mono">{{ appearance.colorPrimary }}</span>
        </div>
        <div class="mb-4 flex items-center gap-4">
          <label class="flex-1 text-sm font-medium text-white/60">Background</label>
          <input type="color" v-model="appearance.colorBg" class="h-10 w-16 cursor-pointer rounded border border-white/10 bg-transparent" />
          <span class="text-xs text-white/30 font-mono">{{ appearance.colorBg }}</span>
        </div>
        <div class="mb-4 flex items-center gap-4">
          <label class="flex-1 text-sm font-medium text-white/60">Accent</label>
          <input type="color" v-model="appearance.colorAccent" class="h-10 w-16 cursor-pointer rounded border border-white/10 bg-transparent" />
          <span class="text-xs text-white/30 font-mono">{{ appearance.colorAccent }}</span>
        </div>

        <h3 class="mb-5 mt-8 text-xs font-semibold uppercase tracking-widest text-white/50">Social Links</h3>
        <div v-for="social in socialFields" :key="social.key" class="mb-3">
          <label class="mb-1 block text-sm font-medium text-white/60">{{ social.label }}</label>
          <input v-model="(appearance as any)[social.key]" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" :placeholder="social.placeholder" />
        </div>
      </div>
    </div>

    <div class="mt-6 flex gap-3">
      <button @click="save" class="rounded-lg bg-gold px-8 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">Save Appearance</button>
      <button @click="load" class="rounded-lg border border-white/10 bg-transparent px-6 py-2.5 text-sm text-white/50 cursor-pointer hover:text-white transition-colors">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const appearance = ref({
  heroBg: '/images/hero-bg.webp', logo: '/images/logo.webp',
  tagline: 'ผจญภัยไปด้วยกัน พิชิตยอดหอคอย', ctaText: 'ลงทะเบียนล่วงหน้าเลย',
  colorPrimary: '#d4a843', colorBg: '#0a0a0f', colorAccent: '#b8922e',
  facebook: '', twitter: '', youtube: '', discord: '', line: '',
})
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
    if (data) Object.assign(appearance.value, data)
  } catch { /* defaults */ }
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
