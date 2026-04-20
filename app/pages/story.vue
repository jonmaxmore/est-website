<template>
  <div>
    <section class="relative flex min-h-[50vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12"><span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">Story</span><h1 class="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">The Legend of the Eternal Tower</h1></div>
    </section>
    <section class="mx-auto max-w-[800px] px-6 py-12">
      <p class="mb-8 text-xl font-normal leading-[1.9] text-white/80" v-motion :initial="{ opacity: 0, y: 20 }" :visibleOnce="{ opacity: 1, y: 0 }">In a world where the skies are scarred by a tower that stretches beyond the clouds, civilizations rise and fall in its shadow. The Eternal Tower — an ancient monolith of unknown origin — promises limitless power to those who reach its summit.</p>
      <p class="mb-6 text-base leading-[1.8] text-white/50" v-motion :initial="{ opacity: 0 }" :visibleOnce="{ opacity: 1, transition: { delay: 200 } }">For centuries, warriors, mages, and rogues have attempted the climb. None have returned from the upper floors. Legends speak of a guardian at the apex — a being born from the tower itself — who destroys all who approach.</p>
      <p class="mb-6 text-base leading-[1.8] text-white/50" v-motion :initial="{ opacity: 0 }" :visibleOnce="{ opacity: 1, transition: { delay: 400 } }">But a new age of heroes has dawned. As a mercenary chosen by fate, you must assemble a team of companions, forge legendary weapons, and uncover the truth hidden within the tower's walls.</p>
      <p class="mb-10 text-base leading-[1.8] text-white/50">The question is not whether you can reach the top — it's whether you're prepared for what awaits.</p>
      <div class="py-12 text-center"><NuxtLink to="/event" class="inline-flex h-[52px] items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light px-10 text-[0.9375rem] font-extrabold uppercase tracking-wider text-black no-underline shadow-[0_0_30px_rgba(212,168,67,0.3)]">Begin Your Journey</NuxtLink></div>
    </section>
  </div>
</template>
<script setup lang="ts">
usePageSeo({
  title: 'Story | Eternal Tower Saga',
  description: 'Discover the epic story of Eternal Tower Saga. An ancient tower, fallen heroes, and a world in need of a champion.',
})
</script>
