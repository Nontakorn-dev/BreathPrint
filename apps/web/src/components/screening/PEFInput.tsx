import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useT } from '@/i18n'

interface PEFInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  onComplete: () => void
  onSkip: () => void
}

export function PEFInput({ value, onChange, onComplete, onSkip }: PEFInputProps) {
  const { t } = useT()
  const [input, setInput] = useState(value?.toString() ?? '')

  const handleContinue = () => {
    if (input) {
      const num = parseInt(input, 10)
      if (num > 0 && num < 800) {
        onChange(num)
      }
    }
    onComplete()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink font-display">{t('screening.pef.title')}</h2>
        <p className="text-sub text-sm mt-1">{t('screening.pef.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('screening.pef.cardTitle')}</CardTitle>
          <CardDescription>
            {t('screening.pef.cardDesc')}
          </CardDescription>
        </CardHeader>
        <Input
          id="pef"
          type="number"
          placeholder={t('screening.pef.placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </Card>

      <div className="flex flex-col gap-3">
        <Button fullWidth size="lg" onClick={handleContinue}>
          {input ? t('screening.pef.saveAndContinue') : t('screening.pef.continue')}
        </Button>
        <Button fullWidth variant="ghost" onClick={onSkip}>
          {t('screening.pef.skip')}
        </Button>
      </div>
    </div>
  )
}
