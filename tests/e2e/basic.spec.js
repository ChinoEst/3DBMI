import { test, expect } from '@playwright/test'

test('page loads and canvas exists', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/BIM Viewer/)
  const canvas = await page.waitForSelector('canvas', { timeout: 10000 })
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  expect(box.width).toBeGreaterThan(0)
})
