/**
 * Google Analytics 4 Utility Functions
 *
 * Usage:
 * import { trackEvent, GAEvents } from './utils/analytics';
 * trackEvent(GAEvents.CLICK_SIGNUP, { button_location: 'hero' });
 */

import eventsManifest from '../analytics/events.json' with { type: 'json' }

/** Registered names from `src/analytics/events.json` (DE-01); use plain string for dynamic events. */
export type AnalyticsEventName = (typeof eventsManifest.events)[number]

declare global {
  interface Window {
    gtag?: (...args: GtagArgs) => void;
    dataLayer?: unknown[];
  }
}

type AnalyticsValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly AnalyticsValue[]
  | { readonly [key: string]: AnalyticsValue }

type AnalyticsParams = Record<string, AnalyticsValue>

type GtagArgs =
  | ['event', string, AnalyticsParams?]
  | ['set', string, AnalyticsParams]
  | ['set', AnalyticsParams]

/**
 * Send event to Google Analytics 4
 * @param eventName - Name of the event
 * @param eventParams - Additional parameters
 */
export function trackEvent(
  eventName: AnalyticsEventName | (string & {}),
  eventParams?: AnalyticsParams
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);

    // Debug log in development (remove or comment out in production)
    if (import.meta.env.DEV) {
      console.group('📊 GA4 Event');
      console.log('Event:', eventName);
      console.log('Params:', eventParams);
      console.groupEnd();
    }
  } else {
    if (import.meta.env.DEV) {
      console.warn('⚠️ GA4 not loaded - Event not tracked:', eventName);
    }
  }
}

/**
 * Track page view
 * @param path - Page path
 * @param title - Page title
 */
export function trackPageView(path: string, title?: string) {
  trackEvent('page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

/**
 * Set user properties
 * @param properties - User properties to set
 */
export function setUserProperties(properties: AnalyticsParams) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
}

/**
 * Set user ID (for logged in users). Pass opaque internal ids only — never email (SEC-09).
 * @param userId - Unique user identifier
 */
export function setUserId(userId: string | null) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', { user_id: userId });
  }
}

/**
 * Predefined GA4 event names
 * Use these constants for consistency across the app
 */
export const GAEvents = {
  // ========================================
  // User Actions - Clicks
  // ========================================
  CLICK_CTA: 'click_cta',
  CLICK_SIGNUP: 'click_signup_button',
  CLICK_LOGIN: 'click_login_button',
  CLICK_LOGOUT: 'click_logout_button',
  CLICK_HELP: 'click_help_button',
  CLICK_CONTACT: 'click_contact',
  FUNNEL_LANDING_CTA: 'funnel_landing_cta',

  // ========================================
  // Form Events
  // ========================================
  FORM_START: 'form_start',
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',
  FORM_COMPLETE: 'form_complete',
  CONTACT_SUBMIT: 'contact_submit',

  // ========================================
  // User Journey - Authentication
  // ========================================
  SIGNUP_SUCCESS: 'sign_up', // GA4 recommended event
  SIGNUP_START: 'signup_start',
  LOGIN_SUCCESS: 'login', // GA4 recommended event
  LOGOUT_SUCCESS: 'logout',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  PASSWORD_RESET_SUCCESS: 'password_reset_success',

  // ========================================
  // Feature Usage - Core Features
  // ========================================
  ADD_LAHAN: 'add_lahan',
  FIRST_LAHAN_CREATED: 'first_lahan_created',
  EDIT_LAHAN: 'edit_lahan',
  DELETE_LAHAN: 'delete_lahan',

  ADD_PANEN: 'add_panen',
  FIRST_PANEN_CREATED: 'first_panen_created',
  EDIT_PANEN: 'edit_panen',
  DELETE_PANEN: 'delete_panen',

  ADD_PERAWATAN: 'add_perawatan',
  EDIT_PERAWATAN: 'edit_perawatan',
  DELETE_PERAWATAN: 'delete_perawatan',

  ADD_JADWAL: 'add_jadwal_perawatan',
  EDIT_JADWAL: 'edit_jadwal_perawatan',
  DELETE_JADWAL: 'delete_jadwal_perawatan',

  // ========================================
  // Feature Usage - Reports & Exports
  // ========================================
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_LAPORAN: 'view_laporan_keuangan',
  FIRST_REPORT_READY: 'first_report_ready',
  FILTER_LAPORAN: 'filter_laporan',

  EXPORT_EXCEL: 'export_excel',
  EXPORT_PDF: 'export_pdf',
  SEND_EMAIL: 'send_email',
  SUBSCRIPTION_GATE_VIEW: 'subscription_gate_view',

  /** Dashboard trial strip CTA → /subscription */
  TRIAL_BANNER_CLICK: 'trial_banner_click',
  /** User initiated billing checkout (redirect to payment provider) */
  CHECKOUT_START: 'checkout_start',

  // ========================================
  // Feature Usage - Calculator
  // ========================================
  USE_CALCULATOR: 'use_kalkulator_pupuk',
  CALCULATE_PUPUK: 'calculate_pupuk',
  AUTO_FILL_CALCULATOR: 'auto_fill_calculator_data',

  // ========================================
  // Feature Usage - Harga TBS
  // ========================================
  VIEW_HARGA_TBS: 'view_harga_tbs',
  UPDATE_HARGA_TBS: 'update_harga_tbs',

  // ========================================
  // Engagement
  // ========================================
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  VIDEO_PLAY: 'video_play',
  VIDEO_COMPLETE: 'video_complete',

  // ========================================
  // Errors
  // ========================================
  ERROR_API: 'error_api',
  ERROR_NETWORK: 'error_network',
  ERROR_VALIDATION: 'error_validation',
  ERROR_UNKNOWN: 'error_unknown',

  // ========================================
  // Search
  // ========================================
  SEARCH: 'search',
  SEARCH_RESULTS: 'search_results',

  // ========================================
  // Help & Support
  // ========================================
  VIEW_HELP: 'view_help',
  CONTACT_SUPPORT: 'contact_support',

} as const;

/**
 * Predefined parameter keys for consistency
 */
export const GAParams = {
  // Location parameters
  BUTTON_LOCATION: 'button_location',
  PAGE: 'page',
  SECTION: 'section',

  // Form parameters
  FORM_NAME: 'form_name',
  ERROR_MESSAGE: 'error_message',

  // Feature parameters
  FEATURE_NAME: 'feature_name',
  ACTION_TYPE: 'action_type',

  // Report parameters
  REPORT_TYPE: 'report_type',
  DATE_RANGE: 'date_range',
  EXPORT_FORMAT: 'export_format',

  // User parameters
  USER_TYPE: 'user_type',
  USER_ROLE: 'user_role',

  // Performance parameters
  LOAD_TIME: 'load_time',
  RESPONSE_TIME: 'response_time',

} as const;

/**
 * Helper function to track errors
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  additionalParams?: AnalyticsParams
) {
  trackEvent(GAEvents.ERROR_UNKNOWN, {
    error_type: errorType,
    error_message: errorMessage,
    ...additionalParams,
  });
}

/**
 * Helper function to track feature usage
 */
export function trackFeatureUsage(
  featureName: string,
  actionType: 'view' | 'add' | 'edit' | 'delete' | 'export',
  additionalParams?: AnalyticsParams
) {
  trackEvent(`${actionType}_${featureName}`, {
    feature_name: featureName,
    action_type: actionType,
    ...additionalParams,
  });
}

/**
 * Helper function to track timing
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
) {
  trackEvent('timing_complete', {
    timing_category: category,
    timing_var: variable,
    timing_value: value,
    timing_label: label,
  });
}

// Export for debugging
export function checkGAStatus() {
  if (typeof window !== 'undefined') {
    console.log('GA4 Status:', {
      gtag_loaded: typeof window.gtag !== 'undefined',
      dataLayer_exists: Array.isArray(window.dataLayer),
      dataLayer_length: window.dataLayer?.length || 0,
    });
  }
}
