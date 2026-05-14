import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import * as XLSX from 'xlsx'
import { LAPORAN_XLSX_HEADERS_FIXTURE_RECORD } from '../src/pages/LaporanKeuangan/laporanXlsxSheetHeaders'
import { E2E_MOCK_USER, fulfillJson, seedAuthSession, subscriptionPayload } from './e2eApiMock'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const MOCK_LAPORAN = {
  summary: {
    total_ton: 1.2,
    total_pendapatan: 500_000,
    total_biaya_panen: 50_000,
    total_biaya_perawatan: 25_000,
    hasil_bersih: 425_000,
    avg_harga_per_kg: 2500,
    jumlah_panen: 1,
    rata_produktivitas: 2.1,
    revenue_source: 'panen',
  },
  chart: [
    {
      label: 'Jan',
      total_ton: 1.2,
      pendapatan: 500_000,
      biaya_panen: 50_000,
      biaya_perawatan: 25_000,
      hasil_bersih: 425_000,
      harga_avg: 2500,
      per_lahan: {},
    },
  ],
  ranking: [
    {
      id_lahan: 'l1',
      nama_kebun: 'Kebun A',
      total_ton: 1.2,
      luas_ha: 5,
      produktivitas: 2,
      total_pendapatan: 500_000,
      hasil_bersih: 425_000,
      jumlah_panen: 1,
    },
  ],
  detail: [
    {
      id_panen: 'p1',
      tanggal_panen: '2024-01-15',
      nama_kebun: 'Kebun A',
      luas_panen_ha: 5,
      jumlah_janjang: 100,
      berat_kg: 1200,
      berat_ton: 1.2,
      berat_rata_janjang: 12,
      harga_per_kg: 2500,
      total_pendapatan: 500_000,
      biaya_panen: 50_000,
      hasil_bersih: 425_000,
      produktivitas: 2,
      catatan: '',
    },
  ],
}

test.describe('laporan XLSX header parity (QA-02)', () => {
  test('fixture JSON matches exported header record', () => {
    const raw = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'fixtures/laporan-xlsx-expected-headers.json'), 'utf8'),
    ) as typeof LAPORAN_XLSX_HEADERS_FIXTURE_RECORD
    expect(raw).toEqual(LAPORAN_XLSX_HEADERS_FIXTURE_RECORD)
  })

  test('downloaded workbook first rows match builder headers', async ({ page }) => {
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
      if (method === 'GET' && url.includes('/ReportingFarmFinanceService')) {
        await fulfillJson(route, MOCK_LAPORAN)
        return
      }
      if (method === 'GET' && url.includes('/ReportingReconciliationService')) {
        await fulfillJson(route, { panen_total: 500_000, pendapatan_manual_total: 0, flag_conflict: false })
        return
      }
      if (method === 'POST' && url.includes('/ReportingExportService/email-export')) {
        await fulfillJson(route, { message: 'ok', email: E2E_MOCK_USER.email })
        return
      }

      await fulfillJson(route, {})
    })

    await page.goto('/laporan-keuangan', { waitUntil: 'load' })
    await expect(page.getByRole('heading', { name: 'Laporan Keuangan' })).toBeVisible({ timeout: 15_000 })

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /^Excel$/ }).first().click()
    const download = await downloadPromise
    const filePath = await download.path()
    if (!filePath) throw new Error('missing download path')
    const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' })

    const tren = workbook.Sheets['Tren Finansial']
    const trenRows = XLSX.utils.sheet_to_json<(string | number)[]>(tren, { header: 1 }) as (string | number)[][]
    expect(trenRows[0].map(String)).toEqual(LAPORAN_XLSX_HEADERS_FIXTURE_RECORD.dataSheetHeaders['Tren Finansial'])

    const urutan = workbook.Sheets['Urutan Kebun']
    const urutanRows = XLSX.utils.sheet_to_json<(string | number)[]>(urutan, { header: 1 }) as (string | number)[][]
    expect(urutanRows[0].map(String)).toEqual(LAPORAN_XLSX_HEADERS_FIXTURE_RECORD.dataSheetHeaders['Urutan Kebun'])

    const daftar = workbook.Sheets['Daftar Panen']
    const daftarRows = XLSX.utils.sheet_to_json<(string | number)[]>(daftar, { header: 1 }) as (string | number)[][]
    expect(daftarRows[0].map(String)).toEqual(LAPORAN_XLSX_HEADERS_FIXTURE_RECORD.dataSheetHeaders['Daftar Panen'])

    const ringkas = workbook.Sheets['Ringkasan']
    const ringkasRows = XLSX.utils.sheet_to_json<(string | number)[]>(ringkas, { header: 1 }) as (string | number)[][]
    const headerRow = ringkasRows.find((row) => row[0] === 'Ringkasan Uang')
    expect(headerRow?.map(String)).toEqual(LAPORAN_XLSX_HEADERS_FIXTURE_RECORD.ringkasanTableHeader)
  })
})
