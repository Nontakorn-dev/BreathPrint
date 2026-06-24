import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, Menu, X, LogOut } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { useThemeStore } from '@/store/theme-store'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/history', label: 'ประวัติ' },
  { to: '/settings', label: 'ตั้งค่า' },
]

export function AppHeader() {
  const { locale, theme, setLocale, toggleTheme } = useThemeStore()
  const profile = useAuthStore((s) => s.profile)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    clearAuth()
    localStorage.removeItem('breathprint_user_id')
    navigate('/onboarding')
  }

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Logo />

          <div className="hidden sm:flex items-center gap-2">
            <div className="flex rounded-full border border-line bg-panel p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLocale('th')}
                className={cn(
                  'rounded-full px-3 py-1 transition-colors',
                  locale === 'th' ? 'bg-brand text-white' : 'text-muted hover:text-ink',
                )}
              >
                TH
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={cn(
                  'rounded-full px-3 py-1 transition-colors',
                  locale === 'en' ? 'bg-brand text-white' : 'text-muted hover:text-ink',
                )}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-sub hover:text-brand transition-colors"
              aria-label={theme === 'light' ? 'สลับเป็นโหมดมืด' : 'สลับเป็นโหมดสว่าง'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {profile && (
              <span className="text-sm text-sub hidden md:inline">
                อายุ {profile.age} ปี
              </span>
            )}

            <Link to="/screening">
              <Button size="sm" className="rounded-full px-5 shadow-md shadow-brand/20">
                เริ่มคัดกรอง
              </Button>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-muted hover:text-bad transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>

          <button
            type="button"
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-line"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="เมนู"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="sm:hidden pb-4 space-y-3 border-t border-line pt-3 animate-fade-up">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 rounded-full border border-line bg-panel p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLocale('th')}
                  className={cn(
                    'flex-1 rounded-full py-1.5',
                    locale === 'th' ? 'bg-brand text-white' : 'text-muted',
                  )}
                >
                  TH
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={cn(
                    'flex-1 rounded-full py-1.5',
                    locale === 'en' ? 'bg-brand text-white' : 'text-muted',
                  )}
                >
                  EN
                </button>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            </div>
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
            <Link to="/screening" onClick={() => setMenuOpen(false)}>
              <Button fullWidth className="rounded-full">เริ่มคัดกรอง</Button>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted w-full py-2"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
