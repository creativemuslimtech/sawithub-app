import { useState, type FormEvent } from 'react'
import type { AxiosError } from 'axios'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/client'
import PublicPageLayout from '../components/PublicPageLayout'
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

const trustItems = [
  ['Fokus petani mandiri', 'SawitHub tidak dibuat sebagai sistem korporat yang rumit. Fokus kami adalah catatan kebun yang mudah dipakai dari HP.'],
  ['Data milik pengguna', 'Data panen, biaya, jadwal, dan laporan tetap menjadi milik pengguna. Kami tidak menjual data kebun Anda.'],
  ['Trial jelas', 'Coba gratis 14 hari tanpa kartu kredit. Lanjut berlangganan sekitar Rp 30.000/bulan jika cocok.'],
  ['Dibuat untuk Indonesia', 'Bahasa, istilah, dan alur dibuat dekat dengan kebiasaan petani sawit di Sumatra, Kalimantan, dan daerah sawit lainnya.'],
]

const comparison = [
  ['Sistem enterprise', 'Banyak fitur besar, sering cocok untuk perusahaan atau estate besar.'],
  ['SawitHub', 'Catatan kebun digital yang sederhana, ringan, dan praktis untuk petani mandiri.'],
]

const teamPrinciples = [
  ['Mulai dari kebun nyata', 'Kami mendengar kebutuhan petani sawit mandiri, pemilik kebun keluarga, dan pengelola beberapa lahan sebelum menambah fitur.'],
  ['Fokus Sumatra/Kalimantan', 'Konteks awal kami adalah wilayah sawit Indonesia yang banyak memakai HP untuk komunikasi, catatan, dan koordinasi kerja.'],
  ['Tidak membuat bukti palsu', 'Kutipan bernama, foto petani, dan cerita pengguna hanya akan dipublikasikan setelah ada izin yang jelas.'],
]

const inputClass = 'mt-2 w-full rounded-md-1 border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-4 focus:border-emerald'

export default function About() {
  const [form, setForm] = useState<ContactForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const missingName = !form.name.trim()
  const missingEmail = !form.email.trim()
  const missingMessage = !form.message.trim()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSubmitted(true)

    if (missingName || missingEmail || missingMessage) {
      toast.error('Isi nama, email, dan pesan Anda dulu.')
      return
    }

    setSubmitting(true)

    try {
      await api.post('/Contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })

      trackEvent(GAEvents.CONTACT_SUBMIT, {
        form_name: 'contact_form',
        page: 'about',
        has_subject: !!form.subject.trim(),
      })

      toast.success('Pesan berhasil dikirim. Tim SawitHub akan membalas dalam 1–2 hari kerja.')
      setForm(initialForm)
      setSubmitted(false)
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>
      const message = error.response?.data?.error || 'Pesan belum berhasil dikirim. Coba lagi sebentar lagi.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicPageLayout
      eyebrow="Tentang SawitHub"
      title="Catatan kebun sawit rapi dari HP."
      description="SawitHub adalah buku catatan kebun sawit digital yang membantu petani mandiri mencatat panen, biaya, jadwal, dan untung bersih dari HP."
      maxWidth="max-w-7xl"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald">Kenapa SawitHub dibuat</p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            Banyak kebun kecil punya masalah besar: catatan tercecer dan untung bersih tidak jelas.
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-ink-3">
            Di lapangan, data panen bisa ada di buku, biaya pupuk ada di chat, dan jadwal kerja hanya diingat kepala. SawitHub menyatukan tanggal panen, berat TBS, biaya, dan laporan bulanan supaya pemilik kebun melihat angka yang sama dari HP.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {trustItems.map(([title, desc]) => (
              <article key={title} className="rounded-xl border border-line bg-paper-2 p-4">
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-ink-3">{desc}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-emerald-soft bg-emerald-tint p-4">
            <p className="text-sm font-semibold text-emerald">Posisi SawitHub</p>
            <p className="mt-2 text-[15px] leading-7 text-ink-3">
              SawitHub bukan sistem estate yang rumit. SawitHub adalah buku catatan kebun sawit digital yang membantu petani mandiri mencatat panen, biaya, jadwal, dan untung bersih dari HP.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {comparison.map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-line bg-paper-2 p-4">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-2 text-[15px] leading-7 text-ink-3">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="kontak" className="rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald">Hubungi Kami</p>
            <h2 className="mt-4 text-2xl font-semibold text-ink sm:text-3xl">Kirim pesan ke tim SawitHub</h2>
            <p className="mt-3 text-[15px] leading-7 text-ink-3">
              Tulis kebutuhan, pertanyaan, atau masukan Anda. Kami membalas dalam 1–2 hari kerja melalui email yang Anda tulis.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Nama</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  placeholder="Nama Anda"
                  className={`${inputClass} h-12`}
                  aria-invalid={submitted && missingName}
                  aria-describedby={submitted && missingName ? 'about-name-error' : undefined}
                />
                {submitted && missingName ? <span id="about-name-error" role="alert" className="mt-1 block text-xs text-terra-2">Nama wajib diisi.</span> : null}
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                  placeholder="nama@email.com"
                  className={`${inputClass} h-12`}
                  aria-invalid={submitted && missingEmail}
                  aria-describedby={submitted && missingEmail ? 'about-email-error' : undefined}
                />
                {submitted && missingEmail ? <span id="about-email-error" role="alert" className="mt-1 block text-xs text-terra-2">Email wajib diisi.</span> : null}
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Judul pesan</span>
              <input
                type="text"
                value={form.subject}
                onChange={event => setForm(current => ({ ...current, subject: event.target.value }))}
                placeholder="Contoh: Ingin tanya trial 14 hari"
                className={`${inputClass} h-12`}
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">Pesan</span>
              <textarea
                value={form.message}
                onChange={event => setForm(current => ({ ...current, message: event.target.value }))}
                placeholder="Tulis kebutuhan atau pertanyaan Anda di sini."
                rows={7}
                className={inputClass}
                aria-invalid={submitted && missingMessage}
                aria-describedby={submitted && missingMessage ? 'about-message-error' : undefined}
              />
              {submitted && missingMessage ? <span id="about-message-error" role="alert" className="mt-1 block text-xs text-terra-2">Pesan wajib diisi.</span> : null}
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[15px] leading-7 text-ink-3">Kami tidak menjual data kebun Anda. Estimasi respons: 1–2 hari kerja.</p>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-12 rounded-full bg-ink px-6 text-sm font-semibold text-paper transition hover:bg-emerald-2 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {submitting ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="mt-8 rounded-xl-1 border border-line bg-surface p-6 shadow-card-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald">Siapa di balik SawitHub · Statement founder/tim</p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Kami ingin catatan kebun mandiri naik kelas tanpa membuat petani harus belajar sistem yang rumit.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-ink-3">
              Tim SawitHub membangun produk ini untuk membantu pemilik kebun melihat panen, biaya, jadwal, dan hasil bersih dari satu tempat. Fokus kami bukan membuat software paling ramai fitur, tetapi membuat catatan kebun yang cukup jelas untuk dipakai mengambil keputusan.
            </p>
            <p className="mt-3 text-[15px] leading-7 text-ink-3">
              Cerita awal kami datang dari konteks Sumatra dan Kalimantan: banyak pemilik kebun sudah nyaman memakai HP untuk komunikasi, tetapi catatan panen, pupuk, dan biaya masih tersebar di buku atau chat. Karena itu SawitHub dibuat sebagai alat praktis yang dekat dengan cara kerja lapangan.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {teamPrinciples.map(([title, desc]) => (
              <article key={title} className="rounded-xl border border-line bg-paper-2 p-4">
                <h3 className="text-base font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-ink-3">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-xl-1 border border-emerald-soft bg-emerald-tint p-6 text-center sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Ingin mencoba dari satu kebun dulu?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-ink-3">Mulai gratis 14 hari tanpa kartu kredit. Catat panen dan biaya pertama Anda dari HP.</p>
        <Link to="/signup" className="mt-5 inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-sm font-semibold text-paper transition hover:bg-emerald-2">
          Coba Gratis 14 Hari
        </Link>
      </section>
    </PublicPageLayout>
  )
}
