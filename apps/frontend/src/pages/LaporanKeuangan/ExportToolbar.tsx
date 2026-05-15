import { shellTonalButtonClass } from '../../constants/appShellChrome'
import type { ExportFormat } from './types'

export function ExportActionButtons({
  exporting,
  exportRecipient,
  onExcel,
  onPdf,
  className,
}: {
  exporting: ExportFormat | null
  exportRecipient: string
  onExcel: () => void
  onPdf: () => void
  className?: string
}) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={onExcel}
        disabled={!!exporting}
        title={`Unduh laporan Excel dan kirim salinannya ke ${exportRecipient}`}
        className={shellTonalButtonClass}
        style={{ background: 'rgba(10,120,71,0.1)', color: 'var(--emerald)' }}
      >
        {exporting === 'xlsx' ? 'Mengirim Excel...' : 'Excel'}
      </button>
      <button
        type="button"
        onClick={onPdf}
        disabled={!!exporting}
        title={`Unduh laporan PDF dan kirim salinannya ke ${exportRecipient}`}
        className={shellTonalButtonClass}
        style={{ background: 'rgba(217,106,44,0.1)', color: 'var(--terra)' }}
      >
        {exporting === 'pdf' ? 'Mengirim PDF...' : 'PDF'}
      </button>
    </div>
  )
}

export function ExportStatusPanel({
  exportStatus,
}: {
  exportStatus: { type: 'success' | 'error' | 'info'; text: string } | null
}) {
  if (!exportStatus) return null
  return (
    <p
      role="status"
      className="mt-3 rounded-xl border px-3 py-2 text-sm"
      style={{
        background: exportStatus.type === 'success' ? 'var(--emerald-tint)' : exportStatus.type === 'error' ? 'var(--terra-soft)' : 'var(--paper-2)',
        borderColor: exportStatus.type === 'success' ? 'var(--emerald-soft)' : exportStatus.type === 'error' ? 'var(--terra-soft)' : 'var(--line)',
        color: exportStatus.type === 'success' ? 'var(--emerald)' : exportStatus.type === 'error' ? 'var(--terra)' : 'var(--ink-3)',
      }}
    >
      {exportStatus.text}
    </p>
  )
}
