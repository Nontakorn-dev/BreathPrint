import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { getDeviceModel } from '@/lib/utils'
import type { Sex, SmokingStatus, UserProfile } from '@/types'

interface ProfileFormProps {
  userId: string
  onSubmit: (profile: UserProfile) => void
}

export function ProfileForm({ userId, onSubmit }: ProfileFormProps) {
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<Sex>('female')
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>('never')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ageNum = parseInt(age, 10)
    if (!ageNum || ageNum < 18 || ageNum > 100) {
      setError('กรุณากรอกอายุระหว่าง 18–100 ปี')
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
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-sub">
        ข้อมูลนี้ช่วยปรับการวิเคราะห์และลดความคลาดเคลื่อนจากอุปกรณ์ต่างรุ่น
        <span className="block mt-1 text-xs text-muted">อุปกรณ์: {getDeviceModel()}</span>
      </p>

      <div className="space-y-4">
        <Input
          id="age"
          label="อายุ (ปี)"
          type="number"
          min={18}
          max={100}
          placeholder="เช่น 45"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          error={error ?? undefined}
          required
        />
        <Select
          id="sex"
          label="เพศ"
          value={sex}
          onChange={(e) => setSex(e.target.value as Sex)}
          options={[
            { value: 'female', label: 'หญิง' },
            { value: 'male', label: 'ชาย' },
            { value: 'other', label: 'อื่นๆ / ไม่ระบุ' },
          ]}
        />
        <Select
          id="smoking"
          label="สถานะการสูบบุหรี่"
          value={smokingStatus}
          onChange={(e) => setSmokingStatus(e.target.value as SmokingStatus)}
          options={[
            { value: 'never', label: 'ไม่เคยสูบ' },
            { value: 'former', label: 'เคยสูบ (เลิกแล้ว)' },
            { value: 'current', label: 'สูบอยู่' },
          ]}
        />
      </div>

      <Button type="submit" fullWidth size="lg">
        บันทึกและเริ่มใช้งาน
      </Button>
    </form>
  )
}
