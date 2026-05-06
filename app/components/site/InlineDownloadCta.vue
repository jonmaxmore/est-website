<template>
  <aside class="inline-cta" role="complementary" :aria-label="t('news.downloadCtaAria')">
    <div class="inline-cta-copy">
      <p class="inline-cta-eyebrow">{{ t('news.downloadCtaEyebrow') }}</p>
      <p class="inline-cta-title">{{ t('news.downloadCtaTitle') }}</p>
    </div>
    <NuxtLink
      to="/download"
      class="inline-cta-btn"
      @click="trackDownload('article-inline', sourceLabel)"
    >
      {{ t('news.downloadCtaButton') }}
      <UIcon name="i-lucide-arrow-right" class="ml-1 h-4 w-4" />
    </NuxtLink>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{ sourceLabel?: string }>()
const { t } = useI18n()
const { trackDownload } = useTracking()
const sourceLabel = computed(() => props.sourceLabel || 'inline-article')
</script>

<style scoped>
.inline-cta {
  margin: 32px 0;
  padding: 22px 24px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(212, 168, 67, 0.12), rgba(184, 146, 46, 0.08));
  border: 1px solid rgba(212, 168, 67, 0.28);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.inline-cta-eyebrow {
  margin: 0 0 4px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-gold, #d4a843);
}
.inline-cta-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}
.inline-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 11px 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #d4a843, #b8922e);
  color: black;
  font-size: 0.8125rem;
  font-weight: 700;
  text-decoration: none;
  transition: filter 0.15s, transform 0.15s;
}
.inline-cta-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
</style>
