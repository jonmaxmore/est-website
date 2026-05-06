<template>
  <Transition name="consent-slide">
    <aside
      v-if="visible"
      class="cookie-consent"
      role="region"
      :aria-label="t('consent.aria')"
    >
      <div class="cookie-consent-inner">
        <div class="cookie-consent-copy">
          <p class="cookie-consent-title">{{ t('consent.title') }}</p>
          <p class="cookie-consent-body">{{ t('consent.body') }}</p>
          <NuxtLink to="/privacy" class="cookie-consent-link">{{ t('consent.learnMore') }}</NuxtLink>
        </div>
        <div class="cookie-consent-actions">
          <button type="button" class="cookie-consent-btn-secondary" @click="reject">
            {{ t('consent.reject') }}
          </button>
          <button type="button" class="cookie-consent-btn-primary" @click="accept">
            {{ t('consent.accept') }}
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { decided, accept: acceptConsent, reject: rejectConsent } = useConsent()

const mounted = ref(false)
onMounted(() => { mounted.value = true })

const visible = computed(() => mounted.value && !decided.value)

function accept() { acceptConsent() }
function reject() { rejectConsent() }
</script>

<style scoped>
.cookie-consent {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 60;
  max-width: 720px;
  margin: 0 auto;
  background: rgba(15, 13, 22, 0.96);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(212, 168, 67, 0.22);
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}
.cookie-consent-inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  padding: 18px 20px;
}
@media (min-width: 640px) {
  .cookie-consent-inner {
    grid-template-columns: 1fr auto;
    align-items: center;
  }
}
.cookie-consent-title {
  margin: 0 0 4px;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.01em;
}
.cookie-consent-body {
  margin: 0 0 6px;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.62);
}
.cookie-consent-link {
  font-size: 0.75rem;
  color: var(--color-gold);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.cookie-consent-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.cookie-consent-btn-secondary,
.cookie-consent-btn-primary {
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s, background 0.15s;
}
.cookie-consent-btn-secondary {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
}
.cookie-consent-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.06);
  color: white;
}
.cookie-consent-btn-primary {
  border: none;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-deep));
  color: black;
}
.cookie-consent-btn-primary:hover {
  filter: brightness(1.08);
}

.consent-slide-enter-active,
.consent-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.consent-slide-enter-from,
.consent-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
