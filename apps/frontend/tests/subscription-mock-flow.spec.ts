import { expect, test } from '@playwright/test'
import { E2E_MOCK_USER, fulfillJson, seedAuthSession, subscriptionPayload } from './e2eApiMock'

test.describe('subscription mock checkout (QA-01)', () => {
  test('pending_payment → mock settle → active; status badge visible', async ({ page }) => {
    const state = { afterCallback: false }

    await seedAuthSession(page)

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
        const status = state.afterCallback ? 'active' : 'pending_payment'
        await fulfillJson(route, { subscription: subscriptionPayload({ subscription_status: status }) })
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
      if (method === 'POST' && url.includes('/BillingSubscriptionService/checkout')) {
        await fulfillJson(route, {
          checkout: {
            payment_url: '/subscription?provider=mock&order_id=e2e-order-1',
            order_id: 'e2e-order-1',
          },
        })
        return
      }
      if (method === 'POST' && url.includes('/BillingPaymentService/mock/callback')) {
        state.afterCallback = true
        await fulfillJson(route, {})
        return
      }

      await fulfillJson(route, {})
    })

    await page.goto('/subscription', { waitUntil: 'load' })
    await expect(page.getByRole('heading', { name: 'Langganan' })).toBeVisible()
    await expect(page.getByText(/pending payment/i)).toBeVisible()

    await page.getByRole('button', { name: /Lanjutkan pembayaran/i }).click()
    await page.waitForURL(/\/subscription\?provider=mock&order_id=e2e-order-1/)

    await expect(page.getByRole('region', { name: /Pembayaran simulasi/i })).toBeVisible()
    await page.getByRole('button', { name: /Simulasi pembayaran/i }).click()

    await expect(page.getByText(/^active$/i)).toBeVisible({ timeout: 15_000 })
  })

  test('double-click mock settle issues a single callback', async ({ page }) => {
    const state = { afterCallback: false }
    let callbackCount = 0

    await seedAuthSession(page)

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
        const status = state.afterCallback ? 'active' : 'pending_payment'
        await fulfillJson(route, { subscription: subscriptionPayload({ subscription_status: status }) })
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
      if (method === 'POST' && url.includes('/BillingSubscriptionService/checkout')) {
        await fulfillJson(route, {
          checkout: {
            payment_url: '/subscription?provider=mock&order_id=e2e-order-dbl',
            order_id: 'e2e-order-dbl',
          },
        })
        return
      }
      if (method === 'POST' && url.includes('/BillingPaymentService/mock/callback')) {
        callbackCount += 1
        await new Promise((r) => setTimeout(r, 400))
        state.afterCallback = true
        await fulfillJson(route, {})
        return
      }

      await fulfillJson(route, {})
    })

    await page.goto('/subscription', { waitUntil: 'load' })
    await page.getByRole('button', { name: /Lanjutkan pembayaran/i }).click()
    await page.waitForURL(/\/subscription\?provider=mock&order_id=e2e-order-dbl/)

    const btn = page.getByRole('button', { name: /Simulasi pembayaran/i })
    await btn.click({ clickCount: 2, delay: 50 })

    await expect.poll(() => callbackCount, { timeout: 10_000 }).toBe(1)
  })
})
