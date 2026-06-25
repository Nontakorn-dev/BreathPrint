import { Link } from 'react-router-dom'
import { CONTENT_CLASS } from '@/components/layout/PageContainer'
import { useT } from '@/i18n'

export function AppFooter() {
  const { t } = useT()

  return (
    <footer className="mt-auto border-t border-line/80 bg-surface/60 backdrop-blur-sm">
      <div className={CONTENT_CLASS}>
        <div className="py-10 lg:py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-extrabold text-brand font-display text-base mb-2">BreathPrint</p>
            <p className="text-muted text-xs leading-relaxed max-w-[220px]">
              {t('nav.footerTagline')}
            </p>
          </div>
          <div>
            <p className="font-bold text-ink mb-3 text-xs uppercase tracking-wide">{t('nav.footerProducts')}</p>
            <ul className="space-y-2 text-muted text-xs">
              <li><Link to="/screening" className="hover:text-brand transition-colors">{t('nav.startScreening')}</Link></li>
              <li><Link to="/history" className="hover:text-brand transition-colors">{t('nav.history')}</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-ink mb-3 text-xs uppercase tracking-wide">{t('nav.footerAccount')}</p>
            <ul className="space-y-2 text-muted text-xs">
              <li><Link to="/settings" className="hover:text-brand transition-colors">{t('nav.settings')}</Link></li>
              <li><Link to="/onboarding" className="hover:text-brand transition-colors">{t('nav.footerLogin')}</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-ink mb-3 text-xs uppercase tracking-wide">{t('nav.footerLegal')}</p>
            <ul className="space-y-2 text-muted text-xs">
              <li><span>{t('nav.footerNotDiagnosis')}</span></li>
              <li><span>{t('nav.footerPdpa')}</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-5 text-center text-xs text-muted">
          <p>
            <strong className="text-sub">{t('nav.footerDisclaimerLabel')}</strong> {t('nav.footerDisclaimer')}
          </p>
          <p className="mt-1">{t('nav.footerCopyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  )
}
