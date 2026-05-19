import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (size = 18) => ({ viewBox: '0 0 24 24', width: size, height: size, fill: 'none' } as const)

export const HomeIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
)
export const LeafIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M5 19c0-9 6-15 15-15 0 9-6 15-15 15Zm0 0L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const BasketIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M4 9h16l-1.5 10a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 9 12 3l3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const SprayIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M10 8h4v10a2 2 0 0 1-2 2 2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.5"/><path d="M14 5h3l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="9" r="0.8" fill="currentColor"/><circle cx="5" cy="3" r="0.8" fill="currentColor"/></svg>
)
export const CalIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M4 10h16M9 3v4M15 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const MoneyIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
)
export const ChartIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M4 20V8M10 20V4M16 20v-8M22 20H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const CalcIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="8" y="6" width="8" height="3" rx="1" stroke="currentColor" strokeWidth="1.3"/><circle cx="9" cy="13" r="0.8" fill="currentColor"/><circle cx="12" cy="13" r="0.8" fill="currentColor"/><circle cx="15" cy="13" r="0.8" fill="currentColor"/><circle cx="9" cy="17" r="0.8" fill="currentColor"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/><circle cx="15" cy="17" r="0.8" fill="currentColor"/></svg>
)
export const BellIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const UserIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 20c1.4-3.4 4-5 7-5s5.6 1.6 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const SearchIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5"/><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const PlusIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
)
export const ArrowIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const CheckIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="m5 12 5 5 9-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const DownloadIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
export const FilterIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
)
export const MailIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
)
export const LockIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
)
export const MoreIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/></svg>
)
export const StarIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}><path d="m12 4 2.4 5 5.6.8-4 4 1 5.6L12 17l-5 2.4 1-5.6-4-4 5.6-.8L12 4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
)
export const DotIcon = ({ size = 10, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...p}><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>
)
