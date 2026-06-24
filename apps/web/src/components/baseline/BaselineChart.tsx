import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import type { ScreeningSession } from '@/types'

interface BaselineChartProps {
  sessions: ScreeningSession[]
}

export function BaselineChart({ sessions }: BaselineChartProps) {
  const data = sessions
    .filter((s) => s.result)
    .reverse()
    .map((s) => ({
      date: formatDate(s.createdAt),
      riskScore: s.result!.riskScore,
      exposure: s.exposureDoseWeekly ?? 0,
    }))

  if (data.length < 2) {
    return (
      <Card>
        <CardDescription>
          ต้องมีอย่างน้อย 2 ครั้งเพื่อแสดงกราฟแนวโน้ม — คัดกรองซ้ำใน 1–3 เดือน
        </CardDescription>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">แนวโน้ม Baseline</CardTitle>
        <CardDescription>Risk Score และ Exposure Dose ตามเวลา</CardDescription>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dde5ea" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #dde5ea',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="riskScore"
            name="Risk Score"
            stroke="#0e7c86"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="exposure"
            name="Exposure (µg·h/wk)"
            stroke="#e4572e"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
