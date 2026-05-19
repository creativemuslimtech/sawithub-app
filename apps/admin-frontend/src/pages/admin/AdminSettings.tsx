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
  primary_color: 'var(--forest)',
  secondary_color: '#059669',
  background_color: '#0f0f23',
}

function ColorField({
  label, desc, value, onChange,
}: { label: string; desc: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{label}</label>
      <p style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 8 }}>{desc}</p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: 40, height: 40, borderRadius: 10, cursor: 'pointer', border: '1px solid var(--line-2)', background: 'transparent', padding: 2 }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="sh-input flex-1"
          style={{ fontFamily: 'var(--f-mono)', fontSize: 13 }}
          placeholder="#000000"
        />
        <div style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid var(--line-2)', flexShrink: 0, background: value }} />
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
        <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--amber-2)', border: '1px solid rgba(245,158,11,0.2)' }}>
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
              <AdminMetricCard label="Primary" value={form.primary_color} hint="aksi dan navigasi aktif" color="var(--forest)" />
              <AdminMetricCard label="Secondary" value={form.secondary_color} hint="badge dan status pendukung" color="var(--forest-3)" />
              <AdminMetricCard label="Background" value={form.background_color} hint="warna dasar aplikasi" color="var(--c-sky)" />
            </div>

            <AdminPanel
              eyebrow="Preview"
              title="Tema aktif"
              description="Kartu ini memakai kombinasi warna yang sedang diedit."
            >
              <div style={{ borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16, background: form.background_color, border: '1px solid var(--line-2)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: form.primary_color }} />
                <div style={{ width: 40, height: 40, borderRadius: 10, background: form.secondary_color }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: form.primary_color }}>SawitHub</p>
                  <p style={{ fontSize: 12, color: form.secondary_color }}>Preview tema aktif</p>
                </div>
              </div>
            </AdminPanel>

            {subscriptionEnforcement != null ? (
              <AdminPanel
                eyebrow="Backend user app"
                title="Subscription enforcement"
                description="Baca saja. Harus sama dengan env SUBSCRIPTION_ENFORCEMENT pada backend pengguna (SawitHub). Dipakai support untuk membedakan perilaku trial vs gate penuh antar environment (BE-01)."
              >
                <p style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: 'var(--ink)' }}>
                  subscription_enforcement ={' '}
                  <span style={{ color: subscriptionEnforcement ? 'var(--forest)' : 'var(--amber-2)', fontWeight: 600 }}>
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

              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="sh-btn sh-btn-primary flex-1"
                  style={{ opacity: saving || !hasChanges ? 0.4 : 1 }}>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  onClick={() => setForm(saved)}
                  disabled={!hasChanges}
                  className="sh-btn sh-btn-ghost"
                  style={{ opacity: !hasChanges ? 0.4 : 1 }}>
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
