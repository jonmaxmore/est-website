<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">SEO Settings</h2>
      <p class="mt-1 text-sm text-white/50">Search engine optimization and meta configuration</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Global SEO -->
      <div class="panel">
        <h3 class="panel-title">Global SEO</h3>

        <AdminContentLanguageTabs :th-filled="!!seo.siteTitleTh" :en-filled="!!seo.siteTitle">
          <template #th>
            <UFormField label="Site Title (TH)" class="mb-3"><UInput v-model="seo.siteTitleTh" /></UFormField>
            <UFormField label="Meta Description (TH)"><UTextarea v-model="seo.metaDescTh" :rows="3" /></UFormField>
          </template>
          <template #en>
            <UFormField label="Site Title (EN)" class="mb-3"><UInput v-model="seo.siteTitle" /></UFormField>
            <UFormField label="Meta Description (EN)"><UTextarea v-model="seo.metaDesc" :rows="3" /></UFormField>
          </template>
        </AdminContentLanguageTabs>

        <div class="mt-4">
          <AdminMediaPicker v-model="seo.ogImage" label="OG Image (Social Sharing)" />
        </div>

        <UFormField label="Google Analytics ID" class="mt-4">
          <UInput v-model="seo.gaId" placeholder="G-XXXXXXXXXX" class="font-mono" />
        </UFormField>
        <UFormField label="Google Search Console Verification" class="mt-3">
          <UInput v-model="seo.gscVerification" class="font-mono" />
        </UFormField>

        <!-- SEO Preview Card -->
        <div class="mt-5 rounded-lg border border-white/6 bg-white/2 p-4">
          <p class="mb-3 text-xs font-medium text-white/30">Google Preview</p>
          <p class="text-sm text-blue-400 truncate">{{ seo.siteTitle || 'Site Title' }}</p>
          <p class="text-xs text-emerald-400 font-mono truncate">{{ seo.canonicalUrl || 'https://eternaltowersaga.com' }}</p>
          <p class="mt-1 text-xs text-white/40 line-clamp-2">{{ seo.metaDesc || 'Meta description will appear here...' }}</p>
        </div>
      </div>

      <!-- Sitemap & Robots -->
      <div class="panel">
        <h3 class="panel-title">Sitemap & Robots</h3>
        <div class="mb-4 flex items-center justify-between rounded-lg bg-white/2 p-4">
          <div>
            <p class="text-sm font-medium">Auto Sitemap</p>
            <p class="text-xs text-white/40">Generated at /sitemap.xml</p>
          </div>
          <AdminStatusBadge status="ACTIVE" />
        </div>
        <div class="mb-4 flex items-center justify-between rounded-lg bg-white/2 p-4">
          <div>
            <p class="text-sm font-medium">Robots.txt</p>
            <p class="text-xs text-white/40">Generated at /robots.txt</p>
          </div>
          <AdminStatusBadge status="ACTIVE" />
        </div>

        <h3 class="panel-title mt-8">Structured Data</h3>
        <UFormField label="Schema.org Type">
          <USelect v-model="seo.schemaType" :items="['VideoGame', 'WebApplication', 'SoftwareApplication']" />
        </UFormField>
        <UFormField label="Canonical URL" class="mt-3">
          <UInput v-model="seo.canonicalUrl" placeholder="https://eternaltowersaga.com" class="font-mono" />
        </UFormField>

        <h3 class="panel-title mt-8">Social Preview</h3>
        <div class="overflow-hidden rounded-lg border border-white/6">
          <div v-if="seo.ogImage" class="h-32 bg-cover bg-center" :style="{ backgroundImage: `url(${seo.ogImage})` }" />
          <div class="bg-white/2 p-3">
            <p class="text-xs text-white/30">eternaltowersaga.com</p>
            <p class="text-sm font-semibold">{{ seo.siteTitle || 'Eternal Tower Saga' }}</p>
            <p class="text-xs text-white/40 line-clamp-2">{{ seo.metaDesc || 'Description' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex gap-3">
      <button @click="save" class="gold-btn">Save SEO Settings</button>
      <button @click="loadData" class="ghost-btn">Reset</button>
    </div>

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const seo = ref({
  siteTitle: 'Eternal Tower Saga — Mobile MMORPG',
  siteTitleTh: 'Eternal Tower Saga — เกม RPG บนมือถือ',
  metaDesc: 'Eternal Tower Saga — K-Fantasy Mobile MMORPG',
  metaDescTh: 'Eternal Tower Saga — เกม Mobile MMORPG แนว K-Fantasy สุดมหากาพย์',
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

async function loadData() {
  try {
    const data = await $fetch<typeof seo.value>('/api/admin/config?key=seo')
    if (data && typeof data === 'object') Object.assign(seo.value, data)
  } catch { /* keep defaults */ }
}

onMounted(loadData)
</script>

<style scoped>
.panel { border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03); padding: 24px; }
.panel-title { margin-bottom: 20px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.4); }
.gold-btn { padding: 10px 28px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }
.ghost-btn { padding: 10px 20px; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; background: transparent; color: rgba(255,255,255,0.5); font-size: 0.875rem; cursor: pointer; }
.ghost-btn:hover { color: white; border-color: rgba(255,255,255,0.2); }
</style>
