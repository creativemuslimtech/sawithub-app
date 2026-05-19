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

/* ── small badge helper ── */
function Chip({ children, tone }: { children: React.ReactNode; tone: 'forest' | 'amber' | 'terra' | 'neutral' }) {
  const cls = tone === 'forest' ? 'sh-chip sh-chip-forest'
    : tone === 'amber' ? 'sh-chip sh-chip-amber'
    : tone === 'terra' ? 'sh-chip sh-chip-terra'
    : 'sh-chip'
  return <span className={cls}>{children}</span>
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

  const [passwordModal, setPasswordModal] = useState<{ open: boolean; userId: string; username: string } | null>(null)
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
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

  useEffect(() => { fetchUsers(page) }, [page])

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
    const detail = user.is_active ? 'Akun tidak bisa login lagi sampai diaktifkan kembali.' : 'Akun akan bisa login kembali.'
    if (!confirm(`${actionLabel} akun "${user.username}"?\n\n${detail}`)) return
    try {
      const { data } = await api.put(`/admin/users/${user.user_id}/deactivate`, {})
      if (editingUserId === user.user_id) setEditingUserId(null)
      await fetchUsers(page)
      toast.success(data?.message || `Pengguna berhasil ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}`)
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err) || `Gagal ${user.is_active ? 'menonaktifkan' : 'mengaktifkan'} pengguna`)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordModal) return
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error('Password tidak cocok'); return }
    if (passwordForm.newPassword.length < 8) { toast.error('Password minimal 8 karakter'); return }
    setPasswordLoading(true)
    try {
      await api.put(`/admin/users/${passwordModal.userId}/password`, {
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword,
      })
      toast.success('Password berhasil diubah')
      setPasswordModal(null)
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Gagal mengubah password')
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
          description="Pantau akun aktif, status online, role admin, dan histori akses dalam satu tampilan."
        />

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <AdminMetricCard label="Total Akun" value={total.toLocaleString('id-ID')} hint="seluruh akun terdaftar" color="var(--c-sky)" />
          <AdminMetricCard label="Akun Aktif" value={activeTotal.toLocaleString('id-ID')} hint={`${activePct.toFixed(1)}% dari total`} color="var(--forest)" />
          <AdminMetricCard label="Online" value={onlineTotal.toLocaleString('id-ID')} hint={`${onlinePct.toFixed(1)}% aktif sekarang`} color="var(--forest-3)" live />
          <AdminMetricCard label="Nonaktif" value={inactiveTotal.toLocaleString('id-ID')} hint={`${inactivePct.toFixed(1)}% perlu tinjauan`} color="var(--terracotta)" />
        </div>

        <AdminPanel
          eyebrow="Direktori"
          title="Daftar pengguna"
          description="Gunakan pencarian untuk mengecek akun tertentu."
          action={searchTerm ? <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{filteredUsers.length} hasil</span> : undefined}
        >
          <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <AdminSearchField value={searchTerm} onChange={setSearchTerm} placeholder="Cari email, username, atau nama..." className="flex-1" />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="sh-btn sh-btn-ghost sh-btn-sm" style={{ borderRadius: 10 }}>
                  Bersihkan
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <AdminSkeleton rows={6} height="h-16" />
          ) : fetchError ? (
            <AdminEmptyState
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
              title="Gagal memuat data pengguna"
              description="Terjadi kesalahan saat mengambil data. Periksa koneksi atau coba lagi."
            />
          ) : filteredUsers.length === 0 ? (
            <AdminEmptyState
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              title={searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Belum ada pengguna'}
              description={searchTerm ? 'Hapus pencarian atau coba kata kunci lain.' : 'Data pengguna akan muncul setelah ada akun terdaftar.'}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto" style={{ borderRadius: 12, border: '1px solid var(--line-2)', overflow: 'hidden' }}>
                <table className="w-full min-w-[1180px]" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line-2)' }}>
                      {['Email', 'Nama', 'Username', 'Role', 'Onboarding', 'Status', 'Bergabung', 'Aksi'].map(h => (
                        <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => {
                      const isSelf = user.user_id === currentUser?.user_id
                      return (
                        <tr key={user.user_id} style={{ borderBottom: '1px solid var(--line-2)' }} className="transition hover:bg-[var(--paper-2)]">
                          <td style={{ padding: '12px 18px', fontSize: 13, color: 'var(--ink-3)' }}>
                            {user.email || <span style={{ color: 'var(--ink-5)' }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', opacity: user.is_active ? 1 : 0.55 }}>
                            {user.full_name || <span style={{ fontWeight: 400, color: 'var(--ink-5)' }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 18px', fontSize: 13, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', opacity: user.is_active ? 1 : 0.55 }}>
                            {user.username}
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            {editingUserId === user.user_id ? (
                              <select
                                value={editingRole}
                                onChange={e => setEditingRole(e.target.value as 'user' | 'admin')}
                                className="sh-input"
                                style={{ height: 34, fontSize: 13 }}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <Chip tone={user.role === 'admin' ? 'amber' : 'neutral'}>
                                {user.role === 'admin' ? 'Admin' : 'User'}
                              </Chip>
                            )}
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <Chip tone={user.onboarding_done ? 'forest' : 'amber'}>
                              {user.onboarding_done ? 'Selesai' : 'Belum'}
                            </Chip>
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <Chip tone={user.is_active ? 'forest' : 'terra'}>{user.is_active ? 'Aktif' : 'Nonaktif'}</Chip>
                              {!user.is_active && user.deactivated_at && (
                                <span style={{ fontSize: 11, color: 'var(--ink-5)' }}>Sejak {fmtDateTime(user.deactivated_at)}</span>
                              )}
                              {user.is_active && (
                                <Chip tone={user.is_online ? 'forest' : 'neutral'}>{user.is_online ? 'Online' : 'Offline'}</Chip>
                              )}
                              {user.is_active && !user.is_online && (
                                <span style={{ fontSize: 11, color: 'var(--ink-5)' }}>{user.last_seen_relative || 'belum aktif'}</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 18px', fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>
                            {fmtDate(user.created_at)}
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {editingUserId === user.user_id ? (
                                <>
                                  <button onClick={() => handleRoleChange(user.user_id, editingRole)} className="sh-btn sh-btn-primary sh-btn-sm" style={{ borderRadius: 8, height: 30 }}>Simpan</button>
                                  <button onClick={() => setEditingUserId(null)} className="sh-btn sh-btn-ghost sh-btn-sm" style={{ borderRadius: 8, height: 30 }}>Batal</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => { setEditingUserId(user.user_id); setEditingRole(user.role) }} className="sh-btn sh-btn-ghost sh-btn-sm" style={{ borderRadius: 8, height: 30 }}>Edit Role</button>
                                  <button onClick={() => setPasswordModal({ open: true, userId: user.user_id, username: user.username })} className="sh-btn sh-btn-ghost sh-btn-sm" style={{ borderRadius: 8, height: 30, color: 'var(--amber-2)' }}>Password</button>
                                  <button
                                    onClick={() => handleToggleStatus(user)}
                                    disabled={isSelf && user.is_active}
                                    className="sh-btn sh-btn-ghost sh-btn-sm"
                                    style={{ borderRadius: 8, height: 30, color: user.is_active ? 'var(--terracotta-2)' : 'var(--forest)', opacity: isSelf && user.is_active ? 0.4 : 1 }}>
                                    {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                  </button>
                                </>
                              )}
                            </div>
                            {isSelf && user.is_active && (
                              <p style={{ fontSize: 11, marginTop: 6, color: 'var(--ink-5)' }}>Akun Anda sendiri.</p>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {filteredUsers.map(user => {
                  const isSelf = user.user_id === currentUser?.user_id
                  return (
                    <article key={user.user_id} className="sh-card" style={{ padding: 16, borderRadius: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name || user.username}</p>
                          <p style={{ fontSize: 12, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email || user.username}</p>
                        </div>
                        <Chip tone={user.role === 'admin' ? 'amber' : 'neutral'}>{user.role === 'admin' ? 'Admin' : 'User'}</Chip>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        {[
                          { l: 'Status', v: <Chip tone={user.is_active ? 'forest' : 'terra'}>{user.is_active ? 'Aktif' : 'Nonaktif'}</Chip> },
                          { l: 'Presence', v: <Chip tone={user.is_online ? 'forest' : 'neutral'}>{user.is_online ? 'Online' : (user.last_seen_relative || 'Offline')}</Chip> },
                          { l: 'Bergabung', v: <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{fmtDate(user.created_at)}</span> },
                          { l: 'Onboarding', v: <Chip tone={user.onboarding_done ? 'forest' : 'amber'}>{user.onboarding_done ? 'Selesai' : 'Belum'}</Chip> },
                        ].map(item => (
                          <div key={item.l} className="sh-card" style={{ padding: '8px 12px', borderRadius: 10 }}>
                            <p style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 4 }}>{item.l}</p>
                            {item.v}
                          </div>
                        ))}
                      </div>
                      {editingUserId === user.user_id && (
                        <select value={editingRole} onChange={e => setEditingRole(e.target.value as 'user' | 'admin')} className="sh-input" style={{ marginBottom: 10 }}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {editingUserId === user.user_id ? (
                          <>
                            <button onClick={() => handleRoleChange(user.user_id, editingRole)} className="sh-btn sh-btn-primary sh-btn-sm" style={{ borderRadius: 10 }}>Simpan</button>
                            <button onClick={() => setEditingUserId(null)} className="sh-btn sh-btn-ghost sh-btn-sm" style={{ borderRadius: 10 }}>Batal</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingUserId(user.user_id); setEditingRole(user.role) }} className="sh-btn sh-btn-ghost sh-btn-sm" style={{ borderRadius: 10 }}>Edit Role</button>
                            <button onClick={() => setPasswordModal({ open: true, userId: user.user_id, username: user.username })} className="sh-btn sh-btn-ghost sh-btn-sm" style={{ borderRadius: 10, color: 'var(--amber-2)' }}>Password</button>
                            <button onClick={() => handleToggleStatus(user)} disabled={isSelf && user.is_active} className="sh-btn sh-btn-ghost sh-btn-sm" style={{ borderRadius: 10, color: user.is_active ? 'var(--terracotta-2)' : 'var(--forest)', gridColumn: '1 / -1' }}>
                              {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          </>
                        )}
                      </div>
                      {isSelf && user.is_active && (
                        <p style={{ fontSize: 11, marginTop: 8, color: 'var(--ink-5)' }}>Akun Anda sendiri tidak bisa dinonaktifkan.</p>
                      )}
                    </article>
                  )
                })}
              </div>
            </>
          )}

          {totalPages > 1 && !searchTerm && (
            <AdminPagination page={page} totalPages={totalPages} totalLabel={`Halaman ${page} dari ${totalPages} · ${total.toLocaleString('id-ID')} pengguna`} onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />
          )}
        </AdminPanel>
      </div>

      {/* Password modal */}
      {passwordModal?.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,31,26,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div className="sh-card" style={{ padding: 28, borderRadius: 20, width: '100%', maxWidth: 420 }}>
            <h3 className="sh-h-4" style={{ marginBottom: 6 }}>Ubah Password</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 24 }}>
              User: <strong style={{ color: 'var(--ink)' }}>{passwordModal.username}</strong>
            </p>
            <form onSubmit={handlePasswordChange}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="sh-label" style={{ display: 'block', marginBottom: 6 }}>Password baru</label>
                  <input type="password" className="sh-input" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Minimal 8 karakter" minLength={8} required autoFocus />
                </div>
                <div>
                  <label className="sh-label" style={{ display: 'block', marginBottom: 6 }}>Konfirmasi password</label>
                  <input type="password" className="sh-input" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Ulangi password" minLength={8} required />
                </div>
                {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p style={{ fontSize: 12, color: 'var(--terracotta-2)' }}>Password tidak cocok</p>
                )}
                <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--line-2)' }}>
                  <button type="submit" disabled={passwordLoading || passwordForm.newPassword !== passwordForm.confirmPassword || passwordForm.newPassword.length < 8} className="sh-btn sh-btn-primary" style={{ flex: 1, borderRadius: 10 }}>
                    {passwordLoading ? 'Menyimpan...' : 'Simpan Password'}
                  </button>
                  <button type="button" onClick={() => { setPasswordModal(null); setPasswordForm({ newPassword: '', confirmPassword: '' }) }} disabled={passwordLoading} className="sh-btn sh-btn-ghost" style={{ flex: 1, borderRadius: 10 }}>
                    Batal
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
