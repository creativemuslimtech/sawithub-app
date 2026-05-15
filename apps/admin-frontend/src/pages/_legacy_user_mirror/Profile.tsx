import { useEffect, useState } from 'react'
import type { User } from '../context/AuthContext'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/AppLayout'
import AppTopbar from '../components/AppTopbar'
import ShellUserMenu from '../components/ShellUserMenu'
import api from '../api/client'

const PANEL = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
  border: '1px solid rgba(255,255,255,0.08)',
}

const INPUT =
  'w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition bg-white/5 border border-white/10 focus:border-green-500 focus:bg-white/[0.08] placeholder:text-white/25'

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
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<AccountInfo>(EMPTY_INFO)
  const [formState, setFormState] = useState<FormState>('view')
  const [fullNameForm, setFullNameForm] = useState('')
  const [emailForm, setEmailForm] = useState('')
  const [phoneForm, setPhoneForm] = useState('')
  const [usernameForm, setUsernameForm] = useState('')
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const applyUserInfo = (nextUser: User | null) => {
    const nextInfo = toAccountInfo(nextUser)
    setUserInfo(nextInfo)
    setFullNameForm(nextInfo.full_name)
    setEmailForm(nextInfo.email)
    setPhoneForm(nextInfo.phone)
    setUsernameForm(nextInfo.username)
  }

  useEffect(() => {
    if (user) applyUserInfo(user)
  }, [user])

  const fetchUserInfo = async () => {
    const nextUser = await refreshUser()
    if (nextUser) {
      applyUserInfo(nextUser)
    } else if (user) {
      applyUserInfo(user)
    }
  }

  useEffect(() => {
    void fetchUserInfo()
  }, [])

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
      await api.put('/auth/update-full-name', { new_full_name: trimmed })
      await fetchUserInfo()
      setFormState('view')
      showResult('success', 'Nama lengkap berhasil diubah')
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Gagal mengubah nama lengkap'
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
      await api.put('/auth/update-email', { new_email: trimmed })
      await fetchUserInfo()
      setFormState('view')
      showResult('success', 'Email berhasil diubah')
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Gagal mengubah email'
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
      await api.put('/auth/update-phone', { new_phone: trimmed })
      await fetchUserInfo()
      setFormState('view')
      showResult('success', 'Nomor telepon berhasil diubah')
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Gagal mengubah nomor telepon'
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
      await api.put('/auth/update-username', { new_username: trimmed })
      await fetchUserInfo()
      setFormState('view')
      showResult('success', 'Username berhasil diubah')
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Gagal mengubah username'
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
      await api.put('/auth/update-password', {
        current_password: passwordForm.current,
        new_password: passwordForm.new,
      })
      setPasswordForm({ current: '', new: '', confirm: '' })
      setFormState('view')
      showResult('success', 'Password berhasil diubah')
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Gagal mengubah password'
      showResult('error', errMsg)
    } finally {
      setLoading(false)
    }
  }

  const completion = completionOf(userInfo)
  const displayName = userInfo.full_name || userInfo.username || userInfo.email || 'Akun SawitHub'
  const loginMethods = loginMethodsOf(userInfo)

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
        : 'Tambahkan nomor telepon agar akun lebih mudah diakses.',
      actionLabel: userInfo.phone ? 'Ubah' : 'Tambah',
    },
  ] as const

  return (
    <AppLayout
      topbar={(
        <AppTopbar
          title="Profil Akun"
          subtitle="Data diri, kontak, dan cara masuk akun"
          actions={<ShellUserMenu />}
        />
      )}
    >
      <div className="app-shell-gutter py-6 pb-8 md:py-8">
        <div className="app-shell-container">
          <div className="w-full space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Profil</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Atur nama, email, nomor telepon, dan password akun Anda.
              </p>
            </div>

            {message && (
              <div
                className="p-4 rounded-xl text-sm"
                style={{
                  background: message.type === 'success' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                  border: message.type === 'success' ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(248,113,113,0.3)',
                  color: message.type === 'success' ? '#4ade80' : '#f87171',
                }}
              >
                {message.text}
              </div>
            )}

            <section className="rounded-2xl overflow-hidden" style={PANEL}>
              <div className="px-6 py-6 md:px-8 md:py-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.75))',
                      color: '#04110a',
                      boxShadow: '0 12px 28px rgba(22,163,74,0.22)',
                    }}
                  >
                    {initialsOf(userInfo.full_name, userInfo.username, userInfo.email)}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Akun SawitHub
                    </div>
                    <h2 className="text-2xl font-semibold text-white break-words">{displayName}</h2>
                    <div className="mt-1 text-sm break-words" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {userInfo.username ? `@${userInfo.username}` : userInfo.email}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(74,222,128,0.14)', border: '1px solid rgba(74,222,128,0.24)', color: '#86efac' }}
                      >
                        {roleLabel(userInfo.role)}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.22)', color: '#7dd3fc' }}
                      >
                        Status aktif
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: userInfo.phone ? 'rgba(250,204,21,0.1)' : 'rgba(248,113,113,0.12)',
                          border: userInfo.phone ? '1px solid rgba(250,204,21,0.2)' : '1px solid rgba(248,113,113,0.2)',
                          color: userInfo.phone ? '#fde68a' : '#fca5a5',
                        }}
                      >
                        {userInfo.phone ? 'Nomor telepon terhubung' : 'Lengkapi nomor telepon'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:max-w-sm">
                  <div className="text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Ikhtisar
                  </div>
                  <div className="text-white text-sm leading-6" style={{ color: 'rgba(255,255,255,0.72)' }}>
                    Profil Anda terisi {completion}% dan saat ini mendukung login melalui {loginMethods.join(', ').toLowerCase()}.
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 px-6 py-5 md:px-8" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Kelengkapan profil
                  </div>
                  <div className="text-xl font-semibold text-white">{completion}%</div>
                  <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Isi nama lengkap dan nomor telepon agar akun lebih lengkap.
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Terdaftar sejak
                  </div>
                  <div className="text-xl font-semibold text-white">{fmtShortDate(userInfo.created_at)}</div>
                  <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Akun dibuat pada {fmtDateTime(userInfo.created_at)}.
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Diperbarui terakhir
                  </div>
                  <div className="text-xl font-semibold text-white">{fmtShortDate(userInfo.updated_at)}</div>
                  <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Data akun terakhir berubah pada {fmtDateTime(userInfo.updated_at)}.
                  </div>
                </div>
              </div>
            </section>

            <div className="grid xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)] gap-6">
              <section className="rounded-2xl p-6 md:p-7" style={PANEL}>
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-white">Informasi Akun</h2>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Data utama yang dipakai untuk identitas, kontak, dan akses akun.
                  </p>
                </div>

                <div className="divide-y divide-white/7">
                  {infoRows.map((row) => (
                    <div key={row.key} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {row.label}
                        </div>
                        <div className="text-lg font-medium text-white break-words">{row.value}</div>
                        <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.42)' }}>
                          {row.hint}
                        </div>
                      </div>

                      <button
                        onClick={() => setFormState(row.key)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition shrink-0"
                        style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.2)', color: '#86efac' }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(74,222,128,0.18)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(74,222,128,0.12)')}
                      >
                        {row.actionLabel}
                      </button>
                    </div>
                  ))}

                  <div className="py-4 flex flex-col gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        ID akun
                      </div>
                      <div className="text-sm font-medium text-white break-all" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                        {userInfo.public_id || '-'}
                      </div>
                      <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.42)' }}>
                        ID unik akun untuk referensi internal dan dukungan teknis.
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl p-6 md:p-7" style={PANEL}>
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-white">Keamanan & Akses</h2>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Ikhtisar keamanan akun dan cara Anda bisa masuk ke aplikasi.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Password
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-medium text-white">••••••••</div>
                        <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.42)' }}>
                          Gunakan password kuat dengan minimal 8 karakter.
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPasswordForm({ current: '', new: '', confirm: '' })
                          setFormState('password')
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition shrink-0"
                        style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.2)', color: '#86efac' }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(74,222,128,0.18)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(74,222,128,0.12)')}
                      >
                        Ubah
                      </button>
                    </div>
                  </div>

                  <div className="pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Metode masuk
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {loginMethods.map((method) => (
                        <span
                          key={method}
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.72)' }}
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.42)' }}>
                      {userInfo.phone
                        ? 'Anda bisa login menggunakan email, username, atau nomor telepon.'
                        : 'Tambahkan nomor telepon jika ingin login dengan opsi selain email dan username.'}
                    </div>
                  </div>

                  <div className="pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Hak akses
                    </div>
                    <div className="text-lg font-medium text-white">{roleLabel(userInfo.role)}</div>
                    <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.42)' }}>
                      {userInfo.role === 'admin'
                        ? 'Akun ini memiliki akses administrasi ke sistem.'
                        : 'Akun ini memiliki akses standar untuk mengelola kebun sendiri.'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Waktu akun
                    </div>
                    <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
                      <div>Dibuat: {fmtDateTime(userInfo.created_at)}</div>
                      <div>Diperbarui: {fmtDateTime(userInfo.updated_at)}</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {formState !== 'view' && (
              <section className="rounded-2xl p-6 md:p-7" style={PANEL}>
                <div className="mb-5">
                  <div className="text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Perbarui Data
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {formState === 'full_name' && 'Ubah Nama Lengkap'}
                    {formState === 'email' && 'Ubah Email'}
                    {formState === 'phone' && 'Ubah Nomor Telepon'}
                    {formState === 'username' && 'Ubah Username'}
                    {formState === 'password' && 'Ubah Password'}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
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
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
                        className="px-4 py-3 rounded-xl font-medium transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', boxShadow: '0 10px 24px rgba(22,163,74,0.2)' }}
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState('view')}
                        className="px-4 py-3 rounded-xl font-medium transition"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {formState === 'email' && (
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
                        className="px-4 py-3 rounded-xl font-medium transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', boxShadow: '0 10px 24px rgba(22,163,74,0.2)' }}
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState('view')}
                        className="px-4 py-3 rounded-xl font-medium transition"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {formState === 'phone' && (
                  <form onSubmit={handleUpdatePhone} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
                        className="px-4 py-3 rounded-xl font-medium transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', boxShadow: '0 10px 24px rgba(22,163,74,0.2)' }}
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState('view')}
                        className="px-4 py-3 rounded-xl font-medium transition"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {formState === 'username' && (
                  <form onSubmit={handleUpdateUsername} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
                        className="px-4 py-3 rounded-xl font-medium transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', boxShadow: '0 10px 24px rgba(22,163,74,0.2)' }}
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState('view')}
                        className="px-4 py-3 rounded-xl font-medium transition"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {formState === 'password' && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
                      <label className="block text-xs uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
                        className="px-4 py-3 rounded-xl font-medium transition disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', boxShadow: '0 10px 24px rgba(22,163,74,0.2)' }}
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormState('view')}
                        className="px-4 py-3 rounded-xl font-medium transition"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
