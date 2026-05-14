import FarmSwitcher from './FarmSwitcher'
import ShellUserMenu from './ShellUserMenu'

type Props = {
  accent?: string
}

export default function AppShellActions({ accent = '#22c55e' }: Props) {
  return (
    <>
      <FarmSwitcher />
      <ShellUserMenu accentColor={accent} />
    </>
  )
}
