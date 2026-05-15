import fs from 'node:fs'

const requiredFiles = [
  'src/pages/Landing.tsx',
  'src/pages/About.tsx',
  'src/pages/Help.tsx',
  'src/pages/Privacy.tsx',
  'src/pages/Terms.tsx',
  'src/pages/CookieSettings.tsx',
  'src/pages/NotFound.tsx',
  'src/App.tsx',
  'public/sitemap.xml',
  'playwright.config.ts',
  'tests/visual-smoke.spec.ts',
  'tests/accessibility.spec.ts',
  'src/components/RouteErrorBoundary.tsx',
  'src/components/RouteErrorState.tsx',
  'src/components/AuthLayout.tsx',
  'src/components/authStyles.ts',
  'src/constants/cookieConsent.ts',
  'src/constants/publicFooterLinks.ts',
  '.github/workflows/ci.yml',
]

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing required public page file: ${file}`)
}

const app = fs.readFileSync('src/App.tsx', 'utf8')
for (const route of ['/tentang-kami', '/bantuan', '/privasi', '/syarat', '/pengaturan-cookie']) {
  if (!app.includes(`path="${route}"`)) throw new Error(`Missing Indonesian public route: ${route}`)
}
if (!app.includes('path="*"')) throw new Error('Missing catch-all 404 route')
if (!app.includes('<CookieConsent />')) throw new Error('CookieConsent is not mounted')

const publicCopy = [
  'index.html',
  'src/pages/Landing.tsx',
  'src/pages/About.tsx',
  'src/pages/Help.tsx',
  'src/pages/Privacy.tsx',
  'src/pages/Terms.tsx',
  'src/pages/CookieSettings.tsx',
  'src/components/PublicFooter.tsx',
  'src/components/SEO.tsx',
].map(file => fs.readFileSync(file, 'utf8')).join('\n')
const indexHtml = fs.readFileSync('index.html', 'utf8')
const publicAssetBaseUrl = 'https://sawithub-public-assets-660113312407-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/public'
const appIconBaseUrl = `${publicAssetBaseUrl}/app-icons`
const logoMarkUrl = `${publicAssetBaseUrl}/branding/logo-mark.png`

if (/gratis\s+3\s+bulan/i.test(publicCopy)) {
  throw new Error('Found stale public campaign copy: old 3-month trial phrase')
}
if (/\bPWA\b/.test(publicCopy)) {
  throw new Error('Public-facing copy must avoid the technical term PWA; use app-install language instead')
}
if (/\bExport\b/.test(publicCopy) || /\b[Ee]kspor\b/.test(publicCopy)) {
  throw new Error('Public-facing copy must avoid Export/Ekspor; use Unduh Excel/PDF instead')
}
if (new RegExp('mengelo' + 'lah', 'i').test(publicCopy)) {
  throw new Error('Found known About-page typo')
}

const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8')
if (sitemap.includes('https://sawithub.com/')) throw new Error('Sitemap must use https://www.sawithub.com URLs')
for (const path of ['/', '/tentang-kami', '/bantuan', '/privasi', '/syarat', '/pengaturan-cookie']) {
  const url = `https://www.sawithub.com${path === '/' ? '/' : path}`
  if (!sitemap.includes(`<loc>${url}</loc>`)) throw new Error(`Sitemap missing ${url}`)
}
if (sitemap.includes('<loc>https://www.sawithub.com/signup</loc>') || sitemap.includes('<loc>https://www.sawithub.com/login</loc>')) {
  throw new Error('Signup/login must stay intentionally omitted from sitemap because they are noindex account pages')
}
if (!sitemap.includes('Signup/login are intentionally omitted')) {
  throw new Error('Sitemap must document why signup/login are omitted')
}

const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'))
const manifestAssetPaths = []

function collectManifestAssetPaths(value) {
  if (Array.isArray(value)) {
    for (const item of value) collectManifestAssetPaths(item)
    return
  }
  if (!value || typeof value !== 'object') return

  if (typeof value.src === 'string' && value.src.startsWith('/')) {
    manifestAssetPaths.push(value.src)
  }

  for (const nested of Object.values(value)) {
    collectManifestAssetPaths(nested)
  }
}

collectManifestAssetPaths(manifest)

for (const assetPath of manifestAssetPaths) {
  const file = `public${assetPath}`
  if (!fs.existsSync(file)) throw new Error(`Manifest references missing asset: ${assetPath}`)
}
if (!manifest.icons?.some(icon => icon.src === `${appIconBaseUrl}/maskable-512.png` && icon.purpose === 'maskable')) {
  throw new Error('Manifest must include dedicated maskable Android app icons')
}

const landing = fs.readFileSync('src/pages/Landing.tsx', 'utf8')
const cookieConsent = fs.readFileSync('src/components/CookieConsent.tsx', 'utf8')
const logoComponent = fs.readFileSync('src/components/Logo.tsx', 'utf8')
const designSystem = fs.readFileSync('src/components/design-system.tsx', 'utf8')
const indexCss = fs.readFileSync('src/index.css', 'utf8')
const publicHeader = fs.readFileSync('src/components/PublicHeader.tsx', 'utf8')
const publicFooter = fs.readFileSync('src/components/PublicFooter.tsx', 'utf8')
const publicPageLayout = fs.readFileSync('src/components/PublicPageLayout.tsx', 'utf8')
const publicFooterLinks = fs.readFileSync('src/constants/publicFooterLinks.ts', 'utf8')
const signup = fs.readFileSync('src/pages/Signup.tsx', 'utf8')
const login = fs.readFileSync('src/pages/Login.tsx', 'utf8')
const authLayout = fs.readFileSync('src/components/AuthLayout.tsx', 'utf8')
const help = fs.readFileSync('src/pages/Help.tsx', 'utf8')
const profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8')
const formPage = fs.readFileSync('src/components/FormPage.tsx', 'utf8')
const dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8')
const onboardingWizard = fs.readFileSync('src/components/OnboardingWizard.tsx', 'utf8')
const indexCssSource = fs.readFileSync('src/index.css', 'utf8')
const packageJson = fs.readFileSync('package.json', 'utf8')
const playwrightConfig = fs.readFileSync('playwright.config.ts', 'utf8')
const visualSmoke = fs.readFileSync('tests/visual-smoke.spec.ts', 'utf8')
const accessibilitySmoke = fs.readFileSync('tests/accessibility.spec.ts', 'utf8')
const ciWorkflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8')
const routeErrorBoundary = fs.readFileSync('src/components/RouteErrorBoundary.tsx', 'utf8')
const routeErrorState = fs.readFileSync('src/components/RouteErrorState.tsx', 'utf8')
const mobileSensitiveForms = [
  'src/pages/AddLahan.tsx',
  'src/pages/AddPanen.tsx',
  'src/pages/AddPerawatan.tsx',
  'src/pages/AddPendapatan.tsx',
  'src/pages/Lahan.tsx',
  'src/pages/Panen.tsx',
  'src/pages/Perawatan.tsx',
  'src/pages/Pendapatan.tsx',
].map(file => [file, fs.readFileSync(file, 'utf8')])
const jadwalPerawatan = fs.readFileSync('src/pages/JadwalPerawatan.tsx', 'utf8')
const hargaTbs = fs.readFileSync('src/pages/HargaTbs.tsx', 'utf8')
const kalkulatorPupuk = fs.readFileSync('src/pages/KalkulatorPupuk.tsx', 'utf8')
const laporanKeuanganModuleFiles = [
  'src/pages/LaporanKeuangan.tsx',
  'src/pages/LaporanKeuangan/LaporanKeuanganPage.tsx',
  'src/pages/LaporanKeuangan/SummaryCards.tsx',
  'src/pages/LaporanKeuangan/LaporanCharts.tsx',
  'src/pages/LaporanKeuangan/HarvestDetailTable.tsx',
  'src/pages/LaporanKeuangan/ExportToolbar.tsx',
]
const laporanKeuangan = laporanKeuanganModuleFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n')
const notFound = fs.readFileSync('src/pages/NotFound.tsx', 'utf8')
const terms = fs.readFileSync('src/pages/Terms.tsx', 'utf8')
const cookieSettingsPage = fs.readFileSync('src/pages/CookieSettings.tsx', 'utf8')
const privacy = fs.readFileSync('src/pages/Privacy.tsx', 'utf8')
const forgotPassword = fs.readFileSync('src/pages/ForgotPassword.tsx', 'utf8')
const resetPassword = fs.readFileSync('src/pages/ResetPassword.tsx', 'utf8')
const about = fs.readFileSync('src/pages/About.tsx', 'utf8')
const analytics = fs.readFileSync('src/utils/analytics.ts', 'utf8')
const addLahan = fs.readFileSync('src/pages/AddLahan.tsx', 'utf8')
const addPanen = fs.readFileSync('src/pages/AddPanen.tsx', 'utf8')
const laporanKeuanganPage = laporanKeuangan

// SEO/Growth guard: static base HTML and visible landing copy must target long-tail intent.
for (const seoMarker of [
  'Aplikasi kebun sawit untuk petani mandiri',
  'cara catat panen TBS',
  'laporan keuangan kebun sawit',
  'kalkulator pupuk sawit',
  'Panduan kebun sawit digital',
  'Aplikasi kebun sawit',
  'Cara catat panen TBS',
  'Laporan keuangan kebun sawit',
  'Kalkulator pupuk sawit',
]) {
  if (!publicCopy.includes(seoMarker)) throw new Error(`Missing SEO/Growth long-tail marker: ${seoMarker}`)
}
if (!indexHtml.includes('<title>SawitHub - Aplikasi Kebun Sawit | Catat Panen TBS, Biaya & Laporan</title>')) {
  throw new Error('Base static HTML title must stay strong for non-JS crawlers')
}
if (!indexHtml.includes('FAQPage')) {
  throw new Error('FAQPage schema must exist in static HTML')
}
if (!indexHtml.includes('Organization') || !indexHtml.includes(logoMarkUrl) || !indexHtml.includes('support@sawithub.com')) {
  throw new Error('Static Organization schema must include logo and contact')
}
if (!landing.includes('Contoh screenshot produk SawitHub:')) {
  throw new Error('Product screenshot frames must include accessible text for screenshot context')
}

// Copywriter guard: public copy should stay concrete, farmer-friendly, and low-jargon.
if (!landing.includes('SawitHub bantu petani sawit catat panen, biaya rawat, harga TBS, dan jadwal kerja')) {
  throw new Error('Landing hero headline must keep the concrete copywriter-approved value proposition')
}
if (!landing.includes('sekali isi, hasilnya langsung jadi laporan keuangan yang rapi.')) {
  throw new Error('Landing supporting copy must explain concrete farm records and avoid generic claims')
}
if (!landing.includes('tanpa kartu kredit')) {
  throw new Error('Landing CTA helper must keep the low-friction trial reassurance')
}
if (!landing.includes('Masukkan umur tanaman, jumlah pohon, kadar NPK') || !landing.includes('siap unduh Excel atau PDF dan kirim langsung ke email.')) {
  throw new Error('Landing feature section must keep concrete tool descriptions')
}
if (!publicCopy.includes('Pasang di layar utama HP seperti aplikasi.') && !publicCopy.includes('dipasang di layar utama HP seperti aplikasi')) {
  throw new Error('Public app-install copy must use plain HP home-screen language')
}
if (!publicCopy.includes('Excel atau PDF') && !publicCopy.includes('Excel dan PDF')) {
  throw new Error('Public report copy must use Unduh Excel/PDF phrasing')
}
const brandPositioning = 'SawitHub adalah buku catatan kebun sawit digital yang membantu petani mandiri mencatat panen, biaya, jadwal, dan untung bersih dari HP.'
if (!landing.includes('SawitHub adalah buku catatan kebun sawit digital untuk petani mandiri Indonesia') || !about.includes(brandPositioning)) {
  throw new Error('Landing and About must keep the approved brand positioning statement')
}
for (const brandMarker of [
  'Dibuat untuk Indonesia',
  'Sumatra, Kalimantan',
  'Contoh screenshot produk',
  'Fokus Sumatra/Kalimantan',
  'Statement founder/tim',
]) {
  if (!publicCopy.includes(brandMarker)) throw new Error(`Public pages missing brand-strategy marker: ${brandMarker}`)
}
for (const promotionMarker of [
  'Mulai gratis {SUBSCRIPTION_TRIAL_DAYS} hari',
  'Coba gratis {SUBSCRIPTION_TRIAL_DAYS} hari',
  'Petani Pro',
  'tanpa kartu kredit',
  "handleSignupClick('pricing_section')",
  "handleSignupClick('bottom_cta')",
  "handleSignupClick('sticky_mobile_cta')",
]) {
  if (!landing.includes(promotionMarker)) throw new Error(`Landing missing promotion asset marker: ${promotionMarker}`)
}

// Design-system guard: shared tokens/components must exist before further UI unification work.
for (const token of ['.marketing-panel', '.app-submit-button']) {
  if (!indexCss.includes(token)) throw new Error(`Missing design token utility: ${token}`)
}
for (const component of ['MarketingCard', 'AppCard', 'SectionHeader', 'PrimaryButton', 'SecondaryButton', 'EmptyState']) {
  if (!designSystem.includes(`function ${component}`)) throw new Error(`Missing shared design component: ${component}`)
}
if (!designSystem.includes('function AppMetricIcon') || !designSystem.includes('AppMetricIconKind')) {
  throw new Error('App pages must use shared SVG metric icons instead of mixing emoji and SVG icon languages')
}
if (!designSystem.includes('function DefaultEmptyIcon') && !designSystem.includes('function EmptyStateIcon')) {
  throw new Error('Shared EmptyState must use an SVG icon default, not emoji defaults')
}
if (designSystem.includes("icon = '🌱'")) {
  throw new Error('Shared EmptyState must use SVG icon defaults, not emoji defaults')
}
for (const sharedAppClass of ['.app-submit-button', '.app-submit-button--emerald', '.app-submit-button--sky', '.app-submit-button--purple', '.app-submit-button--amber']) {
  if (!indexCssSource.includes(sharedAppClass)) throw new Error(`Missing shared app submit-button class: ${sharedAppClass}`)
}

// Brand asset guard: Logo must be accessible and used correctly in the public header.
if (!logoComponent.includes('aria-label="Logo SawitHub"') && !logoComponent.includes('alt="Logo SawitHub"')) {
  throw new Error('Logo must have accessible label: aria-label or alt="Logo SawitHub"')
}
if (!publicHeader.includes('<Logo size="md" />')) {
  throw new Error('Public header must keep the dedicated horizontal logo usage')
}

// Conversion-flow guard: landing is long, so CTA must repeat around high-intent sections.
const signupCtaCount = (landing.match(/handleSignupClick\('/g) || []).length
if (signupCtaCount < 4) {
  throw new Error(`Landing must keep repeated signup CTAs for long-page conversion flow; found ${signupCtaCount}`)
}
for (const ctaMarker of ["handleSignupClick('header')", "handleSignupClick('pricing_section')", "handleSignupClick('bottom_cta')", "handleSignupClick('sticky_mobile_cta')"]) {
  if (!landing.includes(ctaMarker)) throw new Error(`Landing missing signup CTA marker: ${ctaMarker}`)
}
if (!landing.includes('id="fitur"') || !landing.includes('id="harga"')) {
  throw new Error('Landing must keep product feature and pricing sections before signup')
}
for (const pageSpecificMarker of [
  'Contoh screenshot produk',
  'bekerja sama, bukan terpisah.',
  'Mulai gratis. Tambah saat siap.',
  'Petani Pro',
  'Mulai gratis {SUBSCRIPTION_TRIAL_DAYS} hari',
]) {
  if (!landing.includes(pageSpecificMarker)) throw new Error(`Landing missing page-specific implementation marker: ${pageSpecificMarker}`)
}
if (/[📊💰⏰🌱]/u.test(landing)) {
  throw new Error('Landing value cards must use SVG icons instead of emoji icons')
}
if (landing.includes('text-sm leading-6 text-white/')) {
  throw new Error('Public landing explanatory card copy must use at least 15px/text-base with leading-7')
}
if (/testimoni palsu/i.test(landing) && !landing.includes('SawitHub tidak memakai testimoni palsu')) {
  throw new Error('Landing proof copy must avoid unsupported fake testimonials')
}

// Footer consistency guard: the approved footer is a single-row, centered shared component.
const expectedFooterLinkLabels = ['Tentang Kami', 'Privasi', 'Syarat', 'Bantuan', 'Pengaturan Cookie']
const expectedFooterLinkTargets = ['/tentang-kami', '/privasi', '/syarat', '/bantuan', '/pengaturan-cookie']
const footerLinkLabels = [...publicFooterLinks.matchAll(/label:\s*'([^']+)'/g)].map(match => match[1])
const footerLinkTargets = [...publicFooterLinks.matchAll(/to:\s*'([^']+)'/g)].map(match => match[1])

if (JSON.stringify(footerLinkLabels) !== JSON.stringify(expectedFooterLinkLabels) || JSON.stringify(footerLinkTargets) !== JSON.stringify(expectedFooterLinkTargets)) {
  throw new Error(`Public footer nav order must stay ${expectedFooterLinkLabels.join(' → ')}`)
}
if (!publicFooter.includes('PUBLIC_FOOTER_LINKS') || !publicFooter.includes('© 2026 SawitHub / Untuk petani sawit mandiri Indonesia')) {
  throw new Error('Shared PublicFooter must render exported nav links and the approved single-line copyright')
}
if (!publicFooter.includes('justify-center') || !publicFooter.includes('aria-label="Tautan halaman publik"')) {
  throw new Error('Shared PublicFooter nav links must stay centered with aria-label')
}
if (publicFooter.includes('FooterSupportCard') || publicFooter.includes('Butuh bantuan cepat') || publicFooter.includes('Catatan kebun sawit rapi dari HP') || publicFooter.includes('md:grid-cols') || publicFooter.includes('gridColumns')) {
  throw new Error('PublicFooter must not reintroduce the rejected 3-column brand/support-widget layout')
}
if (!publicPageLayout.includes('<PublicFooter />')) {
  throw new Error('PublicPageLayout must use the shared PublicFooter component without page-specific variants')
}
if (!landing.includes("import PublicFooter from '../components/PublicFooter'") || !/<PublicFooter\s*\/>/.test(landing)) {
  throw new Error('Landing must use the shared PublicFooter component')
}
if (!landing.includes('pb-16 md:pb-0')) {
  throw new Error('Landing must keep mobile-safe footer wrapper spacing for sticky CTA')
}
const legacyLandingFooterPatterns = [
  /navigate\('\/tentang-kami'\)/,
  /navigate\('\/privasi'\)/,
  /navigate\('\/syarat'\)/,
  /navigate\('\/bantuan'\)/,
]
if (legacyLandingFooterPatterns.some(pattern => pattern.test(landing))) {
  throw new Error('Landing must not reintroduce a page-hardcoded footer')
}
if (publicFooter.includes('hasMobileStickyCta') || publicFooter.includes('bottomSafeArea') || publicFooter.includes('pb-24') || publicFooter.includes('md:pb-8')) {
  throw new Error('PublicFooter must not own Landing/sticky-CTA spacing; keep spacing in page wrappers')
}

// Mobile overlay regression guard: cookie consent must not cover the sticky mobile CTA.
if (!landing.includes('fixed inset-x-3 bottom-3 z-40')) {
  throw new Error('Landing sticky mobile CTA position changed; re-check cookie overlay spacing')
}
if (!cookieConsent.includes('bottom-24') || !cookieConsent.includes('md:bottom-4')) {
  throw new Error('Cookie consent must stay above mobile sticky CTA and reset near bottom on desktop')
}

// Visual smoke guard: prior Tailwind regressions must be caught on key public pages.
if (!packageJson.includes('test:visual') || !packageJson.includes('@playwright/test')) {
  throw new Error('Package scripts/dependencies must include Playwright visual smoke testing')
}
for (const required of ['390', '1440', "'/'", "'/signup'", "'/login'", "'/tentang-kami'", "'/bantuan'", "'/privasi'", "'/syarat'", "'/pengaturan-cookie'"]) {
  if (!visualSmoke.includes(required) && !playwrightConfig.includes(required)) {
    throw new Error(`Visual smoke tests missing required coverage marker: ${required}`)
  }
}
if (!visualSmoke.includes("expect(footerLabels).toEqual(['Tentang Kami', 'Privasi', 'Syarat', 'Bantuan', 'Pengaturan Cookie'])")) {
  throw new Error('Visual smoke tests must assert the approved footer nav order')
}
if (!visualSmoke.includes('landing-hero-navbar')) {
  throw new Error('Visual smoke tests must keep dedicated landing Hero/Navbar screenshots')
}

// Frontend-engineering guard: CI and route-level recovery must stay explicit.
for (const ciCheck of ['npm run lint', 'npm run check:icons', 'npm run check:public-pages', 'npm run typecheck', 'npm run build', 'npm run test:visual']) {
  if (!ciWorkflow.includes(ciCheck)) throw new Error(`CI workflow missing required frontend check: ${ciCheck}`)
}
if (!app.includes('resetKey={location.pathname}') || !app.includes('<RouteFrame />')) {
  throw new Error('Routes must stay wrapped by a pathname-reset RouteErrorBoundary')
}
if (!routeErrorBoundary.includes('componentDidUpdate') || !routeErrorBoundary.includes('RouteErrorState') || !routeErrorBoundary.includes('serviceWorker') || !routeErrorBoundary.includes('caches')) {
  throw new Error('RouteErrorBoundary must reset per route and keep stale cache/service-worker recovery')
}
if (!routeErrorState.includes('EmptyState') || !routeErrorState.includes('RouteLoadingState') || !routeErrorState.includes('Bersihkan cache & muat ulang')) {
  throw new Error('Route error/loading states must reuse shared EmptyState and keep recovery copy')
}
for (const eventMarker of ['FUNNEL_LANDING_CTA', 'SIGNUP_START', 'FIRST_LAHAN_CREATED', 'FIRST_PANEN_CREATED', 'FIRST_REPORT_READY']) {
  if (!analytics.includes(eventMarker)) throw new Error(`Analytics event catalog missing funnel marker: ${eventMarker}`)
}
if (!landing.includes('GAEvents.FUNNEL_LANDING_CTA') || !signup.includes('GAEvents.SIGNUP_START')) {
  throw new Error('Landing and signup must track the top of the analytics funnel')
}
if (!addLahan.includes('GAEvents.FIRST_LAHAN_CREATED') || !addPanen.includes('GAEvents.FIRST_PANEN_CREATED') || !laporanKeuanganPage.includes('GAEvents.FIRST_REPORT_READY')) {
  throw new Error('Core activation pages must track first lahan, first panen, and first report funnel milestones')
}

// Trial signup friction guard: signup should remain a simple trial conversion form with auto-generated username.
if (!signup.includes('buildTrialUsername') || !signup.includes('SUBSCRIPTION_TRIAL_DAYS') || !signup.includes('Bawa kebun kamu ke dalam satu aplikasi.')) {
  throw new Error('Signup must keep auto-generated username, trial days messaging, and the UX headline')
}
if (signup.includes('No. Handphone') || signup.includes('>Username</label>')) {
  throw new Error('Signup reintroduced high-friction phone/username fields')
}
if (!profile.includes('Belum ditambahkan') || !profile.includes('Kelola informasi akun')) {
  throw new Error('Profile must support progressive onboarding: show phone as optional and let user add it later')
}
if (!help.includes('Bagaimana jika sinyal di kebun sering lemah?') || !help.includes('Apakah data aman jika saya ganti HP?')) {
  throw new Error('Help FAQ must cover low-signal rural usage and data safety when changing phones')
}

// Protected-page readability guard: form pages should expose plain-language helper content.
if (!formPage.includes('Tips pengisian') || !formPage.includes('stats.map') || !formPage.includes('insights.map')) {
  throw new Error('Protected form pages must render farmer-friendly stats and tips copy')
}
if (!dashboard.includes('Ringkasan ini dibuat lebih sederhana untuk pengguna baru') || !onboardingWizard.includes('Langkah {step + 1} dari {STEPS.length}')) {
  throw new Error('Dashboard must keep plain-language guidance and first-run onboarding wizard')
}
for (const dashboardMarker of ['Hari ini yang perlu dilihat', 'Data masih kosong', 'Catat Panen Pertama', 'Catat Biaya Perawatan']) {
  if (!dashboard.includes(dashboardMarker)) throw new Error(`Dashboard missing first-run/empty-state marker: ${dashboardMarker}`)
}
for (const [file, contents] of mobileSensitiveForms) {
  if (contents.includes('grid grid-cols-2 gap-3')) {
    throw new Error(`${file} has a mobile-sensitive two-column form grid; use grid-cols-1 sm:grid-cols-2`)
  }
  if (file.includes('/Add') && !contents.includes('Contoh:')) {
    throw new Error(`${file} must include example placeholders for older mobile users`)
  }
}
if (mobileSensitiveForms.some(([file, contents]) => file.includes('AddPanen') && contents.includes('Input data panen'))) {
  throw new Error('AddPanen form title/subtitle must use field-friendly copy instead of "Input data"')
}
if (!mobileSensitiveForms.some(([file, contents]) => file.includes('AddPanen') && contents.includes('Isi tanggal panen, berat, harga, dan biaya dari hasil timbang.'))) {
  throw new Error('AddPanen must keep copywriter-approved field-friendly helper copy')
}
if (!mobileSensitiveForms.some(([file, contents]) => file.includes('AddPendapatan') && contents.includes('Isi hasil timbang, uang masuk, dan biaya agar hasil bersih terlihat.'))) {
  throw new Error('AddPendapatan must keep copywriter-approved field-friendly helper copy')
}
for (const addAnotherFile of ['AddLahan', 'AddPanen', 'AddPerawatan', 'AddPendapatan', 'Lahan', 'Panen', 'Perawatan', 'Pendapatan']) {
  const entry = mobileSensitiveForms.find(([file]) => file.includes(`${addAnotherFile}.tsx`))
  if (!entry?.[1].includes('Simpan & Tambah')) throw new Error(`${addAnotherFile} must support save confirmation plus add-another action`)
}
for (const [file, contents] of mobileSensitiveForms) {
  if (contents.includes("linear-gradient(135deg")) {
    throw new Error(`${file} reintroduced inline submit-button gradient styles; use app-submit-button classes`)
  }
}
if (!dashboard.includes('AppMetricIcon') || /icon:\s*'[🌿💰🧾📈📉🌾]/u.test(dashboard)) {
  throw new Error('Dashboard metric cards must use shared SVG AppMetricIcon instead of emoji metric icons')
}
if (!laporanKeuangan.includes('AppMetricIcon') || /[🌿💰🧾📈📉🌾]/u.test(laporanKeuangan)) {
  throw new Error('Laporan Keuangan metric and empty states must use shared SVG AppMetricIcon instead of emoji icons')
}
for (const scheduleMarker of ['Pemupukan 3 bulanan', 'Semprot rumput bulanan', 'Pruning 6 bulanan', 'Rotasi NPK', 'pengingat otomatis']) {
  if (!jadwalPerawatan.includes(scheduleMarker)) throw new Error(`Jadwal Perawatan missing clarity/preset marker: ${scheduleMarker}`)
}
for (const priceMarker of ['Sumber data', 'Rata-rata semua sumber', 'timeAgo']) {
  if (!hargaTbs.includes(priceMarker)) throw new Error(`Harga TBS missing source freshness marker: ${priceMarker}`)
}
for (const fertilizerMarker of ['estimasi awal', 'agronom', 'Nitrogen', 'Fosfor', 'Kalium']) {
  if (!kalkulatorPupuk.includes(fertilizerMarker)) throw new Error(`Kalkulator Pupuk missing disclaimer/plain-language nutrient marker: ${fertilizerMarker}`)
}
for (const reportMarker of ['QA unduhan mobile/PWA/browser', 'exportStatus', 'role="status"', 'terunduh', 'sudah terunduh']) {
  if (!laporanKeuangan.includes(reportMarker)) throw new Error(`Laporan Keuangan missing mobile/export state marker: ${reportMarker}`)
}
for (const notFoundMarker of ['to="/"', 'to="/login"', 'to="/bantuan"', 'to="/signup"']) {
  if (!notFound.includes(notFoundMarker)) throw new Error(`NotFound missing recovery link marker: ${notFoundMarker}`)
}


// Accessibility guard: public pages need automated axe coverage, linked errors, labels, contrast, and touch target checks.
if (!packageJson.includes('"@axe-core/playwright"') || !packageJson.includes('"test:a11y"')) {
  throw new Error('Accessibility smoke tests must use @axe-core/playwright and expose npm run test:a11y')
}
for (const required of ['AxeBuilder', "'/'", "'/signup'", "'/login'", "'/tentang-kami'", "'/bantuan'", "'/privasi'", "'/syarat'", "'/pengaturan-cookie'", 'toBeGreaterThanOrEqual(44)']) {
  if (!accessibilitySmoke.includes(required)) throw new Error(`Accessibility smoke test missing required marker: ${required}`)
}
if (!ciWorkflow.includes('npm run test:a11y')) {
  throw new Error('CI workflow missing accessibility smoke test')
}
if (/text-white\/6[0-9]/.test(publicCopy)) {
  throw new Error('Public-page body/link copy must keep contrast at text-white/70 or stronger on dark backgrounds')
}
for (const [file, contents] of [
  ['src/pages/About.tsx', about],
  ['src/pages/Signup.tsx', signup],
  ['src/pages/Login.tsx', fs.readFileSync('src/pages/Login.tsx', 'utf8')],
  ['src/pages/ResetPassword.tsx', resetPassword],
]) {
  if (contents.includes('aria-invalid') && !contents.includes('aria-describedby')) {
    throw new Error(`${file} has aria-invalid fields without aria-describedby-linked error/help text`)
  }
}
for (const [file, contents] of [
  ['src/pages/Signup.tsx', signup],
  ['src/pages/Login.tsx', fs.readFileSync('src/pages/Login.tsx', 'utf8')],
  ['src/pages/ResetPassword.tsx', resetPassword],
]) {
  if (!contents.includes("aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}") && !(contents.includes('AuthPasswordToggle') && authLayout.includes("aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}"))) {
    throw new Error(`${file} password visibility button needs an accessible label`)
  }
}

// Legal readability guard: older mobile users need a quick-read layer before dense legal detail.

// Legal/compliance guard: privacy contact, timelines, cookie preferences, and processor status must stay visible.
for (const marker of ['privacy@sawithub.com', '7 hari kerja', '30 hari kalender', 'vendor/subprocessor bernama', 'Pengaturan cookie']) {
  if (!publicCopy.includes(marker)) throw new Error(`Public legal/compliance copy missing marker: ${marker}`)
}
if (!fs.readFileSync('src/constants/cookieConsent.ts', 'utf8').includes('COOKIE_SETTINGS_EVENT') || !publicFooterLinks.includes('/pengaturan-cookie') || !cookieSettingsPage.includes('COOKIE_SETTINGS_EVENT')) {
  throw new Error('Cookie preference management must be linked from the public footer and reopenable from /pengaturan-cookie')
}

if (!terms.includes('Baca cepat untuk pengguna baru') || !privacy.includes('Baca cepat tentang data Anda')) {
  throw new Error('Terms and Privacy pages must keep mobile-friendly quick-read sections')
}


// Page-specific review implementation guard: latest public-page recommendations must stay implemented.
for (const aboutMarker of ['Siapa di balik SawitHub', 'Sumatra dan Kalimantan', '1–2 hari kerja']) {
  if (!about.includes(aboutMarker)) throw new Error(`About page missing page-specific marker: ${aboutMarker}`)
}
for (const helpMarker of ['Panduan 3 langkah', 'Contoh screenshot', 'Buka fitur Lahan setelah login', 'Bagaimana jika sinyal di kebun sering lemah?', 'Apakah data aman jika saya ganti HP?']) {
  if (!help.includes(helpMarker)) throw new Error(`Help page missing page-specific marker: ${helpMarker}`)
}
for (const termsMarker of ['Sebelum billing aktif', 'Perpanjangan langganan', 'Pembatalan sebelum periode berikutnya', 'Refund bila ada kesalahan penagihan', 'Invoice dan bukti pembayaran', 'Sengketa pembayaran']) {
  if (!terms.includes(termsMarker)) throw new Error(`Terms page missing future billing marker: ${termsMarker}`)
}
for (const authMarker of ['function AuthLayout', 'function AuthInput', 'function AuthSubmitButton', 'function AuthPasswordToggle']) {
  if (!authLayout.includes(authMarker)) throw new Error(`Shared auth component missing marker: ${authMarker}`)
}
if (!login.includes('Data kebun kamu aman') || !login.includes('AuthLayout') || !login.includes('AuthSubmitButton')) {
  throw new Error('Login must use shared auth components and show security reassurance microcopy')
}
if (!signup.includes('Saya setuju dengan') || !signup.includes('Privasi') || !signup.includes('No. WhatsApp')) {
  throw new Error('Signup must keep explicit consent copy and WhatsApp phone field')
}
for (const [file, contents] of [['src/pages/Login.tsx', login], ['src/pages/Signup.tsx', signup]]) {
  if (contents.includes('onMouseOver') || contents.includes('onMouseOut')) {
    throw new Error(`${file} must not use inline hover/mouseout patterns after AuthLayout refactor`)
  }
}

console.log('[public-pages] OK: routes, sitemap, design tokens, visual smoke setup, logo assets, cookie consent, manifest assets, conversion flow, frontend engineering guards, readability guards, and campaign copy validated.')
