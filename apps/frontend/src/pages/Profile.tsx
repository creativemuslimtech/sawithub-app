import { useCallback, useEffect, useState } from 'react'
import type { User } from '../context/auth'
import { useAuth } from '../context/useAuth'
import ConfirmDialog from '../components/ConfirmDialog'
import AppLayout from '../components/AppLayout'
import AppTopbar from '../components/AppTopbar'
import api from '../api/client'
import { getAdminAppUrl } from '../constants/adminApp'
import { getApiErrorMessage } from '../utils/apiError'

const INPUT =
  'w-full px-4 py-3 rounded-xl text-ink text-sm outline-none transition bg-paper-2 border border-line focus:border-forest placeholder-ink-4'

type FormState = 'view' | 'full_name' | 'email' | 'phone' | 'username' | 'password'

type AccountInfo = {
  user_id: string
  public_id: string
  full_name: string
  email: string
  username: string
  phone: string
  role: string
  created_at: string
  updated_at: string
}

const EMPTY_INFO: AccountInfo = {
  user_id: '',
  public_id: '',
  full_name: '',
  email: '',
  username: '',
  phone: '',
  role: '',
  created_at: '',
  updated_at: '',
}

function toAccountInfo(user: User | null): AccountInfo {
  return {
    user_id: user?.user_id || '',
    public_id: user?.public_id || '',
    full_name: user?.full_name || '',
    email: user?.email || '',
    username: user?.username || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
    created_at: user?.created_at || '',
    updated_at: user?.updated_at || '',
  }
}

function fmtDateTime(value: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
}

function fmtShortDate(value: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

function roleLabel(role: string) {
  return role === 'admin' ? 'Admin' : 'Pengguna'
}

function initialsOf(fullName: string, username: string, email: string) {
  const source = fullName || username || email || '?'
  const parts = source.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function completionOf(info: AccountInfo) {
  const fields = [info.full_name, info.email, info.username, info.phone]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}

function loginMethodsOf(info: AccountInfo) {
  const methods = ['Email', 'Username']
  if (info.phone) methods.push('Nomor telepon')
  return methods
}

export default function Profile() {
  const { user, refreshUser, logoutAll } = useAuth()
  const [loading, setLoading] = useState(false)
  const [logoutAllBusy, setLogoutAllBusy] = useState(false)
  const [logoutAllConfirmOpen, setLogoutAllConfirmOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<AccountInfo>(EMPTY_INFO)
  const [formState, setFormState] = useState<FormState>('view')
  const [fullNameForm, setFullNameForm] = useState('')
  const [emailForm, setEmailForm] = useState('')
  const [phoneForm, setPhoneForm] = useState('')
  const [usernameForm, setUsernameForm] = useState('')
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const applyUserInfo = useCallback((nextUser: User | null) => {
    const nextInfo = toAccountInfo(nextUser)
    setUserInfo(nextInfo)
    setFullNameForm(nextInfo.full_name)
    setEmailForm(nextInfo.email)
    setPhoneForm(nextInfo.phone)
    setUsernameForm(nextInfo.username)
  }, [])

  const fetchUserInfo = useCallback(async () => {
    const nextUser = await refreshUser()
    if (nextUser) {
      applyUserInfo(nextUser)
    } else if (user) {
      applyUserInfo(user)
    }
  }, [applyUserInfo, refreshUser, user])

  useEffect(() => {
    if (user) applyUserInfo(user)
  }, [applyUserInfo, user])

  useEffect(() => {
    void fetchUserInfo()
  }, [fetchUserInfo])

  const showResult = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleUpdateFullName = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = fullNameForm.trim()
    if (trimmed === userInfo.full_name.trim()) {
      showResult('error', 'Nama lengkap belum berubah')
      return
    }
    if (trimmed && trimmed.length < 3) {
      showResult('error', 'Nama lengkap minimal 3 karakter')
      return
    }

    setLoading(true)
    try {
      await api.put('/IdentityProfileService/update-full-name', { new_full_name: trimmed })
      await fetchUserInfo()
      setFormState('view')
      showResult('success', 'Nama lengkap berhasil diubah')
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err, 'Gagal mengubah nama lengkap')
      showResult('error', errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = emailForm.trim().toLowerCase()
    if (!trimmed || trimmed === userInfo.email) {
      showResult('error', 'Email harus berbeda dari yang saat ini')
      return
    }

    setLoading(true)
    try {
      await api.put('/IdentityProfileService/update-email', { new_email: trimmed })
      await fetchUserInfo()
      setFormState('view')
      showResult('success', 'Email berhasil diubah')
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err, 'Gagal mengubah email')
      showResult('error', errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = phoneForm.trim()
    if (trimmed === userInfo.phone) {
      showResult('error', 'Nomor telepon belum berubah')
      return
    }
    if (trimmed && !/^[0-9+\-\s]{8,15}$/.test(trimmed)) {
      showResult('error', 'Format nomor telepon tidak valid')
      return
    }

    setLoading(true)
    try {
      await api.put('/IdentityProfileService/update-phone', { new_phone: trimmed })
      await fetchUserInfo()
      setFormState('view')
      showResult('success', 'Nomor telepon berhasil diubah')
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err, 'Gagal mengubah nomor telepon')
      showResult('error', errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = usernameForm.trim().toLowerCase()
    if (!trimmed || trimmed === userInfo.username) {
      showResult('error', 'Username harus berbeda dari yang saat ini')
      return
    }
    if (trimmed.length < 3) {
      showResult('error', 'Username minimal 3 karakter')
      return
    }

    setLoading(true)
    try {
      await api.put('/IdentityProfileService/update-username', { new_username: trimmed })
      await fetchUserInfo()
      setFormState('view')
      showResult('success', 'Username berhasil diubah')
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err, 'Gagal mengubah username')
      showResult('error', errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordForm.current || !passwordForm.new) {
      showResult('error', 'Semua field harus diisi')
      return
    }
    if (passwordForm.new.length < 8) {
      showResult('error', 'Password minimal 8 karakter')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      showResult('error', 'Password baru tidak cocok')
      return
    }

    setLoading(true)
    try {
      await api.put('/IdentityAuthService/update-password', {
        current_password: passwordForm.current,
        new_password: passwordForm.new,
      })
      setPasswordForm({ current: '', new: '', confirm: '' })
      setFormState('view')
      showResult('success', 'Password berhasil diubah')
    } catch (err: unknown) {
      const errMsg = getApiErrorMessage(err, 'Gagal mengubah password')
      showResult('error', errMsg)
    } finally {
      setLoading(false)
    }
  }

  const completion = completionOf(userInfo)
  const displayName = userInfo.full_name || userInfo.username || userInfo.email || 'Akun SawitHub'
  const loginMethods = loginMethodsOf(userInfo)
  const adminPanelUrl = getAdminAppUrl()

  const infoRows = [
    {
      key: 'full_name',
      label: 'Nama lengkap',
      value: userInfo.full_name || 'Belum ditambahkan',
      hint: 'Nama yang tampil di dashboard dan identitas akun.',
      actionLabel: userInfo.full_name ? 'Ubah' : 'Tambah',
    },
    {
      key: 'email',
      label: 'Email',
      value: userInfo.email || '-',
      hint: 'Dipakai untuk reset password dan komunikasi akun.',
      actionLabel: 'Ubah',
    },
    {
      key: 'username',
      label: 'Username',
      value: userInfo.username || '-',
      hint: 'Bisa dipakai untuk login ke aplikasi.',
      actionLabel: 'Ubah',
    },
    {
      key: 'phone',
      label: 'Nomor telepon',
      value: userInfo.phone || 'Belum ditambahkan',
      hint: userInfo.phone
        ? 'Bisa digunakan sebagai alternatif login akun.'
        : 'Tambahkan nomor telepon agar ada opsi masuk tambahan saat dibutuhkan.',
      actionLabel: userInfo.phone ? 'Ubah' : 'Tambah',
    },
  ] as const

  const NAV_ITEMS = [
    { label: 'Profil saya', key: 'profil', icon: '👤' },
    { label: 'Kebun & blok', key: 'kebun', icon: '🌴' },
    { label: 'Anggota tim', key: 'anggota', icon: '👥' },
    { label: 'Keamanan', key: 'keamanan', icon: '🔒' },
    { label: 'Cookie & privasi', key: 'cookie', icon: '⚙' },
    { label: 'Bantuan', key: 'bantuan', icon: '📞' },
  ]
  const [activeNav, setActiveNav] = useState('profil')

  return (
    <AppLayout>
      <AppTopbar title="Profil & Pengaturan" />
      <div style={{ padding: '32px 36px 48px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Profil & Akun</div>
          <h1 className="sh-h-2">
            Kelola <em className="sh-italic" style={{ color: 'var(--forest)' }}>akun&nbsp;kamu</em>.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8 }}>
            Kelola informasi akun, kebun, dan preferensi pengingat.
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-xl text-sm border`} style={message.type === 'success' ? { background: 'var(--forest-tint)', borderColor: 'var(--forest-soft)', color: 'var(--forest)' } : { background: 'var(--terra-soft)', borderColor: 'var(--terra-soft)', color: 'var(--terracotta-2)' }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
          {/* Sidebar nav */}
          <nav style={{ position: 'sticky', top: 80, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
                  color: activeNav === item.key ? 'var(--ink)' : 'var(--ink-3)',
                  background: activeNav === item.key ? 'white' : 'transparent',
                  border: activeNav === item.key ? '1px solid var(--line)' : '1px solid transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeNav === 'profil' && (
              <>

            {/* Identity card */}
            <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-7">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div style={{
                  width: 92, height: 92, borderRadius: 24,
                  background: 'linear-gradient(135deg, var(--forest), var(--forest-3))',
                  color: 'white', display: 'grid', placeItems: 'center',
                  fontSize: 32, fontWeight: 800, flexShrink: 0, position: 'relative',
                }}>
                  {initialsOf(userInfo.full_name, userInfo.username, userInfo.email)}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="display" style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                    {displayName}
                  </h2>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                      {userInfo.username ? `@${userInfo.username}` : 'Petani · SawitHub'}
                    </span>
                    <span className="chip sh-chip-forest" style={{ fontSize: 11 }}>✓ Terverifikasi</span>
                    {userInfo.role === 'admin' && (
                      <span className="chip sh-chip-terra" style={{ fontSize: 11 }}>Admin</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setFormState('full_name')}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink-3 hover:bg-paper-2 transition-colors"
                >
                  Edit profil
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['Nama lengkap', userInfo.full_name || '—'],
                  ['No. WhatsApp', userInfo.phone || 'Belum ditambahkan'],
                  ['Email', userInfo.email || '—'],
                  ['Username', userInfo.username ? `@${userInfo.username}` : '—'],
                  ['Hak akses', roleLabel(userInfo.role)],
                  ['Anggota sejak', fmtShortDate(userInfo.created_at)],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: 14, background: 'var(--paper)', borderRadius: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity summary */}
            <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-7">
              <p className="sh-eyebrow" style={{ marginBottom: 4 }}>Ringkasan aktivitas</p>
              <h3 className="sh-h-4" style={{ marginTop: 4, marginBottom: 20 }}>Sejak bergabung</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  ['Profil', `${completion}%`, 'terisi', 'var(--c1)'],
                  ['Login method', `${loginMethods.length}`, 'cara', 'var(--c2)'],
                  ['Akun dibuat', fmtShortDate(userInfo.created_at), '', 'var(--c4)'],
                  ['Diperbarui', fmtShortDate(userInfo.updated_at), '', 'var(--c5)'],
                ].map(([label, value, unit, color]) => (
                  <div key={label} style={{ padding: 18, borderRadius: 14, background: 'var(--paper)', borderTop: `3px solid ${color}` }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    <div className="num" style={{ fontSize: 24, fontWeight: 800, marginTop: 6, letterSpacing: '-0.025em' }}>
                      {value}<span style={{ fontSize: 13, color: 'var(--ink-4)', fontWeight: 500, marginLeft: 3 }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)] gap-6">
              <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card md:p-7">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-ink">Informasi Akun</h2>
                  <p className="text-sm mt-1 text-ink-3">
                    Data utama yang dipakai untuk identitas, kontak, dan akses akun.
                  </p>
                </div>

                <div className="divide-y divide-line">
                  {infoRows.map((row) => (
                    <div key={row.key} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-[0.18em] mb-1 text-ink-4">
                          {row.label}
                        </div>
                        <div className="text-lg font-medium text-ink break-words">{row.value}</div>
                        <div className="text-sm mt-1 text-ink-4">
                          {row.hint}
                        </div>
                      </div>

                      <button
                        onClick={() => setFormState(row.key)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition shrink-0 border border-forest-soft bg-forest-tint text-forest hover:opacity-80"
                      >
                        {row.actionLabel}
                      </button>
                    </div>
                  ))}

                  <div className="py-4 flex flex-col gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] mb-1 text-ink-4">
                        ID akun
                      </div>
                      <div className="text-sm font-medium text-ink break-all" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                        {userInfo.public_id || '-'}
                      </div>
                      <div className="text-sm mt-1 text-ink-4">
                        ID unik akun untuk referensi internal dan dukungan teknis.
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card md:p-7">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-ink">Keamanan & Akses</h2>
                  <p className="text-sm mt-1 text-ink-3">
                    Ikhtisar keamanan akun dan cara Anda bisa masuk ke aplikasi.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="pb-5 border-b border-line">
                    <div className="text-xs uppercase tracking-[0.18em] mb-1 text-ink-4">
                      Password
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-medium text-ink">••••••••</div>
                        <div className="text-sm mt-1 text-ink-4">
                          Gunakan password kuat dengan minimal 8 karakter.
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPasswordForm({ current: '', new: '', confirm: '' })
                          setFormState('password')
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition shrink-0 border border-forest-soft bg-forest-tint text-forest hover:opacity-80"
                      >
                        Ubah
                      </button>
                    </div>
                  </div>

                  <div className="pb-5 border-b border-line">
                    <div className="text-xs uppercase tracking-[0.18em] mb-1 text-ink-4">
                      Metode masuk
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {loginMethods.map((method) => (
                        <span key={method} className="px-3 py-1 rounded-full text-xs font-medium border border-line bg-paper-2 text-ink-3">
                          {method}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm mt-2 text-ink-4">
                      {userInfo.phone
                        ? 'Anda bisa login menggunakan email, username, atau nomor telepon.'
                        : 'Tambahkan nomor telepon jika ingin login dengan opsi selain email dan username.'}
                    </div>
                  </div>

                  <div className="pb-5 border-b border-line">
                    <div className="text-xs uppercase tracking-[0.18em] mb-1 text-ink-4">
                      Hak akses
                    </div>
                    <div className="text-lg font-medium text-ink">{roleLabel(userInfo.role)}</div>
                    <div className="text-sm mt-1 text-ink-4">
                      {userInfo.role === 'admin'
                        ? 'Akun ini memiliki akses administrasi ke sistem.'
                        : 'Akun ini memiliki akses standar untuk mengelola kebun sendiri.'}
                    </div>
                    {userInfo.role === 'admin' && adminPanelUrl ? (
                      <div className="mt-4 rounded-xl border border-line bg-paper-2 px-4 py-3 text-sm">
                        <p className="font-medium text-ink mb-1">Panel admin</p>
                        <p className="text-ink-3 mb-3">
                          Moderasi pengguna, audit, dan pengaturan sistem dilakukan di aplikasi admin terpisah (JWT
                          admin), bukan dari halaman petani ini.
                        </p>
                        <a
                          href={adminPanelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-lg px-4 py-2 font-semibold text-white"
                          style={{ background: 'var(--forest)' }}
                        >
                          Buka panel admin
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div className="pb-5 border-b border-line">
                    <div className="text-xs uppercase tracking-[0.18em] mb-1 text-ink-4">
                      Keamanan sesi
                    </div>
                    <p className="text-sm mb-3 text-ink-4">
                      Cabut semua sesi login di perangkat lain (memerlukan backend Redis sesi). Perangkat ini juga akan diminta login ulang.
                    </p>
                    <button
                      type="button"
                      disabled={logoutAllBusy}
                      onClick={() => setLogoutAllConfirmOpen(true)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 border"
                      style={{ background: 'rgba(217,119,6,0.08)', borderColor: 'rgba(217,119,6,0.2)', color: '#d97706' }}
                    >
                      {logoutAllBusy ? 'Memproses…' : 'Keluar dari semua perangkat'}
                    </button>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] mb-1 text-ink-4">
                      Waktu akun
                    </div>
                    <div className="space-y-2 text-sm text-ink-3">
                      <div>Dibuat: {fmtDateTime(userInfo.created_at)}</div>
                      <div>Diperbarui: {fmtDateTime(userInfo.updated_at)}</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {formState !== 'view' && (
              <section className="rounded-xl-1 border border-line bg-surface p-6 shadow-card md:p-7">
                <div className="mb-5">
                  <div className="text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">
                    Perbarui Data
                  </div>
                  <h2 className="text-xl font-semibold text-ink">
                    {formState === 'full_name' && 'Ubah Nama Lengkap'}
                    {formState === 'email' && 'Ubah Email'}
                    {formState === 'phone' && 'Ubah Nomor Telepon'}
                    {formState === 'username' && 'Ubah Username'}
                    {formState === 'password' && 'Ubah Password'}
                  </h2>
                  <p className="text-sm mt-1 text-ink-3">
                    {formState === 'full_name' && 'Gunakan nama yang mudah dikenali agar profil lebih jelas di dashboard.'}
                    {formState === 'email' && 'Email ini dipakai untuk reset password dan informasi terkait akun.'}
                    {formState === 'phone' && 'Nomor telepon bisa dipakai sebagai alternatif login. Kosongkan jika ingin menghapusnya dari akun.'}
                    {formState === 'username' && 'Username dipakai untuk login dan identitas singkat akun Anda.'}
                    {formState === 'password' && 'Pastikan password baru kuat dan tidak sama dengan password lama.'}
                  </p>
                </div>

                {formState === 'full_name' && (
                  <form onSubmit={handleUpdateFullName} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">
                        Nama lengkap
                      </label>
                      <input
                        type="text"
                        value={fullNameForm}
                        onChange={(e) => setFullNameForm(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        className={INPUT}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="app-submit-button app-submit-button--emerald px-4 py-3 disabled:opacity-50"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState('view')}
                        className="rounded-xl border border-line bg-paper-2 px-4 py-3 font-medium text-ink-3 transition hover:bg-line"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {formState === 'email' && (
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">
                        Email baru
                      </label>
                      <input
                        type="email"
                        value={emailForm}
                        onChange={(e) => setEmailForm(e.target.value)}
                        placeholder="email@contoh.com"
                        className={INPUT}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="app-submit-button app-submit-button--emerald px-4 py-3 disabled:opacity-50"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState('view')}
                        className="rounded-xl border border-line bg-paper-2 px-4 py-3 font-medium text-ink-3 transition hover:bg-line"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {formState === 'phone' && (
                  <form onSubmit={handleUpdatePhone} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">
                        Nomor telepon
                      </label>
                      <input
                        type="tel"
                        value={phoneForm}
                        onChange={(e) => setPhoneForm(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className={INPUT}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="app-submit-button app-submit-button--emerald px-4 py-3 disabled:opacity-50"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState('view')}
                        className="rounded-xl border border-line bg-paper-2 px-4 py-3 font-medium text-ink-3 transition hover:bg-line"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {formState === 'username' && (
                  <form onSubmit={handleUpdateUsername} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">
                        Username baru
                      </label>
                      <input
                        type="text"
                        value={usernameForm}
                        onChange={(e) => setUsernameForm(e.target.value)}
                        placeholder="username"
                        className={INPUT}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="app-submit-button app-submit-button--emerald px-4 py-3 disabled:opacity-50"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState('view')}
                        className="rounded-xl border border-line bg-paper-2 px-4 py-3 font-medium text-ink-3 transition hover:bg-line"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {formState === 'password' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">
                        Password saat ini
                      </label>
                      <input
                        type="password"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        placeholder="Masukkan password saat ini"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">
                        Password baru
                      </label>
                      <input
                        type="password"
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        placeholder="Minimal 8 karakter"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">
                        Konfirmasi password baru
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        placeholder="Ulangi password baru"
                        className={INPUT}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="app-submit-button app-submit-button--emerald px-4 py-3 disabled:opacity-50"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState('view')}
                        className="rounded-xl border border-line bg-paper-2 px-4 py-3 font-medium text-ink-3 transition hover:bg-line"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}
            </>
            )}

            {activeNav === 'kebun' && (
              <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-7">
                <p className="sh-eyebrow" style={{ marginBottom: 4 }}>Kebun & blok</p>
                <h3 className="sh-h-4" style={{ marginTop: 4, marginBottom: 16 }}>Kelola lahan</h3>
                <p className="text-sm text-ink-3 mb-4">Lihat dan tambah kebun dari halaman Lahan.</p>
                <a href="/lahan" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--forest)' }}>
                  Buka halaman Lahan →
                </a>
              </div>
            )}

            {activeNav === 'anggota' && (
              <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-7">
                <p className="sh-eyebrow" style={{ marginBottom: 4 }}>Anggota tim</p>
                <h3 className="sh-h-4" style={{ marginTop: 4, marginBottom: 16 }}>Akses bersama</h3>
                <p className="text-sm text-ink-3">Fitur multi-anggota tersedia di paket Koperasi. Hubungi tim kami untuk informasi lebih lanjut.</p>
              </div>
            )}

            {activeNav === 'keamanan' && (
              <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-7 space-y-5">
                <div>
                  <p className="sh-eyebrow" style={{ marginBottom: 4 }}>Keamanan</p>
                  <h3 className="sh-h-4" style={{ marginTop: 4, marginBottom: 16 }}>Keamanan & Akses</h3>
                </div>
                <div className="pb-5 border-b border-line">
                  <div className="text-xs uppercase tracking-[0.18em] mb-1 text-ink-4">Password</div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-medium text-ink">••••••••</div>
                      <div className="text-sm mt-1 text-ink-4">Gunakan password kuat dengan minimal 8 karakter.</div>
                    </div>
                    <button onClick={() => { setPasswordForm({ current: '', new: '', confirm: '' }); setFormState('password') }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition shrink-0 border border-forest-soft bg-forest-tint text-forest hover:opacity-80">
                      Ubah
                    </button>
                  </div>
                </div>
                <div className="pb-5 border-b border-line">
                  <div className="text-xs uppercase tracking-[0.18em] mb-1 text-ink-4">Keamanan sesi</div>
                  <p className="text-sm mb-3 text-ink-4">Cabut semua sesi login di perangkat lain.</p>
                  <button type="button" disabled={logoutAllBusy} onClick={() => setLogoutAllConfirmOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 border"
                    style={{ background: 'rgba(217,119,6,0.08)', borderColor: 'rgba(217,119,6,0.2)', color: '#d97706' }}>
                    {logoutAllBusy ? 'Memproses…' : 'Keluar dari semua perangkat'}
                  </button>
                </div>
                {formState === 'password' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div><label className="block text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">Password saat ini</label>
                      <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Masukkan password saat ini" className={INPUT} /></div>
                    <div><label className="block text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">Password baru</label>
                      <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} placeholder="Minimal 8 karakter" className={INPUT} /></div>
                    <div><label className="block text-xs uppercase tracking-[0.18em] mb-2 text-ink-4">Konfirmasi password baru</label>
                      <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Ulangi password baru" className={INPUT} /></div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={loading} className="app-submit-button app-submit-button--emerald px-4 py-3 disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan'}</button>
                      <button type="button" onClick={() => setFormState('view')} className="rounded-xl border border-line bg-paper-2 px-4 py-3 font-medium text-ink-3 transition hover:bg-line">Batal</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeNav === 'cookie' && (
              <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-7">
                <p className="sh-eyebrow" style={{ marginBottom: 4 }}>Cookie & privasi</p>
                <h3 className="sh-h-4" style={{ marginTop: 4, marginBottom: 16 }}>Pengaturan cookie</h3>
                <p className="text-sm text-ink-3 mb-4">Kelola preferensi cookie Anda.</p>
                <a href="/pengaturan-cookie" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--forest)' }}>
                  Pengaturan cookie →
                </a>
              </div>
            )}

            {activeNav === 'bantuan' && (
              <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-7">
                <p className="sh-eyebrow" style={{ marginBottom: 4 }}>Bantuan</p>
                <h3 className="sh-h-4" style={{ marginTop: 4, marginBottom: 16 }}>Pusat bantuan</h3>
                <p className="text-sm text-ink-3 mb-4">Temukan jawaban dan hubungi tim dukungan kami.</p>
                <a href="/bantuan" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'var(--forest)' }}>
                  Buka bantuan →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={logoutAllConfirmOpen}
        title="Keluar dari semua perangkat?"
        message="Semua sesi login di perangkat lain akan berakhir. Anda mungkin perlu masuk kembali di perangkat ini jika sesi ikut dihapus."
        confirmLabel="Ya, keluar semua"
        busy={logoutAllBusy}
        danger
        onClose={() => {
          if (!logoutAllBusy) setLogoutAllConfirmOpen(false)
        }}
        onConfirm={async () => {
          setLogoutAllBusy(true)
          try {
            await logoutAll()
          } catch {
            showResult('error', 'Gagal keluar dari semua perangkat')
            setLogoutAllBusy(false)
          }
        }}
      />
    </AppLayout>
  )
}
