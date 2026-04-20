<template>
  <div>
    <section class="relative flex min-h-[50vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }">
        <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">FAQ</span>
        <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">{{ currentLocale === 'th' ? 'คำถามที่พบบ่อย' : 'Frequently Asked Questions' }}</h1>
      </div>
    </section>
    <section class="mx-auto max-w-[800px] px-6 py-12">
      <div class="flex flex-col gap-3">
        <UAccordion :items="accordionItems" class="gap-3">
          <template #default="{ item, open }">
            <UButton variant="ghost" class="w-full justify-between rounded-xl border border-white/6 bg-white/4 px-5 py-4 text-left text-white hover:bg-white/8" :class="{ 'border-gold/20': open }">
              <span class="text-base font-semibold">{{ item.label }}</span>
              <span class="text-xl text-gold transition-transform duration-300" :class="{ 'rotate-45': open }">+</span>
            </UButton>
          </template>
          <template #body="{ item }">
            <div class="px-5 pb-4 text-sm leading-relaxed text-white/60">{{ item.content }}</div>
          </template>
        </UAccordion>
      </div>
      <div v-if="accordionItems.length === 0" class="py-12 text-center text-white/30">
        No FAQ items available.
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
const { locale } = useI18n()
const currentLocale = computed(() => locale.value)
usePageSeo({
  title: 'FAQ | Eternal Tower Saga',
  description: 'Frequently asked questions about Eternal Tower Saga. Find answers about gameplay, accounts, platforms, and more.',
})

// Fetch FAQ from CMS (SiteConfig)
interface FaqItem {
  labelEn: string; labelTh: string; contentEn: string; contentTh: string; visible: boolean
}
const { data: siteConfig } = await useFetch<{ faq: FaqItem[] }>('/api/public/site', {
  default: () => ({ faq: [] }),
  pick: ['faq'],
})

const accordionItems = computed(() => {
  const items = siteConfig.value?.faq || []
  return items
    .filter((item) => item.visible !== false)
    .map((item) => ({
      label: currentLocale.value === 'th' ? item.labelTh : item.labelEn,
      content: currentLocale.value === 'th' ? item.contentTh : item.contentEn,
    }))
})
</script>
