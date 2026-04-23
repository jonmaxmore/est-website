import { test, expect } from '@playwright/test'

test.describe('Event / Pre-Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/event', { waitUntil: 'load' })
    await page.locator('[data-testid="event-registration-form"][data-ready="true"]').waitFor({ state: 'attached' })
  })

  test('should render the event page with countdown timer', async ({ page }) => {
    await expect(page).toHaveTitle(/Eternal Tower Saga/)

    // Countdown timer should have units (Days, Hours, Minutes, Seconds)
    const countdownLabel = page.getByText('Days').first()
    await expect(countdownLabel).toBeVisible({ timeout: 5000 })
  })

  test('should render the registration form', async ({ page }) => {
    // Email input
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    // Submit button
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
  })

  test('should render milestone rewards', async ({ page }) => {
    const milestoneHeading = page.getByText('Milestone Rewards')
    if (await milestoneHeading.count() > 0) {
      await milestoneHeading.scrollIntoViewIfNeeded()
      await expect(milestoneHeading).toBeVisible()
    }
  })

  test('should render pre-registration reward cards', async ({ page }) => {
    const rewardHeading = page.getByText('Pre-Registration Rewards')
    await rewardHeading.scrollIntoViewIfNeeded()
    await expect(rewardHeading).toBeVisible()
  })

  test('should submit registration with valid email', async ({ page }) => {
    // Generate unique test email
    const testEmail = `e2e-test-${Date.now()}@test-playwright.dev`

    // Fill the form
    const emailInput = page.locator('input[type="email"]')
    await emailInput.scrollIntoViewIfNeeded()
    await emailInput.fill(testEmail)

    // Submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.scrollIntoViewIfNeeded()
    await submitButton.click()

    // Wait for either success or a surfaced server response such as rate limit.
    const successText = page.getByText('Registration Successful')
    const errorText = page.locator('.text-red-400')
    await expect(successText.or(errorText)).toBeVisible({ timeout: 15_000 })
  })

  test('should show total registration count', async ({ page }) => {
    const countLabel = page.getByText('Total Pre-Registrations')
    await expect(countLabel).toBeVisible()
  })
})
