import { readFileSync } from 'node:fs'

const VERCEL_CONFIG_PATH = new URL('../vercel.json', import.meta.url)

const REQUIRED = {
  production: {
    appHost: 'adminpanel.sawithub.com',
    backendHost: 'admin-backend-sawithub-production.up.railway.app',
  },
  staging: {
    appHost: 'staging.adminpanel.sawithub.com',
    backendHost: 'staging.admin.backend.sawithub.com',
  },
}

function fail(message) {
  console.error(`\n[admin-backend-target-guard] ${message}\n`)
  process.exit(1)
}

/**
 * - VITE_ENVIRONMENT=staging|production when set (e.g. local .env.production).
 * - Else infer from vercel.json /api rewrite first (committed file wins over VERCEL_ENV).
 *   Production Vercel builds often still commit vercel.json == vercel.staging.json until
 *   you run use-vercel-config.sh production.
 * - VERCEL_ENV=preview|development → staging if rewrite is ambiguous.
 * - Default staging.
 */
function resolveEnv(config) {
  const explicit = process.env.VITE_ENVIRONMENT
  if (explicit === 'staging' || explicit === 'production') return explicit

  const rewrites = Array.isArray(config.rewrites) ? config.rewrites : []
  const apiRewrite = rewrites.find((entry) => entry?.source === '/api/(.*)')
  const dest = String(apiRewrite?.destination || '')
  if (dest.includes(REQUIRED.staging.backendHost)) return 'staging'
  if (dest.includes(REQUIRED.production.backendHost)) return 'production'

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
const required = REQUIRED[ENV] || REQUIRED.production
const forbiddenBackendHosts =
  ENV === 'staging'
    ? [REQUIRED.production.backendHost, 'sawithub-backend-production-92d6.up.railway.app', 'staging.backend.sawithub.com']
    : ['sawithub-backend-production-92d6.up.railway.app', 'staging.backend.sawithub.com', REQUIRED.staging.backendHost]

for (const forbidden of forbiddenBackendHosts) {
  if (raw.includes(forbidden)) {
    fail(`Target backend salah terdeteksi ("${forbidden}"). Wajib pakai "${required.backendHost}" untuk ${ENV}.`)
  }
}

const rewrites = Array.isArray(config.rewrites) ? config.rewrites : []
const apiRewrite = rewrites.find((entry) => entry?.source === '/api/(.*)')
if (!apiRewrite?.destination || !String(apiRewrite.destination).includes(required.backendHost)) {
  fail('Rewrite /api/(.*) belum mengarah ke admin backend yang benar.')
}

const headers = Array.isArray(config.headers) ? config.headers : []
const cspHeader = headers
  .flatMap((entry) => (Array.isArray(entry?.headers) ? entry.headers : []))
  .find((header) => header?.key === 'Content-Security-Policy')

const csp = String(cspHeader?.value || '')
if (!csp.includes(required.backendHost)) {
  fail('CSP connect-src belum mengizinkan admin backend yang benar.')
}
if (!csp.includes(required.appHost)) {
  fail('CSP belum mengizinkan host admin frontend yang benar.')
}

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
  } catch {
    fail(`Bukan JSON valid: ${fileUrl.pathname}`)
  }
  const templateRewrites = Array.isArray(templateConfig.rewrites) ? templateConfig.rewrites : []
  const templateApi = templateRewrites.find((entry) => entry?.source === '/api/(.*)')
  return String(templateApi?.destination || '')
}

const STAGING_TEMPLATE = new URL('../vercel.staging.json', import.meta.url)
const PRODUCTION_TEMPLATE = new URL('../vercel.production.json', import.meta.url)

const stagingTemplateDest = readApiRewriteDestination(STAGING_TEMPLATE)
if (!stagingTemplateDest.includes(REQUIRED.staging.backendHost)) {
  fail('vercel.staging.json: rewrite /api/(.*) wajib mengarah ke staging admin backend.')
}
if (stagingTemplateDest.includes(REQUIRED.production.backendHost)) {
  fail('vercel.staging.json: rewrite /api tidak boleh mengarah ke production admin backend.')
}

const productionTemplateDest = readApiRewriteDestination(PRODUCTION_TEMPLATE)
if (!productionTemplateDest.includes(REQUIRED.production.backendHost)) {
  fail('vercel.production.json: rewrite /api/(.*) wajib mengarah ke production admin backend.')
}
if (productionTemplateDest.includes(REQUIRED.staging.backendHost)) {
  fail('vercel.production.json: rewrite /api tidak boleh mengarah ke staging admin backend.')
}

console.log(`[admin-backend-target-guard] OK: vercel.json menggunakan admin backend untuk ${ENV} (${required.backendHost}).`)
