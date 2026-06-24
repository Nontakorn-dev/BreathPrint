import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Locale = 'th' | 'en'
type Theme = 'light' | 'dark'

interface ThemeState {
  locale: Locale
  theme: Theme
  setLocale: (locale: Locale) => void
  toggleTheme: () => void
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      locale: 'th',
      theme: 'light',
      setLocale: (locale) => set({ locale }),
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        applyTheme(next)
        set({ theme: next })
      },
    }),
    {
      name: 'breathprint-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)

// Apply on first load before rehydration
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('breathprint-theme')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      applyTheme(parsed?.state?.theme ?? 'light')
    } catch {
      applyTheme('light')
    }
  }
}
