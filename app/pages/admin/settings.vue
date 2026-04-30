<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Site Settings</h2>
      <p class="mt-1 text-sm text-white/50">Configure global site defaults.</p>
    </div>

    <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(420px, 1fr))">
      <div class="settings-card">
        <div class="settings-card-header">
          <h3 class="font-semibold">Navigation</h3>
          <p class="text-xs text-white/30">Navigation is managed from the Menus screen.</p>
        </div>
        <div class="flex-1 p-5">
          <NuxtLink to="/admin/menus" class="text-sm font-semibold text-gold no-underline hover:text-gold-light">
            Open Navigation Manager
          </NuxtLink>
        </div>
        <div class="settings-card-footer">
          <span class="text-xs text-white/20">Route-safe page links</span>
          <span />
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-header">
          <h3 class="font-semibold">SEO Defaults</h3>
          <p class="text-xs text-white/30">Default meta tags for search engines.</p>
        </div>
        <div class="flex-1 p-5">
          <AdminContentLanguageTabs :th-filled="!!seo.titleTh" :en-filled="!!seo.titleEn">
            <template #th>
              <UFormField label="Site Title (TH)" class="mb-3">
                <UInput v-model="seo.titleTh" />
              </UFormField>
              <UFormField label="Meta Description (TH)">
                <UTextarea v-model="seo.descriptionTh" :rows="2" />
              </UFormField>
            </template>
            <template #en>
              <UFormField label="Site Title (EN)" class="mb-3">
                <UInput v-model="seo.titleEn" />
              </UFormField>
              <UFormField label="Meta Description (EN)">
                <UTextarea v-model="seo.descriptionEn" :rows="2" />
              </UFormField>
            </template>
          </AdminContentLanguageTabs>
        </div>
        <div class="settings-card-footer">
          <span />
          <UButton size="sm" :loading="savingSeo" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveSection('seo', seo, 'savingSeo')">
            Save
          </UButton>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-header">
          <h3 class="font-semibold">Social Links</h3>
          <p class="text-xs text-white/30">Social media and community links.</p>
        </div>
        <div class="flex flex-1 flex-col gap-3 p-5">
          <div v-for="field in socialFields" :key="field.key" class="flex items-center gap-3">
            <span class="w-20 flex-shrink-0 text-xs font-semibold uppercase tracking-wider text-white/35">{{ field.label }}</span>
            <UInput v-model="(social as Record<string, string>)[field.key]" :placeholder="field.placeholder" class="flex-1" />
          </div>
        </div>
        <div class="settings-card-footer">
          <span />
          <UButton size="sm" :loading="savingSocial" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveSection('social', social, 'savingSocial')">
            Save
          </UButton>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-header">
          <h3 class="font-semibold">Maintenance Mode</h3>
          <p class="text-xs text-white/30">Take the site offline for maintenance.</p>
        </div>
        <div class="flex flex-1 flex-col gap-4 p-5">
          <label
            class="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors"
            :class="maintenance.enabled ? 'border-red-500/20 bg-red-500/8' : 'border-white/4 bg-white/2'"
          >
            <input v-model="maintenance.enabled" type="checkbox" class="h-5 w-5 accent-red-500" />
            <div>
              <p class="text-sm font-medium" :class="maintenance.enabled ? 'text-red-400' : 'text-white/50'">
                {{ maintenance.enabled ? 'Maintenance Mode Active' : 'Site is live' }}
              </p>
              <p class="text-xs text-white/25">Users will see the maintenance page when enabled.</p>
            </div>
          </label>

          <AdminContentLanguageTabs :th-filled="!!maintenance.messageTh" :en-filled="!!maintenance.messageEn">
            <template #th>
              <UFormField label="Message (TH)">
                <UTextarea v-model="maintenance.messageTh" :rows="2" placeholder="Maintenance message in Thai" />
              </UFormField>
            </template>
            <template #en>
              <UFormField label="Message (EN)">
                <UTextarea v-model="maintenance.messageEn" :rows="2" placeholder="We are currently under maintenance..." />
              </UFormField>
            </template>
          </AdminContentLanguageTabs>
        </div>
        <div class="settings-card-footer">
          <span />
          <UButton size="sm" :loading="savingMaint" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveSection('maintenance', maintenance, 'savingMaint')">
            Save
          </UButton>
        </div>
      </div>
    </div>

    <AdminToast :toast="toast" />
  </div>
</template>

<!--
  ═══ Admin Site Settings ═══
  ตั้งค่าทั่วไปของเว็บไซต์ (3 กลุ่ม)

  1. SEO Defaults: Title/Description ภาษาไทย+อังกฤษ → siteConfig key='seo'
  2. Social Links: FB, IG, Twitter, YT, TikTok, Discord, Line
     → siteConfig key='social'
  3. Maintenance Mode: เปิด/ปิด + ข้อความ 2 ภาษา
     → siteConfig key='maintenance'

  แต่ละกลุ่มบันทึกแยกกัน — กด Save ทีละอัน
  ⚠️ Navigation ย้ายไปหน้า menus.vue แทน
-->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type LoadingKey = 'savingSeo' | 'savingSocial' | 'savingMaint'

interface ConfigEntry {
  key: string
  value: unknown
}

const { toast, showToast } = useAdminToast()

const seo = reactive({ titleEn: '', titleTh: '', descriptionEn: '', descriptionTh: '' })
const social = reactive({ facebook: '', instagram: '', twitter: '', youtube: '', tiktok: '', discord: '', line: '' })
const maintenance = reactive({ enabled: false, messageEn: '', messageTh: '' })

const savingSeo = ref(false)
const savingSocial = ref(false)
const savingMaint = ref(false)

const socialFields = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/...' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
  { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/...' },
  { key: 'line', label: 'Line', placeholder: 'https://line.me/...' },
]

function assignRecord(target: Record<string, unknown>, value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    Object.assign(target, value)
  }
}

async function loadConfigs() {
  try {
    const configs = await $fetch<ConfigEntry[]>('/api/admin/config')
    for (const config of configs) {
      if (config.key === 'seo') assignRecord(seo, config.value)
      if (config.key === 'social') assignRecord(social, config.value)
      if (config.key === 'maintenance') assignRecord(maintenance, config.value)
    }
  } catch {
    showToast('Failed to load settings', 'error')
  }
}

async function saveSection(key: string, value: unknown, loadingKey: LoadingKey) {
  const loadingRefs = { savingSeo, savingSocial, savingMaint }
  loadingRefs[loadingKey].value = true

  try {
    await $fetch('/api/admin/config', { method: 'PUT', body: { key, value } })
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} saved successfully`)
  } catch (error: any) {
    showToast(error?.data?.message || error?.message || `Failed to save ${key}`, 'error')
  } finally {
    loadingRefs[loadingKey].value = false
  }
}

// SSR-safe: admin auth is client-cookie based, so fetch on client only
onMounted(loadConfigs)
</script>

<style scoped>
.settings-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
}

.settings-card-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.settings-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.01);
  padding: 12px 20px;
}
</style>
