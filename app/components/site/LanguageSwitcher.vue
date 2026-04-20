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
      <span class="lang-flag">{{ loc.flag }}</span>
      <span class="lang-code">{{ loc.code.toUpperCase() }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()

const availableLocales = [
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
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
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 2px;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.05em;
}

.lang-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.06);
}

.lang-btn.active {
  background: linear-gradient(135deg, rgba(212, 168, 67, 0.15), rgba(212, 168, 67, 0.08));
  color: #d4a843;
  box-shadow: 0 0 12px rgba(212, 168, 67, 0.08);
}

.lang-flag {
  font-size: 0.875rem;
  line-height: 1;
}

.lang-code {
  line-height: 1;
}
</style>
