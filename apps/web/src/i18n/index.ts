import { useThemeStore } from '@/store/theme-store'
import type { Bundle, Locale } from './types'
import { common } from './keys/common'
import { nav } from './keys/nav'
import { home } from './keys/home'
import { screening } from './keys/screening'
import { result } from './keys/result'
import { history } from './keys/history'
import { settings } from './keys/settings'
import { onboarding } from './keys/onboarding'
import { assistant } from './keys/assistant'

export type { Locale, Bundle } from './types'

/**
 * In-house i18n (no dependency). Locale lives in the theme-store (`useThemeStore`).
 * Usage:
 *   const { t } = useT()                       // inside components (reactive)
 *   t('home.welcome')                          // -> string
 *   t('home.userAge', { age: 45 })             // interpolation: "ผู้ใช้อายุ {age} ปี"
 *   translate('nav.home')                      // module-scope, non-reactive
 */
const bundles: Record<string, Bundle> = {
  common,
  nav,
  home,
  screening,
  result,
  history,
  settings,
  onboarding,
  assistant,
}

function resolve(
  locale: Locale,
  path: string,
  vars?: Record<string, string | number>,
): string {
  const [ns, ...rest] = path.split('.')
  const key = rest.join('.')
  const bundle = bundles[ns]
  let val: string | undefined
  if (bundle) val = (locale === 'en' ? bundle.en : bundle.th)[key] ?? bundle.th[key]
  if (val == null) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${path}`)
    return path
  }
  if (vars) {
    for (const k of Object.keys(vars)) val = val.replaceAll(`{${k}}`, String(vars[k]))
  }
  return val
}

export function useLocale(): Locale {
  return useThemeStore((s) => s.locale)
}

/** Reactive translator for use inside React components (re-renders on locale change). */
export function useT() {
  const locale = useLocale()
  return {
    locale,
    t: (path: string, vars?: Record<string, string | number>) => resolve(locale, path, vars),
  }
}

/** Non-reactive translator for module-scope code (reads current locale from the store). */
export function translate(path: string, vars?: Record<string, string | number>): string {
  return resolve(useThemeStore.getState().locale, path, vars)
}
