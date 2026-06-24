import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHero, SurfacePanel } from '@/components/layout/PageContainer'
import { DisclaimerBanner } from '@/components/results/DisclaimerBanner'
import { useAuthStore } from '@/store/auth-store'
import { getUserScreenings } from '@/lib/storage'

export function SettingsPage() {
  const profile = useAuthStore((s) => s.profile)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!profile) return
    setExporting(true)
    const sessions = await getUserScreenings(profile.id)
    const data = { profile, sessions: sessions.map(({ breathAudioBlob, coughAudioBlob, ...rest }) => rest) }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `breathprint-export-${profile.id.slice(0, 8)}.json`
    a.click()
    setExporting(false)
  }

  const handleDelete = () => {
    if (
      confirm(
        'ยืนยันการลบข้อมูลทั้งหมด? การดำเนินการนี้ไม่สามารถย้อนกลับได้ (สิทธิตาม PDPA)',
      )
    ) {
      localStorage.clear()
      indexedDB.deleteDatabase('breathprint')
      clearAuth()
      navigate('/onboarding')
    }
  }

  return (
    <div className="space-y-6">
      <PageHero title="ตั้งค่าและความเป็นส่วนตัว" subtitle="จัดการข้อมูลส่วนบุคคลตาม PDPA" />
      <DisclaimerBanner compact />

      {profile && (
        <SurfacePanel>
          <CardHeader>
            <CardTitle>โปรไฟล์</CardTitle>
          </CardHeader>
          <dl className="text-sm space-y-3">
            <div className="flex justify-between py-2 border-b border-line">
              <dt className="text-muted">อายุ</dt>
              <dd className="font-semibold">{profile.age} ปี</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-line">
              <dt className="text-muted">อุปกรณ์</dt>
              <dd className="font-semibold">{profile.deviceModel}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted">ยินยอมเมื่อ</dt>
              <dd className="font-semibold">{new Date(profile.consentAt).toLocaleDateString('th-TH')}</dd>
            </div>
          </dl>
        </SurfacePanel>
      )}

      <SurfacePanel>
        <CardHeader>
          <CardTitle>สิทธิตาม PDPA</CardTitle>
          <CardDescription>คุณมีสิทธิขอสำเนาและลบข้อมูลส่วนบุคคล</CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-3">
          <Button variant="outline" fullWidth onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4" />
            ส่งออกข้อมูล (JSON)
          </Button>
          <Button variant="danger" fullWidth onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            ลบข้อมูลทั้งหมด
          </Button>
        </div>
      </SurfacePanel>
    </div>
  )
}
