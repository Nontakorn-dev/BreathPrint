import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Moon, Sun, Menu, X, LogOut } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { CONTENT_CLASS } from '@/components/layout/PageContainer'
import { useThemeStore } from '@/store/theme-store'
import { useAuthStore } from '@/store/auth-store'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const { t } = useT()
  const { locale, theme, setLocale, toggleTheme } = useThemeStore()
  const profile = useAuthStore((s) => s.profile)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const NAV_LINKS = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/history', label: t('nav.history') },
    { to: '/settings', label: t('nav.settings') },
  ]

  const handleLogout = () => {
    clearAuth()
    localStorage.removeItem('breathprint_user_id')
    navigate('/onboarding')
  }

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className={CONTENT_CLASS}>
        <div className="flex h-[4.25rem] lg:h-[4.5rem] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    isActive ? 'text-brand bg-brand-light/60' : 'text-sub hover:text-ink hover:bg-panel',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            <div className="flex rounded-full border border-line bg-panel p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLocale('th')}
                className={cn(
                  'rounded-full px-3.5 py-1.5 transition-colors',
                  locale === 'th' ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-ink',
                )}
              >
                TH
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={cn(
                  'rounded-full px-3.5 py-1.5 transition-colors',
                  locale === 'en' ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-ink',
                )}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-sub hover:text-brand hover:border-brand/30 transition-all"
              aria-label={theme === 'light' ? t('nav.toggleDark') : t('nav.toggleLight')}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {profile && (
              <Link
                to="/settings"
                className="text-sm font-medium text-sub hover:text-brand transition-colors hidden xl:inline"
              >
                {t('nav.userAge', { age: profile.age })}
              </Link>
            )}

            <Link to="/screening">
              <Button size="sm" className="rounded-full px-6 shadow-lg shadow-brand/25">
                {t('nav.startScreening')}
              </Button>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-muted hover:text-bad transition-colors px-1"
            >
              {t('nav.logout')}
            </button>
          </div>

          <button
            type="button"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('nav.menu')}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-5 space-y-3 border-t border-line pt-4 animate-fade-up">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 text-sm font-medium text-sub"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex flex-1 rounded-full border border-line bg-panel p-0.5 text-xs font-bold">
                <button type="button" onClick={() => setLocale('th')} className={cn('flex-1 rounded-full py-2', locale === 'th' ? 'bg-brand text-white' : 'text-muted')}>TH</button>
                <button type="button" onClick={() => setLocale('en')} className={cn('flex-1 rounded-full py-2', locale === 'en' ? 'bg-brand text-white' : 'text-muted')}>EN</button>
              </div>
              <button type="button" onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-full border border-line">
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            </div>
            <Link to="/screening" onClick={() => setMenuOpen(false)}>
              <Button fullWidth className="rounded-full">{t('nav.startScreening')}</Button>
            </Link>
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted w-full py-2">
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
