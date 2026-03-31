/* eslint-disable max-lines -- Central verification rail keeps cross-stack checks in one place. */
import { z } from 'zod'

export type VerificationCheckStatus = 'passed' | 'failed' | 'skipped'

export type VerificationCheck = {
  id: string;
  label: string;
  target: string;
  status: VerificationCheckStatus;
  detail: string;
}

export type StackVerificationSummary = {
  baseUrl: string;
  generatedAt: string;
  ok: boolean;
  checks: VerificationCheck[];
  totals: {
    passed: number;
    failed: number;
    skipped: number;
  };
}

type FetchLike = typeof fetch

type VerificationContext = {
  baseUrl: string;
  fetchImpl: FetchLike;
  payloadSecret: string | null;
  checks: VerificationCheck[];
}

type CheckInput = {
  id: string;
  label: string;
  target: string;
}

type RunOptions = {
  baseUrl?: string;
  fetchImpl?: FetchLike;
  payloadSecret?: string | null;
  enableMutation?: boolean;
  mutationPlatform?: 'ios' | 'android' | 'pc';
  mutationRegion?: 'th' | 'my' | 'id' | 'ph' | 'sg';
}

const DEFAULT_BASE_URL = process.env.STACK_VERIFY_BASE_URL
  || process.env.CONTENT_HEALTH_BASE_URL
  || process.env.NEXT_PUBLIC_SITE_URL
  || `http://127.0.0.1:${process.env.PORT || '3000'}`
const DEFAULT_MUTATION_ENABLED = process.env.STACK_VERIFY_ENABLE_MUTATION === '1'
const DEFAULT_MUTATION_PLATFORM: 'ios' | 'android' | 'pc' =
  process.env.STACK_VERIFY_TEST_PLATFORM === 'ios'
  || process.env.STACK_VERIFY_TEST_PLATFORM === 'android'
  || process.env.STACK_VERIFY_TEST_PLATFORM === 'pc'
    ? process.env.STACK_VERIFY_TEST_PLATFORM
    : 'ios'
const DEFAULT_MUTATION_REGION: 'th' | 'my' | 'id' | 'ph' | 'sg' =
  process.env.STACK_VERIFY_TEST_REGION === 'th'
  || process.env.STACK_VERIFY_TEST_REGION === 'my'
  || process.env.STACK_VERIFY_TEST_REGION === 'id'
  || process.env.STACK_VERIFY_TEST_REGION === 'ph'
  || process.env.STACK_VERIFY_TEST_REGION === 'sg'
    ? process.env.STACK_VERIFY_TEST_REGION
    : 'th'

const PAGE_PATHS = [
  { id: 'page-home', label: 'Public page: home', path: '/' },
  { id: 'page-event', label: 'Public page: event', path: '/event' },
  { id: 'page-news', label: 'Public page: news', path: '/news' },
  { id: 'page-game-guide', label: 'Public page: game guide', path: '/game-guide' },
  { id: 'page-privacy', label: 'Public page: privacy', path: '/privacy' },
  { id: 'page-terms', label: 'Public page: terms', path: '/terms' },
  { id: 'page-admin-login', label: 'CMS page: admin login', path: '/admin/login' },
] as const

const htmlDocumentPattern = /<(?:!doctype|html)\b/i
const nonEmptyTextSchema = z.string().trim().min(1)
const idSchema = z.union([z.number(), z.string()])
const healthSchema = z.object({
  status: z.literal('ok'),
  timestamp: nonEmptyTextSchema,
})

const settingsSchema = z.object({
  site: z.object({
    name: nonEmptyTextSchema,
    registrationUrl: nonEmptyTextSchema,
    logo: z.object({
      url: nonEmptyTextSchema,
    }),
    navigationLinks: z.array(z.object({
      href: nonEmptyTextSchema,
      labelEn: nonEmptyTextSchema.optional(),
      labelTh: nonEmptyTextSchema.optional(),
    }).passthrough()).min(1),
    footer: z.object({
      groups: z.array(z.object({
        links: z.array(z.object({
          href: nonEmptyTextSchema,
        }).passthrough()).min(1),
      }).passthrough()).min(1),
    }).passthrough(),
  }).passthrough(),
  gameGuidePage: z.object({
    features: z.array(z.unknown()).min(1),
  }).passthrough(),
  storeButtons: z.array(z.object({
    url: nonEmptyTextSchema,
  }).passthrough()).min(1),
})

const weaponsSchema = z.object({
  weapons: z.array(z.object({
    id: idSchema,
  }).passthrough()).min(1),
})

const legacyCharactersSchema = z.object({
  characters: z.array(z.object({
    id: idSchema,
  }).passthrough()).min(1),
})

const gallerySchema = z.object({
  gallery: z.record(z.string(), z.array(z.unknown())),
  items: z.record(z.string(), z.array(z.unknown())),
})

const newsPreviewSchema = z.object({
  slug: z.string().optional().nullable(),
  href: nonEmptyTextSchema,
  isExternal: z.boolean().optional().default(false),
  titleEn: z.string().optional().nullable(),
  titleTh: z.string().optional().nullable(),
  summaryEn: z.string().optional().nullable(),
  summaryTh: z.string().optional().nullable(),
}).passthrough()

const newsListSchema = z.object({
  articles: z.array(newsPreviewSchema).min(1),
  pagination: z.object({
    totalDocs: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    hasNextPage: z.boolean(),
    limit: z.number().int().positive(),
  }),
})

const newsDetailSchema = z.object({
  article: z.object({
    slug: nonEmptyTextSchema,
    titleEn: z.string().optional().nullable(),
    titleTh: z.string().optional().nullable(),
    summaryEn: z.string().optional().nullable(),
    summaryTh: z.string().optional().nullable(),
    contentEn: z.unknown().optional(),
    contentTh: z.unknown().optional(),
  }).passthrough(),
  related: z.array(z.unknown()),
})

const contentHealthSchema = z.object({
  generatedAt: nonEmptyTextSchema,
  summary: z.object({
    publishedNews: z.number().int().nonnegative(),
    newsWithErrors: z.number().int().nonnegative(),
    newsWithWarnings: z.number().int().nonnegative(),
    globalsWithErrors: z.number().int().nonnegative(),
    globalsWithWarnings: z.number().int().nonnegative(),
  }),
  news: z.array(z.unknown()),
  globals: z.array(z.unknown()),
})

const registerErrorSchema = z.object({
  error: nonEmptyTextSchema,
})

const registerSuccessSchema = z.object({
  success: z.literal(true),
  referralCode: nonEmptyTextSchema,
  message: nonEmptyTextSchema,
})

const registrationCleanupSchema = z.object({
  success: z.literal(true),
  email: nonEmptyTextSchema,
  deletedCount: z.number().int().nonnegative(),
})

function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, '')
}

function buildUrl(baseUrl: string, path: string) {
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

function extractOrigin(baseUrl: string) {
  return new URL(baseUrl).origin
}

function resolveInternalPath(baseUrl: string, target: string) {
  if (!target.trim()) return null
  if (target.startsWith('/')) return target

  try {
    const url = new URL(target)
    return url.origin === extractOrigin(baseUrl) ? `${url.pathname}${url.search}${url.hash}` : null
  } catch {
    return null
  }
}

function hasContent(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return Boolean(value)
}

function hasLocalizedCopy(values: Array<string | null | undefined>) {
  return values.some((value) => typeof value === 'string' && value.trim().length > 0)
}

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function addCheck(
  context: VerificationContext,
  input: CheckInput,
  status: VerificationCheckStatus,
  detail: string,
) {
  context.checks.push({
    ...input,
    status,
    detail,
  })
}

async function fetchResponse(
  context: VerificationContext,
  path: string,
  init?: RequestInit,
) {
  return context.fetchImpl(buildUrl(context.baseUrl, path), {
    redirect: 'follow',
    ...init,
  })
}

async function fetchJson<T>(
  context: VerificationContext,
  path: string,
  schema: z.ZodSchema<T>,
  init?: RequestInit,
) {
  const response = await fetchResponse(context, path, init)
  ensure(response.ok, `Expected HTTP 200, received ${response.status}`)

  const data = await response.json()
  return schema.parse(data)
}

async function fetchHtml(context: VerificationContext, path: string) {
  const response = await fetchResponse(context, path, {
    headers: { Accept: 'text/html' },
  })

  ensure(response.ok, `Expected HTTP 200, received ${response.status}`)

  const contentType = response.headers.get('content-type') || ''
  ensure(contentType.includes('text/html'), `Expected text/html, received ${contentType || 'unknown content type'}`)

  const html = await response.text()
  ensure(htmlDocumentPattern.test(html), 'Expected an HTML document shell in the response body')

  return html
}

async function runCheck(
  context: VerificationContext,
  input: CheckInput,
  task: () => Promise<string>,
) {
  try {
    const detail = await task()
    addCheck(context, input, 'passed', detail)
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown verification failure'
    addCheck(context, input, 'failed', detail)
  }
}

async function verifyHtmlPage(
  context: VerificationContext,
  id: string,
  label: string,
  path: string,
) {
  await runCheck(context, { id, label, target: path }, async () => {
    await fetchHtml(context, path)
    return 'HTTP 200 with HTML document response'
  })
}

async function verifyHealthEndpoint(context: VerificationContext) {
  await runCheck(context, {
    id: 'api-health',
    label: 'Public API: health',
    target: '/api/health',
  }, async () => {
    const data = await fetchJson(context, '/api/health', healthSchema)
    return `status=${data.status} at ${data.timestamp}`
  })
}

async function verifySettingsEndpoint(
  context: VerificationContext,
): Promise<z.infer<typeof settingsSchema> | null> {
  let settings: z.infer<typeof settingsSchema> | null = null

  await runCheck(context, {
    id: 'api-settings',
    label: 'Public API: settings',
    target: '/api/settings',
  }, async () => {
    const data = await fetchJson(context, '/api/settings', settingsSchema)
    settings = data
    return [
      `navigation=${data.site.navigationLinks.length}`,
      `footerGroups=${data.site.footer.groups.length}`,
      `storeButtons=${data.storeButtons.length}`,
      `guideFeatures=${data.gameGuidePage.features.length}`,
    ].join(', ')
  })

  return settings
}

async function verifyWeaponsEndpoints(context: VerificationContext) {
  const weapons = await fetchJson(context, '/api/public/weapons', weaponsSchema)

  addCheck(
    context,
    {
      id: 'api-weapons',
      label: 'Public API: weapons',
      target: '/api/public/weapons',
    },
    'passed',
    `weapons=${weapons.weapons.length}`,
  )

  await runCheck(context, {
    id: 'api-characters-alias',
    label: 'Public API: characters alias',
    target: '/api/public/characters',
  }, async () => {
    const data = await fetchJson(context, '/api/public/characters', legacyCharactersSchema)
    ensure(
      data.characters.length === weapons.weapons.length,
      `Alias returned ${data.characters.length} items, expected ${weapons.weapons.length}`,
    )

    return `alias matches canonical weapons count (${data.characters.length})`
  })
}

async function verifyGalleryEndpoint(context: VerificationContext) {
  await runCheck(context, {
    id: 'api-gallery',
    label: 'Public API: gallery',
    target: '/api/public/gallery',
  }, async () => {
    const data = await fetchJson(context, '/api/public/gallery', gallerySchema)
    return `categories=${Object.keys(data.gallery).length}`
  })
}

function selectInternalNewsSlug(articles: z.infer<typeof newsPreviewSchema>[]) {
  return articles.find((article) => !article.isExternal && hasContent(article.slug))?.slug?.trim() || null
}

async function verifyNewsEndpoints(context: VerificationContext) {
  let internalSlug: string | null = null

  await runCheck(context, {
    id: 'api-news',
    label: 'Public API: news list',
    target: '/api/public/news?limit=5',
  }, async () => {
    const data = await fetchJson(context, '/api/public/news?limit=5', newsListSchema)
    const slug = selectInternalNewsSlug(data.articles)

    ensure(slug, 'Expected at least one internal published article for frontend detail routes')
    ensure(
      data.articles.some((article) => hasLocalizedCopy([article.titleEn, article.titleTh])),
      'Expected at least one article title in the news feed',
    )

    internalSlug = slug
    return `articles=${data.articles.length}, detailSlug=${slug}`
  })

  if (!internalSlug) return null

  await runCheck(context, {
    id: 'api-news-detail',
    label: 'Public API: news detail',
    target: `/api/public/news-detail?slug=${internalSlug}`,
  }, async () => {
    const data = await fetchJson(context, `/api/public/news-detail?slug=${internalSlug}`, newsDetailSchema)
    ensure(data.article.slug === internalSlug, `Detail route returned slug "${data.article.slug}" instead of "${internalSlug}"`)
    ensure(
      hasLocalizedCopy([data.article.titleEn, data.article.titleTh]),
      'News detail is missing localized title content',
    )
    ensure(
      hasLocalizedCopy([data.article.summaryEn, data.article.summaryTh]),
      'News detail is missing localized summary content',
    )
    ensure(
      hasContent(data.article.contentEn) || hasContent(data.article.contentTh),
      'News detail is missing article body content in both locales',
    )

    return `detail article "${data.article.slug}" returned with ${data.related.length} related items`
  })

  return internalSlug
}

async function verifyProtectedContentHealthEndpoint(context: VerificationContext) {
  await runCheck(context, {
    id: 'api-content-health-auth',
    label: 'Protected API: content health requires auth',
    target: '/api/content-health',
  }, async () => {
    const response = await fetchResponse(context, '/api/content-health')
    ensure(response.status === 401, `Expected HTTP 401, received ${response.status}`)
    return 'unauthenticated access correctly rejected with HTTP 401'
  })
}

async function verifyHomepageRegistrationLink(
  context: VerificationContext,
  registrationUrl: string,
) {
  await runCheck(context, {
    id: 'flow-home-registration-link',
    label: 'Flow: homepage registration CTA',
    target: '/',
  }, async () => {
    const html = await fetchHtml(context, '/')
    ensure(
      html.includes(`href="${registrationUrl}"`),
      `Homepage HTML does not expose registration link "${registrationUrl}"`,
    )

    return `homepage contains registration href "${registrationUrl}"`
  })
}

async function verifyRegistrationSurface(
  context: VerificationContext,
  registrationUrl: string,
) {
  const internalPath = resolveInternalPath(context.baseUrl, registrationUrl)
  const input = {
    id: 'flow-registration-surface',
    label: 'Flow: registration page surface',
    target: registrationUrl,
  }

  if (!internalPath) {
    addCheck(context, input, 'skipped', 'Registration URL points off-site, skipping internal form verification')
    return
  }

  await runCheck(context, input, async () => {
    const html = await fetchHtml(context, internalPath)
    ensure(html.includes('<form'), 'Registration page is missing a form shell')
    ensure(html.includes('type="email"'), 'Registration page is missing the email input')
    ensure(html.includes('event-submit-btn'), 'Registration page is missing the submit action button')
    ensure(
      html.includes('store-btn') || html.includes('event-form-store-btn'),
      'Registration page is missing store button markup',
    )

    return `registration route ${internalPath} exposes form, submit, and store CTA markup`
  })
}

async function verifyRegisterValidation(context: VerificationContext) {
  await runCheck(context, {
    id: 'flow-register-validation',
    label: 'Flow: register endpoint validation',
    target: '/api/register',
  }, async () => {
    const requestHeaders = buildRegisterHeaders(Date.now())
    const response = await fetchResponse(context, '/api/register', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        email: 'not-an-email',
        platform: 'switch',
        region: 'xx',
      }),
    })

    ensure(response.status === 400, `Expected HTTP 400, received ${response.status}`)
    const result = registerErrorSchema.parse(await response.json())
    return `invalid payload rejected with message "${result.error}"`
  })
}

function createVerificationEmail() {
  return `codex+verify-${Date.now()}@example.com`
}

function buildVerificationIp(seed: number) {
  const octet = Math.abs(seed % 200) + 20
  return `198.51.100.${octet}`
}

function buildRegisterHeaders(seed: number): HeadersInit {
  const ip = buildVerificationIp(seed)

  return {
    'Content-Type': 'application/json',
    'X-Forwarded-For': ip,
    'X-Real-IP': ip,
  }
}

async function cleanupVerificationRegistration(
  context: VerificationContext,
  email: string,
) {
  return fetchJson(
    context,
    '/api/internal/test-registrations',
    registrationCleanupSchema,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${context.payloadSecret}`,
      },
      body: JSON.stringify({ email }),
    },
  )
}

async function verifyRegisterMutationFlow(
  context: VerificationContext,
  options: RunOptions,
) {
  const input = {
    id: 'flow-register-mutation',
    label: 'Flow: register mutation and cleanup',
    target: '/api/register',
  }

  const mutationEnabled = options.enableMutation ?? DEFAULT_MUTATION_ENABLED
  if (!mutationEnabled) {
    addCheck(context, input, 'skipped', 'Mutation verification disabled. Set STACK_VERIFY_ENABLE_MUTATION=1 to enable it.')
    return
  }

  if (!context.payloadSecret) {
    addCheck(context, input, 'skipped', 'PAYLOAD_SECRET unavailable, skipping mutation verification.')
    return
  }

  await runCheck(context, input, async () => {
    const email = createVerificationEmail()
    const platform = options.mutationPlatform || DEFAULT_MUTATION_PLATFORM
    const region = options.mutationRegion || DEFAULT_MUTATION_REGION
    const requestHeaders = buildRegisterHeaders(Date.now())

    const preCleanup = await cleanupVerificationRegistration(context, email)
    ensure(preCleanup.deletedCount === 0, `Expected clean slate, but removed ${preCleanup.deletedCount} existing verification records`)

    const createResponse = await fetchResponse(context, '/api/register', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({ email, platform, region }),
    })

    ensure(createResponse.status === 201, `Expected HTTP 201, received ${createResponse.status}`)
    const createResult = registerSuccessSchema.parse(await createResponse.json())
    ensure(createResult.referralCode.length >= 6, 'Registration did not return a usable referral code')

    const duplicateResponse = await fetchResponse(context, '/api/register', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({ email, platform, region }),
    })

    ensure(duplicateResponse.status === 409, `Expected duplicate attempt to return HTTP 409, received ${duplicateResponse.status}`)
    registerErrorSchema.parse(await duplicateResponse.json())

    const cleanupResult = await cleanupVerificationRegistration(context, email)
    ensure(cleanupResult.deletedCount === 1, `Expected cleanup to delete 1 registration, deleted ${cleanupResult.deletedCount}`)

    return `created verification registration for ${platform}/${region}, duplicate request rejected, cleanup removed 1 record`
  })
}

async function verifyAdminLoginShell(context: VerificationContext) {
  await runCheck(context, {
    id: 'flow-admin-shell-isolation',
    label: 'Flow: admin login shell isolation',
    target: '/admin/login',
  }, async () => {
    const html = await fetchHtml(context, '/admin/login')
    ensure(html.includes('Login - EST CMS'), 'Admin login page is missing the CMS login title')
    ensure(!html.includes('site-nav__brand'), 'Admin login page should not render the public navigation shell')
    ensure(!html.includes('site-footer__'), 'Admin login page should not render the public footer shell')
    ensure(!html.includes('cookie-banner'), 'Admin login page should not render the public cookie banner shell')

    return 'admin login page is isolated from the public site shell'
  })
}

async function verifyInternalContentHealth(context: VerificationContext) {
  const input = {
    id: 'api-internal-content-health',
    label: 'Internal API: content health',
    target: '/api/internal/content-health',
  }

  if (!context.payloadSecret) {
    addCheck(context, input, 'skipped', 'PAYLOAD_SECRET unavailable, skipping internal verification')
    return
  }

  await runCheck(context, input, async () => {
    const data = await fetchJson(
      context,
      '/api/internal/content-health',
      contentHealthSchema,
      {
        headers: {
          Authorization: `Bearer ${context.payloadSecret}`,
        },
      },
    )

    ensure(data.summary.newsWithErrors === 0, `Expected 0 news errors, found ${data.summary.newsWithErrors}`)
    ensure(data.summary.newsWithWarnings === 0, `Expected 0 news warnings, found ${data.summary.newsWithWarnings}`)
    ensure(data.summary.globalsWithErrors === 0, `Expected 0 global errors, found ${data.summary.globalsWithErrors}`)
    ensure(data.summary.globalsWithWarnings === 0, `Expected 0 global warnings, found ${data.summary.globalsWithWarnings}`)

    return `publishedNews=${data.summary.publishedNews}, all content-health counters are clean`
  })
}

function buildSummary(baseUrl: string, checks: VerificationCheck[]): StackVerificationSummary {
  const totals = checks.reduce((summary, check) => {
    if (check.status === 'passed') summary.passed += 1
    if (check.status === 'failed') summary.failed += 1
    if (check.status === 'skipped') summary.skipped += 1
    return summary
  }, {
    passed: 0,
    failed: 0,
    skipped: 0,
  })

  return {
    baseUrl,
    generatedAt: new Date().toISOString(),
    ok: totals.failed === 0,
    checks,
    totals,
  }
}

export async function runStackVerification(options: RunOptions = {}): Promise<StackVerificationSummary> {
  const context: VerificationContext = {
    baseUrl: normalizeBaseUrl(options.baseUrl || DEFAULT_BASE_URL),
    fetchImpl: options.fetchImpl || fetch,
    payloadSecret: options.payloadSecret || null,
    checks: [],
  }

  await verifyHealthEndpoint(context)
  const settings = await verifySettingsEndpoint(context)
  await verifyWeaponsEndpoints(context)
  await verifyGalleryEndpoint(context)

  const newsSlug = await verifyNewsEndpoints(context)

  if (settings) {
    await verifyHomepageRegistrationLink(context, settings.site.registrationUrl)
    await verifyRegistrationSurface(context, settings.site.registrationUrl)
  }

  await verifyRegisterValidation(context)
  await verifyRegisterMutationFlow(context, options)
  await verifyAdminLoginShell(context)
  await verifyProtectedContentHealthEndpoint(context)
  await verifyInternalContentHealth(context)

  for (const page of PAGE_PATHS) {
    await verifyHtmlPage(context, page.id, page.label, page.path)
  }

  if (newsSlug) {
    await verifyHtmlPage(
      context,
      'page-news-detail',
      'Public page: news detail',
      `/news/${newsSlug}`,
    )
  }

  return buildSummary(context.baseUrl, context.checks)
}
