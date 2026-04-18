<template>
  <div>
    <section class="relative flex min-h-[50vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }">
        <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">FAQ</span>
        <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">Frequently Asked Questions</h1>
      </div>
    </section>
    <section class="mx-auto max-w-[800px] px-6 py-12">
      <div class="flex flex-col gap-3">
        <UAccordion :items="faqItems" class="gap-3">
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
    </section>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'FAQ | Eternal Tower Saga' })
const faqItems = [
  { label: 'What is Eternal Tower Saga?', content: 'Eternal Tower Saga is a mobile MMORPG with K-Fantasy aesthetic, featuring real-time combat, guild system, and an infinite tower challenge.' },
  { label: 'What platforms are supported?', content: 'ETS will be available on iOS, Android, and PC via an official client.' },
  { label: 'When is the release date?', content: 'The official release date will be announced after CBT. Pre-register now to get early access!' },
  { label: 'Is the game free to play?', content: 'Yes! ETS is free-to-play with optional cosmetic purchases. No pay-to-win mechanics.' },
  { label: 'How do I pre-register?', content: 'Visit the Event page and enter your email to pre-register. You will receive exclusive rewards upon launch.' },
  { label: 'What languages are supported?', content: 'ETS supports Thai and English, with more languages planned for the global release.' },
  { label: 'How do I contact support?', content: 'Visit the Support page or email us at support@eternaltowersaga.com.' },
]
</script>
