<template>
  <div class="event-page">
    <!-- Hero Banner -->
    <section class="hero-section">
      <div class="hero-bg" />
      <div class="hero-glow" />
      <!-- Floating particles -->
      <div class="particles">
        <div v-for="i in 20" :key="i" class="particle" :style="{ left: `${(i * 5) % 100}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + (i % 5)}s` }" />
      </div>

      <div class="hero-content" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0 }">
        <span class="hero-badge">🎮 {{ t('event.preRegister') }}</span>
        <h1 class="hero-title">
          <span class="hero-title-text">{{ t('event.preRegister') }}</span>
        </h1>
        <p class="hero-tagline">{{ t('hero.tagline') }}</p>

        <!-- Countdown -->
        <div class="countdown" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }">
          <div v-for="unit in countdown" :key="unit.label" class="countdown-unit">
            <div class="countdown-value">{{ String(unit.value).padStart(2, '0') }}</div>
            <span class="countdown-label">{{ unit.label }}</span>
          </div>
        </div>
        <p class="hero-sub">🔥 CBT Launch Target</p>
      </div>
    </section>

    <!-- Registration Section -->
    <section class="reg-section">
      <!-- Stats Counter -->
      <div class="stats-counter" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1 }">
        <p class="stats-label">Total Pre-Registrations</p>
        <div class="stats-number">{{ totalRegistrations.toLocaleString() }}</div>
      </div>

      <div class="reg-grid">
        <!-- Registration Form (LEFT — primary CTA) -->
        <div class="form-col">
          <div v-if="!submitted" class="reg-card">
            <div class="reg-card-header">
              <h2 class="reg-card-title">{{ t('event.registerButton') }}</h2>
              <p class="reg-card-sub">Get exclusive rewards at launch!</p>
            </div>
            <form @submit.prevent="handleSubmit" class="reg-form">
              <UFormField label="Email *">
                <UInput v-model="form.email" type="email" placeholder="your@email.com" size="lg" required />
              </UFormField>
              <div class="form-row">
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
              <p v-if="error" class="form-error">{{ error }}</p>
              <UButton type="submit" size="lg" block :loading="loading"
                class="reg-submit-btn">
                🚀 {{ t('event.registerButton') }}
              </UButton>
              <p class="form-notice">By registering, you agree to receive game updates. No spam.</p>
            </form>
          </div>

          <!-- Success -->
          <div v-else class="success-card" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1 }">
            <div class="success-emoji">🎉</div>
            <h2 class="success-title">Registration Successful!</h2>
            <p class="success-sub">Your referral code:</p>
            <div class="referral-code">{{ referralCode }}</div>
            <p class="success-share-text">Share your code with friends — both of you get bonus rewards! 🎁</p>
            <div class="share-buttons">
              <button @click="copyCode" class="share-btn copy-btn">
                {{ copied ? '✅ Copied!' : '📋 Copy Code' }}
              </button>
              <a :href="`https://twitter.com/intent/tweet?text=I just pre-registered for Eternal Tower Saga! Use my referral code: ${referralCode} 🎮⚔️&url=http://178.128.127.161/event`"
                target="_blank" class="share-btn twitter-btn">
                𝕏 Share
              </a>
            </div>
          </div>
        </div>

        <!-- Milestones (RIGHT) -->
        <div class="milestones-col">
          <h2 class="milestones-title">
            <span>🎯</span>Milestone Rewards
          </h2>
          <div class="milestones-list">
            <div v-for="(ms, idx) in milestones" :key="ms.id"
              class="milestone-card"
              :class="{ reached: ms.reached }"
              v-motion :initial="{ opacity: 0, x: 20 }" :enter="{ opacity: 1, x: 0, transition: { delay: idx * 100 } }">
              <div class="milestone-icon" :class="{ 'milestone-icon-reached': ms.reached }">{{ ms.icon }}</div>
              <div class="milestone-info">
                <div class="milestone-header">
                  <span class="milestone-name" :class="{ 'text-gold': ms.reached }">
                    {{ locale === 'th' ? ms.rewardTh : ms.rewardEn }}
                  </span>
                  <span v-if="ms.reached" class="milestone-unlocked">UNLOCKED ✓</span>
                </div>
                <p class="milestone-target">{{ ms.targetCount.toLocaleString() }} registrations</p>
                <div class="milestone-bar-bg">
                  <div class="milestone-bar-fill" :class="ms.reached ? 'bar-gold' : 'bar-dim'"
                    :style="{ width: `${Math.min((totalRegistrations / ms.targetCount) * 100, 100)}%` }" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Rewards Section -->
    <section class="rewards-section">
      <div class="rewards-container">
        <h2 class="rewards-title">🎁 Pre-Registration Rewards</h2>
        <p class="rewards-sub">Everyone who pre-registers will receive these exclusive items at launch</p>
        <div class="rewards-grid">
          <div v-for="(reward, ri) in baseRewards" :key="ri"
            class="reward-card"
            v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { delay: ri * 100 } }">
            <div class="reward-icon">{{ reward.icon }}</div>
            <h3 class="reward-name">{{ reward.title }}</h3>
            <p class="reward-desc">{{ reward.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
usePageSeo({
  title: `${t('event.preRegister')} | Eternal Tower Saga`,
  description: 'Pre-register for Eternal Tower Saga and unlock exclusive rewards. Join the community and be first to play.',
})

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
const cbtDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

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
/* ═══ Hero ═══ */
.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 65vh;
  overflow: hidden;
  text-align: center;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 10, 30, 1), rgba(10, 8, 20, 1) 50%, rgba(5, 5, 10, 1));
}
.hero-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 40% at 50% 30%, rgba(212, 168, 67, 0.1), transparent),
    radial-gradient(ellipse 40% 50% at 20% 80%, rgba(59, 130, 246, 0.05), transparent),
    radial-gradient(ellipse 40% 50% at 80% 80%, rgba(139, 92, 246, 0.05), transparent);
}
.particles { position: absolute; inset: 0; pointer-events: none; }
.particle {
  position: absolute;
  width: 3px; height: 3px;
  background: rgba(212, 168, 67, 0.5);
  border-radius: 50%;
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0% { transform: translateY(100vh) scale(0); opacity: 0 }
  10% { opacity: 0.8 }
  90% { opacity: 0.8 }
  100% { transform: translateY(-20vh) scale(1.5); opacity: 0 }
}
.hero-content {
  position: relative;
  z-index: 1;
  padding: 7rem 1.5rem 4rem;
}
.hero-badge {
  display: inline-block;
  margin-bottom: 1.25rem;
  padding: 0.5rem 1.5rem;
  border: 1px solid rgba(212, 168, 67, 0.2);
  border-radius: 100px;
  background: rgba(212, 168, 67, 0.08);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #d4a843;
}
.hero-title {
  margin-bottom: 1rem;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.hero-title-text {
  background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0.5));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-tagline {
  max-width: 32rem;
  margin: 0 auto;
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.45);
}
.hero-sub {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.25);
}

/* Countdown */
.countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2.5rem;
}
.countdown-unit { display: flex; flex-direction: column; align-items: center; }
.countdown-value {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px; height: 76px;
  border-radius: 14px;
  border: 1px solid rgba(212, 168, 67, 0.2);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  font-family: 'Inter', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #d4a843;
  box-shadow: 0 0 40px rgba(212, 168, 67, 0.08);
}
.countdown-label {
  margin-top: 0.5rem;
  font-size: 0.55rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.25);
}

/* ═══ Registration Section ═══ */
.reg-section {
  position: relative;
  max-width: 72rem;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}
.stats-counter {
  text-align: center;
  margin-bottom: 3.5rem;
}
.stats-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.25);
  margin-bottom: 0.5rem;
}
.stats-number {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(to bottom, #d4a843, rgba(212, 168, 67, 0.5));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 4px 30px rgba(212, 168, 67, 0.25));
}

/* Grid: Form LEFT, Milestones RIGHT */
.reg-grid {
  display: grid;
  gap: 2.5rem;
  align-items: start;
}
@media (min-width: 1024px) {
  .reg-grid {
    grid-template-columns: 420px 1fr;
  }
}

/* Form Card */
.form-col { position: sticky; top: 6rem; }
.reg-card {
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px);
  overflow: hidden;
}
.reg-card-header {
  padding: 2rem 2rem 0;
  text-align: center;
}
.reg-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.reg-card-sub {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
}
.reg-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 2rem 2rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.form-error {
  text-align: center;
  font-size: 0.875rem;
  color: #ef4444;
}
.reg-submit-btn {
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #d4a843, #b8922e) !important;
  font-weight: 700 !important;
  color: black !important;
  box-shadow: 0 4px 20px rgba(212, 168, 67, 0.3);
  transition: all 0.3s;
}
.reg-submit-btn:hover {
  box-shadow: 0 6px 30px rgba(212, 168, 67, 0.5);
  transform: translateY(-1px);
}
.form-notice {
  text-align: center;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.15);
}

/* Success Card */
.success-card {
  border-radius: 1.25rem;
  border: 1px solid rgba(212, 168, 67, 0.2);
  background: rgba(212, 168, 67, 0.04);
  padding: 2.5rem;
  text-align: center;
  backdrop-filter: blur(24px);
}
.success-emoji { font-size: 4rem; margin-bottom: 1rem; }
.success-title { font-size: 1.5rem; font-weight: 700; color: #d4a843; margin-bottom: 0.75rem; }
.success-sub { font-size: 0.875rem; color: rgba(255, 255, 255, 0.5); margin-bottom: 0.5rem; }
.referral-code {
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(212, 168, 67, 0.3);
  background: rgba(212, 168, 67, 0.08);
  font-family: monospace;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #d4a843;
  box-shadow: 0 0 20px rgba(212, 168, 67, 0.15);
}
.success-share-text { font-size: 0.875rem; color: rgba(255, 255, 255, 0.45); margin-bottom: 1.5rem; }
.share-buttons { display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border: none;
}
.copy-btn { background: rgba(255, 255, 255, 0.06); color: white; }
.copy-btn:hover { background: rgba(255, 255, 255, 0.1); }
.twitter-btn { background: rgba(29, 161, 242, 0.1); color: #1DA1F2; }
.twitter-btn:hover { background: rgba(29, 161, 242, 0.2); }

/* ═══ Milestones ═══ */
.milestones-col {}
.milestones-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}
.milestones-list { display: flex; flex-direction: column; gap: 0.75rem; }
.milestone-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s;
}
.milestone-card:hover { border-color: rgba(255, 255, 255, 0.12); }
.milestone-card.reached {
  border-color: rgba(212, 168, 67, 0.25);
  background: rgba(212, 168, 67, 0.04);
}
.milestone-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px; height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  font-size: 1.5rem;
  flex-shrink: 0;
}
.milestone-icon-reached { background: rgba(212, 168, 67, 0.12); }
.milestone-info { flex: 1; min-width: 0; }
.milestone-header { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.milestone-name { font-size: 0.875rem; font-weight: 600; color: rgba(255, 255, 255, 0.8); }
.text-gold { color: #d4a843 !important; }
.milestone-unlocked {
  padding: 0.125rem 0.5rem;
  border-radius: 100px;
  background: rgba(16, 185, 129, 0.1);
  font-size: 0.5rem;
  font-weight: 700;
  color: #34d399;
}
.milestone-target { font-size: 0.7rem; color: rgba(255, 255, 255, 0.25); margin-top: 0.125rem; }
.milestone-bar-bg {
  height: 6px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
  margin-top: 0.5rem;
}
.milestone-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 1s ease-out;
}
.bar-gold { background: linear-gradient(90deg, #d4a843, #e8c468); }
.bar-dim { background: linear-gradient(90deg, rgba(212, 168, 67, 0.5), rgba(212, 168, 67, 0.2)); }

/* ═══ Rewards ═══ */
.rewards-section {
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.015));
  padding: 5rem 0;
}
.rewards-container { max-width: 72rem; margin: 0 auto; padding: 0 1.5rem; }
.rewards-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.rewards-sub {
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 3rem;
}
.rewards-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.reward-card {
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  text-align: center;
  transition: all 0.3s;
}
.reward-card:hover {
  border-color: rgba(212, 168, 67, 0.2);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}
.reward-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.reward-name { font-size: 0.875rem; font-weight: 700; margin-bottom: 0.25rem; }
.reward-desc { font-size: 0.75rem; color: rgba(255, 255, 255, 0.35); }

/* ═══ Responsive ═══ */
@media (max-width: 1023px) {
  .reg-grid { grid-template-columns: 1fr; }
  .form-col { position: static; order: -1; }
}
</style>
