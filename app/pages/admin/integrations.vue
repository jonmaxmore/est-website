<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Integrations</h2>
      <p class="mt-1 text-sm text-white/50">Connect with WordPress, Wix, and external services</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- WordPress -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10"><UIcon name="i-lucide-file-text" class="w-6 h-6 text-blue-400" /></div>
          <div>
            <h3 class="text-lg font-bold">WordPress</h3>
            <p class="text-xs text-white/40">Bidirectional content sync</p>
          </div>
          <span class="ml-auto rounded-full px-2 py-0.5 text-[0.625rem] font-semibold"
            :class="integrations.wordpress.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'">
            {{ integrations.wordpress.enabled ? 'Connected' : 'Disabled' }}
          </span>
        </div>
        <div class="mb-3">
          <label class="mb-1 block text-sm text-white/60">Site URL</label>
          <input v-model="integrations.wordpress.url" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="https://your-wordpress-site.com" />
        </div>
        <div class="mb-3">
          <label class="mb-1 block text-sm text-white/60">API Key</label>
          <input v-model="integrations.wordpress.apiKey" type="password" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" />
        </div>
        <div class="mb-3 flex items-center gap-3">
          <label class="text-sm text-white/60">Sync Direction:</label>
          <select v-model="integrations.wordpress.syncDirection" class="rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-sm text-white outline-none">
            <option value="pull">Pull (WP → ETS)</option>
            <option value="push">Push (ETS → WP)</option>
            <option value="bidirectional">Bidirectional</option>
          </select>
        </div>
        <label class="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" v-model="integrations.wordpress.enabled" class="accent-gold" /> Enable WordPress Integration
        </label>
      </div>

      <!-- Wix -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10"><UIcon name="i-lucide-palette" class="w-6 h-6 text-purple-400" /></div>
          <div>
            <h3 class="text-lg font-bold">Wix</h3>
            <p class="text-xs text-white/40">Webhook-based content sync</p>
          </div>
          <span class="ml-auto rounded-full px-2 py-0.5 text-[0.625rem] font-semibold"
            :class="integrations.wix.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'">
            {{ integrations.wix.enabled ? 'Connected' : 'Disabled' }}
          </span>
        </div>
        <div class="mb-3">
          <label class="mb-1 block text-sm text-white/60">Account ID</label>
          <input v-model="integrations.wix.accountId" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" />
        </div>
        <div class="mb-3">
          <label class="mb-1 block text-sm text-white/60">API Key</label>
          <input v-model="integrations.wix.apiKey" type="password" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" />
        </div>
        <div class="mb-3">
          <label class="mb-1 block text-sm text-white/60">Webhook Secret</label>
          <input v-model="integrations.wix.webhookSecret" type="password" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" />
        </div>
        <label class="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" v-model="integrations.wix.enabled" class="accent-gold" /> Enable Wix Integration
        </label>
      </div>

      <!-- Webhook Endpoint -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10"><UIcon name="i-lucide-link" class="w-6 h-6 text-[#d4a843]" /></div>
          <div>
            <h3 class="text-lg font-bold">Webhook Endpoint</h3>
            <p class="text-xs text-white/40">Receive signed events from external services</p>
          </div>
        </div>
        <div class="mb-3">
          <label class="mb-1 block text-sm text-white/60">Shared Webhook Secret</label>
          <input v-model="integrations.webhookSecret" type="password" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" />
        </div>
        <div class="rounded-lg bg-white/2 p-4 font-mono text-xs text-gold">
          POST {{ siteUrl }}/api/integration/webhook
        </div>
        <p class="mt-3 text-xs text-white/40">Send JSON payloads with the <code>x-webhook-secret</code> header to sync content from an external CMS.</p>
      </div>

      <!-- Marketing Tracking -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10"><UIcon name="i-lucide-chart-no-axes-combined" class="w-6 h-6 text-emerald-400" /></div>
          <div>
            <h3 class="text-lg font-bold">Marketing Tracking</h3>
            <p class="text-xs text-white/40">Google Analytics, Tag Manager, and Meta Pixel</p>
          </div>
          <span class="ml-auto rounded-full px-2 py-0.5 text-[0.625rem] font-semibold"
            :class="integrations.analytics.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'">
            {{ integrations.analytics.enabled ? 'Enabled' : 'Disabled' }}
          </span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm text-white/60">GA4 Measurement ID</label>
            <input v-model="integrations.analytics.googleAnalyticsId" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="G-XXXXXXXXXX" />
          </div>
          <div>
            <label class="mb-1 block text-sm text-white/60">Google Tag Manager ID</label>
            <input v-model="integrations.analytics.googleTagManagerId" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="GTM-XXXXXXX" />
          </div>
          <div>
            <label class="mb-1 block text-sm text-white/60">Meta Pixel / Dataset ID</label>
            <input v-model="integrations.analytics.metaPixelId" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" placeholder="1234567890" />
          </div>
          <div>
            <label class="mb-1 block text-sm text-white/60">Meta Conversions API Token</label>
            <input v-model="integrations.analytics.metaConversionsApiToken" type="password" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50 font-mono" />
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-4">
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" v-model="integrations.analytics.enabled" class="accent-gold" /> Enable browser tracking
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" v-model="integrations.analytics.debug" class="accent-gold" /> Debug mode
          </label>
        </div>
        <p class="mt-3 text-xs text-white/40">Server-side event storage remains active for dashboard analytics even when external pixels are disabled.</p>
      </div>

      <!-- Generic REST API -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10"><UIcon name="i-lucide-radio" class="w-6 h-6 text-emerald-400" /></div>
          <div>
            <h3 class="text-lg font-bold">REST API</h3>
            <p class="text-xs text-white/40">Public API endpoints for external access</p>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2 rounded-lg bg-white/2 p-3">
            <span class="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[0.625rem] font-bold text-emerald-400">GET</span>
            <span class="text-xs font-mono text-white/60">/api/public/news</span>
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-white/2 p-3">
            <span class="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[0.625rem] font-bold text-emerald-400">GET</span>
            <span class="text-xs font-mono text-white/60">/api/public/weapons</span>
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-white/2 p-3">
            <span class="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[0.625rem] font-bold text-emerald-400">GET</span>
            <span class="text-xs font-mono text-white/60">/api/integration/export/news</span>
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-white/2 p-3">
            <span class="rounded bg-blue-500/20 px-1.5 py-0.5 text-[0.625rem] font-bold text-blue-400">POST</span>
            <span class="text-xs font-mono text-white/60">/api/integration/webhook</span>
          </div>
        </div>
      </div>
    </div>

    <button @click="save" class="mt-6 rounded-lg bg-gold px-8 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">Save Integration Settings</button>

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://eternaltowersaga.com'

const integrations = ref({
  webhookSecret: '',
  analytics: {
    enabled: false,
    googleAnalyticsId: '',
    googleTagManagerId: '',
    metaPixelId: '',
    metaConversionsApiToken: '',
    debug: false,
  },
  wordpress: { enabled: false, url: '', apiKey: '', syncDirection: 'bidirectional' },
  wix: { enabled: false, accountId: '', apiKey: '', webhookSecret: '' },
})

const { toast, showToast } = useAdminToast()
async function save() {
  try {
    await $fetch('/api/admin/config', { method: 'PUT', body: { key: 'integrations', value: integrations.value } })
    showToast('Integration settings saved!')
  } catch { showToast('Failed to save integration settings', 'error') }
}
onMounted(async () => {
  try {
    const data = await $fetch<typeof integrations.value>('/api/admin/config?key=integrations')
    if (data && typeof data === 'object') Object.assign(integrations.value, data)
  } catch { /* use defaults */ }
})
</script>
