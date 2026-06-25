import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHero, SurfacePanel } from '@/components/layout/PageContainer'
import { DisclaimerBanner } from '@/components/results/DisclaimerBanner'
import { useAuthStore } from '@/store/auth-store'
import { getUserScreenings } from '@/lib/storage'
import { useT } from '@/i18n'

export function SettingsPage() {
  const { t } = useT()
  const profile = useAuthStore((s) => s.profile)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!profile) return
    setExporting(true)
    const sessions = await getUserScreenings(profile.id)
    const data = {
      profile,
      sessions: sessions.map(({ breathAudioBlob: _b, coughAudioBlob: _c, ...rest }) => rest),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `breathprint-export-${profile.id.slice(0, 8)}.json`
    a.click()
    setExporting(false)
  }

  const handleDelete = () => {
    if (
      confirm(
        t('settings.deleteConfirm'),
      )
    ) {
      localStorage.clear()
      indexedDB.deleteDatabase('breathprint')
      clearAuth()
      navigate('/onboarding')
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHero title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <DisclaimerBanner compact />

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {profile && (
          <SurfacePanel>
            <p className="section-label mb-1">{t('settings.accountLabel')}</p>
            <h3 className="text-lg font-bold text-ink mb-5">{t('settings.profileTitle')}</h3>
            <dl className="text-sm space-y-0">
              <div className="flex justify-between py-3.5 border-b border-line">
                <dt className="text-muted">{t('settings.age')}</dt>
                <dd className="font-semibold">{profile.age} {t('settings.ageUnit')}</dd>
              </div>
              <div className="flex justify-between py-3.5 border-b border-line">
                <dt className="text-muted">{t('settings.device')}</dt>
                <dd className="font-semibold">{profile.deviceModel}</dd>
              </div>
              <div className="flex justify-between py-3.5">
                <dt className="text-muted">{t('settings.consentedAt')}</dt>
                <dd className="font-semibold">
                  {new Date(profile.consentAt).toLocaleDateString('th-TH')}
                </dd>
              </div>
            </dl>
          </SurfacePanel>
        )}

        <SurfacePanel>
          <p className="section-label mb-1">{t('settings.pdpaLabel')}</p>
          <h3 className="text-lg font-bold text-ink mb-2">{t('settings.rightsTitle')}</h3>
          <p className="text-sm text-muted mb-6">
            {t('settings.rightsDesc')}
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="outline" fullWidth onClick={handleExport} disabled={exporting}>
              <Download className="h-4 w-4" />
              {t('settings.export')}
            </Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              {t('settings.deleteAll')}
            </Button>
          </div>
        </SurfacePanel>
      </div>
    </div>
  )
}
