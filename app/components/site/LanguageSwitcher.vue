<template>
  <div class="lang-switcher" role="group" aria-label="Language selector">
    <button
      v-for="loc in availableLocales"
      :key="loc.code"
      type="button"
      class="lang-btn"
      :class="{ active: locale === loc.code }"
      :aria-pressed="locale === loc.code"
      :aria-label="loc.name"
      @click="switchTo(loc.code)"
    >
      {{ loc.code.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()

const availableLocales = [
  { code: 'th', name: 'ไทย' },
  { code: 'en', name: 'English' },
]

function switchTo(code: string) {
  if (locale.value === code) return
  const path = switchLocalePath(code as 'th' | 'en')
  if (path) {
    router.push(path)
  } else {
    setLocale(code as 'th' | 'en')
  }
}
</script>

<style scoped>
.lang-switcher {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  padding: 3px;
  border: 1px solid rgba(232, 181, 71, 0.18);
  border-radius: 999px;
  background: rgba(7, 5, 12, 0.4);
  backdrop-filter: blur(8px);
}

.lang-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--color-ink-mute);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  cursor: pointer;
  transition: color 0.25s ease, background 0.25s ease;
  line-height: 1;
}

.lang-btn:hover {
  color: var(--color-ink-soft);
}

.lang-btn:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

.lang-btn.active {
  background: linear-gradient(135deg, rgba(232, 181, 71, 0.22), rgba(232, 181, 71, 0.1));
  color: var(--color-gold);
  box-shadow: 0 0 12px rgba(232, 181, 71, 0.18);
}
</style>
