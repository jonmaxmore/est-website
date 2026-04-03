// API client for fetching CMS content (server-side)
const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || '';

interface FetchOptions {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
}

export async function apiGet<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { cache, revalidate = 60, tags } = options;

  const url = `${API_BASE}/api${endpoint}`;

  const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  };

  if (cache) {
    fetchOptions.cache = cache;
  } else {
    fetchOptions.next = { revalidate, tags };
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function apiPost<T>(
  endpoint: string,
  body: unknown
): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}
