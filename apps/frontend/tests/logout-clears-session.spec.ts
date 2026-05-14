import { expect, test } from '@playwright/test'
import { E2E_MOCK_USER, fulfillJson, subscriptionPayload } from './e2eApiMock'

test.describe('logout clears stored session (QA-06)', () => {
  test('Keluar removes sawit_token and sawit_user', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      const req = route.request()
      const url = req.url()
      const method = req.method()

      if (method === 'GET' && url.includes('/IdentityAuthService/me')) {
        await fulfillJson(route, { user: E2E_MOCK_USER })
        return
      }
      if (method === 'GET' && url.includes('/IdentityAuthService/ping')) {
        await fulfillJson(route, { ok: true })
        return
      }
      if (method === 'POST' && url.includes('/PlatformTrafficService')) {
        await fulfillJson(route, {})
        return
      }
      if (method === 'GET' && url.includes('/BillingSubscriptionService/status')) {
        await fulfillJson(route, { subscription: subscriptionPayload({ subscription_status: 'active' }) })
        return
      }
      if (method === 'PUT' && url.includes('/BillingSubscriptionService/active-farm')) {
        await fulfillJson(route, {})
        return
      }
      if (method === 'GET' && url.includes('/CorePlotService')) {
        await fulfillJson(route, [])
        return
      }
      if (method === 'GET' && url.includes('/NotificationCenterService')) {
        await fulfillJson(route, { items: [] })
        return
      }

      await fulfillJson(route, {})
    })

    await page.goto('/login', { waitUntil: 'load' })
    await page.evaluate(() => {
      localStorage.setItem('sawit_token', 'e2e-test-token')
      localStorage.setItem('sawithub_onboarding_done', '1')
    })
    await page.goto('/profile', { waitUntil: 'load' })
    await expect(page.getByLabel('Menu akun')).toBeVisible({ timeout: 15_000 })

    await page.getByLabel('Menu akun').click()
    await page.getByRole('menuitem', { name: 'Keluar', exact: true }).click()

    await page.waitForURL('http://127.0.0.1:4173/')
    const token = await page.evaluate(() => localStorage.getItem('sawit_token'))
    const storedUser = await page.evaluate(() => localStorage.getItem('sawit_user'))
    expect(token).toBeNull()
    expect(storedUser).toBeNull()
  })
})
