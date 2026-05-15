import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHero,
  AdminPagination,
  AdminPanel,
  AdminSearchField,
  AdminSkeleton,
} from '../../components/AdminUI'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

interface UserItem {
  user_id: string
  email: string
  username: string
  full_name: string
  role: 'user' | 'admin'
  created_at: string
  is_active: boolean
  is_online: boolean
  last_seen_at?: string
  last_seen_relative?: string
  deactivated_at?: string
  /** PM-01: app onboarding wizard completed (from user preferences_json). */
  onboarding_done?: boolean
}

function fmtDate(raw: string) {
  if (!raw) return '-'
  const d = new Date(raw)
  return isNaN(d.getTime()) ? raw : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })
}

function fmtDateTime(raw: string) {
  if (!raw) return '-'
  const d = new Date(raw)
  return isNaN(d.getTime()) ? raw : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}

function apiErrorMessage(err: unknown) {
  if (!err || typeof err !== 'object' || !('response' in err)) return undefined
  const response = (err as { response?: { data?: { error?: string } } }).response
  return response?.data?.error
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<'user' | 'admin'>('user')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [activeTotal, setActiveTotal] = useState(0)
  const [inactiveTotal, setInactiveTotal] = useState(0)
  const [onlineTotal, setOnlineTotal] = useState(0)

  // Password change modal state
  const [passwordModal, setPasswordModal] = useState<{
    open: boolean
    userId: string
    username: string
  } | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  const fetchUsers = async (p: number) => {
    setLoading(true)
    setFetchError(false)
    try {
      const { data: response } = await api.get(`/admin/users?page=${p}`)
      const payload = response?.users !== undefined ? response : (response?.data ?? response)
      setUsers(Array.isArray(payload?.users) ? payload.users : [])
      setTotalPages(payload?.total_pages || 1)
      setTotal(payload?.total || 0)
      setActiveTotal(payload?.active_total || 0)
      setInactiveTotal(payload?.inactive_total || 0)
      setOnlineTotal(payload?.online_total || 0)
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(page)
  }, [page])

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u))
      setEditingUserId(null)
      toast.success('Role berhasil diubah')
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err) || 'Gagal mengubah role')
    }
  }

  const handleToggleStatus = async (user: UserItem) => {
    const actionLabel = user.is_active ? 'Nonaktifkan' : 'Aktifkan'
    const detail = user.is_active
      ? 'Akun tidak bisa login lagi sampai diaktifkan kembali.'
      : 'Akun akan bisa login kembali.'

    if (!confirm(`${actionLabel} akun "${user.username}"?\n\n${detail}`)) return

    try {
      const { data } = await api.put(`/admin/users/${user.user_id}/deactivate`, {})
      if (editingUserId === user.user_id) {
        setEditingUserId(null)
      }
      await fetchUsers(page)
      toast.success(data?.message || `Pengguna berhasil ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}`)
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err) || `Gagal ${user.is_active ? 'menonaktifkan' : 'mengaktifkan'} pengguna`)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordModal) return
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password minimal 8 karakter')
      return
    }

    setPasswordLoading(true)
    try {
      await api.put(`/admin/users/${passwordModal.userId}/password`, {
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword,
      })

      toast.success('Password berhasil diubah')
      setPasswordModal(null)
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengubah password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )
  const onlinePct = total > 0 ? (onlineTotal / total) * 100 : 0
  const activePct = total > 0 ? (activeTotal / total) * 100 : 0
  const inactivePct = total > 0 ? (inactiveTotal / total) * 100 : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHero
          eyebrow="User Control"
          title="Manajemen pengguna yang mudah dipindai dan aman dieksekusi."
          description="Pantau akun aktif, status online, role admin, dan histori akses dalam satu tampilan. Layout mobile memakai kartu agar aksi penting tetap jelas tanpa memaksa tabel lebar."
          accent="#06b6d4"
        />

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <AdminMetricCard label="Total Akun" value={total.toLocaleString('id-ID')} hint="seluruh akun terdaftar" accent="#06b6d4" icon="👥" />
          <AdminMetricCard label="Akun Aktif" value={activeTotal.toLocaleString('id-ID')} hint={`${activePct.toFixed(1)}% dari total akun`} accent="#22c55e" icon="✅" />
          <AdminMetricCard label="Online" value={onlineTotal.toLocaleString('id-ID')} hint={`${onlinePct.toFixed(1)}% sedang aktif sekarang`} accent="#84cc16" icon="●" />
          <AdminMetricCard label="Nonaktif" value={inactiveTotal.toLocaleString('id-ID')} hint={`${inactivePct.toFixed(1)}% perlu tinjauan`} accent="#f87171" icon="!" />
        </div>

        <AdminPanel
          eyebrow="Direktori"
          title="Daftar pengguna"
          description="Gunakan pencarian untuk mengecek akun tertentu, atau pindah halaman untuk memantau seluruh basis pengguna."
          action={searchTerm ? <span className="text-sm text-white/45">{filteredUsers.length} hasil ditemukan</span> : undefined}
        >
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <AdminSearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Cari email, username, atau nama..."
              className="flex-1"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="rounded-2xl px-4 py-3 text-sm font-medium transition"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Bersihkan
              </button>
            )}
          </div>

          {loading ? (
            <AdminSkeleton rows={6} height="h-16" />
          ) : fetchError ? (
            <div className="rounded-[28px] py-12 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="mb-3 text-3xl">⚠️</div>
              <p className="text-sm font-semibold text-white">Gagal memuat data pengguna</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/40">
                Terjadi kesalahan saat mengambil data dari server. Periksa koneksi atau coba lagi.
              </p>
              <button
                onClick={() => fetchUsers(page)}
                className="mt-5 rounded-2xl px-5 py-2.5 text-sm font-semibold transition"
                style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.25)' }}
              >
                Coba lagi
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <AdminEmptyState
              icon="👤"
              title={searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Belum ada pengguna'}
              description={searchTerm ? 'Hapus pencarian atau coba kata kunci lain.' : 'Data pengguna akan muncul setelah ada akun yang berhasil terdaftar.'}
            />
          ) : (
            <>
              <div
                className="hidden overflow-x-auto rounded-2xl md:block"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <table className="w-full min-w-[1180px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Email', 'Nama', 'Username', 'Role', 'Onboarding', 'Status', 'Bergabung', 'Aksi'].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-semibold uppercase"
                          style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => {
                      const isSelf = user.user_id === currentUser?.user_id
                      return (
                        <tr key={user.user_id}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          className="transition hover:bg-white/[0.02]">
                          <td className="px-5 py-4 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                            {user.email || <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>}
                          </td>
                          <td className="px-5 py-4 text-sm text-white font-medium" style={{ opacity: user.is_active ? 1 : 0.65 }}>
                            {user.full_name || <span className="text-white/25 font-normal">—</span>}
                          </td>
                          <td className="px-5 py-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)', opacity: user.is_active ? 1 : 0.65 }}>
                            {user.username}
                          </td>
                          <td className="px-5 py-4">
                            {editingUserId === user.user_id ? (
                              <select
                                value={editingRole}
                                onChange={e => setEditingRole(e.target.value as 'user' | 'admin')}
                                className="px-2 py-1 rounded-lg text-sm"
                                style={{ background: '#111827', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                style={{
                                  background: user.role === 'admin' ? 'rgba(167,139,250,0.15)' : 'rgba(56,189,248,0.12)',
                                  color: user.role === 'admin' ? '#a78bfa' : '#38bdf8',
                                }}>
                                {user.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold"
                              style={{
                                background: user.onboarding_done ? 'rgba(52,211,153,0.14)' : 'rgba(251,191,36,0.12)',
                                color: user.onboarding_done ? '#6ee7b7' : '#fcd34d',
                              }}>
                              {user.onboarding_done ? 'Selesai' : 'Belum'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                style={{
                                  background: user.is_active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                                  color: user.is_active ? '#86efac' : '#fca5a5',
                                }}>
                                {user.is_active ? 'Aktif' : 'Nonaktif'}
                              </span>
                              {!user.is_active && user.deactivated_at && (
                                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                  Sejak {fmtDateTime(user.deactivated_at)}
                                </span>
                              )}
                              {user.is_active && (
                                <span className="inline-flex w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold"
                                  style={{
                                    background: user.is_online ? 'rgba(132,204,22,0.14)' : 'rgba(148,163,184,0.12)',
                                    color: user.is_online ? '#bef264' : '#cbd5e1',
                                  }}>
                                  {user.is_online ? 'Online' : 'Offline'}
                                </span>
                              )}
                              {user.is_active && !user.is_online && (
                                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                  {user.last_seen_relative || 'belum pernah aktif'}
                                </span>
                              )}
                              {user.is_active && user.is_online && user.last_seen_at && (
                                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                  Terdeteksi {fmtDateTime(user.last_seen_at)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {fmtDate(user.created_at)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2 items-center">
                              {editingUserId === user.user_id ? (
                                <>
                                  <button onClick={() => handleRoleChange(user.user_id, editingRole)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium transition"
                                    style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                                    Simpan
                                  </button>
                                  <button onClick={() => setEditingUserId(null)}
                                    className="px-3 py-1 rounded-lg text-xs font-medium transition"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    Batal
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => { setEditingUserId(user.user_id); setEditingRole(user.role) }}
                                    className="px-3 py-1 rounded-lg text-xs font-medium transition"
                                    style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
                                    Edit Role
                                  </button>
                                  <button
                                    onClick={() => setPasswordModal({ open: true, userId: user.user_id, username: user.username })}
                                    className="px-3 py-1 rounded-lg text-xs font-medium transition"
                                    style={{ background: 'rgba(250,204,21,0.1)', color: '#fbbf24', border: '1px solid rgba(250,204,21,0.2)' }}>
                                    Change Password
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(user)}
                                    disabled={isSelf && user.is_active}
                                    className="px-3 py-1 rounded-lg text-xs font-medium transition"
                                    style={{
                                      background: user.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.12)',
                                      color: user.is_active ? '#f87171' : '#4ade80',
                                      border: user.is_active ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(74,222,128,0.25)',
                                      opacity: isSelf && user.is_active ? 0.45 : 1,
                                      cursor: isSelf && user.is_active ? 'not-allowed' : 'pointer',
                                    }}>
                                    {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                  </button>
                                </>
                              )}
                            </div>
                            {isSelf && user.is_active && (
                              <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                Akun Anda sendiri tidak bisa dinonaktifkan.
                              </p>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {filteredUsers.map(user => {
                  const isSelf = user.user_id === currentUser?.user_id
                  return (
                    <article
                      key={user.user_id}
                      className="rounded-[24px] p-4"
                      style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-white truncate">{user.full_name || user.username}</p>
                          <p className="text-xs text-white/40 truncate">{user.email || user.username}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{
                            background: user.role === 'admin' ? 'rgba(167,139,250,0.15)' : 'rgba(56,189,248,0.12)',
                            color: user.role === 'admin' ? '#a78bfa' : '#38bdf8',
                          }}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-2xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-white/30">Status</p>
                          <p className="mt-1 font-semibold" style={{ color: user.is_active ? '#86efac' : '#fca5a5' }}>
                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                          </p>
                        </div>
                        <div className="rounded-2xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-white/30">Presence</p>
                          <p className="mt-1 font-semibold" style={{ color: user.is_online ? '#bef264' : '#cbd5e1' }}>
                            {user.is_online ? 'Online' : (user.last_seen_relative || 'Offline')}
                          </p>
                        </div>
                        <div className="rounded-2xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-white/30">Bergabung</p>
                          <p className="mt-1 font-semibold text-white">{fmtDate(user.created_at)}</p>
                        </div>
                        <div className="rounded-2xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-white/30">Username</p>
                          <p className="mt-1 font-semibold text-white truncate">{user.username}</p>
                        </div>
                        <div className="rounded-2xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-white/30">Onboarding app</p>
                          <p className="mt-1 font-semibold" style={{ color: user.onboarding_done ? '#6ee7b7' : '#fcd34d' }}>
                            {user.onboarding_done ? 'Selesai' : 'Belum'}
                          </p>
                        </div>
                      </div>
                      {editingUserId === user.user_id && (
                        <select
                          value={editingRole}
                          onChange={e => setEditingRole(e.target.value as 'user' | 'admin')}
                          className="mt-3 w-full rounded-xl px-3 py-2 text-sm"
                          style={{ background: '#111827', color: 'white', border: '1px solid rgba(255,255,255,0.16)' }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {editingUserId === user.user_id ? (
                          <>
                            <button onClick={() => handleRoleChange(user.user_id, editingRole)}
                              className="rounded-xl px-3 py-2 text-xs font-medium transition"
                              style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                              Simpan
                            </button>
                            <button onClick={() => setEditingUserId(null)}
                              className="rounded-xl px-3 py-2 text-xs font-medium transition"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                              Batal
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingUserId(user.user_id); setEditingRole(user.role) }}
                              className="rounded-xl px-3 py-2 text-xs font-medium transition"
                              style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
                              Edit Role
                            </button>
                            <button
                              onClick={() => setPasswordModal({ open: true, userId: user.user_id, username: user.username })}
                              className="rounded-xl px-3 py-2 text-xs font-medium transition"
                              style={{ background: 'rgba(250,204,21,0.1)', color: '#fbbf24', border: '1px solid rgba(250,204,21,0.2)' }}>
                              Password
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={isSelf && user.is_active}
                              className="rounded-xl px-3 py-2 text-xs font-medium transition disabled:opacity-40"
                              style={{
                                background: user.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.12)',
                                color: user.is_active ? '#f87171' : '#4ade80',
                                border: user.is_active ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(74,222,128,0.25)',
                              }}>
                              {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          </>
                        )}
                      </div>
                      {isSelf && user.is_active && (
                        <p className="mt-2 text-[11px] text-white/30">Akun Anda sendiri tidak bisa dinonaktifkan.</p>
                      )}
                    </article>
                  )
                })}
              </div>
            </>
          )}

          {totalPages > 1 && !searchTerm && (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalLabel={`Halaman ${page} dari ${totalPages} · ${total.toLocaleString('id-ID')} pengguna`}
              onPrev={() => setPage(p => p - 1)}
              onNext={() => setPage(p => p + 1)}
            />
          )}
        </AdminPanel>
      </div>

      {/* Password Change Modal */}
      {passwordModal?.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-2 text-white">
              Change Password
            </h3>
            <p className="text-sm text-white/50 mb-6">
              User: <span className="text-white font-medium">{passwordModal.username}</span>
            </p>

            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-white/70">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Minimal 8 karakter"
                    minLength={8}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-white/70">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-yellow-500/50 transition"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi password"
                    minLength={8}
                    required
                  />
                </div>

                {passwordForm.newPassword && passwordForm.confirmPassword &&
                  passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-red-400 text-sm">Password tidak cocok</p>
                  )}

                {passwordForm.newPassword && passwordForm.newPassword.length < 8 && (
                  <p className="text-yellow-400 text-sm">Password minimal 8 karakter</p>
                )}

                <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={
                      passwordLoading ||
                      passwordForm.newPassword !== passwordForm.confirmPassword ||
                      passwordForm.newPassword.length < 8
                    }
                    className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 rounded-lg font-bold text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Menyimpan...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordModal(null)
                      setPasswordForm({ newPassword: '', confirmPassword: '' })
                    }}
                    disabled={passwordLoading}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-white transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
