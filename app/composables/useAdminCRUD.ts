/**
 * ═══ useAdminCRUD<T> — generic admin CRUD composable ═══
 *
 * ลบ duplicated logic ของหน้า admin: list, search, save, delete, bulk-delete,
 * paginate, toast notification, error handling
 *
 * Usage (ใน admin/banners.vue เป็นต้น):
 *   const crud = useAdminCRUD<Banner>({ endpoint: '/api/admin/banners' })
 *   await crud.load({ page: 1 })
 *   await crud.create({ ... })
 *   await crud.update(id, { ... })
 *   await crud.remove(id)
 *
 * Pages เก่ายังใช้ pattern เก่าก็ได้ — composable นี้สำหรับหน้าใหม่และ refactor ทีหลัง
 */
import { reactive, ref, type Ref } from 'vue'

import { useAdminToast } from './useAdminToast'

export type CrudListMeta = { total: number; page: number; limit: number; totalPages: number }

export type CrudOptions = {
  endpoint: string
  resourceName?: string
  defaultLimit?: number
}

export type AdminCrudReturn<T> = {
  items: Ref<T[]>
  selected: Ref<string | number | null>
  meta: { value: CrudListMeta }
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string | null>

  load: (query?: Record<string, unknown>) => Promise<void>
  get: (id: string | number) => Promise<T | null>
  create: (data: Partial<T>) => Promise<T | null>
  update: (id: string | number, data: Partial<T>) => Promise<T | null>
  remove: (id: string | number) => Promise<boolean>
  bulkRemove: (ids: Array<string | number>) => Promise<{ ok: number; failed: number }>
}

type Identifiable = { id: string | number }

function isIdentifiable(value: unknown): value is Identifiable {
  return Boolean(value && typeof value === 'object' && 'id' in value)
}

export function useAdminCRUD<T extends Identifiable>(opts: CrudOptions): AdminCrudReturn<T> {
  const { endpoint, resourceName = 'item', defaultLimit = 20 } = opts

  const items = ref<T[]>([]) as Ref<T[]>
  const selected = ref<string | number | null>(null)
  const meta = reactive<CrudListMeta>({
    total: 0,
    page: 1,
    limit: defaultLimit,
    totalPages: 0,
  })
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const { showToast } = useAdminToast()

  function extractMessage(err: unknown): string {
    const e = err as { data?: { message?: string }; statusMessage?: string; message?: string }
    return e?.data?.message || e?.statusMessage || e?.message || 'Unknown error'
  }

  async function load(query?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<unknown>(endpoint, { query })
      // รองรับทั้ง { data, meta } และ array ตรงๆ
      if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as { data: unknown }).data)) {
        const r = res as { data: T[]; meta?: CrudListMeta }
        items.value = r.data
        if (r.meta) {
          Object.assign(meta, r.meta)
        }
      } else if (Array.isArray(res)) {
        items.value = res as T[]
        meta.total = res.length
        meta.page = 1
        meta.limit = res.length
        meta.totalPages = 1
      } else {
        items.value = []
      }
    } catch (err) {
      error.value = extractMessage(err)
      showToast(`Failed to load ${resourceName}: ${error.value}`, 'error')
    } finally {
      loading.value = false
    }
  }

  // $fetch on dynamic-string routes triggers Nitro's typed-routes inference
  // which can recursively expand the union and blow the type-checker stack.
  // We bypass it via a loosely-typed local helper; runtime behavior is
  // unchanged. Each caller still asserts the return type.
  type AnyFetch = (url: string, init?: { method?: string; body?: unknown }) => Promise<unknown>
  const fetchAny = $fetch as unknown as AnyFetch

  async function get(id: string | number): Promise<T | null> {
    try {
      return (await fetchAny(`${endpoint}/${id}`)) as T
    } catch (err) {
      showToast(`Failed to fetch ${resourceName}: ${extractMessage(err)}`, 'error')
      return null
    }
  }

  async function create(data: Partial<T>): Promise<T | null> {
    saving.value = true
    error.value = null
    try {
      const created = (await fetchAny(endpoint, { method: 'POST', body: data })) as T
      if (isIdentifiable(created)) items.value = [created, ...items.value]
      showToast(`${resourceName} created`, 'success')
      return created
    } catch (err) {
      error.value = extractMessage(err)
      showToast(`Failed to create: ${error.value}`, 'error')
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(id: string | number, data: Partial<T>): Promise<T | null> {
    saving.value = true
    error.value = null
    try {
      const updated = (await fetchAny(`${endpoint}/${id}`, { method: 'PUT', body: data })) as T
      const idx = items.value.findIndex((i) => i.id === id)
      if (idx >= 0 && isIdentifiable(updated)) {
        items.value.splice(idx, 1, updated)
      }
      showToast(`${resourceName} updated`, 'success')
      return updated
    } catch (err) {
      error.value = extractMessage(err)
      showToast(`Failed to update: ${error.value}`, 'error')
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string | number): Promise<boolean> {
    saving.value = true
    try {
      await $fetch(`${endpoint}/${id}`, { method: 'DELETE' })
      items.value = items.value.filter((i) => i.id !== id)
      showToast(`${resourceName} deleted`, 'success')
      return true
    } catch (err) {
      showToast(`Failed to delete: ${extractMessage(err)}`, 'error')
      return false
    } finally {
      saving.value = false
    }
  }

  async function bulkRemove(ids: Array<string | number>) {
    let ok = 0
    let failed = 0
    for (const id of ids) {
      try {
        await $fetch(`${endpoint}/${id}`, { method: 'DELETE' })
        ok++
      } catch {
        failed++
      }
    }
    items.value = items.value.filter((i) => !ids.includes(i.id))
    showToast(`Deleted ${ok} ${resourceName}${failed ? ` (${failed} failed)` : ''}`, failed ? 'error' : 'success')
    return { ok, failed }
  }

  return {
    items,
    selected,
    meta: { value: meta },
    loading,
    saving,
    error,
    load,
    get,
    create,
    update,
    remove,
    bulkRemove,
  }
}
