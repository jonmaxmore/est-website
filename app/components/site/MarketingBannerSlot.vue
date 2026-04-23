<template>
  <aside
    v-if="banner"
    :data-testid="`marketing-banner-${placement}`"
    class="group overflow-hidden rounded-[1.5rem] border border-gold/25 bg-[linear-gradient(135deg,rgba(212,168,67,0.18),rgba(255,255,255,0.045)_45%,rgba(83,57,23,0.18))] p-px shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
  >
    <NuxtLink
      :to="href"
      :target="target"
      class="relative block rounded-[1.45rem] bg-[#110d17]/90 px-5 py-4 text-white no-underline transition-transform duration-300 group-hover:-translate-y-0.5"
    >
      <div class="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <p v-if="currentBadge" class="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-gold">
        {{ currentBadge }}
      </p>
      <p class="text-sm font-semibold leading-snug">{{ currentTitle }}</p>
      <p v-if="currentBody" class="mt-2 text-sm leading-relaxed text-white/58">{{ currentBody }}</p>
    </NuxtLink>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  placement: string
  banner: Record<string, any> | null
}>()

const { locale } = useI18n()

const currentTitle = computed(() =>
  locale.value === 'th'
    ? props.banner?.titleTh || props.banner?.titleEn
    : props.banner?.titleEn || props.banner?.titleTh,
)
const currentBadge = computed(() =>
  locale.value === 'th'
    ? props.banner?.badgeTh || props.banner?.badgeEn
    : props.banner?.badgeEn || props.banner?.badgeTh,
)
const currentBody = computed(() =>
  locale.value === 'th'
    ? props.banner?.bodyTh || props.banner?.bodyEn
    : props.banner?.bodyEn || props.banner?.bodyTh,
)
const href = computed(() => {
  if (!props.banner) return '/'
  if (props.banner.targetType === 'url') return props.banner.targetUrl || '/'
  if (props.banner.targetType === 'article' && props.banner.article?.slug) return `/news/${props.banner.article.slug}`
  if (props.banner.targetType === 'page' && props.banner.page?.slug) return props.banner.page.slug ? `/${props.banner.page.slug}` : '/'
  if (props.banner.targetType === 'event') return '/event'
  return '/'
})
const target = computed(() => props.banner?.targetNewTab ? '_blank' : undefined)
</script>
