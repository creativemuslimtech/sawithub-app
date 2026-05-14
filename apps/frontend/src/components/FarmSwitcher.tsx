import { useFarm } from '../context/useFarm'

type Props = {
  compact?: boolean
}

/** Visible when subscription allows multiple farms and user has more than one plot. */
export default function FarmSwitcher({ compact }: Props) {
  const { lahans, activeFarmLimit, activeFarmId, setActiveFarm, loading } = useFarm()

  if (loading || activeFarmLimit <= 1 || lahans.length <= 1) {
    return null
  }

  const selCls = compact
    ? 'max-w-[9.5rem] truncate rounded-xl border border-white/12 bg-white/[0.06] px-2 py-1 text-[11px] font-medium text-white outline-none sm:max-w-[11rem]'
    : 'max-w-[11rem] truncate rounded-xl border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-white outline-none'

  return (
    <label className="flex min-w-0 items-center gap-2">
      <span className="hidden text-[10px] uppercase tracking-[0.14em] text-white/38 sm:inline">
        Kebun
      </span>
      <select
        className={selCls}
        style={{ colorScheme: 'dark' }}
        value={activeFarmId}
        onChange={(e) => void setActiveFarm(e.target.value)}
        aria-label="Pilih kebun aktif"
      >
        <option value="">Semua kebun</option>
        {lahans.map((l) => (
          <option key={l.id_lahan} value={String(l.id_lahan)}>
            {l.nama_kebun}
          </option>
        ))}
      </select>
    </label>
  )
}
