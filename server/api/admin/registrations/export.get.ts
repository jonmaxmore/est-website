/** Export all pre-registrations as CSV */
export default defineEventHandler(async (event) => {
  const rows = await prisma.preRegistration.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const headers = ['email', 'platform', 'region', 'referralCode', 'referredBy', 'utmSource', 'utmMedium', 'utmCampaign', 'createdAt']
  const csvRows = [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => {
        const val = r[h as keyof typeof r]
        if (val === null || val === undefined) return ''
        const str = val instanceof Date ? val.toISOString() : String(val)
        return str.includes(',') ? `"${str}"` : str
      }).join(','),
    ),
  ]

  const csv = csvRows.join('\n')

  setResponseHeaders(event, {
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename="registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
  })

  return csv
})
