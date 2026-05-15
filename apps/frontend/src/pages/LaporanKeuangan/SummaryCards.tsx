import { AppMetricIcon } from '../../components/design-system'
import {
  deltaTone,
  fmtDelta,
  fmtNum,
  fmtRp,
  fmtRpFull,
  fmtTon,
  safeDivide,
} from '../../utils/reportFormat'
import type { FarmRanking, FinanceMetricCardProps, RevenueReconciliation } from './types'
import type { FinanceSummary } from '../../hooks/useLaporanData'
import { REVENUE_DISCLOSURE_FOOTNOTE_ID } from './revenueDisclosure'

export function SnapshotPill({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div className="rounded-xl-1 p-4 bg-surface border border-line shadow-card-sm">
      <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: accent }}>{label}</p>
      <p className="text-[15px] font-semibold text-ink leading-tight break-words sm:text-base">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink-4">{hint}</p>
    </div>
  )
}

export function FinanceMetricCard({
  label,
  shortLabel,
  value,
  sub,
  accent,
  iconKind,
  delta,
  insight,
}: FinanceMetricCardProps) {
  const tone = deltaTone(delta)

  return (
    <div className="relative overflow-hidden rounded-xl-1 bg-surface border border-line shadow-card p-4 md:p-5 transition">
      <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl-1" style={{ background: accent }} />
      <div className="pt-1">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)` }}
            >
              <AppMetricIcon kind={iconKind} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
                <span className="md:hidden">{shortLabel}</span>
                <span className="hidden md:inline">{label}</span>
              </p>
              <p className="mt-1 text-lg font-semibold leading-tight text-ink break-words md:text-xl xl:text-[1.45rem] 2xl:text-[1.6rem]">{value}</p>
            </div>
          </div>
          <span
            className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
            style={{ color: tone.color, background: tone.bg, borderColor: tone.border }}
          >
            {fmtDelta(delta)}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-ink-3 md:text-sm">{sub}</p>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-4">{insight}</p>
      </div>
    </div>
  )
}

export function RankingCard({ farm, rank }: { farm: FarmRanking; rank: number }) {
  const accent = rank === 1 ? 'var(--emerald)' : rank === 2 ? '#0284c7' : rank === 3 ? '#d97706' : '#7c3aed'
  const margin = safeDivide(farm.hasil_bersih, farm.total_pendapatan) * 100

  return (
    <div className="rounded-xl-1 bg-surface border border-line shadow-card-sm p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}
            >
              {rank}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{farm.nama_kebun}</p>
              <p className="mt-1 text-xs text-ink-4">{fmtNum(farm.luas_ha)} ha · {farm.jumlah_panen} kali panen</p>
            </div>
          </div>
        </div>
        <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold border border-line bg-paper-2 text-ink-3">
          {fmtNum(margin, 1)}% untung
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SnapshotPill label="Produksi" value={fmtTon(farm.total_ton)} hint={`${fmtNum(farm.produktivitas)} t/ha`} accent="var(--emerald)" />
        <SnapshotPill
          label="Pendapatan"
          value={fmtRpFull(farm.total_pendapatan)}
          hint={`${fmtRpFull(safeDivide(farm.total_pendapatan, farm.jumlah_panen || 1))} per panen`}
          accent="var(--terra)"
        />
        <SnapshotPill
          label="Bersih"
          value={fmtRpFull(farm.hasil_bersih)}
          hint={`${fmtRpFull(safeDivide(farm.hasil_bersih, farm.luas_ha || 1))}/ha`}
          accent={farm.hasil_bersih >= 0 ? 'var(--emerald)' : 'var(--terra)'}
        />
        <SnapshotPill
          label="Fokus"
          value={farm.produktivitas >= 1 ? 'Cukup bagus' : 'Perlu naik'}
          hint={farm.produktivitas >= 1 ? 'Hasil kebun cukup baik.' : 'Cek panen dan biaya lagi.'}
          accent="#0284c7"
        />
      </div>
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="rounded-xl-1 py-20 text-center bg-surface border border-line">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-tint text-emerald" aria-hidden="true">
        <AppMetricIcon kind="report" />
      </div>
      <p className="mb-1 font-medium text-ink-3">Belum ada data laporan pada periode ini</p>
      <p className="text-sm text-ink-4">Coba ganti periode, pilih kebun lain, atau lengkapi data panen terlebih dahulu.</p>
    </div>
  )
}

export function ReportHeroSection({ financeSummary }: { financeSummary: FinanceSummary }) {
  return (
    <section className="relative overflow-hidden rounded-xl-1 bg-surface border border-line shadow-card p-6 md:p-8">
      <div className="relative">
        <div>
          <span className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] border border-emerald-soft bg-emerald-tint text-emerald">
            Ringkasan Uang Kebun
          </span>
          <h2 className="mb-3 text-2xl font-semibold leading-tight text-ink md:text-4xl">Laporan uang kebun yang mudah dibaca.</h2>
          <p className="max-w-3xl text-sm leading-7 text-ink-3 md:text-base">
            Di sini Anda bisa melihat uang masuk, uang keluar, untung, dan kebun mana yang hasilnya paling baik atau perlu dicek lagi.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SnapshotPill
              label="Untung Bersih"
              value={`${financeSummary.marginPct.toFixed(1)}%`}
              hint={financeSummary.marginPct >= 40 ? 'Untung masih bagus dibanding uang masuk.' : 'Biaya perlu dijaga supaya untung tidak turun.'}
              accent={financeSummary.marginPct >= 40 ? 'var(--emerald)' : 'var(--terra)'}
            />
            <SnapshotPill
              label="Biaya per Ton"
              value={fmtRpFull(financeSummary.biayaPerTon)}
              hint="Mudah melihat biaya untuk tiap ton hasil."
              accent="var(--terra)"
            />
            <SnapshotPill
              label="Harga Tertinggi"
              value={fmtRp(financeSummary.highestPricePoint?.harga_avg ?? 0)}
              hint={financeSummary.highestPricePoint ? `Terjadi pada ${financeSummary.highestPricePoint.label}` : 'Belum ada titik harga kuat.'}
              accent="#d97706"
            />
            <SnapshotPill
              label="Rata-rata Bersih"
              value={fmtRpFull(financeSummary.avgNetPerPanen)}
              hint="Rata-rata hasil bersih per catatan panen."
              accent="#0284c7"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export function FinanceMetricGrid({ cards }: { cards: FinanceMetricCardProps[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <FinanceMetricCard key={card.label} {...card} />
      ))}
    </div>
  )
}

export function RevenueDisclosureFootnote() {
  return (
    <p className="text-xs leading-relaxed text-ink-4 max-w-3xl">
      {REVENUE_DISCLOSURE_FOOTNOTE_ID}
    </p>
  )
}

export function RevenueReconciliationPanel({ reconciliation }: { reconciliation: RevenueReconciliation | null }) {
  if (!reconciliation) return null
  const { panen_total, pendapatan_manual_total, flag_conflict } = reconciliation
  if (panen_total <= 0 && pendapatan_manual_total <= 0) return null

  return (
    <section
      className={`rounded-xl-1 p-5 md:p-6 ${flag_conflict ? 'border border-line bg-paper-2' : 'border border-line bg-surface'}`}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-4">Rekonsiliasi pendapatan</p>
          <h2 className="text-lg font-semibold text-ink">Panen vs pendapatan manual</h2>
          <p className="mt-1 text-sm text-ink-3">
            Total dipisahkan agar terlihat apakah kedua sumber aktif di periode yang sama (bukan double counting di ringkasan).
          </p>
        </div>
        {flag_conflict && (
          <span className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold border border-line bg-paper-2 text-terra">
            Kedua sumber &gt; 0
          </span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SnapshotPill
          label="Total dari panen"
          value={fmtRpFull(panen_total)}
          hint="SUM total_pendapatan di catatan panen"
          accent="var(--emerald)"
        />
        <SnapshotPill
          label="Total pendapatan manual"
          value={fmtRpFull(pendapatan_manual_total)}
          hint="SUM pendapatan_kotor di modul pendapatan"
          accent="#0284c7"
        />
      </div>
    </section>
  )
}

export function RankingSection({ ranking }: { ranking: FarmRanking[] }) {
  return (
    <section className="rounded-xl-1 bg-surface border border-line shadow-card p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-4">Urutan Kebun</p>
          <h2 className="text-xl font-semibold text-ink">Perbandingan kebun</h2>
          <p className="mt-1 text-sm text-ink-3">Lihat kebun mana yang hasilnya paling baik dari sisi produksi dan hasil bersih.</p>
        </div>
        <div className="rounded-full px-3 py-1 text-xs font-medium w-max border border-emerald-soft bg-emerald-tint text-emerald">
          {ranking.length} kebun sedang dihitung
        </div>
      </div>

      <div className="space-y-4">
        {ranking.slice(0, 3).map((farm, index) => (
          <RankingCard key={farm.id_lahan} farm={farm} rank={index + 1} />
        ))}
      </div>
    </section>
  )
}
