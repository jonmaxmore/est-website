/**
 * Pick only allowed fields from a loose record.
 *
 * Used as a mass-assignment guard before forwarding caller-supplied data into
 * Prisma writes (see server/api/admin/backup/import.post.ts). The output type
 * is `Record<K, unknown>` — values still need their own runtime validation
 * before reaching the DB; this helper only narrows the keyspace.
 *
 *   pickKnown({ a: 1, b: 2, c: 3 }, ['a', 'c'])  // → { a: 1, c: 3 }
 *   pickKnown(null, ['a'])                        // → {}
 *   pickKnown('not-an-object', ['a'])             // → {}
 *
 * Keys not present on the input are NOT added to the output (so callers can
 * distinguish "not sent" from "sent as undefined" downstream if needed).
 */
export function pickKnown<K extends string>(
  input: unknown,
  allowed: readonly K[],
): Record<K, unknown> {
  if (!input || typeof input !== 'object') return {} as Record<K, unknown>
  const src = input as Record<string, unknown>
  const out = {} as Record<K, unknown>
  for (const k of allowed) {
    if (k in src) out[k] = src[k]
  }
  return out
}
