import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n'
import type { SymptomScores } from '@/types'
import { cn } from '@/lib/utils'

interface SymptomFormProps {
  values: SymptomScores
  onChange: (values: SymptomScores) => void
  onComplete: () => void
}

export function SymptomForm({ values, onChange, onComplete }: SymptomFormProps) {
  const { t } = useT()

  const SYMPTOM_ITEMS: {
    key: keyof SymptomScores
    label: string
    description: string
  }[] = [
    { key: 'cough', label: t('screening.symptom.cough.label'), description: t('screening.symptom.cough.desc') },
    { key: 'chestPain', label: t('screening.symptom.chestPain.label'), description: t('screening.symptom.chestPain.desc') },
    {
      key: 'shortnessOfBreath',
      label: t('screening.symptom.shortnessOfBreath.label'),
      description: t('screening.symptom.shortnessOfBreath.desc'),
    },
    { key: 'wheeze', label: t('screening.symptom.wheeze.label'), description: t('screening.symptom.wheeze.desc') },
    { key: 'fatigue', label: t('screening.symptom.fatigue.label'), description: t('screening.symptom.fatigue.desc') },
  ]

  const SCALE_LABELS = [
    t('screening.symptom.scale.0'),
    t('screening.symptom.scale.1'),
    t('screening.symptom.scale.2'),
    t('screening.symptom.scale.3'),
    t('screening.symptom.scale.4'),
  ]

  const setScore = (key: keyof SymptomScores, score: number) => {
    onChange({ ...values, [key]: score })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-ink font-display">{t('screening.symptom.title')}</h2>
        <p className="text-muted text-sm mt-1">
          {t('screening.symptom.subtitle')}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {SYMPTOM_ITEMS.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-line bg-panel/30 p-4 lg:p-5 hover:border-brand/25 transition-colors"
          >
            <div className="mb-3">
              <p className="font-semibold text-ink text-sm">{item.label}</p>
              <p className="text-xs text-muted">{item.description}</p>
            </div>
            <div className="flex gap-1.5">
              {SCALE_LABELS.map((label, score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setScore(item.key, score)}
                  className={cn(
                    'flex-1 py-2.5 px-1 rounded-xl text-xs font-semibold transition-all border',
                    values[item.key] === score
                      ? 'bg-brand text-white border-brand shadow-sm shadow-brand/20'
                      : 'bg-surface text-muted border-line hover:border-brand/40',
                  )}
                >
                  {score}
                  <span className="block text-[9px] font-normal opacity-80 mt-0.5 leading-tight">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button fullWidth size="lg" onClick={onComplete}>
        {t('screening.symptom.continue')}
      </Button>
    </div>
  )
}
