<template>
  <div>
    <section class="relative flex min-h-[50vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12"><span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">{{ t('nav.support') }}</span><h1 class="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">{{ t('nav.support') }}</h1></div>
    </section>
    <section class="mx-auto max-w-[700px] px-6 py-12">
      <div class="flex flex-col gap-4">
        <div v-for="item in supportItems" :key="item.title" class="flex flex-col gap-2 rounded-2xl border border-white/6 bg-white/4 p-6" v-motion :initial="{ opacity: 0, x: -20 }" :visibleOnce="{ opacity: 1, x: 0 }">
          <span class="text-3xl">{{ item.icon }}</span>
          <h3 class="font-semibold">{{ item.title }}</h3>
          <p class="text-sm leading-relaxed text-white/50">{{ item.desc }}</p>
          <a v-if="item.link" :href="item.link" target="_blank" class="mt-2 text-sm font-medium text-gold no-underline hover:underline">{{ item.linkLabel }}</a>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
const { t } = useI18n()
useHead({ title: `${t('nav.support')} | Eternal Tower Saga` })
const supportItems = [
  { icon: '📧', title: 'Email Support', desc: 'Send us a message and our team will respond within 24 hours.', link: 'mailto:support@eternaltowersaga.com', linkLabel: 'support@eternaltowersaga.com' },
  { icon: '💬', title: 'Discord Community', desc: 'Join our Discord for live support and community discussions.', link: 'https://discord.gg/eternaltowersaga', linkLabel: 'Join Discord' },
  { icon: '❓', title: 'FAQ', desc: 'Find answers to the most frequently asked questions.', link: '/faq', linkLabel: 'View FAQ' },
]
</script>
