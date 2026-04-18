<template>
  <section ref="heroRef" class="relative flex min-h-dvh w-full items-center justify-center overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 z-0">
      <img src="/images/hero-bg.webp" alt="" class="h-full w-full object-cover object-[center_30%]" loading="eager" />
      <div class="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-[rgba(10,10,15,0.8)] to-transparent" />
      <div class="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-surface-primary to-transparent" />
    </div>

    <!-- Particles -->
    <div
      class="pointer-events-none absolute inset-0 z-[1] animate-[particle-drift_20s_linear_infinite]"
      style="background-image: radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 60% 70%, rgba(212,168,67,0.2), transparent), radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,0.2), transparent)"
    />

    <!-- Content -->
    <div
      ref="contentRef"
      class="relative z-[2] flex flex-col items-center gap-6 px-6 text-center"
      v-motion
      :initial="{ opacity: 0, y: 40 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 1200, ease: 'easeOut' } }"
    >
      <div ref="logoRef" class="w-[clamp(200px,40vw,400px)]">
        <img :src="'/images/logo.webp'" :alt="SITE.name" class="w-full drop-shadow-[0_0_40px_rgba(212,168,67,0.3)]" />
      </div>

      <h1 class="max-w-[600px] font-display text-[clamp(1rem,2.5vw,1.5rem)] font-normal uppercase tracking-[0.15em] text-white/60">
        {{ t('hero.tagline') }}
      </h1>

      <div class="mt-4">
        <NuxtLink
          to="/event"
          class="group relative inline-flex h-[52px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gold to-gold-light px-10 text-[0.9375rem] font-extrabold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(212,168,67,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(212,168,67,0.5)]"
        >
          <span class="relative z-[1]">{{ t('hero.cta') }}</span>
          <span class="absolute inset-0 -left-full animate-[glow-sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SITE } from '~/shared/constants'
const { t } = useI18n()
</script>
