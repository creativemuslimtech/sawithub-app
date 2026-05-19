import PublicPageLayout from '../components/PublicPageLayout'
import { COOKIE_SETTINGS_EVENT } from '../constants/cookieConsent'
import { MarketingCard, PrimaryButton } from '../components/design-system'

const cookieItems = [
  ['Cookie penting', 'Dipakai agar halaman, keamanan dasar, dan pilihan cookie dapat berjalan. Cookie ini selalu aktif.'],
  ['Cookie analitik', 'Membantu SawitHub memahami halaman dan tombol yang berguna. Cookie ini hanya aktif jika Anda menyetujuinya.'],
  ['Pilihan bisa diubah', 'Anda dapat membuka ulang panel persetujuan kapan saja dari halaman Pengaturan Cookie ini.'],
]

export default function CookieSettings() {
  const openCookieSettings = () => {
    window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))
  }

  return (
    <PublicPageLayout
      eyebrow="Pengaturan Cookie"
      title="Kelola pilihan cookie SawitHub."
      description="Atur ulang persetujuan cookie analitik kapan saja. Cookie penting tetap dipakai agar situs berjalan aman dan stabil."
    >
      <div className="space-y-6 text-[15px] leading-7 text-ink-3 sm:text-base">
        <MarketingCard as="section" className="border-forest-soft bg-forest-tint">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-forest">Preferensi cookie</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight text-ink">Buka panel persetujuan cookie</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-ink-3">
                Gunakan tombol ini untuk menolak atau menyetujui cookie analitik. Pilihan Anda akan disimpan di browser yang sedang dipakai.
              </p>
            </div>
            <PrimaryButton type="button" onClick={openCookieSettings} className="min-h-12 shrink-0 px-5 py-3">
              Buka Pengaturan Cookie
            </PrimaryButton>
          </div>
        </MarketingCard>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Jenis cookie SawitHub">
          {cookieItems.map(([title, description]) => (
            <article key={title} className="rounded-xl-1 border border-line bg-surface p-5 shadow-card-sm">
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
              <p className="mt-2 text-base leading-7 text-ink-3">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </PublicPageLayout>
  )
}
