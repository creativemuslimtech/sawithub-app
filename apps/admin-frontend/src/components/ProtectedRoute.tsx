import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f23]">
        <div className="text-gray-400 text-lg">Memuat...</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}
