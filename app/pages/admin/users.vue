<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div><h2 class="text-2xl font-bold">User Management</h2><p class="mt-1 text-sm text-white/50">Manage admin users and roles</p></div>
      <button class="gold-btn" @click="openEditor(null)">+ Add User</button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/6 bg-white/2">
            <th class="th-cell">User</th>
            <th class="th-cell">Email</th>
            <th class="th-cell">Role</th>
            <th class="th-cell">Last Login</th>
            <th class="th-cell text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b border-white/3 transition-colors hover:bg-white/2">
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" :class="u.role === 'SUPER_ADMIN' ? 'bg-gold/15 text-gold' : 'bg-blue-500/15 text-blue-400'">
                  {{ (u.displayName || 'A').charAt(0).toUpperCase() }}
                </div>
                <span class="font-medium">{{ u.displayName }}</span>
              </div>
            </td>
            <td class="px-5 py-3 text-white/50 font-mono text-xs">{{ u.email }}</td>
            <td class="px-5 py-3">
              <span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.625rem] font-bold"
                :class="u.role === 'SUPER_ADMIN' ? 'bg-gold/10 text-gold' : 'bg-blue-500/10 text-blue-400'">
                <UIcon :name="u.role === 'SUPER_ADMIN' ? 'i-lucide-shield-check' : 'i-lucide-pencil'" class="w-3 h-3 inline" /> {{ u.role.replace('_', ' ') }}
              </span>
            </td>
            <td class="px-5 py-3 text-white/30 whitespace-nowrap text-xs">{{ u.lastLoginAt ? formatDate(u.lastLoginAt) : '—' }}</td>
            <td class="px-5 py-3 text-right">
              <div class="flex justify-end gap-1">
                <button class="icon-btn" title="Edit" @click="openEditor(u)"><UIcon name="i-lucide-pencil" class="w-4 h-4" /></button>
                <button class="icon-btn danger" title="Delete" @click="confirmDelete(u)"><UIcon name="i-lucide-trash-2" class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="5">
              <AdminEmptyState icon="i-lucide-user" title="No users" message="Create admin users to manage the CMS." action-label="+ Add User" @action="openEditor(null)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Editor Modal -->
    <UModal v-model:open="editorOpen" :title="editorMode === 'create' ? 'Create User' : 'Edit User'" class="sm:max-w-md">
      <template #body>
        <div class="flex flex-col gap-4 p-1">
          <UFormField label="Display Name *">
            <UInput v-model="form.displayName" placeholder="John Doe" :class="{ 'ring-1 ring-red-500/50': fieldErrors.displayName }" @input="fieldErrors.displayName = ''" />
            <p v-if="fieldErrors.displayName" class="mt-1 text-xs text-red-400">{{ fieldErrors.displayName }}</p>
          </UFormField>

          <UFormField label="Email *">
            <UInput v-model="form.email" type="email" placeholder="admin@example.com" :class="{ 'ring-1 ring-red-500/50': fieldErrors.email }" @input="fieldErrors.email = ''" />
            <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-400">{{ fieldErrors.email }}</p>
          </UFormField>

          <UFormField :label="editorMode === 'edit' ? 'Password (leave blank to keep)' : 'Password *'">
            <UInput v-model="form.password" type="password" placeholder="••••••••" :class="{ 'ring-1 ring-red-500/50': fieldErrors.password }" @input="fieldErrors.password = ''" />
            <p v-if="fieldErrors.password" class="mt-1 text-xs text-red-400">{{ fieldErrors.password }}</p>
            <!-- Password Strength -->
            <div v-if="form.password" class="mt-2">
              <div class="flex gap-1">
                <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full" :class="i <= passwordStrength ? strengthColor : 'bg-white/8'" />
              </div>
              <p class="mt-1 text-[0.625rem]" :class="strengthTextColor">{{ strengthLabel }}</p>
            </div>
          </UFormField>

          <UFormField label="Role">
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="r in roles"
                :key="r.value"
                type="button"
                class="role-btn"
                :class="{ active: form.role === r.value }"
                @click="form.role = r.value"
              >
                <span>{{ r.icon }}</span>
                <span>{{ r.label }}</span>
              </button>
            </div>
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

    <!-- Delete Confirm -->
    <AdminConfirmDialog
      v-model="deleteOpen"
      title="Delete User?"
      :message="`Permanently delete '${deleteTarget?.displayName}'? This action cannot be undone.`"
      confirm-text="Delete"
      variant="danger"
      @confirm="doDelete"
    />

    <AdminToast :toast="toast" />
  </div>
</template>

<!--
  ═══ Admin User Management ═══
  จัดการผู้ใช้ admin (SUPER_ADMIN เท่านั้นเข้าถึงได้)

  ฟีเจอร์:
  - CRUD: สร้าง/แก้ไข/ลบ admin user
  - Role: EDITOR vs SUPER_ADMIN (ดู admin-auth.ts)
  - Password strength meter: Weak → Fair → Good → Strong
  - Field-level validation: ชื่อ, อีเมล, รหัสผ่าน
  - Last login tracking

  ⚠️ แก้รหัสผ่าน: ปล่อยว่างถ้าไม่ต้องการเปลี่ยน
  ⚠️ ห้ามลบตัวเอง (API จะ reject)
-->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
interface AdminUser { id: string; email: string; displayName: string; role: string; lastLoginAt: string | null }

const users = ref<AdminUser[]>([])
const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const deleteOpen = ref(false)
const deleteTarget = ref<AdminUser | null>(null)
const { toast, showToast } = useAdminToast()

const form = reactive({ displayName: '', email: '', password: '', role: 'EDITOR' })
const fieldErrors = reactive<Record<string, string>>({ displayName: '', email: '', password: '' })

const roles = [
  { value: 'EDITOR', icon: 'pencil', label: 'Editor' },
  { value: 'SUPER_ADMIN', icon: 'shield-check', label: 'Super Admin' },
]

// Password strength
// ── วัดความแข็งแรงรหัสผ่าน: ≥6, ≥10, ตัวใหญ่+เล็ก, อักขระพิเศษ ──
const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/[^a-zA-Z0-9]/.test(p)) s++
  return s
})
const strengthColor = computed(() => {
  const m: Record<number, string> = { 1: 'bg-red-500', 2: 'bg-amber-500', 3: 'bg-blue-500', 4: 'bg-emerald-500' }
  return m[passwordStrength.value] || 'bg-white/8'
})
const strengthTextColor = computed(() => {
  const m: Record<number, string> = { 1: 'text-red-400', 2: 'text-amber-400', 3: 'text-blue-400', 4: 'text-emerald-400' }
  return m[passwordStrength.value] || 'text-white/20'
})
const strengthLabel = computed(() => {
  const m: Record<number, string> = { 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' }
  return m[passwordStrength.value] || ''
})

async function loadUsers() {
  try { users.value = await $fetch<AdminUser[]>('/api/admin/users') } catch { users.value = [] }
}

function openEditor(u: AdminUser | null) {
  formError.value = ''
  Object.keys(fieldErrors).forEach(k => fieldErrors[k] = '')
  if (u) {
    editorMode.value = 'edit'; editingId.value = u.id
    Object.assign(form, { displayName: u.displayName, email: u.email, password: '', role: u.role })
  } else {
    editorMode.value = 'create'; editingId.value = null
    Object.assign(form, { displayName: '', email: '', password: '', role: 'EDITOR' })
  }
  editorOpen.value = true
}

function validate(): boolean {
  let valid = true
  Object.keys(fieldErrors).forEach(k => fieldErrors[k] = '')
  if (!form.displayName) { fieldErrors.displayName = 'Display name is required'; valid = false }
  if (!form.email) { fieldErrors.email = 'Email is required'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { fieldErrors.email = 'Enter a valid email address'; valid = false }
  if (editorMode.value === 'create' && !form.password) { fieldErrors.password = 'Password is required'; valid = false }
  if (form.password && form.password.length < 6) { fieldErrors.password = 'Password must be at least 6 characters'; valid = false }
  return valid
}

async function saveUser() {
  if (!validate()) return
  saving.value = true; formError.value = ''
  try {
    if (editorMode.value === 'create') { await $fetch('/api/admin/users', { method: 'POST', body: form }) }
    else { await $fetch(`/api/admin/users/${editingId.value}`, { method: 'PUT', body: form }) }
    editorOpen.value = false; showToast(editorMode.value === 'create' ? 'User created!' : 'User updated!')
    await loadUsers()
  } catch (e: unknown) { const err = e as { data?: { message?: string } }; formError.value = err?.data?.message || 'Save failed' }
  finally { saving.value = false }
}

function confirmDelete(u: AdminUser) { deleteTarget.value = u; deleteOpen.value = true }
async function doDelete() {
  if (!deleteTarget.value) return
  try { await $fetch(`/api/admin/users/${deleteTarget.value.id}`, { method: 'DELETE' }); showToast('User deleted'); await loadUsers() }
  catch { showToast('Delete failed', 'error') }
}

function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
// SSR-safe: admin auth is client-cookie based, so fetch on client only
onMounted(loadUsers)
</script>

<style scoped>
.gold-btn { padding: 9px 20px; border: none; border-radius: 10px; background: linear-gradient(135deg, #d4a843, #b8922e); color: black; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.gold-btn:hover { filter: brightness(1.1); }
.th-cell { padding: 12px 20px; text-align: left; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); }
.icon-btn { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; cursor: pointer; transition: background 0.15s; }
.icon-btn:hover { background: rgba(255,255,255,0.08); }
.icon-btn.danger:hover { background: rgba(239,68,68,0.15); }

.role-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;
  background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.4);
  font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.role-btn:hover { border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
.role-btn.active { border-color: rgba(212,168,67,0.3); background: rgba(212,168,67,0.06); color: #d4a843; }
</style>
