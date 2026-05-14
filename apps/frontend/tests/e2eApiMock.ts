import type { Page, Route } from '@playwright/test'

export const E2E_MOCK_USER = {
  user_id: 'u-e2e',
  public_id: 'pub-e2e',
  username: 'e2e_user',
  email: 'e2e@sawithub.test',
  full_name: 'E2E User',
  role: 'user',
  preferences: { onboarding_done: true },
}

export async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

/** Minimal subscription payload for FarmProvider + subscription page */
export function subscriptionPayload(overrides: Record<string, unknown> = {}) {
  return {
    subscription_status: 'trialing',
    active_farm_limit: 1,
    current_active_farm_id: '',
    plan_name: 'Pro',
    plan_price: 30_000,
    can_checkout: true,
    ...overrides,
  }
}

export async function seedAuthSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('sawit_token', 'e2e-test-token')
    localStorage.setItem('sawithub_onboarding_done', '1')
  })
}
