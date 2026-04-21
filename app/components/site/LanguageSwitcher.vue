<template>
  <div class="lang-switcher">
    <button
      v-for="loc in availableLocales"
      :key="loc.code"
      class="lang-btn"
      :class="{ active: locale === loc.code }"
      :title="loc.name"
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
  const path = switchLocalePath(code)
  if (path) {
    router.push(path)
  } else {
    setLocale(code)
  }
}
</script>

<style scoped>
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 3px;
}

.lang-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.08em;
  line-height: 1;
}

.lang-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.06);
}

.lang-btn.active {
  background: linear-gradient(135deg, rgba(212, 168, 67, 0.2), rgba(212, 168, 67, 0.1));
  color: #d4a843;
  box-shadow: 0 0 12px rgba(212, 168, 67, 0.1);
}
</style>
