<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div><h2 class="text-2xl font-bold">User Management</h2><p class="mt-1 text-sm text-white/50">Manage admin users and roles</p></div>
      <UButton class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="openEditor(null)">+ Add User</UButton>
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/6">
            <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">User</th>
            <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Email</th>
            <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Role</th>
            <th class="px-5 py-3 text-left text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Last Login</th>
            <th class="px-5 py-3 text-right text-[0.6875rem] font-medium uppercase tracking-widest text-white/30">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b border-white/3 transition-colors hover:bg-white/2">
            <td class="px-5 py-3 font-medium">{{ u.displayName }}</td>
            <td class="px-5 py-3 text-white/50">{{ u.email }}</td>
            <td class="px-5 py-3">
              <span class="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold"
                :class="u.role === 'SUPER_ADMIN' ? 'bg-gold/10 text-gold' : 'bg-blue-500/10 text-blue-400'">
                {{ u.role }}
              </span>
            </td>
            <td class="px-5 py-3 text-white/30 whitespace-nowrap">{{ u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never' }}</td>
            <td class="px-5 py-3 text-right">
              <button class="mr-2 text-sm text-white/50 hover:text-gold transition-colors" @click="openEditor(u)">Edit</button>
              <button class="text-sm text-white/50 hover:text-red-400 transition-colors" @click="deleteUser(u)">Delete</button>
            </td>
          </tr>
          <tr v-if="users.length === 0"><td colspan="5" class="px-5 py-12 text-center text-white/30">No users found</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Editor Modal -->
    <UModal v-model:open="editorOpen" :title="editorMode === 'create' ? 'Create User' : 'Edit User'" class="sm:max-w-md">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <UFormField label="Display Name *"><UInput v-model="form.displayName" /></UFormField>
          <UFormField label="Email *"><UInput v-model="form.email" type="email" /></UFormField>
          <UFormField :label="editorMode === 'edit' ? 'Password (leave blank to keep)' : 'Password *'"><UInput v-model="form.password" type="password" /></UFormField>
          <UFormField label="Role">
            <USelect v-model="form.role" :items="[{label:'Editor',value:'EDITOR'},{label:'Super Admin',value:'SUPER_ADMIN'}]" value-key="value" />
          </UFormField>
          <p v-if="formError" class="text-center text-sm text-red-400">{{ formError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" @click="editorOpen = false">Cancel</UButton>
          <UButton :loading="saving" class="bg-gradient-to-br from-gold to-gold-light font-bold text-black" @click="saveUser">{{ editorMode === 'create' ? 'Create' : 'Save' }}</UButton>
        </div>
      </template>
    </UModal>

    <AdminToast :toast="toast" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
interface AdminUser { id: string; email: string; displayName: string; role: string; lastLoginAt: string | null }

const users = ref<AdminUser[]>([])
const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const { toast, showToast } = useAdminToast()
const form = reactive({ displayName: '', email: '', password: '', role: 'EDITOR' })

async function loadUsers() {
  try { users.value = await $fetch<AdminUser[]>('/api/admin/users') } catch { users.value = [] }
}

function openEditor(u: AdminUser | null) {
  formError.value = ''
  if (u) {
    editorMode.value = 'edit'; editingId.value = u.id
    Object.assign(form, { displayName: u.displayName, email: u.email, password: '', role: u.role })
  } else {
    editorMode.value = 'create'; editingId.value = null
    Object.assign(form, { displayName: '', email: '', password: '', role: 'EDITOR' })
  }
  editorOpen.value = true
}

async function saveUser() {
  if (!form.displayName || !form.email) { formError.value = 'Name and email are required.'; return }
  if (editorMode.value === 'create' && !form.password) { formError.value = 'Password is required for new users.'; return }
  saving.value = true; formError.value = ''
  try {
    if (editorMode.value === 'create') { await $fetch('/api/admin/users', { method: 'POST', body: form }) }
    else { await $fetch(`/api/admin/users/${editingId.value}`, { method: 'PUT', body: form }) }
    editorOpen.value = false; showToast(editorMode.value === 'create' ? 'User created!' : 'User updated!')
    await loadUsers()
  } catch (e: unknown) { const err = e as { data?: { message?: string } }; formError.value = err?.data?.message || 'Save failed' }
  finally { saving.value = false }
}

async function deleteUser(u: AdminUser) {
  if (!confirm(`Delete user "${u.displayName}"?`)) return
  try { await $fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' }); showToast('User deleted'); await loadUsers() }
  catch { showToast('Delete failed', 'error') }
}

function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
await loadUsers()
</script>
