<template>
  <Teleport to="body">
    <!--
      Audit-3 (FE-1 M3) a11y: container is aria-live="polite" + role="status" so
      screen readers announce success/info toasts as they appear; errors get
      role="alert" with assertive politeness.
    -->
    <TransitionGroup name="toast-stack" tag="div" class="toast-container" aria-live="polite" aria-atomic="false">
      <div
        v-for="t in visibleToasts"
        :key="t.id"
        class="toast-item"
        :class="t.type"
        :role="t.type === 'error' ? 'alert' : 'status'"
        :aria-live="t.type === 'error' ? 'assertive' : 'polite'"
      >
        <div class="toast-content">
          <span class="toast-icon" aria-hidden="true">{{ getIcon(t.type) }}</span>
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-close" :aria-label="`Dismiss ${t.type} notification`" @click="dismiss(t.id)">✕</button>
        </div>
        <div class="toast-progress" aria-hidden="true">
          <div class="toast-progress-bar" :class="t.type" :style="{ animationDuration: `${t.duration || 3000}ms` }" />
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  toast: { show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }
}>()

interface ToastItem {
  id: number; message: string; type: string; duration?: number
}

const visibleToasts = ref<ToastItem[]>([])
let counter = 0

function addToast(message: string, type = 'success', duration = 3000) {
  const id = ++counter
  visibleToasts.value.push({ id, message, type, duration })
  setTimeout(() => dismiss(id), duration)
}

function dismiss(id: number) {
  visibleToasts.value = visibleToasts.value.filter(t => t.id !== id)
}

function getIcon(type: string) {
  const icons: Record<string, string> = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
  return icons[type] || ''
}

watch(
  () => props.toast,
  (toast) => {
    if (toast?.show && toast.message) {
      addToast(toast.message, toast.type)
    }
  },
  { deep: true },
)

defineExpose({ addToast, dismiss })
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  max-width: 380px;
}

.toast-item {
  border-radius: 12px;
  border: 1px solid;
  overflow: hidden;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}
.toast-item.success { border-color: rgba(16, 185, 129, 0.25); background: rgba(16, 185, 129, 0.1); }
.toast-item.error { border-color: rgba(239, 68, 68, 0.25); background: rgba(239, 68, 68, 0.1); }
.toast-item.warning { border-color: rgba(245, 158, 11, 0.25); background: rgba(245, 158, 11, 0.1); }
.toast-item.info { border-color: rgba(59, 130, 246, 0.25); background: rgba(59, 130, 246, 0.1); }

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
}
.toast-icon { font-size: 0.875rem; flex-shrink: 0; }
.toast-msg {
  flex: 1;
  font-size: 0.8125rem;
  font-weight: 500;
}
.toast-item.success .toast-msg { color: var(--adm-success); }
.toast-item.error .toast-msg { color: var(--adm-danger); }
.toast-item.warning .toast-msg { color: var(--adm-warning); }
.toast-item.info .toast-msg { color: var(--adm-info); }

.toast-close {
  width: 20px; height: 20px; border: none; border-radius: 4px;
  background: transparent; color: rgba(255, 255, 255, 0.25);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 0.625rem; flex-shrink: 0;
}
.toast-close:hover { background: rgba(255, 255, 255, 0.06); color: white; }

.toast-progress {
  height: 2px;
  background: rgba(255, 255, 255, 0.03);
}
.toast-progress-bar {
  height: 100%;
  animation: toast-timer linear forwards;
}
.toast-progress-bar.success { background: var(--adm-success); }
.toast-progress-bar.error { background: var(--adm-danger); }
.toast-progress-bar.warning { background: var(--adm-warning); }
.toast-progress-bar.info { background: var(--adm-info); }

@keyframes toast-timer {
  from { width: 100%; }
  to { width: 0%; }
}

.toast-stack-enter-active { transition: all 0.3s ease; }
.toast-stack-leave-active { transition: all 0.2s ease; }
.toast-stack-enter-from { opacity: 0; transform: translateX(40px) scale(0.9); }
.toast-stack-leave-to { opacity: 0; transform: translateX(40px) scale(0.9); }
</style>
