<template>
  <div>
    <section class="relative flex min-h-[50vh] items-center justify-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] to-[rgba(10,10,15,1)]" />
      <div class="relative z-[1] px-6 pt-24 pb-12" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }">
        <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold">🎮 {{ t('event.preRegister') }}</span>
        <h1 class="mb-3 text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight">{{ t('event.preRegister') }}</h1>
        <p class="text-lg text-white/50">{{ t('hero.tagline') }}</p>
      </div>
    </section>
    <section class="mx-auto max-w-[600px] px-6 py-12">
      <!-- Form -->
      <div v-if="!submitted" class="rounded-2xl border border-white/6 bg-white/4 p-10 backdrop-blur-xl">
        <h2 class="mb-8 text-center text-xl font-bold">{{ t('event.registerButton') }}</h2>
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
          <UFormField label="Email">
            <UInput v-model="form.email" type="email" placeholder="your@email.com" size="lg" required />
          </UFormField>
          <UFormField label="Platform">
            <USelect v-model="form.platform" :items="['IOS', 'ANDROID', 'PC']" size="lg" />
          </UFormField>
          <UFormField label="Region">
            <USelect v-model="form.region" :items="regionItems" size="lg" value-key="value" />
          </UFormField>
          <p v-if="error" class="text-center text-sm text-red-400">{{ error }}</p>
          <UButton type="submit" size="lg" block :loading="loading" color="primary" class="mt-2 bg-gradient-to-br from-gold to-gold-light font-bold text-black">
            {{ t('event.registerButton') }}
          </UButton>
        </form>
      </div>
      <!-- Success -->
      <div v-else class="rounded-2xl border border-white/6 bg-white/4 p-12 text-center backdrop-blur-xl">
        <div class="mb-4 text-6xl">🎉</div>
        <h2 class="mb-4 text-2xl font-bold">Registration Successful!</h2>
        <p class="mb-2 text-white/60">Your referral code:</p>
        <div class="mx-auto mb-4 inline-block rounded-lg border border-gold/30 bg-gold/10 px-8 py-3 font-mono text-xl font-bold tracking-wider text-gold">{{ referralCode }}</div>
        <p class="text-sm text-white/50">Share your referral code with friends for bonus rewards!</p>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
const { t } = useI18n()
useHead({ title: `${t('event.preRegister')} | Eternal Tower Saga` })
const form = reactive({ email: '', platform: 'ANDROID', region: 'TH' })
const regionItems = [{ label: 'Thailand', value: 'TH' }, { label: 'Southeast Asia', value: 'SEA' }, { label: 'Global', value: 'GLOBAL' }]
const loading = ref(false); const error = ref(''); const submitted = ref(false); const referralCode = ref('')
async function handleSubmit() {
  loading.value = true; error.value = ''
  try {
    const result = await $fetch<{ referralCode: string }>('/api/register', { method: 'POST', body: form })
    referralCode.value = result.referralCode; submitted.value = true
  } catch (e: unknown) { const err = e as { data?: { message?: string } }; error.value = err?.data?.message || 'Registration failed.' }
  finally { loading.value = false }
}
</script>
