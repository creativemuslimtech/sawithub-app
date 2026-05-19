import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import AppTopbar from '../components/AppTopbar'
import Card from '../components/ds/Card'
import Chip from '../components/ds/Chip'
import SeedSprout from '../components/ds/botanical/SeedSprout'
import PalmLeaf from '../components/ds/botanical/PalmLeaf'
import RupiahInput from '../components/RupiahInput'
import SubscriptionGateSheet from '../components/SubscriptionGateSheet'
import { getSubscriptionGateMessage, isSubscriptionRequiredError } from '../utils/apiError'
import type { Lahan } from '../types'
import { parseRupiahInput } from '../utils/rupiah'
import { trackEvent, GAEvents } from '../utils/analytics'
import { CheckIcon, StarIcon } from '../components/ds/icons'

function SectionLabel({ num, title, amber }: { num: string; title: string; amber?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, fontSize: 11, fontWeight: 700,
        background: amber ? 'var(--amber-soft)' : 'var(--forest-soft)',
        color: amber ? 'var(--amber-2)' : 'var(--forest)',
        display: 'grid', placeItems: 'center', fontFamily: 'var(--f-mono)',
      }}>{num}</div>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{title}</span>
    </div>
  )
}

function FormField({ label, hint, children, style }: { label?: string; hint?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      {label && <label className="sh-label" style={{ display: 'block', marginBottom: 6 }}>{label}</label>}
      {children}
      {hint && <p style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 5 }}>{hint}</p>}
    </div>
  )
}

export default function AddPanen() {
  const navigate = useNavigate()
  const [subscriptionGate, setSubscriptionGate] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  })
  const [lahanList, setLahanList] = useState<Lahan[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    id_lahan: '', tanggal_panen: '', luas_panen_ha: '',
    jumlah_janjang: '', berat_kg: '', harga_per_kg: '', biaya_panen: '', catatan: '',
  })
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  const setCurrency = (k: 'harga_per_kg' | 'biaya_panen') =>
    (value: string) =>
      setForm((f) => ({ ...f, [k]: value }))

  const handleLahanChange = (id: string) => {
    const lahan = lahanList.find(l => String(l.id_lahan) === id)
    setForm(f => ({ ...f, id_lahan: id, luas_panen_ha: lahan ? String(lahan.luas_ha) : f.luas_panen_ha }))
  }

  useEffect(() => { api.get('/CorePlotService').then((r) => setLahanList(r.data)) }, [])

  const resetForm = (keepLahan = true) => setForm((current) => ({
    id_lahan: keepLahan ? current.id_lahan : '',
    tanggal_panen: '',
    luas_panen_ha: keepLahan ? current.luas_panen_ha : '',
    jumlah_janjang: '',
    berat_kg: '',
    harga_per_kg: '',
    biaya_panen: '',
    catatan: '',
  }))

  const beratKg = parseFloat(form.berat_kg) || 0
  const hargaPerKg = parseRupiahInput(form.harga_per_kg)
  const biayaPanen = parseRupiahInput(form.biaya_panen)
  const estimasiPendapatan = beratKg * hargaPerKg
  const estimasiBersih = estimasiPendapatan - biayaPanen
  const margin = estimasiPendapatan > 0 ? ((estimasiBersih / estimasiPendapatan) * 100).toFixed(1) : '0'
  const luasHa = parseFloat(form.luas_panen_ha) || 1
  const perHa = estimasiBersih / luasHa

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const addAnother = submitter?.value === 'add-another'
    setLoading(true)
    try {
      await api.post('/CoreHarvestService', {
        id_lahan: parseInt(form.id_lahan),
        tanggal_panen: form.tanggal_panen,
        luas_panen_ha: parseFloat(form.luas_panen_ha) || 0,
        jumlah_janjang: parseInt(form.jumlah_janjang) || 0,
        berat_kg: parseFloat(form.berat_kg) || 0,
        harga_per_kg: parseRupiahInput(form.harga_per_kg),
        biaya_panen: parseRupiahInput(form.biaya_panen),
      })

      trackEvent(GAEvents.ADD_PANEN, {
        feature_name: 'panen',
        action_type: 'add',
        berat_kg: beratKg,
        estimasi_pendapatan: estimasiPendapatan,
      })
      trackEvent(GAEvents.FIRST_PANEN_CREATED, {
        funnel_step: 'first_panen',
        feature_name: 'panen',
        berat_kg: beratKg,
        estimasi_pendapatan: estimasiPendapatan,
      })

      toast.success(addAnother ? 'Data panen tersimpan. Silakan catat panen berikutnya.' : 'Data panen berhasil disimpan!')
      if (addAnother) {
        resetForm(true)
      } else {
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      if (isSubscriptionRequiredError(err)) {
        setSubscriptionGate({
          open: true,
          message: getSubscriptionGateMessage(err, 'Pencatatan panen dibatasi oleh paket atau trial.'),
        })
        return
      }
      toast.error('Gagal menyimpan data.')
    } finally {
      setLoading(false)
    }
  }

  const topbarActions = (
    <div style={{ display: 'flex', gap: 8 }}>
      <Link to="/panen" className="sh-btn sh-btn-ghost sh-btn-sm" style={{ textDecoration: 'none' }}>Batal</Link>
      <button form="add-panen-form" type="submit" disabled={loading} className="sh-btn sh-btn-primary sh-btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <CheckIcon size={14} /> Simpan panen
      </button>
    </div>
  )

  return (
    <AppLayout>
      <SubscriptionGateSheet
        open={subscriptionGate.open}
        onClose={() => setSubscriptionGate((s) => ({ ...s, open: false }))}
        message={subscriptionGate.message}
        surface="add_panen"
      />

      <AppTopbar title="Catat Panen" headerActions={topbarActions} />

      <div style={{ padding: '32px 36px 48px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Panen baru</div>
            <h1 className="sh-h-2">
              Catat <em className="sh-italic" style={{ color: 'var(--forest)' }}>panen&nbsp;hari&nbsp;ini</em>.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8, maxWidth: 600 }}>
              Isi sekali — harga rata-rata, pendapatan, dan biaya panen terhitung otomatis dari data ini.
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'end' }}>
            <span className="sh-eyebrow">Langkah</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[1, 2, 3].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 99,
                    background: s === 1 ? 'var(--forest)' : 'var(--paper)',
                    color: s === 1 ? 'var(--paper)' : 'var(--ink-4)',
                    border: s === 1 ? 0 : '1px solid var(--line)',
                    display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 600,
                  }}>{s}</div>
                  {i < 2 && <div style={{ width: 16, height: 1, background: 'var(--line)' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form id="add-panen-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
            {/* LEFT: form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Section 01: Kebun & Tanggal */}
              <Card padded={false} style={{ padding: 24 }}>
                <SectionLabel num="01" title="Kebun & tanggal panen" />

                {/* Kebun picker */}
                {lahanList.length > 0 ? (
                  <FormField label="Pilih kebun" hint="Kebun aktif yang dipilih akan menentukan luas dan jumlah pohon">
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(lahanList.length, 3)}, 1fr)`, gap: 10 }}>
                      {lahanList.slice(0, 3).map((l, i) => {
                        const colors = ['var(--forest)', 'var(--forest-3)', 'var(--amber-2)']
                        const color = colors[i % colors.length]
                        const active = form.id_lahan === String(l.id_lahan)
                        return (
                          <button
                            key={l.id_lahan}
                            type="button"
                            onClick={() => handleLahanChange(String(l.id_lahan))}
                            style={{
                              padding: 14, borderRadius: 12,
                              border: `1.5px solid ${active ? color : 'var(--line)'}`,
                              background: active ? `${color}18` : 'var(--surface)',
                              textAlign: 'left', cursor: 'pointer', position: 'relative',
                            }}
                          >
                            {active && (
                              <div style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 99, background: color, color: 'var(--paper)', display: 'grid', placeItems: 'center' }}>
                                <CheckIcon size={12} />
                              </div>
                            )}
                            <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 500, color, fontStyle: 'italic', marginBottom: 4 }}>
                              {l.nama_kebun.charAt(0)}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{l.nama_kebun}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{l.luas_ha} ha</div>
                          </button>
                        )
                      })}
                    </div>
                    {lahanList.length > 3 && (
                      <div style={{ marginTop: 10 }}>
                        <select
                          value={form.id_lahan}
                          onChange={e => handleLahanChange(e.target.value)}
                          className="sh-input"
                        >
                          <option value="">-- Pilih lahan lain --</option>
                          {lahanList.map(l => (
                            <option key={l.id_lahan} value={l.id_lahan}>{l.nama_kebun} ({l.luas_ha} ha)</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </FormField>
                ) : (
                  <FormField label="Pilih Lahan *">
                    <select className="sh-input" value={form.id_lahan} onChange={e => handleLahanChange(e.target.value)} required>
                      <option value="">-- Pilih Lahan --</option>
                      {lahanList.map(l => (
                        <option key={l.id_lahan} value={l.id_lahan}>{l.nama_kebun} ({l.jenis_bibit})</option>
                      ))}
                    </select>
                  </FormField>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
                  <FormField label="Tanggal panen">
                    <input type="date" className="sh-input" value={form.tanggal_panen} onChange={set('tanggal_panen')} required />
                  </FormField>
                  <FormField label="Luas dipanen (ha)" hint="Default sesuai luas kebun terpilih">
                    <input type="number" step="0.01" min="0" className="sh-input sh-num" value={form.luas_panen_ha} onChange={set('luas_panen_ha')} placeholder="0.00" />
                  </FormField>
                </div>
              </Card>

              {/* Section 02: Hasil Panen */}
              <Card padded={false} style={{ padding: 24 }}>
                <SectionLabel num="02" title="Hasil panen TBS" amber />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <FormField label="Jumlah janjang" hint="Hitung dari potong terakhir">
                    <div style={{ position: 'relative' }}>
                      <input className="sh-input sh-num" value={form.jumlah_janjang} onChange={set('jumlah_janjang')} type="number" min="0" placeholder="86" style={{ paddingRight: 70 }} />
                      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>janjang</span>
                    </div>
                  </FormField>
                  <FormField label="Berat total" hint="Dari setruk timbangan pabrik">
                    <div style={{ position: 'relative' }}>
                      <input className="sh-input sh-num" value={form.berat_kg} onChange={set('berat_kg')} type="number" step="0.01" min="0" placeholder="1.420" style={{ paddingRight: 50 }} />
                      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>kg</span>
                    </div>
                  </FormField>
                </div>

                {form.berat_kg && form.jumlah_janjang && parseFloat(form.jumlah_janjang) > 0 && (
                  <div style={{ marginTop: 14, padding: 14, background: 'var(--forest-tint)', border: '1px solid var(--forest-soft)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SeedSprout size={28} style={{ color: 'var(--forest)', opacity: 0.9 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--forest)', fontWeight: 600 }}>
                          Berat per janjang: <span className="sh-num">{(parseFloat(form.berat_kg) / parseFloat(form.jumlah_janjang)).toFixed(1)} kg</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                          Kalkulasi otomatis dari data yang diisi.
                        </div>
                      </div>
                      <Chip tone="forest">Normal</Chip>
                    </div>
                  </div>
                )}
              </Card>

              {/* Section 03: Harga & Biaya */}
              <Card padded={false} style={{ padding: 24 }}>
                <SectionLabel num="03" title="Harga & biaya panen" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <FormField label="Harga per kg (TBS)">
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>Rp</span>
                      <RupiahInput className="sh-input sh-num" value={form.harga_per_kg} onValueChange={setCurrency('harga_per_kg')} placeholder="2.340" style={{ paddingLeft: 38 }} />
                    </div>
                  </FormField>
                  <FormField label="Biaya panen (upah TK + transport)">
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>Rp</span>
                      <RupiahInput className="sh-input sh-num" value={form.biaya_panen} onValueChange={setCurrency('biaya_panen')} placeholder="320.000" style={{ paddingLeft: 38 }} />
                    </div>
                  </FormField>
                </div>

                <FormField label="Catatan (opsional)" style={{ marginTop: 14 }}>
                  <textarea
                    className="sh-input"
                    rows={3}
                    value={form.catatan}
                    onChange={set('catatan')}
                    style={{ height: 'auto', padding: 14, resize: 'vertical' }}
                    placeholder="Mis. kondisi cuaca, catatan kualitas buah..."
                  />
                </FormField>
              </Card>

              {/* Action bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
                <Link to="/panen" className="sh-btn sh-btn-ghost" style={{ textDecoration: 'none' }}>← Kembali</Link>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" value="add-another" disabled={loading} className="sh-btn sh-btn-ghost">
                    Simpan & catat lagi
                  </button>
                  <button type="submit" value="dashboard" disabled={loading} className="sh-btn sh-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckIcon size={16} /> {loading ? 'Menyimpan...' : 'Simpan panen'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: live preview */}
            <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
              <Card padded={false} style={{ padding: 24, position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, var(--paper), var(--paper-2))' }}>
                <PalmLeaf size={120} style={{ position: 'absolute', right: -10, top: -10, color: 'var(--forest)', opacity: 0.08 }} />

                <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Ringkasan otomatis</div>
                <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Pratinjau panen</h3>

                {estimasiPendapatan > 0 ? (
                  <>
                    <div style={{ padding: '18px 0', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)', marginBottom: 18 }}>
                      <div className="sh-eyebrow" style={{ marginBottom: 6 }}>Pendapatan kotor</div>
                      <div className="sh-num" style={{ fontSize: 42, fontWeight: 400, color: 'var(--forest)', letterSpacing: '-0.02em' }}>
                        Rp {(estimasiPendapatan / 1_000_000).toFixed(2)}<span style={{ fontSize: 22, color: 'var(--ink-3)' }}>&thinsp;jt</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                        {beratKg.toLocaleString('id-ID')} kg × Rp {hargaPerKg.toLocaleString('id-ID')}/kg
                      </div>
                    </div>

                    {[
                      { l: 'Biaya panen', v: `− Rp ${(biayaPanen / 1000).toFixed(0)} rb`, color: 'var(--terracotta-2)' },
                      { l: 'Hasil bersih', v: `Rp ${(estimasiBersih / 1_000_000).toFixed(2)} jt`, color: 'var(--forest)', bold: true },
                      { l: 'Margin', v: `${margin}%`, color: 'var(--amber-2)' },
                      { l: 'Per hektare', v: `Rp ${(perHa / 1000).toFixed(0)} rb / ha`, color: 'var(--ink-2)' },
                    ].map((r, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: i < 3 ? '1px dashed var(--line)' : 0,
                      }}>
                        <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: r.bold ? 600 : 400 }}>{r.l}</span>
                        <span className="sh-num" style={{ fontSize: r.bold ? 18 : 14, fontWeight: 500, color: r.color }}>{r.v}</span>
                      </div>
                    ))}

                    <div style={{ marginTop: 18, padding: 14, background: 'var(--amber-tint)', border: '1px solid var(--amber-soft)', borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                        <span style={{ color: 'var(--amber-2)', marginTop: 2 }}><StarIcon size={16} /></span>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>Kalkulasi real-time</div>
                          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
                            Data dihitung otomatis. Setelah simpan, entri masuk ke laporan keuangan dan rekap pendapatan.
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>🌱</div>
                    Isi berat dan harga untuk lihat kalkulasi otomatis.
                  </div>
                )}
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
