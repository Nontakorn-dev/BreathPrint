import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

interface PEFInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  onComplete: () => void
  onSkip: () => void
}

export function PEFInput({ value, onChange, onComplete, onSkip }: PEFInputProps) {
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
        <h2 className="text-xl font-bold text-ink font-display">Peak Expiratory Flow (PEF)</h2>
        <p className="text-sub text-sm mt-1">ไม่บังคับ — กรอกหากมีเครื่องวัดที่บ้าน</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ค่า PEF (ลิตร/นาที)</CardTitle>
          <CardDescription>
            เป่าเต็มแรง 3 ครั้ง ใช้ค่าสูงสุด ค่าปกติผู้ใหญ่ ~400–600 L/min
          </CardDescription>
        </CardHeader>
        <Input
          id="pef"
          type="number"
          placeholder="เช่น 420"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </Card>

      <div className="flex flex-col gap-3">
        <Button fullWidth size="lg" onClick={handleContinue}>
          {input ? 'บันทึกและดำเนินการต่อ' : 'ดำเนินการต่อ'}
        </Button>
        <Button fullWidth variant="ghost" onClick={onSkip}>
          ข้ามขั้นตอนนี้
        </Button>
      </div>
    </div>
  )
}
