<template>
  <div>
    <SiteMarketingBannerSlot class="mx-6 pt-24 md:mx-auto md:max-w-7xl" placement="announcement_bar" :banner="banners?.announcement_bar || null" />
    <SiteMarketingBannerSlot placement="popup" :banner="banners?.popup || null" />
    <SiteMarketingBannerSlot placement="floating" :banner="banners?.floating || null" />
    <!-- ═══ HERO — Full-bleed with game art ═══ -->
    <section class="relative flex min-h-[70vh] items-center justify-center overflow-hidden text-center">
      <!-- Background Art -->
      <img :src="eventConfig.backgroundImage" alt="" class="absolute inset-0 h-full w-full object-cover object-top" />
      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[rgb(10,8,20)]" />
      <div class="absolute inset-0 bg-gradient-to-t from-[rgb(10,8,20)] via-transparent to-transparent" />
      <!-- Glow -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(212,168,67,0.12),transparent)]" />

      <!-- Animated particles -->
      <div class="absolute inset-0 pointer-events-none">
        <div v-for="i in 20" :key="i" class="particle"
          :style="{ left: `${(i * 5) % 100}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + (i % 5)}s` }" />
      </div>

      <div class="relative z-10 px-6 pt-32 pb-20" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }">
        <span class="mb-5 inline-block rounded-full border border-gold/25 bg-black/50 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold backdrop-blur-md">
          {{ localized('badge') }}
        </span>
        <h1 class="mb-5 text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight">
          <span class="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(255,255,255,0.3)]">
            {{ localized('title') }}
          </span>
        </h1>
        <p class="mx-auto max-w-xl text-lg text-white/60 drop-shadow-md">{{ localized('subtitle') }}</p>

        <!-- Countdown -->
        <div class="mt-10 flex items-center justify-center gap-3 sm:gap-5" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }">
          <div v-for="(unit, idx) in countdown" :key="unit.label" class="flex flex-col items-center">
            <div class="flex h-[72px] w-[72px] sm:h-[84px] sm:w-[84px] items-center justify-center rounded-2xl border border-gold/25 bg-black/60 backdrop-blur-xl font-mono text-3xl sm:text-4xl font-bold text-gold shadow-[0_0_40px_rgba(212,168,67,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]">
              {{ String(unit.value).padStart(2, '0') }}
            </div>
            <span class="mt-2.5 text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/30">{{ unit.label }}</span>
          </div>
          <span v-if="false" class="text-2xl font-light text-gold/30 -mt-6">:</span>
        </div>
        <p class="mt-5 text-xs text-white/25">{{ localized('countdownLabel') }}</p>

        <!-- CTA Arrow -->
        <div class="mt-8 animate-bounce text-2xl text-gold/40">↓</div>
      </div>
    </section>

    <!-- ═══ REGISTRATION SECTION ═══ -->
    <section class="relative mx-auto max-w-3xl px-6 py-20">
      <!-- Total Registrations -->
      <div class="mb-14 text-center" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1 }">
        <p class="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/25">{{ localized('registrationLabel') }}</p>
        <div class="text-[clamp(3.5rem,10vw,6rem)] font-extrabold tabular-nums bg-gradient-to-b from-gold via-gold-light to-gold/50 bg-clip-text text-transparent drop-shadow-[0_4px_40px_rgba(212,168,67,0.3)]">
          {{ displayRegistrations.toLocaleString('en-US') }}
        </div>
      </div>

      <!-- ── Registration Form (CENTERED) ── -->
      <div class="mx-auto max-w-md">
        <div v-if="!submitted"
          class="overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
          <!-- Form Header -->
          <div class="border-b border-white/6 bg-white/[0.02] px-8 py-6 text-center">
            <h2 class="text-xl font-bold">{{ localized('formTitle') }}</h2>
            <p class="mt-1 text-xs text-white/30">{{ localized('formDescription') }}</p>
          </div>
          <!-- Form Body -->
          <form
            data-testid="event-registration-form"
            :data-ready="hydrated ? 'true' : 'false'"
            @submit.prevent="handleSubmit"
            class="flex flex-col gap-4 p-8"
          >
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
            <UFormField label="Referral Code (Optional)" class="col-span-2">
              <UInput v-model="form.referredBy" placeholder="ETS-XXXXXXX" size="lg" />
            </UFormField>
            <p v-if="error" class="text-center text-sm text-red-400">{{ error }}</p>
            <UButton type="submit" size="lg" block :loading="loading"
              class="mt-2 bg-gradient-to-br from-gold to-gold-light font-bold text-black shadow-[0_4px_25px_rgba(212,168,67,0.35)] transition-all duration-300 hover:shadow-[0_6px_35px_rgba(212,168,67,0.55)] hover:-translate-y-0.5">
              {{ t('event.registerButton') }}
            </UButton>
          </form>
          <p class="border-t border-white/4 px-8 py-3 text-center text-[0.6rem] text-white/15">
            {{ localized('legalCopy') }}
          </p>
        </div>

        <!-- ── Success ── -->
        <div v-else class="rounded-2xl border border-gold/20 bg-gradient-to-b from-gold/8 to-gold/3 p-8 text-center backdrop-blur-xl"
          v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1 }">
          <div class="mb-4 text-6xl">🎉</div>
          <h2 class="mb-3 text-2xl font-bold text-gold">Registration Successful!</h2>
          <p class="mb-2 text-sm text-white/60">Your referral code:</p>
          <div class="mx-auto mb-4 inline-block rounded-xl border border-gold/30 bg-gold/10 px-8 py-3 font-mono text-xl font-bold tracking-wider text-gold shadow-[0_0_25px_rgba(212,168,67,0.2)]">
            {{ referralCode }}
          </div>
          <p class="mb-6 text-sm text-white/50">Share your code with friends — both of you get bonus rewards! 🎁</p>
          <div class="flex items-center justify-center gap-3">
            <button @click="copyCode" class="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/[0.08] cursor-pointer">
              {{ copied ? '✅ Copied!' : '📋 Copy Code' }}
            </button>
            <a :href="shareHref"
              target="_blank" class="flex items-center gap-2 rounded-lg bg-[#1DA1F2]/10 px-4 py-2.5 text-sm text-[#1DA1F2] transition-colors hover:bg-[#1DA1F2]/20 no-underline">
              𝕏 Share
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ MILESTONES SECTION ═══ -->
    <section class="relative mx-auto max-w-5xl px-6 pb-20">
      <h2 class="mb-8 text-center text-2xl font-bold">Milestone Rewards</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="(ms, idx) in milestones" :key="ms.id"
          class="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-500"
          :class="ms.reached
            ? 'border-gold/30 bg-gradient-to-br from-gold/8 to-gold/3'
            : 'border-white/6 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]'"
          v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: idx * 100 } }">
          <!-- Shine effect on reached -->
          <div v-if="ms.reached" class="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div class="relative text-center">
            <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110"
              :class="ms.reached ? 'bg-gold/15 shadow-[0_0_20px_rgba(212,168,67,0.15)]' : 'bg-white/[0.04]'">
              {{ ms.icon || `T${ms.tier}` }}
            </div>
            <h3 class="mb-1 text-sm font-bold" :class="ms.reached ? 'text-gold' : 'text-white/80'">
              {{ locale === 'th' ? ms.rewardTh : ms.rewardEn }}
            </h3>
            <p class="mb-3 text-[0.7rem] text-white/25">{{ ms.targetCount.toLocaleString('en-US') }} registrations</p>
            <span v-if="ms.reached" class="mb-3 inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-emerald-400">
              ✓ Unlocked
            </span>
            <!-- Progress bar -->
            <div class="h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <div class="h-full rounded-full transition-all duration-1000 ease-out"
                :class="ms.reached ? 'bg-gradient-to-r from-gold to-gold-light shadow-[0_0_10px_rgba(212,168,67,0.3)]' : 'bg-gradient-to-r from-gold/50 to-gold/20'"
                :style="{ width: `${Math.min((displayRegistrations / ms.targetCount) * 100, 100)}%` }" />
            </div>
            <p class="mt-1.5 text-[0.6rem] text-white/20">
              {{ Math.min((displayRegistrations / ms.targetCount * 100), 100).toFixed(1) }}%
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ REWARDS SECTION ═══ -->
    <section class="relative border-t border-white/6 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent py-20">
      <div class="mx-auto max-w-5xl px-6">
        <h2 class="mb-3 text-center text-2xl font-bold">{{ localized('rewardsTitle') }}</h2>
        <p class="mb-12 text-center text-sm text-white/35">{{ localized('rewardsSubtitle') }}</p>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="(reward, ri) in baseRewards" :key="ri"
            class="group rounded-2xl border border-white/6 bg-white/[0.03] p-7 text-center transition-all duration-500 hover:border-gold/20 hover:bg-white/[0.06] hover:-translate-y-1"
            v-motion :initial="{ opacity: 0, y: 25 }" :enter="{ opacity: 1, y: 0, transition: { delay: ri * 120 } }">
            <div class="mb-4 flex h-14 w-14 mx-auto items-center justify-center overflow-hidden rounded-xl bg-gold/10 text-gold text-lg font-bold">
              <img v-if="reward.image" :src="reward.image" :alt="rewardTitle(reward)" class="h-full w-full object-cover" />
              <span v-else>{{ reward.label || rewardTitle(reward).slice(0, 3).toUpperCase() }}</span>
            </div>
            <h3 class="mb-1 text-sm font-bold">{{ rewardTitle(reward) }}</h3>
            <p class="text-xs text-white/35 leading-relaxed">{{ rewardDescription(reward) }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-6 pb-10 md:mx-auto md:max-w-7xl">
      <SiteMarketingBannerSlot placement="footer_strip" :banner="banners?.footer_strip || null" />
    </section>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const { trackPreRegister, trackPreRegisterSuccess, trackReferralCopy } = useTracking()
const { data: banners } = await useResolvedBanners({ routeType: 'event_page' })

interface EventReward {
  id: string
  titleEn: string
  titleTh: string
  descriptionEn: string
  descriptionTh: string
  image: string
  label: string
  visible: boolean
  order: number
}

interface EventPageConfig {
  badgeEn: string
  badgeTh: string
  titleEn: string
  titleTh: string
  subtitleEn: string
  subtitleTh: string
  backgroundImage: string
  targetDate: string
  countdownLabelEn: string
  countdownLabelTh: string
  registrationLabelEn: string
  registrationLabelTh: string
  registrationDisplayMode: 'actual' | 'manual' | 'actual_plus_manual'
  manualRegistrationCount: number
  formTitleEn: string
  formTitleTh: string
  formDescriptionEn: string
  formDescriptionTh: string
  legalCopyEn: string
  legalCopyTh: string
  rewardsTitleEn: string
  rewardsTitleTh: string
  rewardsSubtitleEn: string
  rewardsSubtitleTh: string
  baseRewards: EventReward[]
}

const defaultEventConfig: EventPageConfig = {
  badgeEn: 'Pre-registration',
  badgeTh: 'Pre-registration',
  titleEn: 'Pre-registration',
  titleTh: 'Pre-registration',
  subtitleEn: 'Join early and unlock launch rewards for everyone.',
  subtitleTh: 'Join early and unlock launch rewards for everyone.',
  backgroundImage: '/images/hero-bg.webp',
  targetDate: '2026-10-01T00:00:00+07:00',
  countdownLabelEn: 'Launch target',
  countdownLabelTh: 'Launch target',
  registrationLabelEn: 'Total Pre-Registrations',
  registrationLabelTh: 'Total Pre-Registrations',
  registrationDisplayMode: 'actual',
  manualRegistrationCount: 0,
  formTitleEn: 'Pre-register now',
  formTitleTh: 'Pre-register now',
  formDescriptionEn: 'Get exclusive rewards at launch.',
  formDescriptionTh: 'Get exclusive rewards at launch.',
  legalCopyEn: 'By registering, you agree to receive game updates.',
  legalCopyTh: 'By registering, you agree to receive game updates.',
  rewardsTitleEn: 'Pre-Registration Rewards',
  rewardsTitleTh: 'Pre-Registration Rewards',
  rewardsSubtitleEn: 'Everyone who pre-registers will receive these launch rewards.',
  rewardsSubtitleTh: 'Everyone who pre-registers will receive these launch rewards.',
  baseRewards: [],
}
const { data: eventPage } = await useFetch<EventPageConfig>('/api/public/event-page', { default: () => defaultEventConfig })
const eventConfig = computed(() => eventPage.value || defaultEventConfig)

usePageSeo({
  title: `${eventConfig.value.titleEn || t('event.preRegister')} | Eternal Tower Saga`,
  description: eventConfig.value.subtitleEn || 'Pre-register for Eternal Tower Saga and unlock exclusive rewards.',
})

function localized(field: 'badge' | 'title' | 'subtitle' | 'countdownLabel' | 'registrationLabel' | 'formTitle' | 'formDescription' | 'legalCopy' | 'rewardsTitle' | 'rewardsSubtitle') {
  const suffix = locale.value === 'th' ? 'Th' : 'En'
  return eventConfig.value[`${field}${suffix}` as keyof EventPageConfig] as string
}

// --- Form ---
const form = reactive({ email: '', platform: 'ANDROID', region: 'TH', referredBy: '' })
const regionItems = [{ label: 'Thailand', value: 'TH' }, { label: 'Southeast Asia', value: 'SEA' }, { label: 'Global', value: 'GLOBAL' }]
const loading = ref(false); const error = ref(''); const submitted = ref(false); const referralCode = ref(''); const copied = ref(false)
const hydrated = ref(false)

async function handleSubmit() {
  loading.value = true; error.value = ''
  try {
    trackPreRegister(form.platform, form.region)
    const result = await $fetch<{ referralCode: string }>('/api/register', { method: 'POST', body: form })
    referralCode.value = result.referralCode; submitted.value = true
    trackPreRegisterSuccess(form.platform, form.region)
    // Re-fetch actual count from backend
    const freshStats = await $fetch<{ totalRegistrations?: number }>('/api/public/stats').catch(() => null)
    if (freshStats?.totalRegistrations) totalRegistrations.value = freshStats.totalRegistrations
  } catch (e: unknown) { const err = e as { data?: { message?: string } }; error.value = err?.data?.message || 'Registration failed.' }
  finally { loading.value = false }
}

function copyCode() {
  navigator.clipboard.writeText(referralCode.value); copied.value = true
  trackReferralCopy()
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
  totalRegistrations.value = stats?.totalRegistrations || 0
} catch { totalRegistrations.value = 0 }

const displayRegistrations = computed(() => {
  if (eventConfig.value.registrationDisplayMode === 'manual') return eventConfig.value.manualRegistrationCount
  if (eventConfig.value.registrationDisplayMode === 'actual_plus_manual') return totalRegistrations.value + eventConfig.value.manualRegistrationCount
  return totalRegistrations.value
})

// --- Countdown ---
const countdown = ref([
  { label: 'Days', value: 0 }, { label: 'Hours', value: 0 },
  { label: 'Minutes', value: 0 }, { label: 'Seconds', value: 0 },
])
const targetDate = computed(() => new Date(eventConfig.value.targetDate || '2026-10-01T00:00:00+07:00'))

function updateCountdown() {
  const targetTime = targetDate.value.getTime()
  const diff = Number.isFinite(targetTime) ? Math.max(0, targetTime - Date.now()) : 0
  countdown.value[0]!.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  countdown.value[1]!.value = Math.floor((diff / (1000 * 60 * 60)) % 24)
  countdown.value[2]!.value = Math.floor((diff / (1000 * 60)) % 60)
  countdown.value[3]!.value = Math.floor((diff / 1000) % 60)
}

let countdownTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  hydrated.value = true
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
})
onBeforeUnmount(() => {
  if (countdownTimer !== undefined) window.clearInterval(countdownTimer)
})

// --- Base Rewards ---
const baseRewards = computed(() =>
  eventConfig.value.baseRewards
    .filter((reward) => reward.visible !== false)
    .sort((left, right) => left.order - right.order)
)

const _runtimeConfig = useRuntimeConfig()
const _siteUrlBase = String(_runtimeConfig.public.siteUrl || '').replace(/\/$/, '')

const shareHref = computed(() => {
  // Client → use real origin; Server → use configured siteUrl (may be empty until domain registered)
  const url = import.meta.client
    ? `${window.location.origin}/event`
    : (_siteUrlBase ? `${_siteUrlBase}/event` : '/event')
  const text = `I just pre-registered for Eternal Tower Saga! Use my referral code: ${referralCode.value}`
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
})

function rewardTitle(reward: EventReward) {
  return locale.value === 'th' ? reward.titleTh || reward.titleEn : reward.titleEn || reward.titleTh
}

function rewardDescription(reward: EventReward) {
  return locale.value === 'th'
    ? reward.descriptionTh || reward.descriptionEn
    : reward.descriptionEn || reward.descriptionTh
}
</script>

<style scoped>
.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(212, 168, 67, 0.5);
  border-radius: 50%;
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0% { transform: translateY(100vh) scale(0); opacity: 0 }
  10% { opacity: 0.7 }
  90% { opacity: 0.7 }
  100% { transform: translateY(-20vh) scale(1.5); opacity: 0 }
}
</style>
