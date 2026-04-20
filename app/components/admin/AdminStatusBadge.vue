<template>
  <span class="asb" :class="statusClass">{{ label }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

const statusClass = computed(() => {
  const s = props.status.toUpperCase()
  if (s === 'PUBLISHED' || s === 'ACTIVE' || s === 'VISIBLE') return 'success'
  if (s === 'DRAFT' || s === 'PENDING') return 'neutral'
  if (s === 'ARCHIVED' || s === 'HIDDEN' || s === 'INACTIVE') return 'muted'
  if (s === 'DELETED' || s === 'ERROR') return 'danger'
  return 'neutral'
})

const label = computed(() => {
  const s = props.status.toUpperCase()
  const labels: Record<string, string> = {
    PUBLISHED: 'Published', DRAFT: 'Draft', ARCHIVED: 'Archived',
    ACTIVE: 'Active', INACTIVE: 'Inactive', VISIBLE: 'Visible',
    HIDDEN: 'Hidden', PENDING: 'Pending', DELETED: 'Deleted', ERROR: 'Error',
  }
  return labels[s] || props.status
})
</script>

<style scoped>
.asb {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 20px;
  font-size: 0.625rem; font-weight: 600;
  letter-spacing: 0.03em; text-transform: uppercase;
}
.asb.success { background: rgba(16,185,129,0.1); color: #10b981; }
.asb.neutral { background: rgba(156,163,175,0.1); color: #9ca3af; }
.asb.muted { background: rgba(107,114,128,0.1); color: #6b7280; }
.asb.danger { background: rgba(239,68,68,0.1); color: #ef4444; }
</style>
