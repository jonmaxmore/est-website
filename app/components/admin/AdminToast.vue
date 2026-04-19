<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div
        v-if="toast.show"
        class="fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl border px-5 py-3 text-sm font-medium shadow-xl backdrop-blur-xl"
        :class="toastClass"
      >
        <div class="flex items-center gap-2">
          <span>{{ toastIcon }}</span>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  toast: { show: boolean; message: string; type: 'success' | 'error' | 'info' }
}>()

const toastClass = computed(() => {
  switch (props.toast.type) {
    case 'success': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
    case 'error': return 'border-red-500/30 bg-red-500/10 text-red-400'
    case 'info': return 'border-blue-500/30 bg-blue-500/10 text-blue-400'
    default: return 'border-white/10 bg-white/5 text-white'
  }
})

const toastIcon = computed(() => {
  switch (props.toast.type) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'info': return 'ℹ️'
    default: return ''
  }
})
</script>

<style scoped>
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }
</style>
