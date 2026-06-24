import { useState, useCallback } from 'react'
import { getChiangMaiFallbackPm25 } from '@/lib/exposure'

export interface AqiData {
  pm25UgM3: number
  source: string
  isFallback: boolean
}

export function useAqi() {
  const [data, setData] = useState<AqiData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAqi = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality')
      url.searchParams.set('latitude', lat.toString())
      url.searchParams.set('longitude', lng.toString())
      url.searchParams.set('current', 'pm2_5')
      url.searchParams.set('timezone', 'Asia/Bangkok')

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูล AQI ได้')

      const json = await res.json()
      const pm25 = json.current?.pm2_5

      if (typeof pm25 === 'number') {
        setData({ pm25UgM3: pm25, source: 'Open-Meteo', isFallback: false })
      } else {
        throw new Error('ไม่มีข้อมูล PM2.5')
      }
    } catch {
      const fallback = getChiangMaiFallbackPm25()
      setData({
        pm25UgM3: fallback,
        source: 'เชียงใหม่ (ค่าเฉลี่ยจังหวัด)',
        isFallback: true,
      })
      setError('ใช้ค่า PM2.5 เฉลี่ยจังหวัดเชียงใหม่แทน')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchAqi }
}
