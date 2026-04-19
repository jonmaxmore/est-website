<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Backup & Restore</h2>
      <p class="mt-1 text-sm text-white/50">Export and import your site data</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Export -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Export Data</h3>
        <p class="mb-5 text-sm text-white/50">Download a complete backup of your site data as JSON.</p>

        <div class="mb-4 flex flex-col gap-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="exportOptions.news" class="accent-gold" /> <span class="text-sm">News Articles</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="exportOptions.weapons" class="accent-gold" /> <span class="text-sm">Weapons</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="exportOptions.registrations" class="accent-gold" /> <span class="text-sm">Registrations</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="exportOptions.config" class="accent-gold" /> <span class="text-sm">Site Configuration</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="exportOptions.users" class="accent-gold" /> <span class="text-sm">Admin Users</span>
          </label>
        </div>

        <button @click="exportData" class="w-full rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">📦 Export Selected Data</button>
      </div>

      <!-- Import -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-5 text-xs font-semibold uppercase tracking-widest text-white/50">Import Data</h3>
        <p class="mb-5 text-sm text-white/50">Restore data from a previously exported JSON backup file.</p>

        <div class="mb-4 rounded-xl border-2 border-dashed border-white/10 p-8 text-center">
          <input type="file" accept=".json" @change="handleFile" class="hidden" ref="fileInput" />
          <div class="mb-3 text-4xl">📁</div>
          <p class="mb-2 text-sm text-white/50">Drop JSON file here or</p>
          <button @click="($refs.fileInput as HTMLInputElement)?.click()" class="cursor-pointer rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Browse Files</button>
        </div>

        <div v-if="importFile" class="mb-4 rounded-lg bg-white/2 p-3">
          <p class="text-sm font-medium">{{ importFile.name }}</p>
          <p class="text-xs text-white/40">{{ (importFile.size / 1024).toFixed(1) }} KB</p>
        </div>

        <button @click="importData" :disabled="!importFile" class="w-full rounded-lg border border-white/10 bg-transparent px-6 py-2.5 text-sm font-bold text-white/50 cursor-pointer hover:border-gold/30 hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed">📥 Import Data</button>

        <!-- WordPress Import -->
        <div class="mt-6 border-t border-white/6 pt-6">
          <h4 class="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">Import from WordPress</h4>
          <p class="mb-3 text-xs text-white/40">Import posts from WordPress REST API</p>
          <input v-model="wpUrl" class="mb-3 w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="https://your-wp-site.com" />
          <button @click="importFromWP" class="w-full rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-400 cursor-pointer hover:bg-blue-500/20 transition-colors">🔗 Import from WordPress</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const exportOptions = ref({ news: true, weapons: true, registrations: true, config: true, users: false })
const importFile = ref<File | null>(null)
const wpUrl = ref('')

async function exportData() {
  const data = await $fetch<Blob>('/api/admin/backup/export', {
    method: 'POST', body: exportOptions.value, responseType: 'blob'
  })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = `ets-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleFile(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.[0]) importFile.value = files[0]
}

async function importData() {
  if (!importFile.value) return
  const text = await importFile.value.text()
  await $fetch('/api/admin/backup/import', { method: 'POST', body: JSON.parse(text) })
  alert('Data imported successfully!')
}

async function importFromWP() {
  if (!wpUrl.value) return
  await $fetch('/api/admin/backup/import-wp', { method: 'POST', body: { url: wpUrl.value } })
  alert('WordPress import complete!')
}
</script>
