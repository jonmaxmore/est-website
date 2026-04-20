<template>
  <div>
    <div class="mb-6"><h2 class="text-2xl font-bold">Site Settings</h2><p class="mt-1 text-sm text-white/50">Configure your portal</p></div>
    <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(420px, 1fr))">
      <!-- Navigation -->
      <div class="flex flex-col overflow-hidden rounded-2xl border border-white/6 bg-white/4">
        <div class="border-b border-white/6 p-5"><h3 class="font-semibold">🧭 Navigation</h3><p class="text-xs text-white/30">Configure the main navigation menu items</p></div>
        <div class="flex-1 p-5">
          <div v-for="(item, i) in navItems" :key="i" class="mb-2 flex items-center gap-2">
            <UInput v-model="item.labelEn" placeholder="Label (EN)" size="sm" class="flex-1" />
            <UInput v-model="item.labelTh" placeholder="Label (TH)" size="sm" class="flex-1" />
            <UInput v-model="item.href" placeholder="/path" size="sm" class="flex-1" />
            <button class="flex h-8 w-8 items-center justify-center rounded-md text-red-400 transition-colors hover:bg-red-500/15" @click="navItems.splice(i, 1)">✕</button>
          </div>
          <UButton size="xs" variant="ghost" @click="navItems.push({ labelEn: '', labelTh: '', href: '' })">+ Add Item</UButton>
        </div>
        <div class="flex justify-end border-t border-white/6 p-3"><UButton size="sm" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveConfig('navigation', navItems)">Save</UButton></div>
      </div>
      <!-- SEO -->
      <div class="flex flex-col overflow-hidden rounded-2xl border border-white/6 bg-white/4">
        <div class="border-b border-white/6 p-5"><h3 class="font-semibold">🔍 SEO Defaults</h3><p class="text-xs text-white/30">Default meta tags for the site</p></div>
        <div class="flex-1 p-5 flex flex-col gap-3">
          <UFormField label="Title (EN)"><UInput v-model="seo.titleEn" /></UFormField>
          <UFormField label="Title (TH)"><UInput v-model="seo.titleTh" /></UFormField>
          <UFormField label="Description (EN)"><UTextarea v-model="seo.descriptionEn" :rows="2" /></UFormField>
          <UFormField label="Description (TH)"><UTextarea v-model="seo.descriptionTh" :rows="2" /></UFormField>
        </div>
        <div class="flex justify-end border-t border-white/6 p-3"><UButton size="sm" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveConfig('seo', seo)">Save</UButton></div>
      </div>
      <!-- Social -->
      <div class="flex flex-col overflow-hidden rounded-2xl border border-white/6 bg-white/4">
        <div class="border-b border-white/6 p-5"><h3 class="font-semibold">📱 Social Links</h3><p class="text-xs text-white/30">Social media and community links</p></div>
        <div class="flex-1 p-5 flex flex-col gap-3">
          <UFormField label="Facebook"><UInput v-model="social.facebook" placeholder="https://facebook.com/..." /></UFormField>
          <UFormField label="Twitter / X"><UInput v-model="social.twitter" placeholder="https://twitter.com/..." /></UFormField>
          <UFormField label="YouTube"><UInput v-model="social.youtube" placeholder="https://youtube.com/..." /></UFormField>
          <UFormField label="Discord"><UInput v-model="social.discord" placeholder="https://discord.gg/..." /></UFormField>
          <UFormField label="LINE"><UInput v-model="social.line" placeholder="https://line.me/..." /></UFormField>
        </div>
        <div class="flex justify-end border-t border-white/6 p-3"><UButton size="sm" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveConfig('social', social)">Save</UButton></div>
      </div>
      <!-- Maintenance -->
      <div class="flex flex-col overflow-hidden rounded-2xl border border-white/6 bg-white/4">
        <div class="border-b border-white/6 p-5"><h3 class="font-semibold">🔧 Maintenance</h3><p class="text-xs text-white/30">System maintenance settings</p></div>
        <div class="flex-1 p-5 flex flex-col gap-3">
          <label class="flex items-center gap-2 text-sm text-white/50"><input v-model="maintenance.enabled" type="checkbox" /> Enable maintenance mode</label>
          <UFormField label="Message (EN)"><UTextarea v-model="maintenance.messageEn" :rows="2" /></UFormField>
          <UFormField label="Message (TH)"><UTextarea v-model="maintenance.messageTh" :rows="2" /></UFormField>
        </div>
        <div class="flex justify-end border-t border-white/6 p-3"><UButton size="sm" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveConfig('maintenance', maintenance)">Save</UButton></div>
      </div>
    </div>
    <!-- Toast -->
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
async function loadConfigs() { try { const configs: ConfigEntry[] = await $fetch('/api/admin/config'); for (const c of configs) { if (c.key === 'navigation' && Array.isArray(c.value)) { navItems.splice(0, navItems.length, ...(c.value as typeof navItems)) }; if (c.key === 'seo') Object.assign(seo, c.value); if (c.key === 'social') Object.assign(social, c.value); if (c.key === 'maintenance') Object.assign(maintenance, c.value) } } catch {} }
async function saveConfig(key: string, value: unknown) {
  try { await $fetch('/api/admin/config', { method: 'PUT', body: { key, value } }); showToast(`${key} saved successfully`) }
  catch { showToast(`Failed to save ${key}`, 'error') }
}
await loadConfigs()
</script>
