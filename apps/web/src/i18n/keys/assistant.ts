import type { Bundle } from '../types'

// WS2 — AI assistant chatbot (local/contextual + LLM seam).
export const assistant: Bundle = {
  th: {
    title: 'ผู้ช่วย AI',
    subtitle: 'ถามเกี่ยวกับผลคัดกรอง ความเสี่ยง หรือสิ่งที่ควรทำต่อ',
    placeholder: 'พิมพ์คำถามของคุณ…',
    send: 'ส่ง',
    fabAsk: 'ถามผู้ช่วย AI',
    disclaimer:
      'ผู้ช่วย AI ให้ข้อมูลเชิงคัดกรองเท่านั้น ไม่ใช่การวินิจฉัย โปรดปรึกษาแพทย์สำหรับการตัดสินใจทางคลินิก',
    greeting:
      'สวัสดีครับ/ค่ะ 👋 พร้อมช่วยอธิบายผล BreathPrint ของคุณ ลองถามได้เลย เช่น “ผลของฉันแปลว่าอย่างไร”',
    noResult: 'คุณยังไม่มีผลคัดกรอง ลองเริ่มคัดกรองครั้งแรก แล้วจะอธิบายผลให้ฟังได้',
    resultExplain:
      'ผลล่าสุดของคุณคือ Risk Score {score}/100 ระดับ{band} (ความมั่นใจของโมเดล: {confidenceLevel}, {confidence}%) คะแนนยิ่งสูงยิ่งเสี่ยงต่อ Small Airway Dysfunction มากขึ้น',
    nextSteps: 'สิ่งที่ควรทำต่อ: {referral}',
    referralMonitor:
      'ยังอยู่ในเกณฑ์ติดตาม — คัดกรองซ้ำทุก 1–3 เดือน หลีกเลี่ยงฝุ่น PM2.5 สวม N95 เมื่อ AQI สูง และสังเกตอาการ',
    referralIos:
      'ระดับปานกลาง–สูง — แนะนำให้ตรวจ Impulse Oscillometry (IOS) เพื่อยืนยัน Small Airway Dysfunction และพบแพทย์ปอดหากอาการกำเริง',
    referralPulmonologist:
      'ระดับสูงมาก — ควรพบแพทย์ทางเดินหายใจโดยเร็ว และตรวจ IOS/spirometry เพื่อประเมินต่อ',
    exposure:
      'PM2.5 ปัจจุบัน {pm25} µg/m³ (ระดับ{level}), Personal Exposure Dose {dose} ค่านี้สะท้อนการสัมผัสฝุ่นสะสมรายสัปดาห์ — ยิ่งสูงยิ่งเพิ่มความเสี่ยงต่อปอด',
    exposureLevelLow: 'ต่ำ',
    exposureLevelModerate: 'ปานกลาง',
    exposureLevelHigh: 'สูง',
    exposureLevelVeryHigh: 'สูงมาก',
    baselineTrend:
      'Baseline เฉลี่ยของคุณอยู่ที่ Risk Score {avg} จาก {count} ครั้ง{delta} การติดตามแนวโน้มรายบุคคลช่วยจับการเปลี่ยนแปลงก่อนที่จะกลายเป็นโรค',
    baselineDeltaUp: ' (แนวโน้มเพิ่มขึ้น — ควรติดตามใกล้ชิด)',
    baselineDeltaDown: ' (แนวโน้มดีขึ้น)',
    baselineDeltaFlat: ' (คงตัว)',
    noBaseline: 'ยังไม่มี Baseline — คัดกรองอย่างน้อย 2 ครั้งเพื่อเริ่มดูแนวโน้มรายบุคคล',
    confidenceLow:
      'ความมั่นใจของโมเดลต่ำ ({confidence}%) เพราะสัญญาณเสียงคุณภาพไม่ดีพอ — แนะนำให้บันทึกเสียงใหม่ในที่เงียบ หรือพบแพทย์ตรวจโดยตรง',
    confidenceOk: 'ความมั่นใจของโมเดลอยู่ในเกณฑ์{level} ({confidence}%) ผลน่าเชื่อถือในระดับหนึ่ง',
    reRecord:
      'หากผลดูผิดปกติหรือสัญญาณไม่ดี ให้อัดเสียงใหม่: หายใจตามปกติในที่เงียบ วางไมค์ห่างปาก 15–20 ซม. ครั้งละ 10–15 วินาที',
    fallback:
      'ผมช่วยอธิบายเรื่องผลคัดกรอง ความเสี่ยง PM2.5/exposure baseline หรือสิ่งที่ควรทำต่อได้ ลองถามใหม่อีกครั้งได้เลยครับ/ค่ะ',
    quickResult: 'ผลของฉันแปลว่าอย่างไร',
    quickNext: 'ควรทำอย่างไรต่อ',
    quickExposure: 'PM2.5 ของฉันเป็นอย่างไร',
    quickBaseline: 'Baseline แนวโน้ม',
  },
  en: {
    title: 'AI Assistant',
    subtitle: 'Ask about your screening result, risk, or next steps',
    placeholder: 'Type your question…',
    send: 'Send',
    fabAsk: 'Ask AI assistant',
    disclaimer:
      'The AI assistant gives screening information only — not a diagnosis. Please consult a clinician for clinical decisions.',
    greeting:
      "Hi 👋 I can explain your BreathPrint result. Try asking “what does my result mean?”",
    noResult: "You don't have a screening result yet. Complete your first screening and I'll walk you through it.",
    resultExplain:
      'Your latest result is a Risk Score of {score}/100 — {band} band (model confidence: {confidenceLevel}, {confidence}%). Higher scores mean higher likelihood of Small Airway Dysfunction.',
    nextSteps: 'Recommended next step: {referral}',
    referralMonitor:
      'In the monitoring range — re-screen every 1–3 months, avoid PM2.5, wear an N95 when AQI is high, and watch your symptoms.',
    referralIos:
      'Moderate–high — consider Impulse Oscillometry (IOS) to confirm Small Airway Dysfunction, and see a pulmonologist if symptoms worsen.',
    referralPulmonologist:
      'Very high — please see a respiratory physician promptly and get IOS/spirometry for further assessment.',
    exposure:
      'Current PM2.5 is {pm25} µg/m³ ({level}); your Personal Exposure Dose is {dose}. This reflects cumulative weekly dust exposure — higher means more lung risk.',
    exposureLevelLow: 'low',
    exposureLevelModerate: 'moderate',
    exposureLevelHigh: 'high',
    exposureLevelVeryHigh: 'very high',
    baselineTrend:
      'Your average baseline is a Risk Score of {avg} across {count} screening(s){delta}. Tracking your personal trend helps catch changes before they become disease.',
    baselineDeltaUp: ' (trending up — monitor closely)',
    baselineDeltaDown: ' (trending better)',
    baselineDeltaFlat: ' (stable)',
    noBaseline: 'No baseline yet — complete at least 2 screenings to start seeing your personal trend.',
    confidenceLow:
      'Model confidence is low ({confidence}%) because the audio signal wasn’t clean enough — please re-record in a quiet place, or see a clinician directly.',
    confidenceOk: 'Model confidence is {level} ({confidence}%); the result is reasonably trustworthy.',
    reRecord:
      'If the result looks off or the signal is poor, re-record: breathe normally in a quiet spot, mic 15–20 cm from the mouth, 10–15 seconds per clip.',
    fallback:
      'I can explain your screening result, risk, PM2.5/exposure, baseline, or next steps. Try rephrasing your question.',
    quickResult: 'What does my result mean',
    quickNext: 'What should I do next',
    quickExposure: 'How is my PM2.5',
    quickBaseline: 'Baseline trend',
  },
}
