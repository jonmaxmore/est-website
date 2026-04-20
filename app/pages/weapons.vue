<template>
  <div>
    <!-- Hero -->
    <section class="relative flex min-h-[50vh] items-center justify-center overflow-hidden text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(212,168,67,0.08),transparent_60%)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }">
        <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">{{ t('nav.characters') }}</span>
        <h1 class="mx-auto mb-3 text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">{{ t('weapons.title') }}</h1>
        <p class="mx-auto max-w-[500px] text-lg text-white/50">{{ t('weapons.subtitle') }}</p>
      </div>
    </section>

    <!-- Cards -->
    <section class="mx-auto max-w-7xl px-6 py-[clamp(2rem,6vw,5rem)]">
      <div class="grid gap-8" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))">
        <div
          v-for="(weapon, index) in weapons"
          :key="weapon.id"
          class="group cursor-pointer rounded-2xl border border-white/6 bg-white/4 p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-gold/30 hover:shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_40px_rgba(212,168,67,0.1)]"
          :class="{ 'border-gold/30': activeWeapon === index }"
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { delay: index * 100 } }"
          @click="activeWeapon = index"
        >
          <img
            :src="weapon.portrait || `/images/characters/weapon-info-${weapon.name.toLowerCase()}.png`"
            :alt="weapon.nameEn || weapon.name"
            class="mx-auto mb-6 max-w-[200px] drop-shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-[1.08] group-hover:-translate-y-1.5"
            loading="lazy"
          />
          <h2 class="mb-3 text-xl font-bold uppercase tracking-widest">{{ weapon.nameEn || weapon.name }}</h2>
          <p class="text-sm leading-relaxed text-white/50">{{ weapon.descriptionEn || '' }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
usePageSeo({
  title: `${t('nav.characters')} | Eternal Tower Saga`,
  description: 'Choose your weapon class in Eternal Tower Saga. Explore Sword, Bow, Wand, and Axe — each with unique skills and combat styles.',
})
const activeWeapon = ref(0)
const { data: weapons } = await useFetch('/api/public/weapons', {
  default: () => [
    { id: 1, name: 'Sword', nameEn: 'Sword', descriptionEn: 'A balanced melee weapon for warriors.', portrait: '/images/characters/weapon-info-sword.png' },
    { id: 2, name: 'Bow', nameEn: 'Bow', descriptionEn: 'A ranged weapon for agile fighters.', portrait: '/images/characters/weapon-info-bow.png' },
    { id: 3, name: 'Wand', nameEn: 'Wand', descriptionEn: 'A magical weapon for spellcasters.', portrait: '/images/characters/weapon-info-wand.png' },
    { id: 4, name: 'Axe', nameEn: 'Axe', descriptionEn: 'A heavy weapon with devastating power.', portrait: '/images/characters/weapon-info-axe.png' },
  ],
})
</script>
