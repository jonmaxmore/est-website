<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">SEO Settings</h2>
      <p class="mt-1 text-sm text-white/50">Search engine optimization and meta configuration</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Global SEO -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Global SEO</h3>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">Site Title</label>
          <input v-model="seo.siteTitle" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
        </div>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">Meta Description</label>
          <textarea v-model="seo.metaDesc" rows="3" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
        </div>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">OG Image URL</label>
          <input v-model="seo.ogImage" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
        </div>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">Google Analytics ID</label>
          <input v-model="seo.gaId" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="G-XXXXXXXXXX" />
        </div>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">Google Search Console Verification</label>
          <input v-model="seo.gscVerification" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" />
        </div>
      </div>

      <!-- Sitemap & Robots -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Sitemap & Robots</h3>
        <div class="mb-4 flex items-center justify-between rounded-lg bg-white/2 p-4">
          <div>
            <p class="text-sm font-medium">Auto Sitemap</p>
            <p class="text-xs text-white/40">Generated at /sitemap.xml</p>
          </div>
          <span class="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">Active</span>
        </div>
        <div class="mb-4 flex items-center justify-between rounded-lg bg-white/2 p-4">
          <div>
            <p class="text-sm font-medium">Robots.txt</p>
            <p class="text-xs text-white/40">Generated at /robots.txt</p>
          </div>
          <span class="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">Active</span>
        </div>

        <h3 class="mb-5 mt-8 text-xs font-semibold uppercase tracking-widest text-white/50">Structured Data</h3>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">Schema.org Type</label>
          <select v-model="seo.schemaType" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50">
            <option value="VideoGame">VideoGame</option>
            <option value="WebApplication">WebApplication</option>
            <option value="SoftwareApplication">SoftwareApplication</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-white/60">Canonical URL</label>
          <input v-model="seo.canonicalUrl" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="https://eternaltowersaga.com" />
        </div>
      </div>
    </div>

    <button @click="save" class="mt-6 rounded-lg bg-gold px-8 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">Save SEO Settings</button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const seo = ref({
  siteTitle: 'Eternal Tower Saga — เกม RPG บนมือถือ',
  metaDesc: 'Eternal Tower Saga — เกม Mobile MMORPG แนว K-Fantasy สุดมหากาพย์',
  ogImage: '/images/og-cover.png',
  gaId: '', gscVerification: '',
  schemaType: 'VideoGame', canonicalUrl: 'https://eternaltowersaga.com',
})
const { toast, showToast } = useAdminToast()
async function save() {
  try {
    await $fetch('/api/admin/config', { method: 'PUT', body: { key: 'seo', value: seo.value } })
    showToast('SEO settings saved!')
  } catch { showToast('Failed to save SEO settings', 'error') }
}
onMounted(async () => {
  try { const data = await $fetch<typeof seo.value>('/api/admin/config?key=seo'); if (data) Object.assign(seo.value, data) } catch { /* defaults */ }
})
</script>
