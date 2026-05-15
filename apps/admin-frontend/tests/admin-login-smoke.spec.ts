import { expect, test } from '@playwright/test'

test.describe('admin app public smoke (QA-07)', () => {
  test('login page renders stable heading and admin hint', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: 'Selamat Datang' })).toBeVisible()
    await expect(page.getByText('Admin Panel')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
  })
})
