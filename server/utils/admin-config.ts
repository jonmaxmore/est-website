import { z } from 'zod'

import { isSupportedHomepageSectionType } from '../../app/shared/cms/homepage'
import { normalizeNavigationConfig } from '../../app/shared/cms/navigation'

const homepageSectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().refine(isSupportedHomepageSectionType, 'Unsupported homepage section type'),
  visible: z.boolean(),
  order: z.number().int().nonnegative(),
  background: z.string(),
  config: z.record(z.string(), z.unknown()),
})

const homepageSectionsSchema = z.object({
  sections: z.array(homepageSectionSchema),
})

const faqSchema = z.array(
  z
    .object({
      labelEn: z.string(),
      labelTh: z.string(),
      contentEn: z.string(),
      contentTh: z.string(),
      visible: z.boolean(),
    })
    .superRefine((value, ctx) => {
      if (!value.labelEn.trim() && !value.labelTh.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one FAQ question language is required',
        })
      }

      if (!value.contentEn.trim() && !value.contentTh.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one FAQ answer language is required',
        })
      }
    }),
)

const integrationsSchema = z.object({
  webhookSecret: z.string().optional().default(''),
  wordpress: z
    .object({
      enabled: z.boolean().optional().default(false),
      url: z.string().optional().default(''),
      apiKey: z.string().optional().default(''),
      syncDirection: z.enum(['pull', 'push', 'bidirectional']).optional().default('bidirectional'),
    })
    .optional(),
  wix: z
    .object({
      enabled: z.boolean().optional().default(false),
      accountId: z.string().optional().default(''),
      apiKey: z.string().optional().default(''),
      webhookSecret: z.string().optional().default(''),
    })
    .optional(),
})

const maintenanceSchema = z.object({
  enabled: z.boolean(),
  messageEn: z.string().optional().default(''),
  messageTh: z.string().optional().default(''),
})

const stringRecordSchema = z.record(z.string(), z.string())

function parseNavigationConfig(value: unknown) {
  const navigation = normalizeNavigationConfig(value)

  for (const item of [...navigation.main, ...navigation.footer]) {
    if (item.type === 'page' && !item.pageKey?.trim()) {
      throw new Error('Page navigation items require a page key')
    }

    if (item.type === 'custom' && !item.href?.trim()) {
      throw new Error('Custom navigation items require an href')
    }
  }

  return navigation
}

export const DEFAULT_HOMEPAGE_SECTIONS = [
  { id: 'hero', type: 'hero', visible: true, order: 0, background: '/images/hero-bg.webp', config: {} },
  { id: 'weapons', type: 'weapons', visible: true, order: 1, background: '', config: {} },
  { id: 'features', type: 'features', visible: true, order: 2, background: '', config: {} },
  { id: 'highlights', type: 'highlights', visible: true, order: 3, background: '', config: {} },
  { id: 'news', type: 'news', visible: true, order: 4, background: '', config: {} },
  { id: 'cta', type: 'cta', visible: true, order: 5, background: '', config: {} },
] as const

export const DEFAULT_INTEGRATIONS_CONFIG = {
  webhookSecret: '',
  wordpress: {
    enabled: false,
    url: '',
    apiKey: '',
    syncDirection: 'bidirectional' as const,
  },
  wix: {
    enabled: false,
    accountId: '',
    apiKey: '',
    webhookSecret: '',
  },
}

export function normalizeHomepageSections(value: unknown) {
  const parsed = homepageSectionsSchema.safeParse(value)

  if (!parsed.success) {
    return [...DEFAULT_HOMEPAGE_SECTIONS]
  }

  return [...parsed.data.sections].sort((left, right) => left.order - right.order)
}

export function normalizeIntegrationsConfig(value: unknown) {
  const parsed = integrationsSchema.safeParse(value)

  if (!parsed.success) {
    return {
      ...DEFAULT_INTEGRATIONS_CONFIG,
      wordpress: { ...DEFAULT_INTEGRATIONS_CONFIG.wordpress },
      wix: { ...DEFAULT_INTEGRATIONS_CONFIG.wix },
    }
  }

  return {
    ...DEFAULT_INTEGRATIONS_CONFIG,
    ...parsed.data,
    wordpress: {
      ...DEFAULT_INTEGRATIONS_CONFIG.wordpress,
      ...(parsed.data.wordpress || {}),
    },
    wix: {
      ...DEFAULT_INTEGRATIONS_CONFIG.wix,
      ...(parsed.data.wix || {}),
    },
  }
}

const configParsers = {
  navigation: parseNavigationConfig,
  seo: (value: unknown) => stringRecordSchema.parse(value),
  social: (value: unknown) => stringRecordSchema.parse(value),
  appearance: (value: unknown) => stringRecordSchema.parse(value),
  maintenance: (value: unknown) => maintenanceSchema.parse(value),
  homepage_sections: (value: unknown) => {
    const parsed = homepageSectionsSchema.safeParse(value)
    if (!parsed.success) {
      throw parsed.error
    }

    return {
      sections: [...parsed.data.sections].sort((left, right) => left.order - right.order),
    }
  },
  integrations: (value: unknown) => normalizeIntegrationsConfig(value),
  faq: (value: unknown) => faqSchema.parse(value),
} satisfies Record<string, (value: unknown) => unknown>

export function parseAdminConfigWrite(input: { key: string; value: unknown }) {
  const parser = configParsers[input.key as keyof typeof configParsers]
  if (!parser) {
    throw new Error(`Unsupported config key: ${input.key}`)
  }

  return {
    key: input.key,
    value: parser(input.value),
  }
}

export function readAdminConfigValue(key: string, value: unknown) {
  if (key === 'homepage_sections') {
    return { sections: normalizeHomepageSections(value) }
  }

  if (key === 'navigation') {
    return normalizeNavigationConfig(value)
  }

  if (key === 'integrations') {
    return normalizeIntegrationsConfig(value)
  }

  return value
}
