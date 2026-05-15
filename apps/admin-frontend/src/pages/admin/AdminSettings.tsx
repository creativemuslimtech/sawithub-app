import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  AdminMetricCard,
  AdminPageHero,
  AdminPanel,
  AdminSkeleton,
} from '../../components/AdminUI'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface ThemeConfig {
  primary_color: string
  secondary_color: string
  background_color: string
}

const DEFAULTS: ThemeConfig = {
  primary_color: '#16a34a',
  secondary_color: '#059669',
  background_color: '#0f0f23',
}

function ColorField({
  label, desc, value, onChange,
}: { label: string; desc: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-0.5">{label}</label>
      <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
      <div className="flex gap-3 items-center">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg cursor-pointer border-0"
          style={{ background: 'transparent' }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-mono"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            outline: 'none',
          }}
          placeholder="#000000"
        />
        <div className="w-10 h-10 rounded-xl border border-white/10 flex-shrink-0"
          style={{ background: value }} />
      </div>
    </div>
  )
}

export default function AdminSettings() {
  const [saved, setSaved] = useState<ThemeConfig>(DEFAULTS)
  const [form, setForm] = useState<ThemeConfig>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subscriptionEnforcement, setSubscriptionEnforcement] = useState<boolean | null>(null)

  useEffect(() => {
    api
      .get<{ subscription_enforcement?: boolean }>('/health')
      .then((r) => {
        if (typeof r.data?.subscription_enforcement === 'boolean') {
          setSubscriptionEnforcement(r.data.subscription_enforcement)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    api.get('/admin/settings')
      .then(r => {
        const cfg: ThemeConfig = {
          primary_color: r.data.primary_color || DEFAULTS.primary_color,
          secondary_color: r.data.secondary_color || DEFAULTS.secondary_color,
          background_color: r.data.background_color || DEFAULTS.background_color,
        }
        setSaved(cfg)
        setForm(cfg)
      })
      .catch(() => toast.error('Gagal memuat pengaturan'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', form)
      setSaved(form)
      toast.success('Pengaturan berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(form) !== JSON.stringify(saved)
  const set = (key: keyof ThemeConfig) => (v: string) => setForm(f => ({ ...f, [key]: v }))

  return (
    <AdminLayout
      maxWidth="max-w-5xl"
      topbarRight={hasChanges ? (
        <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
          Ada perubahan yang belum disimpan
        </span>
      ) : undefined}
    >
      <div className="space-y-6">
            <AdminPageHero
              eyebrow="Theme Studio"
              title="Pengaturan tema admin yang konsisten dengan dashboard."
              description="Atur warna utama, sekunder, dan latar tanpa kehilangan keterbacaan. Preview dibuat langsung berdampingan dengan form supaya dampak perubahan bisa dibaca sebelum disimpan."
              accent={form.primary_color}
            />

            {loading ? (
              <AdminSkeleton rows={4} height="h-24" />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <AdminMetricCard label="Primary" value={form.primary_color} hint="aksi dan navigasi aktif" accent={form.primary_color} icon="●" />
                  <AdminMetricCard label="Secondary" value={form.secondary_color} hint="badge dan status pendukung" accent={form.secondary_color} icon="●" />
                  <AdminMetricCard label="Background" value={form.background_color} hint="warna dasar aplikasi" accent="#38bdf8" icon="▣" />
                </div>

                <AdminPanel
                  eyebrow="Preview"
                  title="Tema aktif"
                  description="Kartu ini memakai kombinasi warna yang sedang diedit."
                >
                  <div className="rounded-[24px] p-5 flex items-center gap-4"
                    style={{ background: form.background_color, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="w-10 h-10 rounded-xl" style={{ background: form.primary_color }} />
                    <div className="w-10 h-10 rounded-xl" style={{ background: form.secondary_color }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: form.primary_color }}>SawitHub</p>
                      <p className="text-xs" style={{ color: form.secondary_color }}>Preview tema aktif</p>
                    </div>
                  </div>
                </AdminPanel>

                {subscriptionEnforcement != null ? (
                  <AdminPanel
                    eyebrow="Backend user app"
                    title="Subscription enforcement"
                    description="Baca saja. Harus sama dengan env SUBSCRIPTION_ENFORCEMENT pada backend pengguna (SawitHub). Dipakai support untuk membedakan perilaku trial vs gate penuh antar environment (BE-01)."
                  >
                    <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      subscription_enforcement ={' '}
                      <span style={{ color: subscriptionEnforcement ? '#4ade80' : '#fbbf24' }}>
                        {subscriptionEnforcement ? 'true' : 'false'}
                      </span>
                    </p>
                  </AdminPanel>
                ) : null}

                <AdminPanel
                  eyebrow="Konfigurasi"
                  title="Warna tema"
                  description="Simpan perubahan setelah kombinasi warna terasa jelas di layar desktop dan mobile."
                  className="space-y-7"
                >
                  <ColorField
                    label="Warna Utama"
                    desc="Digunakan untuk tombol, aksen, dan elemen interaktif utama"
                    value={form.primary_color}
                    onChange={set('primary_color')}
                  />
                  <ColorField
                    label="Warna Sekunder"
                    desc="Digunakan untuk highlight, badge status, dan elemen pendukung"
                    value={form.secondary_color}
                    onChange={set('secondary_color')}
                  />
                  <ColorField
                    label="Warna Latar"
                    desc="Warna background utama seluruh aplikasi"
                    value={form.background_color}
                    onChange={set('background_color')}
                  />

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving || !hasChanges}
                      className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-40"
                      style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button
                      onClick={() => setForm(saved)}
                      disabled={!hasChanges}
                      className="px-6 py-3 rounded-xl text-sm font-medium transition disabled:opacity-40"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Reset
                    </button>
                  </div>
                </AdminPanel>
              </>
            )}
      </div>
    </AdminLayout>
  )
}
