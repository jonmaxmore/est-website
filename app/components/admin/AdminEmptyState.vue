<template>
  <div class="aes-wrapper">
    <UIcon v-if="icon.startsWith('i-')" :name="icon" class="aes-icon-svg" />
    <div v-else class="aes-icon">{{ icon }}</div>
    <h3 class="aes-title">{{ title }}</h3>
    <p class="aes-message">{{ message }}</p>
    <button v-if="actionLabel" type="button" class="aes-btn" @click="emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title?: string
  message?: string
  actionLabel?: string
}>(), {
  icon: 'i-lucide-inbox',
  title: 'No items yet',
  message: 'Get started by creating your first item.',
  actionLabel: '',
})

const emit = defineEmits<{ action: [] }>()
</script>

<style scoped>
.aes-wrapper {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px; text-align: center;
}
.aes-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }
.aes-icon-svg { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.4; color: rgba(255,255,255,0.5); }
.aes-title { font-size: 1rem; font-weight: 600; margin: 0 0 8px; color: rgba(255,255,255,0.6); }
.aes-message { font-size: 0.875rem; color: rgba(255,255,255,0.3); margin: 0 0 20px; line-height: 1.5; max-width: 320px; }
.aes-btn {
  padding: 9px 20px; border: none; border-radius: 8px;
  background: linear-gradient(135deg, #d4a843, #b8922e); color: black;
  font-size: 0.8125rem; font-weight: 700; cursor: pointer; transition: filter 0.15s;
}
.aes-btn:hover { filter: brightness(1.1); }
</style>
