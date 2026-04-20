<template>
  <div>
    <div class="mb-6"><h2 class="text-2xl font-bold">Site Settings</h2><p class="mt-1 text-sm text-white/50">Configure your portal</p></div>
    <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(420px, 1fr))">
      <!-- Navigation -->
      <div class="settings-card">
        <div class="settings-card-header"><h3 class="font-semibold">🧭 Navigation</h3><p class="text-xs text-white/30">Configure the main navigation menu items</p></div>
        <div class="flex-1 p-5">
          <div v-for="(item, i) in navItems" :key="i" class="mb-2 flex items-center gap-2">
            <span class="sort-handle text-xs text-white/15">☰</span>
            <UInput v-model="item.labelEn" placeholder="Label (EN)" size="sm" class="flex-1" />
            <UInput v-model="item.labelTh" placeholder="Label (TH)" size="sm" class="flex-1" />
            <UInput v-model="item.href" placeholder="/path" size="sm" class="flex-1" />
            <button class="remove-item-btn" @click="navItems.splice(i, 1)">✕</button>
          </div>
          <UButton size="xs" variant="ghost" @click="navItems.push({ labelEn: '', labelTh: '', href: '' })">+ Add Item</UButton>
        </div>
        <div class="settings-card-footer">
          <span class="text-xs text-white/20">{{ navItems.length }} items</span>
          <UButton size="sm" :loading="savingNav" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveSection('navigation', navItems, 'savingNav')">Save</UButton>
        </div>
      </div>

      <!-- SEO — Now with Language Tabs -->
      <div class="settings-card">
        <div class="settings-card-header"><h3 class="font-semibold">🔍 SEO Defaults</h3><p class="text-xs text-white/30">Default meta tags for search engines</p></div>
        <div class="flex-1 p-5">
          <AdminContentLanguageTabs :th-filled="!!seo.titleTh" :en-filled="!!seo.titleEn">
            <template #th>
              <UFormField label="Site Title (TH)" class="mb-3"><UInput v-model="seo.titleTh" /></UFormField>
              <UFormField label="Meta Description (TH)"><UTextarea v-model="seo.descriptionTh" :rows="2" /></UFormField>
            </template>
            <template #en>
              <UFormField label="Site Title (EN)" class="mb-3"><UInput v-model="seo.titleEn" /></UFormField>
              <UFormField label="Meta Description (EN)"><UTextarea v-model="seo.descriptionEn" :rows="2" /></UFormField>
            </template>
          </AdminContentLanguageTabs>
        </div>
        <div class="settings-card-footer">
          <span />
          <UButton size="sm" :loading="savingSeo" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveSection('seo', seo, 'savingSeo')">Save</UButton>
        </div>
      </div>

      <!-- Social Links -->
      <div class="settings-card">
        <div class="settings-card-header"><h3 class="font-semibold">📱 Social Links</h3><p class="text-xs text-white/30">Social media and community links</p></div>
        <div class="flex-1 p-5 flex flex-col gap-3">
          <div v-for="s in socialFields" :key="s.key" class="flex items-center gap-3">
            <span class="text-lg flex-shrink-0">{{ s.icon }}</span>
            <UInput v-model="(social as Record<string, string>)[s.key]" :placeholder="s.placeholder" class="flex-1" />
          </div>
        </div>
        <div class="settings-card-footer">
          <span />
          <UButton size="sm" :loading="savingSocial" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveSection('social', social, 'savingSocial')">Save</UButton>
        </div>
      </div>

      <!-- Maintenance -->
      <div class="settings-card">
        <div class="settings-card-header"><h3 class="font-semibold">🔧 Maintenance Mode</h3><p class="text-xs text-white/30">Take the site offline for maintenance</p></div>
        <div class="flex-1 p-5 flex flex-col gap-4">
          <label class="flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors" :class="maintenance.enabled ? 'bg-red-500/8 border border-red-500/20' : 'bg-white/2 border border-white/4'">
            <input v-model="maintenance.enabled" type="checkbox" class="accent-red-500 w-5 h-5" />
            <div>
              <p class="text-sm font-medium" :class="maintenance.enabled ? 'text-red-400' : 'text-white/50'">
                {{ maintenance.enabled ? '🔴 Maintenance Mode ACTIVE' : '🟢 Site is live' }}
              </p>
              <p class="text-xs text-white/25">Users will see the maintenance page</p>
            </div>
          </label>
          <AdminContentLanguageTabs :th-filled="!!maintenance.messageTh" :en-filled="!!maintenance.messageEn">
            <template #th>
              <UFormField label="Message (TH)"><UTextarea v-model="maintenance.messageTh" :rows="2" placeholder="เว็บไซต์อยู่ระหว่างการปรับปรุง..." /></UFormField>
            </template>
            <template #en>
              <UFormField label="Message (EN)"><UTextarea v-model="maintenance.messageEn" :rows="2" placeholder="We are currently under maintenance..." /></UFormField>
            </template>
          </AdminContentLanguageTabs>
        </div>
        <div class="settings-card-footer">
          <span />
          <UButton size="sm" :loading="savingMaint" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveSection('maintenance', maintenance, 'savingMaint')">Save</UButton>
        </div>
      </div>
    </div>

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
interface ConfigEntry { key: string; value: unknown }
const { toast, showToast } = useAdminToast()

const navItems = reactive<Array<{ labelEn: string; labelTh: string; href: string }>>([])
const seo = reactive({ titleEn: '', titleTh: '', descriptionEn: '', descriptionTh: '' })
const social = reactive({ facebook: '', twitter: '', youtube: '', discord: '', line: '' })
const maintenance = reactive({ enabled: false, messageEn: '', messageTh: '' })

const savingNav = ref(false)
const savingSeo = ref(false)
const savingSocial = ref(false)
const savingMaint = ref(false)

const socialFields = [
  { key: 'facebook', icon: '📘', placeholder: 'https://facebook.com/...' },
  { key: 'twitter', icon: '🐦', placeholder: 'https://twitter.com/...' },
  { key: 'youtube', icon: '▶️', placeholder: 'https://youtube.com/...' },
  { key: 'discord', icon: '💬', placeholder: 'https://discord.gg/...' },
  { key: 'line', icon: '💚', placeholder: 'https://line.me/...' },
]

async function loadConfigs() {
  try {
    const configs: ConfigEntry[] = await $fetch('/api/admin/config')
    for (const c of configs) {
      const val = (c as { value: unknown }).value
      if (c.key === 'navigation' && val && typeof val === 'object') {
        const nav = val as { main?: typeof navItems }
        if (Array.isArray(nav.main)) navItems.splice(0, navItems.length, ...nav.main)
        else if (Array.isArray(val)) navItems.splice(0, navItems.length, ...(val as typeof navItems))
      }
      if (c.key === 'seo' && val && typeof val === 'object') Object.assign(seo, val)
      if (c.key === 'social' && val && typeof val === 'object') Object.assign(social, val)
      if (c.key === 'maintenance' && val && typeof val === 'object') Object.assign(maintenance, val)
    }
  } catch { /* keep defaults */ }
}

async function saveSection(key: string, value: unknown, loadingKey: string) {
  const loadingRef = { savingNav, savingSeo, savingSocial, savingMaint }[loadingKey]
  if (loadingRef) loadingRef.value = true
  try {
    await $fetch('/api/admin/config', { method: 'PUT', body: { key, value } })
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} saved successfully`)
  } catch {
    showToast(`Failed to save ${key}`, 'error')
  } finally {
    if (loadingRef) loadingRef.value = false
  }
}

await loadConfigs()
</script>

<style scoped>
.settings-card {
  display: flex; flex-direction: column; overflow: hidden;
  border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
}
.settings-card-header {
  padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.settings-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.01);
}
.remove-item-btn {
  display: flex; width: 28px; height: 28px; align-items: center; justify-content: center;
  border: none; border-radius: 6px; background: transparent;
  color: rgba(255,255,255,0.2); cursor: pointer; transition: all 0.15s;
}
.remove-item-btn:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
.sort-handle { cursor: grab; user-select: none; }
</style>
