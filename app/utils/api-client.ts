/**
 * ═══ Admin API Client ═══
 * รวม endpoint ทั้งหมดของ admin/public ไว้ที่เดียว — แทน $fetch กระจัดกระจาย
 *
 * ประโยชน์:
 *  - แก้ url ที่เดียว (route refactor ไม่กระทบ pages)
 *  - error handling ตรงกลาง (toast, structured error message)
 *  - type-safe (auto-complete รู้ endpoint ไหน return อะไร)
 *
 * ใช้ใน admin pages:
 *   const data = await adminApi.news.list({ page: 1 })
 *   await adminApi.news.update(id, { titleEn: 'X' })
 */

export type AdminApiError = {
  statusCode: number
  message: string
  data?: unknown
}

function toApiError(err: unknown): AdminApiError {
  const e = err as { statusCode?: number; statusMessage?: string; data?: unknown; message?: string }
  return {
    statusCode: e.statusCode ?? 500,
    message: e.data && typeof e.data === 'object' && 'message' in e.data ? String((e.data as { message: unknown }).message) : (e.statusMessage || e.message || 'Unknown error'),
    data: e.data,
  }
}

async function request<T>(url: string, init?: Parameters<typeof $fetch>[1]): Promise<T> {
  try {
    return await $fetch<T>(url, init)
  } catch (err) {
    throw toApiError(err)
  }
}

// ═══════════ Public API (read-only) ═══════════

export const publicApi = {
  site: () => request<unknown>('/api/public/site'),
  news: {
    list: (query?: { page?: number; limit?: number; category?: string; topic?: string }) =>
      request<{ data: unknown[]; meta: { total: number; page: number; limit: number; totalPages: number } }>('/api/public/news', { query }),
    get: (slug: string) => request<unknown>(`/api/public/news/${slug}`),
  },
  features: () => request<unknown[]>('/api/public/features'),
  highlights: () => request<unknown[]>('/api/public/highlights'),
  weapons: () => request<unknown[]>('/api/public/weapons'),
  banners: (query?: { routeType?: string; articleId?: number; topicKey?: string }) =>
    request<unknown>('/api/public/banners', { query }),
  stats: () => request<unknown>('/api/public/stats'),
  milestones: () => request<unknown[]>('/api/public/milestones'),
}

// ═══════════ Admin API (auth required via cookie) ═══════════

type CrudEndpoints<TList, TItem, TCreate, TUpdate> = {
  list: (query?: Record<string, unknown>) => Promise<TList>
  get: (id: string | number) => Promise<TItem>
  create: (data: TCreate) => Promise<TItem>
  update: (id: string | number, data: TUpdate) => Promise<TItem>
  delete: (id: string | number) => Promise<{ success: boolean }>
}

function makeCrud<TList = unknown[], TItem = unknown, TCreate = unknown, TUpdate = unknown>(
  base: string,
): CrudEndpoints<TList, TItem, TCreate, TUpdate> {
  return {
    list: (query) => request<TList>(base, { query }),
    get: (id) => request<TItem>(`${base}/${id}`),
    create: (data) => request<TItem>(base, { method: 'POST', body: data }),
    update: (id, data) => request<TItem>(`${base}/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request<{ success: boolean }>(`${base}/${id}`, { method: 'DELETE' }),
  }
}

export const adminApi = {
  news: makeCrud('/api/admin/news'),
  banners: makeCrud('/api/admin/banners'),
  events: makeCrud('/api/admin/events'),
  features: makeCrud('/api/admin/features'),
  highlights: makeCrud('/api/admin/highlights'),
  weapons: makeCrud('/api/admin/weapons'),
  milestones: makeCrud('/api/admin/milestones'),
  users: makeCrud('/api/admin/users'),

  // Pages ใช้ key แทน id
  pages: {
    list: () => request<unknown[]>('/api/admin/pages'),
    get: (key: string) => request<unknown>(`/api/admin/pages/${key}`),
    create: (data: unknown) => request<unknown>('/api/admin/pages', { method: 'POST', body: data }),
    update: (key: string, data: unknown) =>
      request<unknown>(`/api/admin/pages/${key}`, { method: 'PUT', body: data }),
  },

  media: {
    list: (query?: Record<string, unknown>) => request<unknown>('/api/admin/media', { query }),
    upload: (formData: FormData) =>
      request<unknown>('/api/admin/media/upload', { method: 'POST', body: formData }),
    delete: (id: string) => request<{ success: boolean }>(`/api/admin/media/${id}`, { method: 'DELETE' }),
    update: (id: string, data: unknown) =>
      request<unknown>(`/api/admin/media/${id}`, { method: 'PATCH', body: data }),
  },

  config: {
    get: (key?: string) => request<unknown>('/api/admin/config', { query: key ? { key } : undefined }),
    update: (data: { key: string; value: unknown }) =>
      request<unknown>('/api/admin/config', { method: 'PUT', body: data }),
  },

  stats: () => request<unknown>('/api/admin/stats'),
  analytics: (query?: { range?: string }) => request<unknown>('/api/admin/analytics', { query }),
  activity: (query?: { page?: number; limit?: number }) =>
    request<unknown>('/api/admin/activity', { query }),

  registrations: {
    list: (query?: { page?: number; limit?: number; platform?: string; region?: string }) =>
      request<unknown>('/api/admin/registrations', { query }),
    export: (query?: Record<string, unknown>) =>
      request<unknown>('/api/admin/registrations/export', { query }),
  },

  backup: {
    export: (selection: Record<string, boolean>) =>
      request<unknown>('/api/admin/backup/export', { method: 'POST', body: selection }),
    import: (data: unknown) =>
      request<unknown>('/api/admin/backup/import', { method: 'POST', body: data }),
    importWp: (data: { url: string; perPage?: number }) =>
      request<unknown>('/api/admin/backup/import-wp', { method: 'POST', body: data }),
  },
}
