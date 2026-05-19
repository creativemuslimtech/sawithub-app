import { readFileSync } from 'node:fs'

const VERCEL_CONFIG_PATH = new URL('../vercel.json', import.meta.url)

const ALLOWED_HOSTS = {
  production: 'backend-production-e631.up.railway.app',
  staging: 'staging.backend.sawithub.com',
}

/** User app /api must never target the admin backend. */
const ADMIN_BACKEND_FORBIDDEN = 'admin-backend-sawithub-production.up.railway.app'

function fail(message) {
  console.error(`\n[backend-target-guard] ${message}\n`)
  process.exit(1)
}

/**
 * - VITE_ENVIRONMENT=staging|production when set.
 * - Else infer from vercel.json /api rewrite first (committed file wins over VERCEL_ENV).
 *   Many projects keep vercel.json identical to vercel.staging.json for Preview *and*
 *   Production Vercel until they explicitly copy vercel.production.json.
 * - VERCEL_ENV=preview|development → staging if rewrite is ambiguous.
 * - Default staging (matches default lane when vercel.json == vercel.staging.json).
 */
function resolveEnv(config) {
  const explicit = process.env.VITE_ENVIRONMENT
  if (explicit === 'staging' || explicit === 'production') return explicit

  const rewrites = Array.isArray(config.rewrites) ? config.rewrites : []
  const apiRewrite = rewrites.find((entry) => entry?.source === '/api/(.*)')
  const dest = String(apiRewrite?.destination || '')
  if (dest.includes(ALLOWED_HOSTS.staging)) return 'staging'
  if (dest.includes(ALLOWED_HOSTS.production)) return 'production'

  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv === 'preview' || vercelEnv === 'development') return 'staging'

  return 'staging'
}

let raw
try {
  raw = readFileSync(VERCEL_CONFIG_PATH, 'utf8')
} catch (error) {
  fail(`Tidak bisa membaca vercel.json: ${error instanceof Error ? error.message : String(error)}`)
}

let config
try {
  config = JSON.parse(raw)
} catch (error) {
  fail(`vercel.json bukan JSON valid: ${error instanceof Error ? error.message : String(error)}`)
}

const ENV = resolveEnv(config)
const REQUIRED_HOST = ALLOWED_HOSTS[ENV] || ALLOWED_HOSTS.production

if (raw.includes(ADMIN_BACKEND_FORBIDDEN)) {
  fail(
    `Target backend salah terdeteksi ("${ADMIN_BACKEND_FORBIDDEN}"). Wajib pakai backend publik SawitHub (${REQUIRED_HOST} untuk ${ENV}).`,
  )
}

const rewrites = Array.isArray(config.rewrites) ? config.rewrites : []
const apiRewrite = rewrites.find((entry) => entry?.source === '/api/(.*)')
if (!apiRewrite?.destination || !String(apiRewrite.destination).includes(REQUIRED_HOST)) {
  fail('Rewrite /api/(.*) belum mengarah ke backend publik yang benar.')
}

const headers = Array.isArray(config.headers) ? config.headers : []
const cspHeader = headers
  .flatMap((entry) => (Array.isArray(entry?.headers) ? entry.headers : []))
  .find((header) => header?.key === 'Content-Security-Policy')

if (!cspHeader?.value || !String(cspHeader.value).includes(REQUIRED_HOST)) {
  fail('CSP connect-src belum mengizinkan host backend publik yang benar.')
}

/** Lane templates must never cross wires: staging template → staging API only, production → prod only. */
function readApiRewriteDestination(fileUrl) {
  let templateRaw
  try {
    templateRaw = readFileSync(fileUrl, 'utf8')
  } catch (error) {
    fail(`Tidak bisa membaca ${fileUrl.pathname}: ${error instanceof Error ? error.message : String(error)}`)
  }
  let templateConfig
  try {
    templateConfig = JSON.parse(templateRaw)
  } catch (error) {
    fail(`Bukan JSON valid: ${fileUrl.pathname}`)
  }
  const templateRewrites = Array.isArray(templateConfig.rewrites) ? templateConfig.rewrites : []
  const templateApi = templateRewrites.find((entry) => entry?.source === '/api/(.*)')
  return String(templateApi?.destination || '')
}

const STAGING_TEMPLATE = new URL('../vercel.staging.json', import.meta.url)
const PRODUCTION_TEMPLATE = new URL('../vercel.production.json', import.meta.url)

const stagingTemplateDest = readApiRewriteDestination(STAGING_TEMPLATE)
if (!stagingTemplateDest.includes(ALLOWED_HOSTS.staging)) {
  fail('vercel.staging.json: rewrite /api/(.*) wajib mengarah ke staging backend.')
}
if (stagingTemplateDest.includes(ALLOWED_HOSTS.production)) {
  fail('vercel.staging.json: rewrite /api tidak boleh mengarah ke host production.')
}

const productionTemplateDest = readApiRewriteDestination(PRODUCTION_TEMPLATE)
if (!productionTemplateDest.includes(ALLOWED_HOSTS.production)) {
  fail('vercel.production.json: rewrite /api/(.*) wajib mengarah ke production backend.')
}
if (productionTemplateDest.includes(ALLOWED_HOSTS.staging)) {
  fail('vercel.production.json: rewrite /api tidak boleh mengarah ke staging backend.')
}

console.log(`[backend-target-guard] OK: vercel.json menggunakan backend untuk ${ENV} (${REQUIRED_HOST}).`)
