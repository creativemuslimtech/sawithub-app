/** PM-01: canonical local flag; migrates legacy checklist key once. */
const ONBOARDING_DONE_KEY = 'sawithub_onboarding_done'
const LEGACY_CHECKLIST_KEY = 'sawithub_onboarding_checklist_done'

export function migrateOnboardingLocalStorage(): void {
  if (typeof window === 'undefined') return
  if (window.localStorage.getItem(ONBOARDING_DONE_KEY) === '1') return
  if (window.localStorage.getItem(LEGACY_CHECKLIST_KEY) === '1') {
    window.localStorage.setItem(ONBOARDING_DONE_KEY, '1')
    window.localStorage.removeItem(LEGACY_CHECKLIST_KEY)
  }
}

export function isOnboardingDoneLocal(): boolean {
  migrateOnboardingLocalStorage()
  return typeof window !== 'undefined' && window.localStorage.getItem(ONBOARDING_DONE_KEY) === '1'
}

export function setOnboardingDoneLocal(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ONBOARDING_DONE_KEY, '1')
  window.localStorage.removeItem(LEGACY_CHECKLIST_KEY)
}
