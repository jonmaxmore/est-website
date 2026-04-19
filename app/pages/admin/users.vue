<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">User Management</h2>
        <p class="mt-1 text-sm text-white/50">Manage admin users and roles</p>
      </div>
      <button @click="showCreate = true" class="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">+ Add User</button>
    </div>

    <!-- Users Table -->
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
          <tr v-for="u in users" :key="u.id" class="border-b border-white/3">
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
              <button @click="editUser(u)" class="mr-2 cursor-pointer border-none bg-none text-sm text-white/50 hover:text-gold">Edit</button>
              <button @click="deleteUser(u.id)" class="cursor-pointer border-none bg-none text-sm text-white/50 hover:text-red-400">Delete</button>
            </td>
          </tr>
          <tr v-if="users.length === 0"><td colspan="5" class="px-5 py-12 text-center text-white/30">No users found</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showCreate || editingUser" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="closeModal">
        <div class="w-full max-w-md rounded-2xl border border-white/10 bg-surface-secondary p-6">
          <h3 class="mb-6 text-xl font-bold">{{ editingUser ? 'Edit User' : 'Create User' }}</h3>
          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">Display Name</label>
            <input v-model="form.displayName" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
          </div>
          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">Email</label>
            <input v-model="form.email" type="email" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
          </div>
          <div class="mb-4">
            <label class="mb-1 block text-sm font-medium text-white/60">Password {{ editingUser ? '(leave blank to keep)' : '' }}</label>
            <input v-model="form.password" type="password" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50" />
          </div>
          <div class="mb-6">
            <label class="mb-1 block text-sm font-medium text-white/60">Role</label>
            <select v-model="form.role" class="w-full rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-gold/50">
              <option value="EDITOR">Editor</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div class="flex gap-3">
            <button @click="saveUser" class="rounded-lg bg-gold px-6 py-2.5 text-sm font-bold text-black cursor-pointer border-none hover:bg-gold-light transition-colors">{{ editingUser ? 'Save' : 'Create' }}</button>
            <button @click="closeModal" class="rounded-lg border border-white/10 bg-transparent px-6 py-2.5 text-sm text-white/50 cursor-pointer hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
interface AdminUser { id: string; email: string; displayName: string; role: string; lastLoginAt: string | null }
const { data: usersData, refresh } = await useFetch<AdminUser[]>('/api/admin/users', { default: () => [] })
const users = computed(() => usersData.value || [])
const showCreate = ref(false)
const editingUser = ref<AdminUser | null>(null)
const form = ref({ displayName: '', email: '', password: '', role: 'EDITOR' })

function editUser(u: AdminUser) {
  editingUser.value = u
  form.value = { displayName: u.displayName, email: u.email, password: '', role: u.role }
}
function closeModal() { showCreate.value = false; editingUser.value = null; form.value = { displayName: '', email: '', password: '', role: 'EDITOR' } }
async function saveUser() {
  if (editingUser.value) {
    await $fetch(`/api/admin/users/${editingUser.value.id}`, { method: 'PUT', body: form.value })
  } else {
    await $fetch('/api/admin/users', { method: 'POST', body: form.value })
  }
  closeModal()
  refresh()
}
async function deleteUser(id: string) {
  if (!confirm('Delete this user?')) return
  await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
  refresh()
}
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
</script>
