<template>
  <NuxtLink
    :to="`/news/${article.slug}`"
    class="group grid gap-4 border-t border-white/10 py-5 text-white no-underline transition-colors duration-300 hover:border-gold/45 sm:grid-cols-[112px_minmax(0,1fr)]"
  >
    <div class="relative h-28 overflow-hidden rounded-2xl bg-white/5">
      <img
        v-if="article.featuredImage"
        :src="article.featuredImage"
        :alt="title"
        class="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
        loading="lazy"
      />
      <div v-else class="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(212,168,67,0.28),transparent_36%),#17111f]" />
    </div>

    <div class="min-w-0">
      <div class="mb-2 flex flex-wrap items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-gold/90">
        <span>{{ contentTypeLabel }}</span>
        <span v-if="article.readingTimeMinutes" class="text-white/35">{{ article.readingTimeMinutes }} min read</span>
      </div>
      <h3 class="text-lg font-black leading-tight tracking-tight text-white transition-colors duration-300 group-hover:text-gold">
        {{ title }}
      </h3>
      <p v-if="excerpt" class="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
        {{ excerpt }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  article: {
    slug: string
    titleEn: string
    titleTh?: string | null
    excerptEn?: string | null
    excerptTh?: string | null
    contentType?: string | null
    featuredImage?: string | null
    readingTimeMinutes?: number | null
  }
}>()

const { locale } = useI18n()

const title = computed(() => locale.value === 'th'
  ? props.article.titleTh || props.article.titleEn
  : props.article.titleEn || props.article.titleTh || '')
const excerpt = computed(() => locale.value === 'th'
  ? props.article.excerptTh || props.article.excerptEn
  : props.article.excerptEn || props.article.excerptTh)
const contentTypeLabel = computed(() => (props.article.contentType || 'ANNOUNCEMENT').replaceAll('_', ' '))
</script>
