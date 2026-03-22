/**
 * Dashboard E2E tests
 *
 * NOTE: Full dashboard testing requires OAuth credentials (Google / GitHub).
 * These tests are intentionally scoped to what is verifiable without authentication.
 * To run authenticated tests, configure environment variables:
 *   - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 *   - GITHUB_ID / GITHUB_SECRET
 *   - NEXTAUTH_SECRET
 * and implement a fixtures/auth.ts helper that seeds a session cookie via the
 * NextAuth callback endpoint before navigating to /dashboard.
 */

import { test, expect } from '@playwright/test'

test.describe('Dashboard (unauthenticated)', () => {
  test('signin page renders the sign-in form', async ({ page }) => {
    // Visiting /signin is a prerequisite for dashboard access
    await page.goto('/signin')

    // Heading is present
    const heading = page.getByRole('heading')
    await expect(heading).toBeVisible()

    // At least one provider button is present
    const buttons = page.getByRole('button')
    await expect(buttons.first()).toBeVisible()
  })

  test('navigating to /dashboard while unauthenticated shows the signin page', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/signin/, { timeout: 10000 })

    // Confirm it is the sign-in page, not an error page
    const googleBtn = page.getByRole('button', { name: /google/i })
    await expect(googleBtn).toBeVisible()
  })
})
