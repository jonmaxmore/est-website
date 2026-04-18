<template>
  <div>
    <div class="mb-6"><h2 class="text-2xl font-bold">Weapons</h2><p class="mt-1 text-sm text-white/50">Manage game weapon data</p></div>
    <div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))">
      <div v-for="weapon in weapons" :key="weapon.id" class="flex gap-5 rounded-2xl border p-5 transition-colors" :class="editingId === weapon.id ? 'border-gold/30 bg-white/4' : 'border-white/6 bg-white/4'">
        <div class="relative w-[100px] flex-shrink-0">
          <img :src="weapon.portrait || '/images/logo.webp'" :alt="weapon.name" class="w-full rounded-lg" />
          <span v-if="!weapon.visible" class="absolute top-1 right-1 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[0.5rem] font-semibold text-red-400">Hidden</span>
        </div>
        <div class="min-w-0 flex-1">
          <template v-if="editingId === weapon.id">
            <UFormField label="Name"><UInput v-model="editForm.name" size="sm" /></UFormField>
            <UFormField label="Name (EN)" class="mt-2"><UInput v-model="editForm.nameEn" size="sm" /></UFormField>
            <UFormField label="Description (EN)" class="mt-2"><UTextarea v-model="editForm.descriptionEn" :rows="2" /></UFormField>
            <UFormField label="Portrait URL" class="mt-2"><UInput v-model="editForm.portrait" size="sm" /></UFormField>
            <div class="mt-2 flex items-center gap-4">
              <UFormField label="Sort"><UInput v-model.number="editForm.sortOrder" type="number" size="sm" class="w-20" /></UFormField>
              <label class="flex items-center gap-2 text-sm text-white/50"><input v-model="editForm.visible" type="checkbox" /> Visible</label>
            </div>
            <div class="mt-3 flex gap-2">
              <UButton size="xs" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveWeapon(weapon.id)">Save</UButton>
              <UButton size="xs" variant="ghost" @click="editingId = null">Cancel</UButton>
            </div>
          </template>
          <template v-else>
            <h3 class="font-semibold">{{ weapon.nameEn || weapon.name }}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-white/50">{{ weapon.descriptionEn || '—' }}</p>
            <div class="mt-2 flex gap-4 text-xs text-white/30"><span>Sort: {{ weapon.sortOrder }}</span><span>{{ weapon.visible ? '✅ Visible' : '🚫 Hidden' }}</span></div>
            <UButton size="xs" variant="ghost" class="mt-3" @click="startEdit(weapon)">Edit</UButton>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
interface Weapon { id: number; name: string; nameEn?: string | null; descriptionEn?: string | null; descriptionTh?: string | null; portrait?: string | null; sortOrder: number; visible: boolean }
const weapons = ref<Weapon[]>([]); const editingId = ref<number | null>(null)
const editForm = reactive({ name: '', nameEn: '', descriptionEn: '', descriptionTh: '', portrait: '', sortOrder: 0, visible: true })
async function loadWeapons() { try { weapons.value = await $fetch('/api/admin/weapons') } catch { weapons.value = [] } }
function startEdit(w: Weapon) { editingId.value = w.id; Object.assign(editForm, { name: w.name, nameEn: w.nameEn || '', descriptionEn: w.descriptionEn || '', descriptionTh: w.descriptionTh || '', portrait: w.portrait || '', sortOrder: w.sortOrder, visible: w.visible }) }
async function saveWeapon(id: number) { try { await $fetch(`/api/admin/weapons/${id}`, { method: 'PUT', body: editForm }); editingId.value = null; await loadWeapons() } catch {} }
await loadWeapons()
</script>
