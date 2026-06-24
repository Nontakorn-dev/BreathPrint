import { useState, useCallback } from 'react'

export interface GeoPosition {
  lat: number
  lng: number
  accuracy: number
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = useCallback(() => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('อุปกรณ์ไม่รองรับ GPS')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setLoading(false)
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'กรุณาอนุญาตการเข้าถึงตำแหน่ง',
          2: 'ไม่สามารถระบุตำแหน่งได้',
          3: 'หมดเวลาในการค้นหาตำแหน่ง',
        }
        setError(messages[err.code] ?? 'เกิดข้อผิดพลาดในการระบุตำแหน่ง')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }, [])

  return { position, loading, error, requestLocation }
}
