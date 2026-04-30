import { expect, test } from '@playwright/test'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import pg from 'pg'

import { resolvePgConnectionString } from '../../server/utils/database-url'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'change-me'
const DATABASE_URL = resolvePgConnectionString(process.env.DATABASE_URL)
const TEST_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Zk1gAAAAASUVORK5CYII='

async function deleteUploadedMediaByOriginalName(fileName: string) {
  if (!DATABASE_URL) {
    return
  }

  const pool = new pg.Pool({ connectionString: DATABASE_URL })

  try {
    const result = await pool.query<{ filename: string }>('SELECT "filename" FROM media_assets WHERE "originalName" = $1', [fileName])
    const filenames = result.rows.map((row) => row.filename)
    await pool.query('DELETE FROM media_assets WHERE "originalName" = $1', [fileName])

    for (const filename of filenames) {
      try {
        await unlink(join(process.cwd(), 'public', 'uploads', filename))
      } catch {
        // Ignore missing local files during cleanup.
      }
    }
  } finally {
    await pool.end()
  }
}

test.describe('admin media flows', () => {
  test('uploads an image and persists alt text edits', async ({ page }) => {
    test.slow()
    test.skip(ADMIN_PASSWORD === 'change-me', 'Set TEST_ADMIN_PASSWORD in .env.test to run this test')

    const fileName = `test-image-${Date.now()}.png`
    const altText = `Test image alt ${Date.now()}`

    try {
      await page.goto('/admin/login')
      const loginStatus = await page.evaluate(
        async ({ email, password }) => {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          return response.status
        },
        { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      )
      expect(loginStatus).toBe(200)

      await page.goto('/admin/media')
      await expect(page.getByRole('heading', { name: 'Media Library' })).toBeVisible()

      const uploadStatus = await page.evaluate(
        async ({ name, base64 }) => {
          const binary = atob(base64)
          const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
          const file = new File([bytes], name, { type: 'image/png' })
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/admin/media/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          })

          return response.status
        },
        { name: fileName, base64: TEST_IMAGE_BASE64 },
      )
      expect(uploadStatus).toBe(200)

      await page.reload({ waitUntil: 'domcontentloaded' })
      const assetName = page.getByText(fileName)
      await expect(assetName).toBeVisible({ timeout: 30000 })
      await assetName.click()
      const altTextInput = page.getByPlaceholder('Describe this image...')
      await expect(altTextInput).toBeVisible()
      await altTextInput.fill(altText)
      await page.getByRole('button', { name: /^save$/i }).click()
      await expect(page.getByText('Alt text saved')).toBeVisible()

      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.getByText(fileName).click()
      await expect(page.getByPlaceholder('Describe this image...')).toHaveValue(altText)
    } finally {
      await deleteUploadedMediaByOriginalName(fileName)
    }
  })
})
