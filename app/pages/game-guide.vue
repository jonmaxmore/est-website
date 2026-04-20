<template>
  <div>
    <section class="relative flex min-h-[50vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }">
        <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">{{ t('nav.features') }}</span>
        <h1 class="mb-3 text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">Game Guide</h1>
        <p class="text-lg text-white/50">Master the tower, master the game.</p>
      </div>
    </section>
    <section class="mx-auto max-w-[900px] px-6 py-12">
      <UTabs :items="tabs" class="w-full">
        <template #default="{ item, selected }">
          <div class="flex items-center gap-2">
            <span>{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </div>
        </template>
        <template #content="{ item }">
          <div class="mt-6 rounded-2xl border border-white/6 bg-white/4 p-8">
            <h2 class="mb-6 text-2xl font-bold">{{ item.label }}</h2>
            <div class="flex flex-col gap-6">
              <div v-for="(entry, i) in item.items" :key="i" class="flex gap-5" v-motion :initial="{ opacity: 0, x: -20 }" :visibleOnce="{ opacity: 1, x: 0, transition: { delay: i * 100 } }">
                <span class="flex-shrink-0 text-2xl font-extrabold text-gold/40">{{ String(i + 1).padStart(2, '0') }}</span>
                <div>
                  <h3 class="mb-1.5 font-semibold">{{ entry.title }}</h3>
                  <p class="text-sm leading-relaxed text-white/50">{{ entry.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UTabs>
    </section>
  </div>
</template>
<script setup lang="ts">
const { t } = useI18n()
usePageSeo({
  title: 'Game Guide | Eternal Tower Saga',
  description: 'Master the tower with our comprehensive game guide. Learn combat systems, tower mechanics, and guild strategies.',
})
const tabs = [
  { label: 'Combat System', icon: '⚔️', items: [
    { title: 'Weapon Types', desc: 'Choose from 4 weapon types: Sword, Bow, Wand, and Axe. Each has a unique skill tree.' },
    { title: 'Combo System', desc: 'Chain skills together for devastating combos. Timing is everything.' },
    { title: 'Elemental Advantage', desc: 'Fire, Ice, Lightning, and Nature elements create a rock-paper-scissors advantage system.' },
  ]},
  { label: 'Tower System', icon: '🏰', items: [
    { title: 'Infinite Floors', desc: 'Climb the Eternal Tower with increasing difficulty. Every 10 floors features a boss.' },
    { title: 'Weekly Reset', desc: 'Tower rankings reset weekly. Top climbers receive exclusive rewards.' },
    { title: 'Co-op Mode', desc: 'Team up with friends to tackle special tower challenges.' },
  ]},
  { label: 'Guild System', icon: '🛡️', items: [
    { title: 'Guild Wars', desc: 'Lead your guild in massive PvP battles for territory control.' },
    { title: 'Guild Dungeons', desc: 'Exclusive guild-only dungeons with rare loot drops.' },
    { title: 'Guild Ranking', desc: 'Complete guild missions to climb the leaderboard.' },
  ]},
]
</script>
