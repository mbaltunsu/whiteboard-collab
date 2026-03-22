import { test, expect } from '@playwright/test'

test.describe('Sign-in page (/signin)', () => {
  test('page loads without error', async ({ page }) => {
    const response = await page.goto('/signin')
    expect(response?.status()).toBeLessThan(400)
  })

  test('Google sign-in button is visible', async ({ page }) => {
    await page.goto('/signin')
    const googleBtn = page.getByRole('button', { name: /google/i })
    await expect(googleBtn).toBeVisible()
  })

  test('GitHub sign-in button is visible', async ({ page }) => {
    await page.goto('/signin')
    const githubBtn = page.getByRole('button', { name: /github/i })
    await expect(githubBtn).toBeVisible()
  })
})

test.describe('Authentication redirect', () => {
  test('unauthenticated visit to /dashboard redirects to /signin', async ({ page }) => {
    await page.goto('/dashboard')
    // Allow for middleware redirect — final URL should contain /signin
    await page.waitForURL(/signin/, { timeout: 10000 })
    expect(page.url()).toContain('/signin')
  })
})
