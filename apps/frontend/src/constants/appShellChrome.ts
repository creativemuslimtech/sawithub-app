/**
 * Shared non-admin shell chrome: sidebar brand, profile chip, outline actions.
 * Borderless pills, compact type (`text-xs`), aligned with `h-14` top row.
 */
export const SHELL_PILL_BASE =
  'rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-xs transition hover:bg-white/[0.08]'

/** Sidebar top: brand link (logo + optional wordmark) — no border */
export const shellSidebarBrandClass =
  `flex h-full w-full items-center justify-center min-[1100px]:justify-start ${SHELL_PILL_BASE}`

/** Profile / user chip */
export const shellProfileChipClass = `flex items-center gap-2 ${SHELL_PILL_BASE}`

/** Secondary topbar action (muted pill) */
export const shellOutlineActionClass =
  'rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white'

/** Destructive / Keluar — add inline style for red tint */
export const shellDangerButtonClass =
  'rounded-lg px-2.5 py-1.5 text-xs font-medium transition'

/** Export / tonal buttons (Excel, PDF) — add inline style */
export const shellTonalButtonClass =
  'rounded-lg px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-70'
