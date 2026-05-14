import { Navigate } from 'react-router-dom'

export default function RedirectPage({ to }: { to: string }) {
  return <Navigate to={to} replace />
}
