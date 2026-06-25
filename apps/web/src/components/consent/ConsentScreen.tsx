import { useState } from 'react'
import { useT } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { DisclaimerBanner } from '@/components/results/DisclaimerBanner'
import type { ConsentDecision } from '@/types'

interface ConsentScreenProps {
  onAccept: (consent: ConsentDecision) => void
}

export function ConsentScreen({ onAccept }: ConsentScreenProps) {
  const [consentResearch, setConsentResearch] = useState(false)
  const [consentPdpa, setConsentPdpa] = useState(false)
  const [consentAudio, setConsentAudio] = useState(false)

  const canProceed = consentResearch && consentPdpa && consentAudio
  const { t } = useT()

  return (
    <div className="space-y-5">
      <DisclaimerBanner compact />

      <div className="space-y-4">
        <p className="text-sm text-sub">{t('onboarding.consent.dataNote')}</p>
        <Checkbox
          id="consent-research"
          checked={consentResearch}
          onChange={(e) => setConsentResearch(e.target.checked)}
          label={t('onboarding.consent.research')}
        />
        <Checkbox
          id="consent-pdpa"
          checked={consentPdpa}
          onChange={(e) => setConsentPdpa(e.target.checked)}
          label={t('onboarding.consent.pdpa')}
        />
        <Checkbox
          id="consent-audio"
          checked={consentAudio}
          onChange={(e) => setConsentAudio(e.target.checked)}
          label={t('onboarding.consent.audio')}
        />
      </div>

      <p className="text-xs text-muted rounded-xl bg-panel px-4 py-3">
        <strong className="text-ink">Data minimization:</strong> {t('onboarding.consent.minimization')}
      </p>

      <Button
        fullWidth
        disabled={!canProceed}
        onClick={() => onAccept({ consentResearch, consentPdpa, consentAudio })}
        size="lg"
      >
        {t('onboarding.consent.accept')}
      </Button>
    </div>
  )
}
