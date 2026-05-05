<template>
  <div>
    <section class="relative min-h-[78vh] overflow-hidden">
      <img :src="downloadConfig.backgroundImage" alt="" class="absolute inset-0 h-full w-full object-cover object-center" />
      <div class="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-surface-primary" />
      <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface-primary to-transparent" />

      <div class="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-6 pb-16 pt-32">
        <div class="max-w-3xl">
          <span class="mb-4 inline-flex rounded-full border border-gold/25 bg-black/35 px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-gold backdrop-blur-md">
            Official Download
          </span>
          <h1 class="font-display text-[clamp(2.75rem,7vw,5rem)] font-extrabold leading-none tracking-tight">
            {{ localized('heroTitle') }}
          </h1>
          <p class="mt-5 max-w-xl text-base leading-8 text-white/65 sm:text-lg">
            {{ localized('heroSubtitle') }}
          </p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 pb-20">
      <div class="mb-6 flex flex-col justify-between gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-end">
        <div>
          <h2 class="text-2xl font-bold">Choose Platform</h2>
          <p class="mt-2 max-w-2xl text-sm leading-7 text-white/50">{{ localized('primaryNote') }}</p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <article
          v-for="platform in visiblePlatforms"
          :key="platform.id"
          class="group overflow-hidden rounded-lg border border-white/8 bg-white/[0.035] p-5 transition-all duration-300 hover:border-gold/30 hover:bg-white/[0.055]"
        >
          <div class="mb-5 flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <UIcon :name="platformIcon(platform.platform)" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-lg font-extrabold">{{ platform.label }}</h3>
              <p class="text-xs text-white/40">{{ localizedPlatformHelper(platform) }}</p>
            </div>
          </div>

          <a
            v-if="platform.url"
            :href="platform.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-11 w-full items-center justify-center rounded-md bg-gradient-to-br from-gold to-gold-light px-4 text-sm font-extrabold uppercase tracking-wider text-black no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(212,168,67,0.35)]"
            @click="trackDownload(platform.platform, platform.label)"
          >
            Download
          </a>
          <span
            v-else
            class="inline-flex h-11 w-full items-center justify-center rounded-md border border-white/10 bg-white/4 px-4 text-sm font-bold uppercase tracking-wider text-white/35"
          >
            Coming Soon
          </span>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
interface DownloadPlatform {
  id: string
  label: string
  platform: 'ios' | 'android' | 'pc' | 'windows' | 'mac' | 'steam' | 'epic' | 'apk'
  url: string
  helperTextEn: string
  helperTextTh: string
  visible: boolean
  order: number
}

interface DownloadPageConfig {
  heroTitleEn: string
  heroTitleTh: string
  heroSubtitleEn: string
  heroSubtitleTh: string
  backgroundImage: string
  primaryNoteEn: string
  primaryNoteTh: string
  platforms: DownloadPlatform[]
}

const defaultDownloadConfig: DownloadPageConfig = {
  heroTitleEn: 'Download Eternal Tower Saga',
  heroTitleTh: 'Download Eternal Tower Saga',
  heroSubtitleEn: 'Choose your platform and start your climb.',
  heroSubtitleTh: 'Choose your platform and start your climb.',
  backgroundImage: '/images/hero-bg.webp',
  primaryNoteEn: 'Use official links only. Progress syncs through your game account.',
  primaryNoteTh: 'Use official links only. Progress syncs through your game account.',
  platforms: [],
}

const { locale } = useI18n()
const { trackDownload } = useTracking()
const { data } = await useFetch<DownloadPageConfig>('/api/public/download-page', { default: () => defaultDownloadConfig })
const downloadConfig = computed(() => data.value || defaultDownloadConfig)

usePageSeo({
  title: downloadConfig.value.heroTitleEn,
  description: downloadConfig.value.heroSubtitleEn,
  path: '/download',
})

const visiblePlatforms = computed(() =>
  downloadConfig.value.platforms
    .filter((platform) => platform.visible !== false)
    .sort((left, right) => left.order - right.order)
)

function localized(field: 'heroTitle' | 'heroSubtitle' | 'primaryNote') {
  const suffix = locale.value === 'th' ? 'Th' : 'En'
  return downloadConfig.value[`${field}${suffix}` as keyof DownloadPageConfig] as string
}

function localizedPlatformHelper(platform: DownloadPlatform) {
  return locale.value === 'th'
    ? platform.helperTextTh || platform.helperTextEn
    : platform.helperTextEn || platform.helperTextTh
}

function platformIcon(platform: DownloadPlatform['platform']) {
  const icons: Record<DownloadPlatform['platform'], string> = {
    ios: 'i-lucide-smartphone',
    android: 'i-lucide-smartphone',
    pc: 'i-lucide-monitor-down',
    windows: 'i-lucide-monitor-down',
    mac: 'i-lucide-laptop',
    steam: 'i-lucide-gamepad-2',
    epic: 'i-lucide-gamepad-2',
    apk: 'i-lucide-package',
  }

  return icons[platform] || 'i-lucide-download'
}
</script>
