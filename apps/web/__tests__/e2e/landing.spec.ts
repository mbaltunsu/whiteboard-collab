import { test, expect } from '@playwright/test'

test.describe('Landing page (/)', () => {
  test('page title contains "Infinite Curator" or "Whiteboard"', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    const hasExpectedTitle =
      title.toLowerCase().includes('infinite curator') ||
      title.toLowerCase().includes('whiteboard')
    expect(hasExpectedTitle).toBe(true)
  })

  test('hero section has a CTA button', async ({ page }) => {
    await page.goto('/')
    // Matches "Get Started" or "Start for free" variants used on the landing page
    const ctaButton = page.getByRole('link', {
      name: /get started|start for free/i,
    })
    await expect(ctaButton).toBeVisible()
  })

  test('nav has a Sign in link', async ({ page }) => {
    await page.goto('/')
    const signInLink = page.getByRole('link', { name: /sign in/i }).first()
    await expect(signInLink).toBeVisible()
  })

  test('page is responsive at 375px viewport width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    // Ensure the page renders without a horizontal scrollbar and the body is visible
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375 + 20) // allow minor subpixel rounding
    // Core heading should still be visible
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
  })
})
