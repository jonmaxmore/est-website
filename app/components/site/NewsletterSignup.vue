<template>
  <form class="newsletter-form" novalidate @submit.prevent="submit">
    <label for="newsletter-email" class="newsletter-label">{{ t('newsletter.label') }}</label>
    <div class="newsletter-row">
      <input
        id="newsletter-email"
        v-model="email"
        type="email"
        :placeholder="t('newsletter.placeholder')"
        class="newsletter-input"
        :disabled="state === 'submitting'"
        required
        autocomplete="email"
      />
      <button
        type="submit"
        class="newsletter-submit"
        :disabled="state === 'submitting'"
      >
        {{ state === 'submitting' ? t('newsletter.sending') : t('newsletter.subscribe') }}
      </button>
    </div>
    <p v-if="message" class="newsletter-message" :class="state">{{ message }}</p>
  </form>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

type FormState = 'idle' | 'submitting' | 'success' | 'error'
const email = ref('')
const state = ref<FormState>('idle')
const message = ref('')

async function submit() {
  if (state.value === 'submitting') return
  state.value = 'submitting'
  message.value = ''

  try {
    await $fetch<{ success: boolean; message?: string }>('/api/public/newsletter/subscribe', {
      method: 'POST',
      body: {
        email: email.value,
        locale: locale.value === 'en' ? 'en' : 'th',
        utm: readUtmFromUrl(),
      },
    })
    state.value = 'success'
    message.value = t('newsletter.success')
    email.value = ''
  } catch (err: unknown) {
    state.value = 'error'
    const msg = (err as { data?: { message?: string } })?.data?.message
    message.value = msg || t('newsletter.error')
  }
}

function readUtmFromUrl() {
  if (!import.meta.client) return undefined
  const params = new URLSearchParams(window.location.search)
  const source = params.get('utm_source') ?? undefined
  const medium = params.get('utm_medium') ?? undefined
  const campaign = params.get('utm_campaign') ?? undefined
  if (!source && !medium && !campaign) return undefined
  return { source, medium, campaign }
}
</script>

<style scoped>
.newsletter-form { max-width: 420px; }
.newsletter-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
}
.newsletter-row { display: flex; gap: 8px; }
.newsletter-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: white;
  font-size: 0.875rem;
}
.newsletter-input:focus {
  outline: none;
  border-color: rgba(212, 168, 67, 0.5);
}
.newsletter-input:disabled { opacity: 0.5; }
.newsletter-submit {
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-deep));
  color: black;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
}
.newsletter-submit:hover:not(:disabled) { filter: brightness(1.08); }
.newsletter-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.newsletter-message {
  margin-top: 10px;
  font-size: 0.8125rem;
}
.newsletter-message.success { color: var(--color-success); }
.newsletter-message.error { color: var(--color-danger); }
</style>
