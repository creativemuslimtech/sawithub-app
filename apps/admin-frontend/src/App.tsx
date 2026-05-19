import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AdminRoute from './components/AdminRoute'
import { queryClient } from './lib/queryClient'

const Login = lazy(() => import('./pages/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminData = lazy(() => import('./pages/admin/AdminData'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminMonitoring = lazy(() => import('./pages/admin/AdminMonitoring'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit'))
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'))
const AdminApps = lazy(() => import('./pages/admin/AdminApps'))
const PwaDetail = lazy(() => import('./pages/admin/PwaDetail'))
const PwaVitals = lazy(() => import('./pages/admin/PwaVitals'))
const AndroidDetail = lazy(() => import('./pages/admin/AndroidDetail'))
const AndroidAnr = lazy(() => import('./pages/admin/AndroidAnr'))

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#1a1a2e', color: '#fff', border: '1px solid #444' },
              }}
            />
            <style>{`
              body { padding-top: env(safe-area-inset-top); background-color: var(--cream, #F5F0E8); }
              html { background-color: var(--cream, #F5F0E8); }
            `}</style>
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen bg-[#0f0f23]">
                  <div className="text-gray-400 text-lg">Memuat...</div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/data" element={<AdminRoute><AdminData /></AdminRoute>} />
                <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
                <Route path="/admin/monitoring" element={<AdminRoute><AdminMonitoring /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                <Route path="/admin/audit" element={<AdminRoute><AdminAudit /></AdminRoute>} />
                <Route path="/admin/revenue" element={<AdminRoute><AdminRevenue /></AdminRoute>} />
                <Route path="/admin/apps" element={<AdminRoute><AdminApps /></AdminRoute>} />
                <Route path="/admin/apps/pwa" element={<AdminRoute><PwaDetail /></AdminRoute>} />
                <Route path="/admin/apps/pwa/vitals" element={<AdminRoute><PwaVitals /></AdminRoute>} />
                <Route path="/admin/apps/android" element={<AdminRoute><AndroidDetail /></AdminRoute>} />
                <Route path="/admin/apps/android/anr" element={<AdminRoute><AndroidAnr /></AdminRoute>} />

                {/* Backward-compatible redirects */}
                <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
                <Route path="/dashboard/admin" element={<Navigate to="/admin" replace />} />
                <Route path="/users" element={<Navigate to="/admin/users" replace />} />
                <Route path="/data" element={<Navigate to="/admin/data" replace />} />
                <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />
                <Route path="/monitoring" element={<Navigate to="/admin/monitoring" replace />} />
                <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
                <Route path="/audit" element={<Navigate to="/admin/audit" replace />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
