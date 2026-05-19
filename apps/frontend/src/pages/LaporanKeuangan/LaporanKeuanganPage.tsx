import { saveAs } from 'file-saver'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api/client'
import AppLayout from '../../components/AppLayout'
import AppTopbar from '../../components/AppTopbar'
import { DownloadIcon, MailIcon } from '../../components/ds/icons'
import PalmFrond from '../../components/ds/botanical/PalmFrond'
import SubscriptionGateSheet from '../../components/SubscriptionGateSheet'
import { useAuth } from '../../context/useAuth'
import { useLaporanData } from '../../hooks/useLaporanData'

import { trackEvent, GAEvents } from '../../utils/analytics'
import { getSubscriptionGateMessage, isSubscriptionRequiredError } from '../../utils/apiError'
import { buildReportFileName, getErrorMessage, MONTHS, YEARS } from '../../utils/reportFormat'
import { buildExcelBlob, buildPdfBlob, emailExportCopy } from './exportReport'
import { ExportActionButtons, ExportStatusPanel } from './ExportToolbar'
import { HarvestDetailTable } from './HarvestDetailTable'
import { LaporanCharts } from './LaporanCharts'
import {
  EmptyState,
  FinanceMetricGrid,
  RankingSection,
  RevenueDisclosureFootnote,
  RevenueReconciliationPanel,
} from './SummaryCards'
import type { ChartMode, ExportFormat, Period } from './types'

export default function LaporanKeuanganPage() {
  const { user } = useAuth()

  const [chartMode, setChartMode] = useState<ChartMode>('cashflow')
  const [exporting, setExporting] = useState<ExportFormat | null>(null)
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [subscriptionGate, setSubscriptionGate] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  })
  const [trialExportBanner, setTrialExportBanner] = useState(false)

  const {
    period,
    setPeriod,
    lahanId,
    setLahanId,
    selYear,
    setSelYear,
    selMonth,
    setSelMonth,
    selWeek,
    setSelWeek,
    data,
    loading,
    lahans,
    selectedLahanName,
    periodLabel,
    chartRows,
    financeSummary,
    financeInsights,
    metricCards,
    hasData,
    reconciliation,
  } = useLaporanData()

  const exportRecipient = user?.email?.trim() || 'email akun Anda'

  const handleExport = async (format: ExportFormat) => {
    if (!data || exporting) return

    const filename = buildReportFileName(
      format,
      user?.user_id || user?.public_id || user?.username || '',
      user?.username || 'user',
      selectedLahanName,
      periodLabel,
    )
    const blob =
      format === 'xlsx'
        ? buildExcelBlob({
            data,
            user,
            selectedLahanName,
            periodLabel,
            financeInsights,
            chartRows,
            financeSummary,
          })
        : await buildPdfBlob({
            data,
            user,
            selectedLahanName,
            periodLabel,
            financeInsights,
          })
    if (!blob) return

    trackEvent(format === 'xlsx' ? GAEvents.EXPORT_EXCEL : GAEvents.EXPORT_PDF, {
      report_type: 'laporan_keuangan',
      period: period,
      lahan: selectedLahanName,
      export_format: format,
    })
    trackEvent(GAEvents.FIRST_REPORT_READY, {
      funnel_step: 'first_report',
      report_type: 'laporan_keuangan',
      period,
      lahan: selectedLahanName,
      export_format: format,
    })

    setExporting(format)
    setExportStatus({ type: 'info', text: `Menyiapkan ${format.toUpperCase()} untuk diunduh dan dikirim ke ${exportRecipient}.` })
    saveAs(blob, filename)

    try {
      const emailResult = await emailExportCopy(api, {
        format,
        filename,
        blob,
        periodLabel,
        selectedLahanName,
        financeInsights,
        data,
      })
      const recipientEmail = emailResult.email?.trim() || exportRecipient

      trackEvent(GAEvents.SEND_EMAIL, {
        report_type: 'laporan_keuangan',
        export_format: format,
        delivery_method: 'email',
      })

      const successText = `${format.toUpperCase()} terunduh; salinan ke ${recipientEmail}.`
      setExportStatus({ type: 'success', text: successText })
      toast.success(successText)
    } catch (error) {
      if (isSubscriptionRequiredError(error)) {
        setTrialExportBanner(true)
        setSubscriptionGate({
          open: true,
          message: getSubscriptionGateMessage(error, 'Langganan atau trial Anda membatasi ekspor laporan.'),
        })
        setExportStatus({
          type: 'error',
          text: 'Ekspor laporan dibatasi oleh status langganan. Buka Kelola langganan untuk detail.',
        })
        toast.custom(
          (t) => (
            <div
              className="flex max-w-sm flex-col gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-2 shadow-card"
            >
              <span>Batas trial ekspor tercapai. Upgrade langganan untuk kirim salinan email tanpa batas.</span>
              <Link
                to="/subscription"
                style={{ fontWeight: 600, color: 'var(--forest)', textDecoration: 'underline' }}
                onClick={() => toast.dismiss(t.id)}
              >
                Buka Langganan →
              </Link>
            </div>
          ),
          { duration: 8000 },
        )
        setExporting(null)
        return
      }
      const detail = getErrorMessage(error, 'pengiriman email gagal').replace(/\.+$/, '')
      const errorText = `File ${format.toUpperCase()} sudah terunduh di browser ini, tetapi ${detail}.`
      setExportStatus({ type: 'error', text: errorText })
      toast.error(errorText)
    } finally {
      setExporting(null)
    }
  }

  const topbarActions = (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        className="sh-btn sh-btn-ghost sh-btn-sm"
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={() => data && void handleExport('pdf')}
        disabled={!data || !!exporting}
      >
        <MailIcon size={14} /> Kirim ke email
      </button>
      <button
        className="sh-btn sh-btn-primary sh-btn-sm"
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={() => data && void handleExport('xlsx')}
        disabled={!data || !!exporting}
      >
        <DownloadIcon size={14} /> Unduh PDF
      </button>
    </div>
  )

  return (
    <AppLayout>
      <AppTopbar title="Laporan Keuangan" headerActions={topbarActions} />
      <div style={{ padding: '32px 36px 48px' }}>
        <div className="space-y-6">
          {/* Editorial header */}
          <div style={{ position: 'relative', marginBottom: 28 }}>
            <PalmFrond size={240} style={{ position: 'absolute', right: 0, top: -40, color: 'var(--forest)', opacity: 0.07, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
              <div>
                <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Laporan keuangan kebun</div>
                <h1 className="sh-h-2">
                  {periodLabel} · <em className="sh-italic" style={{ color: 'var(--forest)' }}>
                    {(data?.summary.hasil_bersih ?? 0) > 0 ? 'untung' : 'rugi'}
                  </em>{' '}
                  {data ? `Rp ${((data.summary.hasil_bersih) / 1_000_000).toFixed(1)} jt` : '—'}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8 }}>
                  Pendapatan, biaya, dan laba bersih per kebun — siap diunduh sebagai PDF atau Excel untuk koperasi, bank, atau pajak.
                </p>
              </div>
            </div>
          </div>

          {trialExportBanner ? (
            <div style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--paper-2)', fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: 'var(--terracotta-2)' }}>Ekspor email trial habis.</span>{' '}
              Unduhan file tetap tersedia di browser; untuk mengirim salinan email tanpa batas,{' '}
              <Link to="/subscription" style={{ fontWeight: 600, color: 'var(--forest)', textDecoration: 'underline' }}>
                kelola langganan
              </Link>
              .
            </div>
          ) : null}

          <div className="rounded-xl-1 p-4 md:p-5 bg-surface border border-line shadow-card-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                <div className="flex overflow-hidden rounded-xl text-sm bg-paper-2 border border-line">
                  {(['week', 'month', 'year'] as Period[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPeriod(item)}
                      className="px-4 py-2 font-medium transition"
                      style={period === item
                        ? { background: 'var(--ink)', color: 'var(--paper)' }
                        : { color: 'var(--ink-3)' }}
                    >
                      {item === 'week' ? 'Minggu' : item === 'month' ? 'Bulan' : 'Tahun'}
                    </button>
                  ))}
                </div>

                <div className="h-6 w-px bg-line" />

                <select
                  value={selYear}
                  onChange={(event) => setSelYear(Number(event.target.value))}
                  className="rounded-xl border border-line bg-paper-2 px-4 py-2 text-sm font-medium text-ink outline-none"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                {period !== 'year' && (
                  <select
                    value={selMonth}
                    onChange={(event) => setSelMonth(Number(event.target.value))}
                    className="rounded-xl border border-line bg-paper-2 px-4 py-2 text-sm font-medium text-ink outline-none"
                  >
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                )}

                {period === 'week' && (
                  <select
                    value={selWeek}
                    onChange={(event) => setSelWeek(Number(event.target.value))}
                    className="rounded-xl border border-line bg-paper-2 px-4 py-2 text-sm font-medium text-ink outline-none"
                  >
                    {[0, 1, 2, 3, 4].map((week) => (
                      <option key={week} value={week}>Minggu {week + 1}</option>
                    ))}
                  </select>
                )}

                <select
                  value={lahanId}
                  onChange={(event) => setLahanId(event.target.value)}
                  className="rounded-xl border border-line bg-paper-2 px-4 py-2 text-sm font-medium text-ink outline-none"
                >
                  <option value="">Semua Kebun</option>
                  {lahans.map((item) => (
                    <option key={item.id_lahan} value={item.id_lahan}>
                      {item.nama_kebun}
                    </option>
                  ))}
                </select>
              </div>

              {data && (
                <ExportActionButtons
                  className="hidden shrink-0 items-center justify-end gap-2 sm:ml-auto md:flex"
                  exporting={exporting}
                  exportRecipient={exportRecipient}
                  onExcel={() => void handleExport('xlsx')}
                  onPdf={() => void handleExport('pdf')}
                />
              )}
            </div>
            {data && (
              <div className="mt-4 rounded-2xl border border-line bg-paper-2 p-4 text-sm leading-6 text-ink-3">
                <p className="font-semibold text-ink">QA unduhan mobile/PWA/browser</p>
                <p className="mt-1">
                  Setelah menekan Excel atau PDF, cek folder unduhan browser/HP. Di mode PWA, jika unduhan tidak terlihat, buka SawitHub dari browser lalu ulangi unduh.
                </p>
                <ExportStatusPanel exportStatus={exportStatus} />
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="skeleton h-44 rounded-xl-1" />
              ))}
            </div>
          ) : !hasData || !data ? (
            <EmptyState />
          ) : (
            <>
              {/* Dark gradient KPI banner */}
              <div
                className="rounded-lg-1 relative overflow-hidden"
                style={{ background: 'linear-gradient(120deg, var(--ink) 0%, #18302a 100%)', padding: 24, border: 'none' }}
              >
                <div className="grid gap-6 md:grid-cols-4">
                  <div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Periode laporan</p>
                    <p className="display" style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em', color: 'white' }}>{periodLabel}</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                      {data.summary.jumlah_panen || 0} panen · {selectedLahanName}
                    </p>
                  </div>
                  {([
                    { label: 'Pendapatan', value: metricCards[1]?.value ?? '—', color: 'var(--c1)' },
                    { label: 'Biaya', value: metricCards[2]?.value ?? '—', color: 'var(--c2)' },
                    { label: 'Laba bersih', value: metricCards[3]?.value ?? '—', color: 'var(--terra)', badge: `${financeSummary.marginPct.toFixed(1)}% margin` },
                  ] as { label: string; value: string; color: string; badge?: string }[]).map(({ label, value, color, badge }) => (
                    <div key={label}>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
                      <p className="num" style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: 'white', letterSpacing: '-0.02em' }}>{value}</p>
                      {badge && (
                        <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 8px', background: color, color: 'white', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                          {badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <FinanceMetricGrid cards={metricCards} />

              <div className="space-y-3">
                <RevenueDisclosureFootnote />
                <RevenueReconciliationPanel reconciliation={reconciliation} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
                <LaporanCharts
                  chartRows={chartRows}
                  chartMode={chartMode}
                  setChartMode={setChartMode}
                  selectedLahanName={selectedLahanName}
                  periodLabel={periodLabel}
                  financeSummary={financeSummary}
                  summary={data.summary}
                />
                <RankingSection ranking={data.ranking} />
              </div>

              <HarvestDetailTable detail={data.detail} summary={data.summary} />
            </>
          )}
        </div>
      </div>

      {data && (
        <div
          className="md:hidden pointer-events-none fixed inset-x-0 z-[25] flex justify-center gap-2 border-t border-line bg-surface px-3 py-3 pointer-events-auto"
          style={{ bottom: 'calc(3.65rem + env(safe-area-inset-bottom))' }}
        >
          <ExportActionButtons
            className="flex justify-center gap-2"
            exporting={exporting}
            exportRecipient={exportRecipient}
            onExcel={() => void handleExport('xlsx')}
            onPdf={() => void handleExport('pdf')}
          />
        </div>
      )}

      <SubscriptionGateSheet
        open={subscriptionGate.open}
        onClose={() => setSubscriptionGate((s) => ({ ...s, open: false }))}
        message={subscriptionGate.message}
        surface="export_laporan"
      />
    </AppLayout>
  )
}
