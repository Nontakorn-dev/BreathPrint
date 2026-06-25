import { useState } from 'react'
import { useT } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { getDeviceModel } from '@/lib/utils'
import type { ConsentDecision, Sex, SmokingStatus, UserProfile } from '@/types'

interface ProfileFormProps {
  userId: string
  /** Consent decisions collected on the previous step (persisted into the profile). */
  consent?: ConsentDecision
  onSubmit: (profile: UserProfile) => void
}

export function ProfileForm({ userId, consent, onSubmit }: ProfileFormProps) {
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<Sex>('female')
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>('never')
  const [error, setError] = useState<string | null>(null)
  const { t } = useT()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ageNum = parseInt(age, 10)
    if (!ageNum || ageNum < 18 || ageNum > 100) {
      setError(t('onboarding.profile.ageError'))
      return
    }

    onSubmit({
      id: userId,
      age: ageNum,
      sex,
      smokingStatus,
      deviceModel: getDeviceModel(),
      consentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      consentResearch: consent?.consentResearch,
      consentPdpa: consent?.consentPdpa,
      consentAudio: consent?.consentAudio,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-sub">
        {t('onboarding.profile.intro')}
        <span className="block mt-1 text-xs text-muted">{t('onboarding.profile.device')}: {getDeviceModel()}</span>
      </p>

      <div className="space-y-4">
        <Input
          id="age"
          label={t('onboarding.profile.ageLabel')}
          type="number"
          min={18}
          max={100}
          placeholder={t('onboarding.profile.agePlaceholder')}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          error={error ?? undefined}
          required
        />
        <Select
          id="sex"
          label={t('onboarding.profile.sexLabel')}
          value={sex}
          onChange={(e) => setSex(e.target.value as Sex)}
          options={[
            { value: 'female', label: t('onboarding.profile.sex.female') },
            { value: 'male', label: t('onboarding.profile.sex.male') },
            { value: 'other', label: t('onboarding.profile.sex.other') },
          ]}
        />
        <Select
          id="smoking"
          label={t('onboarding.profile.smokingLabel')}
          value={smokingStatus}
          onChange={(e) => setSmokingStatus(e.target.value as SmokingStatus)}
          options={[
            { value: 'never', label: t('onboarding.profile.smoking.never') },
            { value: 'former', label: t('onboarding.profile.smoking.former') },
            { value: 'current', label: t('onboarding.profile.smoking.current') },
          ]}
        />
      </div>

      <Button type="submit" fullWidth size="lg">
        {t('onboarding.profile.submit')}
      </Button>
    </form>
  )
}
