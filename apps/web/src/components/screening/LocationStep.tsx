import { useEffect } from 'react'
import { MapPin, Wind, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useAqi } from '@/hooks/useAqi'
import { calculateWeeklyExposureDose, formatExposureDose } from '@/lib/exposure'
import type { LocationData } from '@/types'

interface LocationStepProps {
  onComplete: (data: LocationData, exposureDose: number) => void
}

export function LocationStep({ onComplete }: LocationStepProps) {
  const { position, loading: geoLoading, error: geoError, requestLocation } = useGeolocation()
  const { data: aqi, loading: aqiLoading, error: aqiError, fetchAqi } = useAqi()

  useEffect(() => {
    if (position) fetchAqi(position.lat, position.lng)
  }, [position, fetchAqi])

  const handleContinue = () => {
    if (!position || !aqi) return
    const exposure = calculateWeeklyExposureDose({ pm25UgM3: aqi.pm25UgM3 })
    onComplete(
      {
        lat: position.lat,
        lng: position.lng,
        pm25UgM3: aqi.pm25UgM3,
        aqiSource: aqi.source,
      },
      exposure.weeklyDose,
    )
  }

  const loading = geoLoading || aqiLoading

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink font-display">ตำแหน่งและคุณภาพอากาศ</h2>
        <p className="text-sub text-sm mt-1">
          ใช้ GPS snapshot เพื่อประเมิน Personal Exposure Dose ของ PM2.5
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand" />
            ตำแหน่งปัจจุบัน
          </CardTitle>
          <CardDescription>เก็บเฉพาะตอนคัดกรอง ไม่ติดตามตลอดเวลา</CardDescription>
        </CardHeader>

        {!position ? (
          <Button onClick={requestLocation} disabled={geoLoading} fullWidth>
            {geoLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังระบุตำแหน่ง...
              </>
            ) : (
              'อนุญาตการเข้าถึงตำแหน่ง'
            )}
          </Button>
        ) : (
          <div className="text-sm text-sub space-y-1">
            <p>
              Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
            </p>
            <p>ความแม่นยำ: ±{Math.round(position.accuracy)} เมตร</p>
          </div>
        )}
        {geoError && <p className="text-sm text-bad mt-2">{geoError}</p>}
      </Card>

      {position && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-brand2" />
              PM2.5 ปัจจุบัน
            </CardTitle>
          </CardHeader>
          {aqiLoading ? (
            <div className="flex items-center gap-2 text-sub">
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังดึงข้อมูล AQI...
            </div>
          ) : aqi ? (
            <div>
              <p className="text-3xl font-extrabold text-brand">
                {aqi.pm25UgM3.toFixed(1)}
                <span className="text-base font-medium text-muted ml-1">µg/m³</span>
              </p>
              <p className="text-sm text-sub mt-1">แหล่งข้อมูล: {aqi.source}</p>
              {aqi.isFallback && (
                <p className="text-sm text-warn mt-2">
                  ใช้ค่าเฉลี่ยจังหวัดเชียงใหม่ (42.6 µg/m³) เนื่องจากไม่มีสถานีใกล้เคียง
                </p>
              )}
              <p className="text-sm font-medium text-ink mt-3">
                Exposure Dose ประมาณ:{' '}
                {formatExposureDose(
                  calculateWeeklyExposureDose({ pm25UgM3: aqi.pm25UgM3 }).weeklyDose,
                )}
              </p>
            </div>
          ) : null}
          {aqiError && <p className="text-sm text-warn mt-2">{aqiError}</p>}
        </Card>
      )}

      <Button
        fullWidth
        size="lg"
        disabled={!position || !aqi || loading}
        onClick={handleContinue}
      >
        ดำเนินการต่อ
      </Button>
    </div>
  )
}
