import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { FarmProvider } from './context/FarmContext'
import { ThemeProvider } from './context/ThemeContext'
import { useVisitTracker } from './hooks/useVisitTracker'
import { usePresenceHeartbeat } from './hooks/usePresenceHeartbeat'
import { usePageTracking } from './hooks/usePageTracking'
import { SEO, getSEOConfigForPath } from './components/SEO'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Help from './pages/Help'
import About from './pages/About'
import NotFound from './pages/NotFound'
import RedirectPage from './pages/RedirectPage'
import CookieConsent from './components/CookieConsent'
import CookieSettings from './pages/CookieSettings'
import AdminRoleRouteBanner from './components/AdminRoleRouteBanner'
import { RouteErrorBoundary } from './components/RouteErrorBoundary'
import { RouteLoadingState } from './components/RouteErrorState'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const AddLahan = lazy(() => import('./pages/AddLahan'))
const AddPanen = lazy(() => import('./pages/AddPanen'))
const AddPerawatan = lazy(() => import('./pages/AddPerawatan'))
const AddPendapatan = lazy(() => import('./pages/AddPendapatan'))
const Lahan = lazy(() => import('./pages/Lahan'))
const Panen = lazy(() => import('./pages/Panen'))
const Perawatan = lazy(() => import('./pages/Perawatan'))
const JadwalPerawatan = lazy(() => import('./pages/JadwalPerawatan'))
const AddJadwalPerawatan = lazy(() => import('./pages/AddJadwalPerawatan'))
const Pendapatan = lazy(() => import('./pages/Pendapatan'))
const HargaTbs = lazy(() => import('./pages/HargaTbs'))
const LaporanKeuangan = lazy(() => import('./pages/LaporanKeuangan'))
const KalkulatorPupuk = lazy(() => import('./pages/KalkulatorPupuk'))
const Profile = lazy(() => import('./pages/Profile'))
const Keuangan = lazy(() => import('./pages/Keuangan'))
const SubscriptionPage = lazy(() => import('./pages/Subscription'))
const SubscriptionPaymentsPage = lazy(() => import('./pages/SubscriptionPayments'))
const SubscriptionPaymentReturn = lazy(() => import('./pages/SubscriptionPaymentReturn'))
const BantuanAkses = lazy(() => import('./pages/BantuanAkses'))
const Notifikasi = lazy(() => import('./pages/Notifikasi'))

function VisitTracker() {
  useVisitTracker()
  return null
}

function PresenceHeartbeat() {
  usePresenceHeartbeat()
  return null
}

function PageTracker() {
  usePageTracking()
  return null
}

function HashScroll() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return

    const id = decodeURIComponent(location.hash.slice(1))
    const target = document.getElementById(id)

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.pathname, location.hash])

  return null
}

function RouteSEO() {
  const location = useLocation()
  const seoConfig = getSEOConfigForPath(location.pathname)

  if (!seoConfig) {
    return null
  }

  return <SEO {...seoConfig} />
}

function RouteFrame() {
  const location = useLocation()

  return (
    <RouteErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<RouteLoadingState />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="/privasi" element={<Privacy />} />
          <Route path="/syarat" element={<Terms />} />
          <Route path="/bantuan" element={<Help />} />
          <Route path="/tentang-kami" element={<About />} />
          <Route path="/pengaturan-cookie" element={<CookieSettings />} />
          <Route path="/tentang" element={<RedirectPage to="/tentang-kami" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/lahan" element={<ProtectedRoute><Lahan /></ProtectedRoute>} />
          <Route path="/panen" element={<ProtectedRoute><Panen /></ProtectedRoute>} />
          <Route path="/perawatan" element={<ProtectedRoute><Perawatan /></ProtectedRoute>} />
          <Route path="/jadwal-perawatan" element={<ProtectedRoute><JadwalPerawatan /></ProtectedRoute>} />
          <Route path="/pendapatan" element={<ProtectedRoute><Pendapatan /></ProtectedRoute>} />
          <Route path="/harga-tbs" element={<ProtectedRoute><HargaTbs /></ProtectedRoute>} />
          <Route path="/keuangan" element={<ProtectedRoute><Keuangan /></ProtectedRoute>} />
          <Route path="/kalkulator-pupuk" element={<ProtectedRoute><KalkulatorPupuk /></ProtectedRoute>} />
          <Route path="/laporan-keuangan" element={<ProtectedRoute><LaporanKeuangan /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/subscription/payments" element={<ProtectedRoute><SubscriptionPaymentsPage /></ProtectedRoute>} />
          <Route path="/subscription/riwayat" element={<ProtectedRoute><SubscriptionPaymentsPage /></ProtectedRoute>} />
          <Route path="/subscription/PaymentFinish" element={<ProtectedRoute><SubscriptionPaymentReturn variant="finish" /></ProtectedRoute>} />
          <Route path="/subscription/PaymentUnFinish" element={<ProtectedRoute><SubscriptionPaymentReturn variant="unfinish" /></ProtectedRoute>} />
          <Route path="/subscription/PaymentError" element={<ProtectedRoute><SubscriptionPaymentReturn variant="error" /></ProtectedRoute>} />
          <Route path="/bantuan/akses" element={<ProtectedRoute><BantuanAkses /></ProtectedRoute>} />
          <Route path="/notifikasi" element={<ProtectedRoute><Notifikasi /></ProtectedRoute>} />
          <Route path="/lahan/add" element={<ProtectedRoute><AddLahan /></ProtectedRoute>} />
          <Route path="/panen/add" element={<ProtectedRoute><AddPanen /></ProtectedRoute>} />
          <Route path="/perawatan/add" element={<ProtectedRoute><AddPerawatan /></ProtectedRoute>} />
          <Route path="/jadwal-perawatan/add" element={<ProtectedRoute><AddJadwalPerawatan /></ProtectedRoute>} />
          <Route path="/pendapatan/add" element={<ProtectedRoute><AddPendapatan /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FarmProvider>
            <RouteSEO />
            <VisitTracker />
            <PresenceHeartbeat />
            <PageTracker />
            <HashScroll />
            <CookieConsent />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#ffffff',
                  color: '#0d1f17',
                  border: '1px solid #e7e2d4',
                  borderRadius: '14px',
                  boxShadow: '0 24px 48px -24px rgba(13,31,23,.18), 0 8px 24px -16px rgba(13,31,23,.08)',
                },
              }}
            />
            <AdminRoleRouteBanner />
            <RouteFrame />
          </FarmProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
