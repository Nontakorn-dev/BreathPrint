import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { DisclaimerBanner } from '@/components/results/DisclaimerBanner'

interface ConsentScreenProps {
  onAccept: () => void
}

export function ConsentScreen({ onAccept }: ConsentScreenProps) {
  const [consentResearch, setConsentResearch] = useState(false)
  const [consentPdpa, setConsentPdpa] = useState(false)
  const [consentAudio, setConsentAudio] = useState(false)

  const canProceed = consentResearch && consentPdpa && consentAudio

  return (
    <div className="space-y-5">
      <DisclaimerBanner compact />

      <div className="space-y-4">
        <p className="text-sm text-sub">
          ข้อมูลเสียง ตำแหน่ง GPS (snapshot) และประวัติสุขภาพจะถูกเก็บเพื่อการคัดกรอง
          และวิจัยทางคลินิก ตามมาตรฐาน IRB มหาวิทยาลัยมหิดล
        </p>
        <Checkbox
          id="consent-research"
          checked={consentResearch}
          onChange={(e) => setConsentResearch(e.target.checked)}
          label="ข้าพเจ้ายินยอมให้เก็บข้อมูลเพื่อการคัดกรองและวิจัย โดยเข้าใจว่านี่เป็นเครื่องมือคัดกรอง ไม่ใช่การวินิจฉัย"
        />
        <Checkbox
          id="consent-pdpa"
          checked={consentPdpa}
          onChange={(e) => setConsentPdpa(e.target.checked)}
          label="ข้าพเจ้ายินยอมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) และทราบสิทธิในการเพิกถอนความยินยอมหรือขอลบข้อมูลได้ทุกเมื่อ"
        />
        <Checkbox
          id="consent-audio"
          checked={consentAudio}
          onChange={(e) => setConsentAudio(e.target.checked)}
          label="ข้าพเจ้ายินยอมให้บันทึกเสียงหายใจและเสียงไอผ่านไมโครโฟนมือถือ โดยข้อมูลจะถูกเข้ารหัสและใช้เฉพาะเพื่อการวิเคราะห์"
        />
      </div>

      <p className="text-xs text-muted rounded-xl bg-panel px-4 py-3">
        <strong className="text-ink">Data minimization:</strong> เก็บ GPS เฉพาะตอนคัดกรอง
        ไม่ติดตามตำแหน่งตลอดเวลา ข้อมูลเข้ารหัสระหว่างส่งและจัดเก็บ
      </p>

      <Button fullWidth disabled={!canProceed} onClick={onAccept} size="lg">
        ยอมรับและดำเนินการต่อ
      </Button>
    </div>
  )
}
