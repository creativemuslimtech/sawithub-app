/**
 * Environment configuration.
 *
 * API: prefer same-origin `/api` (Vite dev proxy + Vercel rewrites from `vercel.json`, swapped from
 * `vercel.staging.json` vs `vercel.production.json` via `scripts/use-vercel-config.sh`). Set
 * `VITE_API_BASE_URL` only when you need an absolute URL.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Get app URL from environment variable or fallback to production
export const APP_URL = import.meta.env.VITE_APP_URL || 'https://www.sawithub.com';

export const PUBLIC_ASSET_BASE_URL = (
  import.meta.env.VITE_PUBLIC_ASSET_BASE_URL ||
  'https://sawithub-public-assets-660113312407-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/public'
).replace(/\/$/, '');

// Environment identifier
export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'production';

// Check if we're in production
export const IS_PRODUCTION = ENVIRONMENT === 'production';

// Check if we're in staging
export const IS_STAGING = ENVIRONMENT === 'staging';

// Check if we're in development
export const IS_DEVELOPMENT = import.meta.env.DEV;

/**
 * Get canonical URL for a given path
 * @param path - The path (e.g., '/tentang-kami')
 * @returns Full canonical URL
 */
export function getCanonicalUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Remove trailing slash from APP_URL if present
  const baseUrl = APP_URL.endsWith('/') ? APP_URL.slice(0, -1) : APP_URL;
  // Combine
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
}

/**
 * Get OG image URL
 * @param imagePath - The image path (e.g., '/og-about.png')
 * @returns Full image URL
 */
export function getOgImageUrl(imagePath: string): string {
  return getCanonicalUrl(imagePath);
}

export function getPublicAssetUrl(assetPath: string): string {
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${PUBLIC_ASSET_BASE_URL}${cleanPath}`;
}

export const PUBLIC_ASSETS = {
  branding: {
    logoMark: getPublicAssetUrl('/branding/logo-mark.png'),
    logoHorizontal: getPublicAssetUrl('/branding/logo-horizontal.svg'),
  },
  landing: {
    heroJpg: getPublicAssetUrl('/landing/sawit-hero-hd.jpg'),
    heroWebp: getPublicAssetUrl('/landing/sawit-hero-hd.webp'),
  },
} as const;

// Export configuration object for easy access
export const config = {
  api: {
    baseUrl: API_BASE_URL,
  },
  app: {
    url: APP_URL,
  },
  assets: {
    publicBaseUrl: PUBLIC_ASSET_BASE_URL,
  },
  environment: ENVIRONMENT,
  isDevelopment: IS_DEVELOPMENT,
  isProduction: IS_PRODUCTION,
  isStaging: IS_STAGING,
} as const;

export default config;
