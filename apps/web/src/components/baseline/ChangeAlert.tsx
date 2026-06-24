import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

interface ChangeAlertProps {
  currentScore: number
  baselineScore: number | null
  exposureDelta: number | null
}

export function ChangeAlert({ currentScore, baselineScore, exposureDelta }: ChangeAlertProps) {
  if (baselineScore === null) {
    return (
      <Card className="bg-soft border-brand/20">
        <CardDescription>
          นี่คือการคัดกรองครั้งแรก — ระบบจะสร้าง Personalized Acoustic Baseline
          สำหรับเปรียบเทียบในอนาคต
        </CardDescription>
      </Card>
    )
  }

  const scoreDelta = currentScore - baselineScore
  const isWorse = scoreDelta > 5
  const isBetter = scoreDelta < -5

  return (
    <Card
      className={
        isWorse
          ? 'border-accent/30 bg-[#fdeee9]'
          : isBetter
            ? 'border-good/30 bg-[#e9f7f0]'
            : 'border-line bg-panel'
      }
    >
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {isWorse ? (
            <TrendingUp className="h-5 w-5 text-accent" />
          ) : isBetter ? (
            <TrendingDown className="h-5 w-5 text-good" />
          ) : (
            <Minus className="h-5 w-5 text-muted" />
          )}
          เทียบ Baseline ส่วนตัว
        </CardTitle>
      </CardHeader>
      <div className="text-sm text-sub space-y-1">
        <p>
          Risk Score: {currentScore} (baseline เฉลี่ย {Math.round(baselineScore)})
          {scoreDelta !== 0 && (
            <span className={isWorse ? 'text-accent font-bold' : 'text-good font-bold'}>
              {' '}
              {scoreDelta > 0 ? '+' : ''}
              {scoreDelta}
            </span>
          )}
        </p>
        {exposureDelta !== null && (
          <p>
            Exposure Dose: {exposureDelta >= 0 ? '+' : ''}
            {exposureDelta}% เทียบ baseline
          </p>
        )}
        {isWorse && (
          <p className="text-accent font-medium mt-2">
            แนะนำคัดกรองซ้ำเร็วขึ้นและปรึกษาแพทย์หากมีอาการเพิ่ม
          </p>
        )}
      </div>
    </Card>
  )
}
