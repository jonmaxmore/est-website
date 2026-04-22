import { buildPagePath } from '../../../../app/shared/cms/pages'

export default defineEventHandler(async () => {
  const pages = await prisma.pageContent.findMany({
    orderBy: [{ isSystemPage: 'desc' }, { headerOrder: 'asc' }, { updatedAt: 'desc' }],
  })

  return pages.map((page) => ({
    ...page,
    route: buildPagePath(page),
  }))
})
