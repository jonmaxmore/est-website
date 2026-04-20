<template>
  <div>
    <!-- Hero Banner -->
    <section class="relative flex min-h-[60vh] items-center justify-center overflow-hidden text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-[rgba(15,10,30,1)] via-[rgba(10,8,20,1)] to-[rgba(5,5,10,1)]" />
      <!-- Animated particles -->
      <div class="absolute inset-0 pointer-events-none">
        <div v-for="i in 12" :key="i" class="particle" :style="{left: `${Math.random()*100}%`, animationDelay: `${i*0.5}s`, animationDuration: `${4+Math.random()*6}s`}" />
      </div>
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(212,168,67,0.08),transparent_60%)]" />
      <div class="relative z-[1] px-6 pt-28 pb-16" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }">
        <span class="mb-4 inline-block rounded-full border border-gold/20 bg-gold/8 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          🎮 {{ t('event.preRegister') }}
        </span>
        <h1 class="mb-4 text-[clamp(2rem,5vw,4rem)] font-extrabold tracking-tight">
          <span class="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">{{ t('event.preRegister') }}</span>
        </h1>
        <p class="mx-auto max-w-xl text-lg text-white/50">{{ t('hero.tagline') }}</p>

        <!-- Countdown Timer -->
        <div class="mt-8 flex items-center justify-center gap-4" v-motion :initial="{opacity:0,y:20}" :enter="{opacity:1,y:0,transition:{delay:300}}">
          <div v-for="unit in countdown" :key="unit.label" class="flex flex-col items-center">
            <div class="flex h-[72px] w-[72px] items-center justify-center rounded-xl border border-gold/20 bg-white/4 backdrop-blur-md font-mono text-3xl font-bold text-gold shadow-[0_0_30px_rgba(212,168,67,0.1)]">
              {{ String(unit.value).padStart(2, '0') }}
            </div>
            <span class="mt-2 text-[0.6rem] font-medium uppercase tracking-widest text-white/30">{{ unit.label }}</span>
          </div>
        </div>
        <p class="mt-4 text-xs text-white/30">🔥 CBT Launch Target</p>
      </div>
    </section>

    <!-- Registration Count + Form -->
    <section class="relative mx-auto max-w-4xl px-6 py-16">
      <!-- Total Registrations Counter -->
      <div class="mb-12 text-center" v-motion :initial="{opacity:0,scale:0.9}" :enter="{opacity:1,scale:1}">
        <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">Total Pre-Registrations</p>
        <div class="text-[clamp(3rem,8vw,5rem)] font-extrabold tabular-nums bg-gradient-to-b from-gold via-gold-light to-gold/60 bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(212,168,67,0.3)]">
          {{ totalRegistrations.toLocaleString() }}
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-[1fr_380px]">
        <!-- Milestones -->
        <div>
          <h2 class="mb-6 text-xl font-bold">
            <span class="mr-2">🎯</span>Milestone Rewards
          </h2>
          <div class="flex flex-col gap-3">
            <div v-for="(ms, idx) in milestones" :key="ms.id"
              class="group relative overflow-hidden rounded-xl border p-4 transition-all duration-300"
              :class="ms.reached ? 'border-gold/30 bg-gold/5' : 'border-white/6 bg-white/4 hover:border-white/15'"
              v-motion :initial="{opacity:0,x:-20}" :enter="{opacity:1,x:0,transition:{delay:idx*80}}">
              <!-- Icon + Info -->
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  :class="ms.reached ? 'bg-gold/15' : 'bg-white/4'">{{ ms.icon }}</div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold" :class="ms.reached ? 'text-gold' : 'text-white/80'">
                      {{ locale === 'th' ? ms.rewardTh : ms.rewardEn }}
                    </span>
                    <span v-if="ms.reached" class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.5rem] font-bold text-emerald-400">UNLOCKED</span>
                  </div>
                  <p class="text-xs text-white/30">{{ ms.targetCount.toLocaleString() }} registrations</p>
                </div>
              </div>
              <!-- Progress bar -->
              <div class="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000 ease-out"
                  :class="ms.reached ? 'bg-gradient-to-r from-gold to-gold-light' : 'bg-gradient-to-r from-gold/60 to-gold/30'"
                  :style="{width: `${Math.min((totalRegistrations / ms.targetCount) * 100, 100)}%`}" />
              </div>
              <p class="mt-1 text-right text-[0.6rem] text-white/20">
                {{ Math.min((totalRegistrations / ms.targetCount * 100), 100).toFixed(1) }}%
              </p>
            </div>
          </div>
        </div>

        <!-- Registration Form -->
        <div class="lg:sticky lg:top-24 self-start">
          <div v-if="!submitted" class="rounded-2xl border border-white/6 bg-white/4 p-8 backdrop-blur-xl">
            <h2 class="mb-2 text-center text-xl font-bold">{{ t('event.registerButton') }}</h2>
            <p class="mb-6 text-center text-xs text-white/30">Get exclusive rewards at launch!</p>
            <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
              <UFormField label="Email *">
                <UInput v-model="form.email" type="email" placeholder="your@email.com" size="lg" required />
              </UFormField>
              <div class="grid grid-cols-2 gap-3">
                <UFormField label="Platform">
                  <USelect v-model="form.platform" :items="['IOS', 'ANDROID', 'PC']" size="lg" />
                </UFormField>
                <UFormField label="Region">
                  <USelect v-model="form.region" :items="regionItems" size="lg" value-key="value" />
                </UFormField>
              </div>
              <UFormField label="Referral Code (Optional)">
                <UInput v-model="form.referralCode" placeholder="FRIEND-XXXX" size="lg" />
              </UFormField>

              <p v-if="error" class="text-center text-sm text-red-400">{{ error }}</p>
              <UButton type="submit" size="lg" block :loading="loading"
                class="mt-2 bg-gradient-to-br from-gold to-gold-light font-bold text-black shadow-[0_4px_20px_rgba(212,168,67,0.3)] hover:shadow-[0_6px_30px_rgba(212,168,67,0.5)]">
                🚀 {{ t('event.registerButton') }}
              </UButton>
            </form>
            <p class="mt-4 text-center text-[0.65rem] text-white/20">
              By registering, you agree to receive game updates. No spam.
            </p>
          </div>

          <!-- Success -->
          <div v-else class="rounded-2xl border border-gold/20 bg-gold/5 p-8 text-center backdrop-blur-xl" v-motion :initial="{opacity:0,scale:0.9}" :enter="{opacity:1,scale:1}">
            <div class="mb-4 text-6xl">🎉</div>
            <h2 class="mb-3 text-2xl font-bold text-gold">Registration Successful!</h2>
            <p class="mb-2 text-sm text-white/60">Your referral code:</p>
            <div class="mx-auto mb-4 inline-block rounded-xl border border-gold/30 bg-gold/10 px-8 py-3 font-mono text-xl font-bold tracking-wider text-gold shadow-[0_0_20px_rgba(212,168,67,0.2)]">
              {{ referralCode }}
            </div>
            <p class="mb-6 text-sm text-white/50">Share your code with friends — both of you get bonus rewards! 🎁</p>
            <!-- Share buttons -->
            <div class="flex items-center justify-center gap-3">
              <button @click="copyCode" class="flex items-center gap-2 rounded-lg border border-white/10 bg-white/4 px-4 py-2 text-sm transition-colors hover:bg-white/8 cursor-pointer text-white border-none">
                {{ copied ? '✅ Copied!' : '📋 Copy Code' }}
              </button>
              <a :href="`https://twitter.com/intent/tweet?text=I just pre-registered for Eternal Tower Saga! Use my referral code: ${referralCode} 🎮⚔️&url=http://178.128.127.161/event`"
                target="_blank" class="flex items-center gap-2 rounded-lg bg-[#1DA1F2]/10 px-4 py-2 text-sm text-[#1DA1F2] transition-colors hover:bg-[#1DA1F2]/20 no-underline">
                🐦 Share
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reward Preview Section -->
    <section class="relative border-t border-white/6 bg-gradient-to-b from-transparent to-white/2 py-16">
      <div class="mx-auto max-w-5xl px-6">
        <h2 class="mb-3 text-center text-2xl font-bold">🎁 Pre-Registration Rewards</h2>
        <p class="mb-10 text-center text-sm text-white/40">Everyone who pre-registers will receive these exclusive items at launch</p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="(reward, ri) in baseRewards" :key="ri"
            class="group rounded-2xl border border-white/6 bg-white/4 p-6 text-center transition-all duration-300 hover:border-gold/20 hover:bg-white/6"
            v-motion :initial="{opacity:0,y:20}" :enter="{opacity:1,y:0,transition:{delay:ri*100}}">
            <div class="mb-3 text-4xl">{{ reward.icon }}</div>
            <h3 class="mb-1 text-sm font-bold">{{ reward.title }}</h3>
            <p class="text-xs text-white/40">{{ reward.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
useHead({ title: `${t('event.preRegister')} | Eternal Tower Saga` })

// --- Form ---
const form = reactive({ email: '', platform: 'ANDROID', region: 'TH', referralCode: '' })
const regionItems = [{ label: 'Thailand', value: 'TH' }, { label: 'Southeast Asia', value: 'SEA' }, { label: 'Global', value: 'GLOBAL' }]
const loading = ref(false); const error = ref(''); const submitted = ref(false); const referralCode = ref(''); const copied = ref(false)

async function handleSubmit() {
  loading.value = true; error.value = ''
  try {
    const result = await $fetch<{ referralCode: string }>('/api/register', { method: 'POST', body: form })
    referralCode.value = result.referralCode; submitted.value = true
    totalRegistrations.value++
  } catch (e: unknown) { const err = e as { data?: { message?: string } }; error.value = err?.data?.message || 'Registration failed.' }
  finally { loading.value = false }
}

function copyCode() {
  navigator.clipboard.writeText(referralCode.value); copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// --- Milestones ---
interface Milestone { id: number; tier: number; targetCount: number; rewardEn: string; rewardTh: string; icon: string; reached: boolean }
const { data: milestonesData } = await useFetch<Milestone[]>('/api/public/milestones', { default: () => [] })
const milestones = computed(() => milestonesData.value || [])

// --- Registration Count ---
const totalRegistrations = ref(0)
try {
  const stats = await $fetch<{ totalRegistrations?: number }>('/api/public/stats').catch(() => null)
  totalRegistrations.value = stats?.totalRegistrations || 847
} catch { totalRegistrations.value = 847 }

// --- Countdown (target: 90 days from now for CBT) ---
const countdown = ref([
  { label: 'Days', value: 0 }, { label: 'Hours', value: 0 },
  { label: 'Minutes', value: 0 }, { label: 'Seconds', value: 0 },
])
const cbtDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days out

function updateCountdown() {
  const diff = Math.max(0, cbtDate.getTime() - Date.now())
  countdown.value[0].value = Math.floor(diff / (1000 * 60 * 60 * 24))
  countdown.value[1].value = Math.floor((diff / (1000 * 60 * 60)) % 24)
  countdown.value[2].value = Math.floor((diff / (1000 * 60)) % 60)
  countdown.value[3].value = Math.floor((diff / 1000) % 60)
}
updateCountdown()
if (import.meta.client) setInterval(updateCountdown, 1000)

// --- Base Rewards ---
const baseRewards = [
  { icon: '💎', title: 'Gems x1000', desc: 'Premium currency to start strong' },
  { icon: '⚔️', title: 'SR Weapon Box', desc: 'Choose any SR weapon at launch' },
  { icon: '🦸', title: 'Exclusive Title', desc: '"Pioneer" title for early supporters' },
  { icon: '🎨', title: 'Avatar Frame', desc: 'Limited edition golden frame' },
]
</script>

<style scoped>
.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(212, 168, 67, 0.4);
  border-radius: 50%;
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0% { transform: translateY(100vh) scale(0); opacity: 0 }
  10% { opacity: 1 }
  90% { opacity: 1 }
  100% { transform: translateY(-20vh) scale(1.5); opacity: 0 }
}
</style>
