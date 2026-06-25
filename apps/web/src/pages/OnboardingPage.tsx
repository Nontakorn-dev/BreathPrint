import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '@/i18n'
import { ConsentScreen } from '@/components/consent/ConsentScreen'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Logo } from '@/components/brand/Logo'
import { AppFooter } from '@/components/layout/AppFooter'
import { PageContainer, PageMain, SurfacePanel, PageHero } from '@/components/layout/PageContainer'
import { ensureAuth, upsertProfile, isSupabaseConfigured } from '@/lib/supabase'
import { saveProfile } from '@/lib/storage'
import { useAuthStore } from '@/store/auth-store'
import type { ConsentDecision } from '@/types'

type OnboardingStep = 'consent' | 'profile'

export function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('consent')
  const [userId, setUserId] = useState<string | null>(null)
  const [consent, setConsent] = useState<ConsentDecision | null>(null)
  const navigate = useNavigate()
  const setAuthUserId = useAuthStore((s) => s.setUserId)
  const setProfile = useAuthStore((s) => s.setProfile)
  const { t } = useT()

  const handleConsent = async (c: ConsentDecision) => {
    setConsent(c)
    const id = await ensureAuth()
    setUserId(id)
    setAuthUserId(id)
    setStep('profile')
  }

  const handleProfile = async (profile: Parameters<typeof saveProfile>[0]) => {
    await saveProfile(profile)
    setProfile(profile)
    if (isSupabaseConfigured) {
      try {
        await upsertProfile(profile)
      } catch {
        // non-fatal; will sync later from the first screening
      }
    }
    navigate('/')
  }

  return (
    <PageContainer>
      <header className="glass-nav">
        <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 lg:px-10 h-[4.25rem] flex items-center justify-center">
          <Logo />
        </div>
      </header>
      <PageMain narrow>
        <PageHero
          title={step === 'consent' ? t('onboarding.hero.consent.title') : t('onboarding.hero.profile.title')}
          subtitle={
            step === 'consent'
              ? t('onboarding.hero.consent.subtitle')
              : t('onboarding.hero.profile.subtitle')
          }
        />
        <SurfacePanel>
          {step === 'consent' && <ConsentScreen onAccept={handleConsent} />}
          {step === 'profile' && userId && (
            <ProfileForm userId={userId} consent={consent ?? undefined} onSubmit={handleProfile} />
          )}
        </SurfacePanel>
      </PageMain>
      <AppFooter />
    </PageContainer>
  )
}
