<template>
  <div>
    <section class="relative flex min-h-[50vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12"><span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">Gallery</span><h1 class="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">Screenshot Gallery</h1></div>
    </section>
    <section class="mx-auto max-w-7xl px-6 py-12">
      <div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))">
        <div v-for="(img, i) in images" :key="i" class="group cursor-pointer overflow-hidden rounded-2xl border border-white/6 bg-white/4 transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]" @click="openLightbox(i)" v-motion :initial="{ opacity: 0, scale: 0.95 }" :visibleOnce="{ opacity: 1, scale: 1, transition: { delay: i * 80 } }">
          <img :src="img.src" :alt="img.alt" class="h-[200px] w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        </div>
      </div>
    </section>
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="lightboxOpen" class="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-black/95" @click="lightboxOpen = false">
          <img :src="images[lightboxIndex].src" :alt="images[lightboxIndex].alt" class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
          <button class="absolute top-6 right-6 cursor-pointer border-none bg-none text-3xl text-white">✕</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'Gallery | Eternal Tower Saga' })
const lightboxOpen = ref(false); const lightboxIndex = ref(0)
function openLightbox(i: number) { lightboxIndex.value = i; lightboxOpen.value = true }
const images = [
  { src: '/images/hero-bg.webp', alt: 'Eternal Tower Saga World' },
  { src: '/images/mercenary-companions.webp', alt: 'Mercenary Companions' },
  { src: '/images/characters/weapon-info-sword.png', alt: 'Sword Warrior' },
  { src: '/images/characters/weapon-info-bow.png', alt: 'Bow Hunter' },
  { src: '/images/characters/weapon-info-wand.png', alt: 'Wand Mage' },
  { src: '/images/characters/weapon-info-axe.png', alt: 'Axe Berserker' },
]
</script>
