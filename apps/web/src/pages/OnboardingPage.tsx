import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConsentScreen } from '@/components/consent/ConsentScreen'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Logo } from '@/components/brand/Logo'
import { AppFooter } from '@/components/layout/AppFooter'
import { PageContainer, PageMain, SurfacePanel, PageHero } from '@/components/layout/PageContainer'
import { ensureAuth } from '@/lib/supabase'
import { saveProfile } from '@/lib/storage'
import { useAuthStore } from '@/store/auth-store'

type OnboardingStep = 'consent' | 'profile'

export function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('consent')
  const [userId, setUserId] = useState<string | null>(null)
  const navigate = useNavigate()
  const setAuthUserId = useAuthStore((s) => s.setUserId)
  const setProfile = useAuthStore((s) => s.setProfile)

  const handleConsent = async () => {
    const id = await ensureAuth()
    setUserId(id)
    setAuthUserId(id)
    setStep('profile')
  }

  const handleProfile = async (profile: Parameters<typeof saveProfile>[0]) => {
    await saveProfile(profile)
    setProfile(profile)
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
          title={step === 'consent' ? 'เข้าสู่ระบบ' : 'ตั้งค่าโปรไฟล์'}
          subtitle={
            step === 'consent'
              ? 'เข้าสู่แดชบอร์ด BreathPrint ของคุณ'
              : 'ข้อมูลสุขภาพพื้นฐานสำหรับการคัดกรอง'
          }
        />
        <SurfacePanel>
          {step === 'consent' && <ConsentScreen onAccept={handleConsent} />}
          {step === 'profile' && userId && (
            <ProfileForm userId={userId} onSubmit={handleProfile} />
          )}
        </SurfacePanel>
      </PageMain>
      <AppFooter />
    </PageContainer>
  )
}
