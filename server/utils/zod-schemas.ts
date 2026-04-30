/**
 * ═══ Shared Zod Schema Helpers ═══
 *
 * Reusable validators that handle the form-payload edge cases the admin
 * UI sends — primarily empty-string-as-null (so an admin clearing a
 * field doesn't fail validation as "missing" in PUT endpoints).
 *
 * Zod 4 quirk: z.preprocess(fn, schema) treats the WRAPPER as required.
 * Always chain .optional() AFTER preprocess to allow missing fields.
 */
import { z } from 'zod'

const emptyToNull = (value: unknown) => (value === '' ? null : value)

/** Optional, nullable string. '' is normalized to null. Trimmed by default. */
export const nullableStringSchema = z
  .preprocess(emptyToNull, z.string().trim().nullable())
  .optional()

/** Optional, nullable string without trim (preserves whitespace — for content fields). */
export const nullableStringSchemaNoTrim = z
  .preprocess(emptyToNull, z.string().nullable())
  .optional()

/** Optional, nullable date string (ISO). '' is normalized to null. */
export const nullableDateStringSchema = z
  .preprocess(emptyToNull, z.string().trim().nullable())
  .optional()

/** Optional, nullable positive int. '' is normalized to null. */
export const nullableIntSchema = z
  .preprocess(emptyToNull, z.coerce.number().int().positive().nullable())
  .optional()
