<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div
        v-if="modelValue"
        ref="overlayEl"
        class="acd-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="messageId"
        @click.self="cancel"
        @keydown="onKeydown"
      >
        <div class="acd-dialog" :class="variant">
          <UIcon :name="iconName" class="w-10 h-10" :class="variant === 'danger' ? 'text-red-400' : variant === 'warning' ? 'text-amber-400' : 'text-blue-400'" aria-hidden="true" />
          <h3 :id="titleId" class="acd-title">{{ title }}</h3>
          <p :id="messageId" class="acd-message">{{ message }}</p>
          <div class="acd-actions">
            <button ref="cancelBtnEl" type="button" class="acd-btn-cancel" @click="cancel">{{ cancelText }}</button>
            <button ref="confirmBtnEl" type="button" class="acd-btn-confirm" :class="variant" @click="confirm">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}>(), {
  title: 'Are you sure?',
  message: 'This action cannot be undone.',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const iconName = computed(() => {
  if (props.variant === 'danger') return 'i-lucide-alert-triangle'
  if (props.variant === 'warning') return 'i-lucide-zap'
  return 'i-lucide-info'
})

// Audit-3 (FE-1 M3) a11y: stable IDs for aria-labelledby / aria-describedby
const uid = Math.random().toString(36).slice(2, 9)
const titleId = `acd-title-${uid}`
const messageId = `acd-msg-${uid}`

const overlayEl = ref<HTMLElement | null>(null)
const cancelBtnEl = ref<HTMLElement | null>(null)
const confirmBtnEl = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
function cancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

// Focus trap: keep Tab cycling between cancelBtn ↔ confirmBtn while open.
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    cancel()
    return
  }
  if (e.key !== 'Tab') return
  const a = cancelBtnEl.value
  const b = confirmBtnEl.value
  if (!a || !b) return
  const active = document.activeElement
  if (e.shiftKey && active === a) {
    e.preventDefault(); b.focus()
  } else if (!e.shiftKey && active === b) {
    e.preventDefault(); a.focus()
  }
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    lastFocused = (document.activeElement as HTMLElement | null) ?? null
    await nextTick()
    confirmBtnEl.value?.focus()
  } else if (lastFocused) {
    lastFocused.focus()
    lastFocused = null
  }
})
</script>

<style scoped>
.acd-overlay {
  position: fixed; inset: 0; z-index: 70;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.acd-dialog {
  width: 100%; max-width: 400px; padding: 32px;
  background: #111118; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; text-align: center;
}
.acd-dialog.danger { border-color: rgba(239,68,68,0.2); }
.acd-dialog.warning { border-color: rgba(245,158,11,0.2); }
.acd-icon { font-size: 2.5rem; margin-bottom: 12px; }
.acd-title { font-size: 1.125rem; font-weight: 700; margin: 0 0 8px; }
.acd-message { font-size: 0.875rem; color: rgba(255,255,255,0.5); margin: 0 0 24px; line-height: 1.5; }
.acd-actions { display: flex; gap: 10px; justify-content: center; }
.acd-btn-cancel {
  padding: 9px 20px; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
  background: transparent; color: rgba(255,255,255,0.5); font-size: 0.8125rem;
  cursor: pointer; transition: all 0.15s;
}
.acd-btn-cancel:hover { color: white; border-color: rgba(255,255,255,0.2); }
.acd-btn-confirm {
  padding: 9px 24px; border: none; border-radius: 8px; font-size: 0.8125rem;
  font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.acd-btn-confirm.danger { background: var(--adm-danger); color: white; }
.acd-btn-confirm.danger:hover { background: #dc2626; }
.acd-btn-confirm.warning { background: var(--adm-warning); color: black; }
.acd-btn-confirm.warning:hover { background: #d97706; }
.acd-btn-confirm.info { background: var(--adm-info); color: white; }
.acd-btn-confirm.info:hover { background: #2563eb; }

.confirm-fade-enter-active, .confirm-fade-leave-active { transition: opacity 0.2s; }
.confirm-fade-enter-from, .confirm-fade-leave-to { opacity: 0; }
</style>
