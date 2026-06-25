import { Stethoscope, Activity, Eye } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useT } from '@/i18n'
import type { ReferralLevel } from '@/types'

interface ReferralCardProps {
  level: ReferralLevel
  score: number
}

const REFERRAL_CONFIG: Record<
  ReferralLevel,
  { icon: typeof Stethoscope; titleKey: string; descKey: string; color: string }
> = {
  monitor: {
    icon: Eye,
    titleKey: 'result.referralMonitorTitle',
    descKey: 'result.referralMonitorDesc',
    color: 'text-good border-good/30 bg-[#e9f7f0]',
  },
  ios: {
    icon: Activity,
    titleKey: 'result.referralIosTitle',
    descKey: 'result.referralIosDesc',
    color: 'text-warn border-warn/30 bg-[#fff7e8]',
  },
  pulmonologist: {
    icon: Stethoscope,
    titleKey: 'result.referralPulmonologistTitle',
    descKey: 'result.referralPulmonologistDesc',
    color: 'text-bad border-bad/30 bg-[#fdeee9]',
  },
}

export function ReferralCard({ level, score }: ReferralCardProps) {
  const { t } = useT()
  const config = REFERRAL_CONFIG[level]
  const Icon = config.icon

  return (
    <Card className={`border ${config.color}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5" />
          {t(config.titleKey)}
        </CardTitle>
        <CardDescription className="text-sub">{t(config.descKey)}</CardDescription>
      </CardHeader>
      <p className="text-xs text-muted">{t('result.referralBasedOn', { score })}</p>
    </Card>
  )
}
