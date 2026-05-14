import { useState } from 'react'
import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/kalkulator-pupuk', label: 'Kalkulator Pupuk' },
  { to: '/jadwal-perawatan', label: 'Jadwal Perawatan' },
  { to: '/keuangan', label: 'Hub Keuangan' },
  { to: '/pendapatan', label: 'Pendapatan' },
  { to: '/harga-tbs', label: 'Harga TBS' },
  { to: '/subscription', label: 'Langganan' },
]

/** Floating entry (“Lainnya”) for finance destinations on small screens (UX-02). */
export default function MobileMoreNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="md:hidden fixed right-3 z-[38] flex h-11 w-11 items-center justify-center rounded-2xl border border-white/14 bg-[rgba(8,6,18,0.94)] text-lg font-bold text-white shadow-xl backdrop-blur-xl"
        style={{ bottom: 'calc(4.35rem + env(safe-area-inset-bottom))' }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Menu lainnya — keuangan"
        onClick={() => setOpen(true)}
      >
        ···
      </button>

      {open ? (
        <div
          className="md:hidden fixed inset-0 z-[70] flex items-end justify-center bg-black/70 px-3 pb-6 pt-10"
          role="dialog"
          aria-modal="true"
          aria-label="Menu keuangan lainnya"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/12 shadow-2xl"
            style={{
              background: 'linear-gradient(165deg, rgba(14,18,24,0.98), rgba(8,6,20,0.98))',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <p className="text-sm font-semibold text-white">Keuangan & langganan</p>
              <button type="button" className="rounded-lg px-2 py-1 text-xs text-white/55 hover:bg-white/[0.06]" onClick={() => setOpen(false)}>
                Tutup
              </button>
            </div>
            <nav className="flex flex-col py-2">
              {LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-5 py-3.5 text-sm font-medium text-white/88 hover:bg-white/[0.06]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  )
}
