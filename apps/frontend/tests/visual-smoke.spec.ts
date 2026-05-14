import { expect, test } from '@playwright/test'

const publicPages = [
  { path: '/', label: 'landing', heading: /Catat panen, biaya, dan untung kebun sawit/i },
  { path: '/signup', label: 'signup', heading: /Buat Akun Baru/i },
  { path: '/login', label: 'login', heading: /Selamat Datang/i },
  { path: '/tentang-kami', label: 'tentang-kami', heading: /Catatan kebun sawit rapi dari HP/i },
  { path: '/bantuan', label: 'bantuan', heading: /Jawaban cepat untuk mulai memakai SawitHub/i },
  { path: '/privasi', label: 'privasi', heading: /Data kebun Anda tetap milik Anda/i },
  { path: '/syarat', label: 'syarat', heading: /Aturan penggunaan SawitHub/i },
  { path: '/pengaturan-cookie', label: 'pengaturan-cookie', heading: /Kelola pilihan cookie SawitHub/i },
]

test.describe('public visual smoke', () => {
  for (const pageInfo of publicPages) {
    test(`${pageInfo.label} renders stable header and primary content`, async ({ page }, testInfo) => {
      await page.addStyleTag({
        content: `
          *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; scroll-behavior: auto !important; }
          [data-testid="dynamic-time"] { visibility: hidden !important; }
        `,
      })

      await page.goto(pageInfo.path, { waitUntil: 'networkidle' })
      await expect(page.getByAltText('Logo SawitHub').first()).toBeVisible()
      await expect(page.getByRole('heading', { name: pageInfo.heading }).first()).toBeVisible()

      if (!['/signup', '/login'].includes(pageInfo.path)) {
        const footer = page.locator('footer').last()
        await expect(footer).toContainText('© 2026 SawitHub / Untuk petani sawit mandiri Indonesia')
        await expect(footer.getByText('Butuh bantuan cepat?')).toHaveCount(0)
        await expect(footer.getByText('Catatan kebun sawit rapi dari HP')).toHaveCount(0)
        await expect(footer.getByText('Hubungi SawitHub')).toHaveCount(0)
        const footerLabels = (await footer.locator('nav a').allTextContents()).map(label => label.trim())
        expect(footerLabels).toEqual(['Tentang Kami', 'Privasi', 'Syarat', 'Bantuan', 'Pengaturan Cookie'])
      }

      if (pageInfo.path === '/') {
        await expect(page.getByRole('main').getByRole('button', { name: /Coba gratis \d+ hari/i }).first()).toBeVisible()
        await expect(page.getByRole('main').getByRole('button', { name: /Daftar sekarang/i })).toBeVisible()
        await expect(page.locator('header').first()).toBeVisible()
        await page.screenshot({
          path: `test-results/visual-smoke/${testInfo.project.name}-landing-hero-navbar.png`,
          fullPage: false,
        })
      }

      await page.screenshot({
        path: `test-results/visual-smoke/${testInfo.project.name}-${pageInfo.label}.png`,
        fullPage: pageInfo.path !== '/',
      })
    })
  }
})
