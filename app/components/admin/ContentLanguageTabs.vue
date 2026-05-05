<template>
  <div class="clt-wrapper" :class="{ 'clt-has-errors': hasAnyErrors }">
    <div class="clt-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="clt-tab"
        :class="{ active: activeTab === tab.key, 'has-errors': tab.errors.length > 0 }"
        @click="activeTab = tab.key"
      >
        <span class="clt-flag">{{ tab.flag }}</span>
        <span>{{ tab.label }}</span>
        <!-- Error badge takes priority over fill status -->
        <span v-if="tab.errors.length > 0" class="clt-badge clt-badge-error" :title="tab.errors.join('\n')">
          {{ tab.errors.length }}
        </span>
        <span v-else class="clt-status" :class="tab.filled ? 'filled' : 'empty'">
          {{ tab.filled ? '✓' : '!' }}
        </span>
      </button>

      <button
        v-if="showCopyButton"
        type="button"
        class="clt-copy-btn"
        :title="`Copy ${activeTab === 'th' ? 'TH → EN' : 'EN → TH'}`"
        @click="copyContent"
      >
        📋 {{ activeTab === 'th' ? 'Copy to EN' : 'Copy to TH' }}
      </button>
    </div>

    <div class="clt-content">
      <div v-show="activeTab === 'th'">
        <slot name="th" />
      </div>
      <div v-show="activeTab === 'en'">
        <slot name="en" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  thFilled?: boolean
  enFilled?: boolean
  showCopyButton?: boolean
  thErrors?: string[]
  enErrors?: string[]
}>()

const emit = defineEmits<{
  copy: [from: 'th' | 'en', to: 'th' | 'en']
}>()

const activeTab = ref<'th' | 'en'>('th')

const tabs = computed(() => [
  { key: 'th' as const, label: 'ภาษาไทย', flag: '🇹🇭', filled: props.thFilled !== false, errors: props.thErrors || [] },
  { key: 'en' as const, label: 'English', flag: '🇬🇧', filled: props.enFilled !== false, errors: props.enErrors || [] },
])

const hasAnyErrors = computed(() => (props.thErrors?.length || 0) + (props.enErrors?.length || 0) > 0)

function copyContent() {
  if (activeTab.value === 'th') {
    emit('copy', 'th', 'en')
  } else {
    emit('copy', 'en', 'th')
  }
}

/** Programmatically switch to the first tab that has errors */
function focusFirstError() {
  if (props.thErrors?.length) activeTab.value = 'th'
  else if (props.enErrors?.length) activeTab.value = 'en'
}

defineExpose({ activeTab, focusFirstError })
</script>

<style scoped>
.clt-wrapper {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.3s;
}
.clt-wrapper.clt-has-errors {
  border-color: rgba(239, 68, 68, 0.25);
}

.clt-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.clt-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.clt-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
}
.clt-tab.active {
  background: rgba(212, 168, 67, 0.1);
  color: var(--adm-gold);
}
.clt-tab.has-errors {
  animation: tab-shake 0.4s ease;
}
.clt-tab.has-errors.active {
  background: rgba(239, 68, 68, 0.08);
  color: var(--adm-danger);
}

.clt-flag { font-size: 0.875rem; }

.clt-status {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 0.5625rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.clt-status.filled {
  background: rgba(16, 185, 129, 0.15);
  color: var(--adm-success);
}
.clt-status.empty {
  background: rgba(245, 158, 11, 0.15);
  color: var(--adm-warning);
}

.clt-badge-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  font-size: 0.5625rem;
  font-weight: 800;
  background: rgba(239, 68, 68, 0.2);
  color: var(--adm-danger);
  cursor: help;
}

.clt-copy-btn {
  margin-left: auto;
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.6875rem;
  cursor: pointer;
  transition: all 0.15s;
}
.clt-copy-btn:hover {
  color: var(--adm-gold);
  border-color: rgba(212, 168, 67, 0.2);
}

.clt-content {
  padding: 16px;
}

@keyframes tab-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
</style>
