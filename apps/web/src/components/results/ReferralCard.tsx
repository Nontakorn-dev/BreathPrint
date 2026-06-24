import { Stethoscope, Activity, Eye } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { ReferralLevel } from '@/types'

interface ReferralCardProps {
  level: ReferralLevel
  score: number
}

const REFERRAL_CONFIG: Record<
  ReferralLevel,
  { icon: typeof Stethoscope; title: string; description: string; color: string }
> = {
  monitor: {
    icon: Eye,
    title: 'ติดตามที่บ้าน',
    description:
      'ความเสี่ยงต่ำ–ปานกลาง แนะนำคัดกรองซ้ำใน 1–3 เดือน ลดการสัมผัส PM2.5 และสวม N95 ในวันที่ AQI สูง',
    color: 'text-good border-good/30 bg-[#e9f7f0]',
  },
  ios: {
    icon: Activity,
    title: 'แนะนำตรวจ IOS',
    description:
      'ความเสี่ยงสูง — แนะนำตรวจ Impulse Oscillometry (IOS) ที่โรงพยาบาล เพื่อยืนยันสถานะหลอดลมฝอย',
    color: 'text-warn border-warn/30 bg-[#fff7e8]',
  },
  pulmonologist: {
    icon: Stethoscope,
    title: 'พบแพทย์ปอด',
    description:
      'ความเสี่ยงสูงมาก — แนะนำพบแพทย์เฉพาะทางโรคปอดและตรวจ IOS โดยเร็วที่สุด',
    color: 'text-bad border-bad/30 bg-[#fdeee9]',
  },
}

export function ReferralCard({ level, score }: ReferralCardProps) {
  const config = REFERRAL_CONFIG[level]
  const Icon = config.icon

  return (
    <Card className={`border ${config.color}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5" />
          {config.title}
        </CardTitle>
        <CardDescription className="text-sub">{config.description}</CardDescription>
      </CardHeader>
      <p className="text-xs text-muted">อ้างอิงจาก Risk Score: {score}/100</p>
    </Card>
  )
}
