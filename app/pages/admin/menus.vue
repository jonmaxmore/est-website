<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Navigation Menu</h2>
      <p class="mt-1 text-sm text-white/50">Manage navigation links and ordering</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Main Nav -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Main Navigation</h3>
        <draggable-list v-model="mainNav" />
        <button @click="addMainNav" class="mt-4 w-full cursor-pointer rounded-lg border border-dashed border-white/10 bg-transparent px-4 py-2.5 text-sm text-white/40 hover:border-gold/30 hover:text-gold transition-colors">+ Add Link</button>
      </div>

      <!-- Footer Nav -->
      <div class="rounded-2xl border border-white/6 bg-white/4 p-6">
        <h3 class="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Footer Links</h3>
        <draggable-list v-model="footerNav" />
        <button @click="addFooterNav" class="mt-4 w-full cursor-pointer rounded-lg border border-dashed border-white/10 bg-transparent px-4 py-2.5 text-sm text-white/40 hover:border-gold/30 hover:text-gold transition-colors">+ Add Link</button>
      </div>
    </div>

    <button @click="save" class="mt-6 rounded-lg bg-gold px-8 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">Save Navigation</button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

// Simple draggable list component inline
const DraggableList = defineComponent({
  props: { modelValue: { type: Array as () => { label: string; href: string; visible: boolean }[], required: true } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    function remove(index: number) {
      const items = [...props.modelValue]
      items.splice(index, 1)
      emit('update:modelValue', items)
    }
    function moveUp(index: number) {
      if (index === 0) return
      const items = [...props.modelValue]
      ;[items[index - 1], items[index]] = [items[index], items[index - 1]]
      emit('update:modelValue', items)
    }
    function moveDown(index: number) {
      if (index >= props.modelValue.length - 1) return
      const items = [...props.modelValue]
      ;[items[index], items[index + 1]] = [items[index + 1], items[index]]
      emit('update:modelValue', items)
    }
    function update(index: number, field: string, value: unknown) {
      const items = [...props.modelValue]
      ;(items[index] as Record<string, unknown>)[field] = value
      emit('update:modelValue', items)
    }
    return () => h('div', { class: 'flex flex-col gap-2' }, props.modelValue.map((item, index) =>
      h('div', { key: index, class: 'flex items-center gap-2 rounded-lg bg-white/2 p-2' }, [
        h('div', { class: 'flex flex-col gap-0.5' }, [
          h('button', { class: 'cursor-pointer border-none bg-none text-[0.625rem] text-white/30 hover:text-white', onClick: () => moveUp(index) }, '▲'),
          h('button', { class: 'cursor-pointer border-none bg-none text-[0.625rem] text-white/30 hover:text-white', onClick: () => moveDown(index) }, '▼'),
        ]),
        h('input', { value: item.label, class: 'flex-1 rounded border border-white/10 bg-white/4 px-2 py-1.5 text-xs text-white outline-none', onInput: (e: Event) => update(index, 'label', (e.target as HTMLInputElement).value) }),
        h('input', { value: item.href, class: 'flex-1 rounded border border-white/10 bg-white/4 px-2 py-1.5 text-xs text-white/50 outline-none font-mono', onInput: (e: Event) => update(index, 'href', (e.target as HTMLInputElement).value) }),
        h('button', { class: 'cursor-pointer border-none bg-none text-xs text-red-400/50 hover:text-red-400', onClick: () => remove(index) }, '✕'),
      ])
    ))
  }
})

const mainNav = ref([
  { label: 'หน้าแรก', href: '/', visible: true },
  { label: 'อาวุธ', href: '/weapons', visible: true },
  { label: 'ข่าวสาร', href: '/news', visible: true },
  { label: 'ฟีเจอร์ของเกม', href: '/game-guide', visible: true },
  { label: 'ศูนย์ช่วยเหลือ', href: '/support', visible: true },
])

const footerNav = ref([
  { label: 'อาวุธ', href: '/weapons', visible: true },
  { label: 'ฟีเจอร์ของเกม', href: '/game-guide', visible: true },
  { label: 'FAQ', href: '/faq', visible: true },
  { label: 'เงื่อนไขการใช้งาน', href: '/terms', visible: true },
  { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy', visible: true },
])

function addMainNav() { mainNav.value.push({ label: 'New Link', href: '/', visible: true }) }
function addFooterNav() { footerNav.value.push({ label: 'New Link', href: '/', visible: true }) }

const { toast, showToast } = useAdminToast()
async function save() {
  try {
    await $fetch('/api/admin/config', { method: 'PUT', body: { key: 'navigation', value: { main: mainNav.value, footer: footerNav.value } } })
    showToast('Navigation saved!')
  } catch { showToast('Failed to save navigation', 'error') }
}

onMounted(async () => {
  try {
    const data = await $fetch<{ main: typeof mainNav.value; footer: typeof footerNav.value }>('/api/admin/config?key=navigation')
    if (data?.main) mainNav.value = data.main
    if (data?.footer) footerNav.value = data.footer
  } catch { /* defaults */ }
})
</script>
