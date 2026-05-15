import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const publicPages = [
  { path: '/', label: 'landing' },
  { path: '/signup', label: 'signup' },
  { path: '/login', label: 'login' },
  { path: '/tentang-kami', label: 'tentang-kami' },
  { path: '/bantuan', label: 'bantuan' },
  { path: '/privasi', label: 'privasi' },
  { path: '/syarat', label: 'syarat' },
  { path: '/pengaturan-cookie', label: 'pengaturan-cookie' },
]

test.describe('public accessibility smoke', () => {
  for (const pageInfo of publicPages) {
    test(`${pageInfo.label} has no critical axe violations`, async ({ page }) => {
      await page.goto(pageInfo.path, { waitUntil: 'networkidle' })

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('body')
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  }

  test('mobile signup and login controls keep comfortable touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    for (const path of ['/signup', '/login']) {
      await page.goto(path, { waitUntil: 'networkidle' })
      const controls = page.locator('input, button')
      const count = await controls.count()

      for (let index = 0; index < count; index += 1) {
        const control = controls.nth(index)
        const box = await control.boundingBox()
        if (!box) continue
        expect.soft(box.height, `${path} control ${index} height`).toBeGreaterThanOrEqual(44)
      }
    }
  })
})
