import { expect, test } from '@playwright/test'

test('integration webhook rejects unsigned content mutation requests', async ({ request, baseURL }) => {
  const response = await request.post(`${baseURL}/api/integration/webhook`, {
    data: {
      type: 'news',
      action: 'create',
      data: { slug: 'unsigned-news', title: 'Unsigned' },
    },
  })

  expect(response.status()).toBe(401)
})
