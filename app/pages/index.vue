<template>
  <div>
    <HeroSection />

    <!-- Weapons Preview Section -->
    <section class="mx-auto max-w-7xl px-6 py-[clamp(4rem,8vw,8rem)]">
      <div class="mb-12 text-center">
        <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">{{ t('nav.characters') }}</span>
        <h2 class="mx-auto max-w-lg text-[clamp(1.5rem,4vw,2.75rem)] font-extrabold tracking-tight">
          {{ t('weapons.title') }}
        </h2>
      </div>
      <div
        class="grid gap-6"
        style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))"
      >
        <NuxtLink
          v-for="weapon in weapons"
          :key="weapon.id"
          to="/weapons"
          class="group flex flex-col items-center rounded-2xl border border-white/6 bg-white/4 p-6 text-center no-underline transition-all duration-500 hover:-translate-y-2 hover:border-gold/30 hover:shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_40px_rgba(212,168,67,0.1)]"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { delay: 100 * weapons.indexOf(weapon) } }"
        >
          <img
            :src="weapon.portrait || '/images/logo.webp'"
            :alt="weapon.nameEn || weapon.name"
            class="mb-4 h-36 w-36 object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <h3 class="text-sm font-bold uppercase tracking-widest">{{ weapon.nameEn || weapon.name }}</h3>
        </NuxtLink>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="mx-auto max-w-7xl px-6 pb-24 text-center">
      <h2
        class="mb-4 text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visibleOnce="{ opacity: 1, y: 0 }"
      >
        {{ t('hero.cta') }}
      </h2>
      <p
        class="mx-auto mb-8 max-w-lg text-white/60"
        v-motion
        :initial="{ opacity: 0 }"
        :visibleOnce="{ opacity: 1, transition: { delay: 200 } }"
      >
        {{ t('hero.tagline') }}
      </p>
      <NuxtLink
        to="/event"
        class="inline-flex h-[52px] items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light px-10 text-[0.9375rem] font-extrabold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(212,168,67,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(212,168,67,0.5)]"
      >
        {{ t('event.registerButton') }}
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({ title: 'Eternal Tower Saga — เกม RPG บนมือถือ' })

const { data: weapons } = await useFetch('/api/public/weapons', {
  default: () => [
    { id: 1, name: 'Sword', nameEn: 'Sword', portrait: '/images/characters/weapon-info-sword.png' },
    { id: 2, name: 'Bow', nameEn: 'Bow', portrait: '/images/characters/weapon-info-bow.png' },
    { id: 3, name: 'Wand', nameEn: 'Wand', portrait: '/images/characters/weapon-info-wand.png' },
    { id: 4, name: 'Axe', nameEn: 'Axe', portrait: '/images/characters/weapon-info-axe.png' },
  ],
})
</script>
