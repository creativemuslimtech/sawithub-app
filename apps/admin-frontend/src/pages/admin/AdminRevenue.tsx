// TODO[backend-pending]: GET /admin/RevenueService/mrr — MRR, ARR, subscriber count, churn
// TODO[backend-pending]: GET /admin/RevenueService/movements — New MRR, expansion, contraction, churned
// TODO[backend-pending]: GET /admin/RevenueService/plans — Plan-level breakdown
// TODO[backend-pending]: GET /admin/RevenueService/transactions — Recent subscription transactions
import AdminLayout from '../../components/AdminLayout'
import { DownloadIcon } from '../../components/ds/icons'

const DUMMY_MRR_SPARK = [88, 96, 102, 108, 114, 118, 122, 128, 132, 138, 142]
const DUMMY_MOVEMENT = [
  { label: 'New MRR', value: 'Rp 18,2 jt', sub: '+41 pelanggan baru', color: 'var(--forest)', delta: '+14%' },
  { label: 'Expansion MRR', value: 'Rp 4,6 jt', sub: 'upgrade plan', color: 'var(--c-sky)', delta: '+22%' },
  { label: 'Contraction MRR', value: '−Rp 1,8 jt', sub: 'downgrade plan', color: 'var(--amber-2)', delta: '−8%' },
  { label: 'Churned MRR', value: '−Rp 5,3 jt', sub: 'batalkan langganan', color: 'var(--terracotta-2)', delta: '−19%' },
]
const DUMMY_PLANS = [
  { name: 'Starter', price: 'Rp 39k/bln', users: 1102, mrr: 'Rp 43,0 jt', pct: 30, color: 'var(--forest-3)' },
  { name: 'Pro', price: 'Rp 79k/bln', users: 789, mrr: 'Rp 62,3 jt', pct: 44, color: 'var(--forest)' },
  { name: 'Koperasi', price: 'Rp 249k/bln', users: 293, mrr: 'Rp 72,9 jt', pct: 51, color: 'var(--amber-2)' },
]
const DUMMY_TX = [
  { id: 'INV-20260519-0041', user: 'Pak Yusran · 6281x', plan: 'Pro', amount: 'Rp 79.000', status: 'paid', date: '19 Mei 2026' },
  { id: 'INV-20260519-0040', user: 'Koperasi Sejahtera', plan: 'Koperasi', amount: 'Rp 249.000', status: 'paid', date: '19 Mei 2026' },
  { id: 'INV-20260518-0039', user: 'Ahmad Ridwan', plan: 'Starter', amount: 'Rp 39.000', status: 'paid', date: '18 Mei 2026' },
  { id: 'INV-20260518-0038', user: 'Budi Santoso', plan: 'Pro', amount: 'Rp 79.000', status: 'failed', date: '18 Mei 2026' },
  { id: 'INV-20260517-0037', user: 'KUD Maju Jaya', plan: 'Koperasi', amount: 'Rp 249.000', status: 'refunded', date: '17 Mei 2026' },
]

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  paid: { background: 'var(--forest-soft)', color: 'var(--forest)', border: '1px solid var(--forest-soft)' },
  failed: { background: 'var(--terra-soft)', color: 'var(--terracotta-2)', border: '1px solid var(--terra-soft)' },
  refunded: { background: 'var(--amber-tint)', color: 'var(--amber-2)', border: '1px solid var(--amber-tint)' },
}

export default function AdminRevenue() {
  return (
    <AdminLayout
      topbarRight={
        <div style={{ display: 'flex', gap: 8 }}>
          <select style={{ height: 36, padding: '0 28px 0 12px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--paper)', fontSize: 12.5, color: 'var(--ink)', cursor: 'pointer' }}>
            <option>Mei 2026</option>
            <option>Apr 2026</option>
            <option>Mar 2026</option>
          </select>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 36, borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--paper)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer' }}>
            <DownloadIcon size={14} /> Ekspor CSV
          </button>
        </div>
      }
    >
      {import.meta.env.DEV && <div style={{ background: 'var(--amber-tint)', border: '1px solid rgba(212,168,39,0.35)', borderRadius: 8, padding: '8px 14px', fontSize: 11.5, fontFamily: 'var(--f-mono)', color: 'var(--amber-2)', marginBottom: 16 }}>⚠ Data dummy · API belum tersedia · Lihat IMPLEMENTATION_REPORT.md</div>}

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Pendapatan langganan · Mei 2026</p>
          <h1 className="sh-h-2">
            MRR <em className="sh-italic" style={{ color: 'var(--forest)' }}>Rp&thinsp;142,4&thinsp;jt</em>, naik{' '}
            <em className="sh-italic" style={{ color: 'var(--amber-2)' }}>+12%</em> dari April.
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 8, fontFamily: 'var(--f-mono)' }}>
            2.184 pelanggan berbayar · ARR Rp 1,71 M · Churn 90d 2,4% · LTV/CAC 4,8×
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['7 hari', '30 hari', 'MTD', 'QTD', 'YTD'].map((p, i) => (
            <button key={p} style={{
              padding: '8px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
              background: i === 1 ? 'var(--ink)' : 'var(--paper)',
              color: i === 1 ? 'var(--paper)' : 'var(--ink-3)',
              border: i === 1 ? 'none' : '1px solid var(--line-2)',
              cursor: 'pointer', fontFamily: 'var(--f-mono)',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Hero KPI band */}
      <div className="sh-card" style={{ padding: 0, marginBottom: 22, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr 1fr' }}>
        {/* MRR hero cell */}
        <div style={{ padding: 28, background: 'var(--forest)', color: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 10.5, color: 'var(--amber-3)', letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, fontFamily: 'var(--f-mono)' }}>—— MRR · Monthly Recurring</div>
            <div className="sh-num" style={{ fontSize: 48, fontWeight: 400, color: 'var(--paper)', marginTop: 14, lineHeight: 1, letterSpacing: '-0.025em' }}>
              Rp 142,4<span style={{ fontSize: 18, color: 'rgba(251,248,241,0.5)' }}>&thinsp;jt</span>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="sh-chip" style={{ background: 'rgba(212,168,39,0.18)', color: 'var(--amber-3)', borderColor: 'rgba(212,168,39,0.3)' }}>↑ 12,4%</span>
              <span style={{ fontSize: 11.5, color: 'rgba(251,248,241,0.65)' }}>vs. April · Rp 126,7 jt</span>
            </div>
            {/* Sparkline */}
            <div style={{ marginTop: 18, height: 42, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
              {DUMMY_MRR_SPARK.map((v, i) => (
                <div key={i} style={{ flex: 1, background: 'var(--amber)', opacity: 0.4 + (i / DUMMY_MRR_SPARK.length) * 0.6, borderRadius: 2, height: `${(v / 142) * 100}%`, minHeight: 4 }} />
              ))}
            </div>
          </div>
        </div>
        {/* Stat cells */}
        {[
          { l: 'ARR Projection', v: 'Rp 1,71 M', sub: '12 × MRR saat ini', delta: '↑ 24%' },
          { l: 'Pelanggan Berbayar', v: '2.184', sub: '+34 minggu ini', delta: '↑ 1,6%' },
          { l: 'ARPU', v: 'Rp 65.2k', sub: 'rata-rata per user', delta: '↑ 2,1%' },
          { l: 'Net Churn 90d', v: '2,4%', sub: 'Rp 4,2 jt hilang', delta: '↓ 0,3 pt' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 24, borderLeft: '1px solid var(--line-2)' }}>
            <p className="sh-eyebrow" style={{ marginBottom: 10 }}>{s.l}</p>
            <div className="sh-num" style={{ fontSize: 26, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 6 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 10 }}>{s.sub}</div>
            <span className="sh-chip" style={{ background: 'var(--forest-soft)', color: 'var(--forest)', borderColor: 'transparent' }}>{s.delta}</span>
          </div>
        ))}
      </div>

      {/* MRR Movement */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        {DUMMY_MOVEMENT.map((m) => (
          <div key={m.label} className="sh-card" style={{ padding: 20, borderTop: `3px solid ${m.color}` }}>
            <p className="sh-eyebrow" style={{ marginBottom: 8 }}>{m.label}</p>
            <div className="sh-num" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{m.value}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>{m.sub}</div>
            <span className="sh-chip" style={{ marginTop: 10, display: 'inline-flex', background: 'var(--paper)', borderColor: 'var(--line-2)', color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>{m.delta}</span>
          </div>
        ))}
      </div>

      {/* Plan breakdown + Recent transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 22 }}>
        {/* Plans */}
        <div className="sh-card" style={{ padding: 24 }}>
          <p className="sh-eyebrow" style={{ marginBottom: 8 }}>Per paket</p>
          <h3 className="sh-h-4" style={{ marginBottom: 20 }}>Breakdown Plan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {DUMMY_PLANS.map((plan) => (
              <div key={plan.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{plan.name}</span>
                    <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>{plan.price}</span>
                  </div>
                  <span className="sh-num" style={{ fontWeight: 600, color: plan.color }}>{plan.mrr}</span>
                </div>
                <div style={{ height: 6, background: 'var(--paper-2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${plan.pct}%`, background: plan.color, borderRadius: 99, transition: 'width 0.6s' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>{plan.users.toLocaleString('id-ID')} pengguna · {plan.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="sh-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="sh-h-4">Transaksi Terbaru</h3>
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{DUMMY_TX.length} terbaru</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--paper)', fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {['Invoice', 'Pengguna', 'Plan', 'Jumlah', 'Status', 'Tanggal'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DUMMY_TX.map((tx) => (
                <tr key={tx.id} style={{ borderTop: '1px solid var(--line-2)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{tx.id}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--ink)' }}>{tx.user}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--ink-3)' }}>{tx.plan}</td>
                  <td style={{ padding: '12px 8px', fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{tx.amount}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, ...STATUS_STYLE[tx.status] }}>{tx.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
