import { useState, type FormEvent } from 'react'
import type { AxiosError } from 'axios'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/client'
import PublicHeader from '../components/PublicHeader'
import { trackEvent, GAEvents } from '../utils/analytics'

type ContactForm = {
  name: string
  email: string
  subject: string
  message: string
}

const initialForm: ContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

export default function About() {
  const [form, setForm] = useState<ContactForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Isi nama, email, dan pesan Anda dulu.')
      return
    }

    setSubmitting(true)

    try {
      await api.post('/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })

      // Track contact form submission
      trackEvent(GAEvents.CONTACT_SUBMIT, {
        form_name: 'contact_form',
        page: 'about',
        has_subject: !!form.subject.trim(),
      })

      toast.success('Pesan berhasil dikirim. Tim kami akan membaca dan membalas lewat email Anda.')
      setForm(initialForm)
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>
      const message = error.response?.data?.error || 'Pesan belum berhasil dikirim. Coba lagi sebentar lagi.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-[#06100c] text-white"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <PublicHeader
        bordered
        rightSlot={(
          <Link
            to="/signup"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-[#04210f] transition hover:bg-emerald-400"
          >
            Coba Gratis
          </Link>
        )}
      />

      <main className="px-4 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(7,20,14,0.96),rgba(11,25,18,0.92))] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">Tentang Kami</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">
              SawitHub dibuat supaya catatan kebun terasa lebih ringan dipakai setiap hari.
            </h1>
            <p className="mt-5 text-base leading-7 text-white/70">
              Kami fokus membantu petani sawit mandiri mencatat panen, biaya, jadwal kerja, dan laporan tanpa bahasa yang rumit.
              Tujuannya sederhana: pemilik kebun bisa lebih cepat tahu kondisi kebun dan uang yang berjalan, sehingga mengelolah kebun dengan data bukan dengan asumsi.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ['Bahasa sederhana', 'Menu dan istilah dibuat supaya mudah dipahami di lapangan maupun di rumah.'],
                ['Satu tempat', 'Data lahan, panen, perawatan, jadwal, dan laporan ada di satu aplikasi.'],
                ['Siap dipakai di HP', 'Tampilan dirapikan supaya nyaman dipakai lewat browser maupun PWA di Android.'],
                ['Harga ringan', 'Rencana harga bulanan sekitar Rp 30.000 setelah masa gratis 3 bulan.'],
              ].map(item => (
                <div key={item[0]} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <h2 className="text-base font-semibold text-white">{item[0]}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/60">{item[1]}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-emerald-300/20 bg-emerald-400/8 p-4">
              <p className="text-sm font-semibold text-emerald-200">Ingin bicara dengan kami?</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Isi form di samping. Pesan Anda akan masuk ke email tim SawitHub supaya kami bisa menindaklanjuti lebih cepat.
              </p>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/80">Hubungi Kami</p>
              <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Kirim pesan lewat email</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Tulis kebutuhan Anda, pertanyaan, atau masukan untuk SawitHub. Kami akan membaca pesan ini dari email tim.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/55">Nama</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                    placeholder="Nama Anda"
                    className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/50"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/55">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                    placeholder="nama@email.com"
                    className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/50"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/55">Judul pesan</span>
                <input
                  type="text"
                  value={form.subject}
                  onChange={event => setForm(current => ({ ...current, subject: event.target.value }))}
                  placeholder="Contoh: Ingin tanya paket SawitHub"
                  className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/50"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/55">Pesan</span>
                <textarea
                  value={form.message}
                  onChange={event => setForm(current => ({ ...current, message: event.target.value }))}
                  placeholder="Tulis kebutuhan atau pertanyaan Anda di sini."
                  rows={7}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/50"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-white/50">
                  Setelah dikirim, pesan masuk ke email tim SawitHub.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-[#04210f] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/40 sm:px-8">
        © {new Date().getFullYear()} SawitHub / Untuk petani sawit mandiri Indonesia
      </footer>
    </div>
  )
}
