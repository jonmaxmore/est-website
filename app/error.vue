<template>
  <NuxtLayout name="blank">
    <div class="flex min-h-dvh items-center justify-center bg-surface-primary bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,168,67,0.03),transparent_60%)] p-8">
      <div class="max-w-[500px] rounded-2xl border border-white/6 bg-white/4 p-16 text-center backdrop-blur-xl">
        <h1 class="text-8xl font-black leading-none text-gold/30">{{ error?.statusCode || 404 }}</h1>
        <p class="mt-4 mb-2 text-2xl font-bold">{{ error?.message || 'Page not found' }}</p>
        <p class="mb-8 text-sm text-white/50">The page you're looking for doesn't exist or has been moved.</p>
        <div class="flex flex-col items-center gap-4">
          <NuxtLink to="/" class="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light px-8 text-sm font-bold text-black no-underline">Back to Home</NuxtLink>
          <NuxtLink to="/download" class="text-sm text-white/50 no-underline transition-colors duration-200 hover:text-gold">Download →</NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<script setup lang="ts">
defineProps<{ error: { statusCode: number; message: string } }>()
useHead({ title: 'Page Not Found | Eternal Tower Saga' })
</script>
