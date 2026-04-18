<template>
  <div>
    <section class="relative flex min-h-[50vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12"><span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">Download</span><h1 class="mb-3 text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">Download Eternal Tower Saga</h1><p class="text-lg text-white/50">Available on iOS, Android, and PC.</p></div>
    </section>
    <section class="mx-auto max-w-[600px] px-6 py-12 text-center">
      <div class="mb-8 flex flex-wrap justify-center gap-4">
        <a href="#" class="transition-transform duration-300 hover:scale-105"><img src="/images/badge-app-store.webp" alt="App Store" class="h-12 w-auto" /></a>
        <a href="#" class="transition-transform duration-300 hover:scale-105"><img src="/images/badge-google-play.webp" alt="Google Play" class="h-12 w-auto" /></a>
      </div>
      <p class="mb-8 text-sm text-white/30">The game is currently in pre-registration. Download links will be available at launch.</p>
      <NuxtLink to="/event" class="inline-flex h-[52px] items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light px-10 text-[0.9375rem] font-extrabold uppercase tracking-wider text-black no-underline shadow-[0_0_30px_rgba(212,168,67,0.3)]">Pre-Register Now</NuxtLink>
    </section>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'Download | Eternal Tower Saga' })
</script>
