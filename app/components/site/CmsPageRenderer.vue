<template>
  <div>
    <section class="relative flex min-h-[40vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pb-12 pt-24">
        <span v-if="page.description" class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">
          {{ page.description }}
        </span>
        <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">
          {{ localizedTitle }}
        </h1>
      </div>
    </section>

    <section class="mx-auto max-w-[900px] px-6 py-12">
      <div class="prose prose-invert max-w-none text-white/75 [&_a]:text-gold [&_a]:no-underline hover:[&_a]:underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_img]:rounded-2xl [&_img]:border [&_img]:border-white/6 [&_img]:shadow-[0_20px_60px_rgba(0,0,0,0.35)] [&_li]:text-white/60 [&_p]:leading-[1.9]" v-html="renderedHtml" />
    </section>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: {
    titleEn: string
    titleTh: string
    description?: string | null
    seoTitle?: string | null
    seoTitleTh?: string | null
    seoDesc?: string | null
    seoDescTh?: string | null
    contentEn?: string | null
    contentTh?: string | null
  }
}>()

const route = useRoute()
const { locale } = useI18n()

const isThai = computed(() => locale.value === 'th')
const localizedTitle = computed(() => (isThai.value ? props.page.titleTh || props.page.titleEn : props.page.titleEn || props.page.titleTh))
const localizedDescription = computed(() => (isThai.value ? props.page.seoDescTh || props.page.seoDesc || props.page.description || '' : props.page.seoDesc || props.page.seoDescTh || props.page.description || ''))
const localizedSeoTitle = computed(() => (isThai.value ? props.page.seoTitleTh || props.page.seoTitle || localizedTitle.value : props.page.seoTitle || props.page.seoTitleTh || localizedTitle.value))
const renderedHtml = computed(() => (isThai.value ? props.page.contentTh || props.page.contentEn || '' : props.page.contentEn || props.page.contentTh || ''))

useHead(() => ({
  title: localizedSeoTitle.value.includes('Eternal Tower Saga') ? localizedSeoTitle.value : `${localizedSeoTitle.value} | Eternal Tower Saga`,
  link: [{ rel: 'canonical', href: `http://178.128.127.161${route.path}` }],
  meta: [
    { name: 'description', content: localizedDescription.value },
    { property: 'og:title', content: localizedSeoTitle.value },
    { property: 'og:description', content: localizedDescription.value },
    { property: 'og:type', content: 'website' },
  ],
}))
</script>
