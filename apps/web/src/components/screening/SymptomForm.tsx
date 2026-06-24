import { Button } from '@/components/ui/Button'
import type { SymptomScores } from '@/types'
import { cn } from '@/lib/utils'

const SYMPTOM_ITEMS: {
  key: keyof SymptomScores
  label: string
  description: string
}[] = [
  { key: 'cough', label: 'ไอ', description: 'ไอเรื้อรังหรือไอบ่อย' },
  { key: 'chestPain', label: 'เจ็บหน้าอก', description: 'แน่นหน้าอกหรือเจ็บเมื่อหายใจ' },
  {
    key: 'shortnessOfBreath',
    label: 'หายใจลำบาก',
    description: 'หอบเหนื่อยง่ายกว่าปกติ',
  },
  { key: 'wheeze', label: 'หวีดเสียง', description: 'ได้ยินเสียงหวีดตอนหายใจ' },
  { key: 'fatigue', label: 'อ่อนเพลีย', description: 'เหนื่อยล้าไม่สมเหตุสมผล' },
]

const SCALE_LABELS = ['ไม่มี', 'เล็กน้อย', 'ปานกลาง', 'ค่อนข้างมาก', 'มาก']

interface SymptomFormProps {
  values: SymptomScores
  onChange: (values: SymptomScores) => void
  onComplete: () => void
}

export function SymptomForm({ values, onChange, onComplete }: SymptomFormProps) {
  const setScore = (key: keyof SymptomScores, score: number) => {
    onChange({ ...values, [key]: score })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-ink font-display">แบบสอบถามอาการ</h2>
        <p className="text-muted text-sm mt-1">
          ประเมินอาการทางเดินหายใจในช่วง 2 สัปดาห์ที่ผ่านมา (0–4)
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
        ดำเนินการต่อ
      </Button>
    </div>
  )
}
