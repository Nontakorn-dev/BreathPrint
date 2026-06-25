import type { Bundle } from '../types'

export const result: Bundle = {
  th: {
    // ResultPage
    'notFound': 'ไม่พบผลการคัดกรอง',
    'backHome': 'กลับหน้าหลัก',
    'heroTitle': 'รายงานผลการคัดกรอง 📋',
    'heroSubtitle': 'BreathPrint Risk Score และคำอธิบายจาก audio-LLM',
    'stepCapture': 'รับสัญญาณ',
    'stepAudio': 'บันทึกเสียง',
    'stepAnalyze': 'วิเคราะห์ AI',
    'stepReport': 'รายงานผล',
    'modelNote': 'Model: {model} · คัดกรอง ไม่ใช่วินิจฉัย',
    'rescreen': 'คัดกรองใหม่',

    // RiskScoreGauge
    'riskScoreLabel': 'BreathPrint Risk Score',
    'bandLow': 'ต่ำ',
    'bandModerate': 'ปานกลาง',
    'bandHigh': 'สูง',
    'bandVeryHigh': 'สูงมาก',

    // ExplanationPanel
    'explanationTitle': 'คำอธิบาย (audio-LLM)',
    'llmExplainLabel': 'AI อธิบายจากการวิเคราะห์เสียงจริง',
    'timeGrounding': 'Time-grounding',

    // ReferralCard
    'referralMonitorTitle': 'ติดตามที่บ้าน',
    'referralMonitorDesc':
      'ความเสี่ยงต่ำ–ปานกลาง แนะนำคัดกรองซ้ำใน 1–3 เดือน ลดการสัมผัส PM2.5 และสวม N95 ในวันที่ AQI สูง',
    'referralIosTitle': 'แนะนำตรวจ IOS',
    'referralIosDesc':
      'ความเสี่ยงสูง — แนะนำตรวจ Impulse Oscillometry (IOS) ที่โรงพยาบาล เพื่อยืนยันสถานะหลอดลมฝอย',
    'referralPulmonologistTitle': 'พบแพทย์ปอด',
    'referralPulmonologistDesc':
      'ความเสี่ยงสูงมาก — แนะนำพบแพทย์เฉพาะทางโรคปอดและตรวจ IOS โดยเร็วที่สุด',
    'referralBasedOn': 'อ้างอิงจาก Risk Score: {score}/100',

    // DisclaimerBanner
    'disclaimerTitle': 'เครื่องมือคัดกรอง — ไม่ใช่การวินิจฉัย',
    'disclaimerBody':
      'BreathPrint AI ใช้สำหรับคัดกรองความเสี่ยงเท่านั้น ไม่สามารถแทนการตรวจทางคลินิก เช่น IOS หรือ spirometry หากมีอาการรุนแรง กรุณาพบแพทย์ทันที',

    // ConfidenceIndicator
    'modelConfidence': 'ความมั่นใจของโมเดล',
    'confidenceHigh': 'สูง',
    'confidenceModerate': 'ปานกลาง',
    'confidenceLow': 'ต่ำ',
    'lowSignalCallout':
      'คุณภาพสัญญาณต่ำ — ผลอาจไม่น่าเชื่อถือ แนะนำให้ ',
    'lowSignalRerecord': 'บันทึกเสียงใหม่',
    'lowSignalOr': ' ในที่เงียบ หรือ ',
    'lowSignalSeeClinician': 'พบแพทย์ตรวจโดยตรง',

    // ChangeAlert
    'firstScreening':
      'นี่คือการคัดกรองครั้งแรก — ระบบจะสร้าง Personalized Acoustic Baseline สำหรับเปรียบเทียบในอนาคต',
    'compareBaselineTitle': 'เทียบ Baseline ส่วนตัว',
    'riskScoreVsBaseline': 'Risk Score: {current} (baseline เฉลี่ย {baseline})',
    'exposureVsBaseline': 'Exposure Dose: {delta}% เทียบ baseline',
    'worseAdvice': 'แนะนำคัดกรองซ้ำเร็วขึ้นและปรึกษาแพทย์หากมีอาการเพิ่ม',

    // BaselineChart
    'chartNeedsTwo':
      'ต้องมีอย่างน้อย 2 ครั้งเพื่อแสดงกราฟแนวโน้ม — คัดกรองซ้ำใน 1–3 เดือน',
    'baselineTrendTitle': 'แนวโน้ม Baseline',
    'baselineTrendSubtitle': 'Risk Score และ Exposure Dose ตามเวลา',

    // ScreeningHistory
    'noHistory': 'ยังไม่มีประวัติการคัดกรอง',
    'screeningList': 'รายการคัดกรอง',
    'pendingSync': 'รอ sync ออฟไลน์',
  },
  en: {
    // ResultPage
    'notFound': 'Screening result not found',
    'backHome': 'Back to home',
    'heroTitle': 'Screening Report 📋',
    'heroSubtitle': 'BreathPrint Risk Score and explanation from audio-LLM',
    'stepCapture': 'Capture signal',
    'stepAudio': 'Record audio',
    'stepAnalyze': 'AI analysis',
    'stepReport': 'Report',
    'modelNote': 'Model: {model} · Screening, not diagnosis',
    'rescreen': 'Screen again',

    // RiskScoreGauge
    'riskScoreLabel': 'BreathPrint Risk Score',
    'bandLow': 'Low',
    'bandModerate': 'Moderate',
    'bandHigh': 'High',
    'bandVeryHigh': 'Very high',

    // ExplanationPanel
    'explanationTitle': 'Explanation (audio-LLM)',
    'llmExplainLabel': 'AI explanation from real audio analysis',
    'timeGrounding': 'Time-grounding',

    // ReferralCard
    'referralMonitorTitle': 'Monitor at home',
    'referralMonitorDesc':
      'Low to moderate risk. We recommend re-screening in 1–3 months, reducing PM2.5 exposure, and wearing an N95 on high-AQI days.',
    'referralIosTitle': 'IOS test recommended',
    'referralIosDesc':
      'High risk — we recommend Impulse Oscillometry (IOS) testing at a hospital to confirm small-airway status.',
    'referralPulmonologistTitle': 'See a pulmonologist',
    'referralPulmonologistDesc':
      'Very high risk — see a pulmonology specialist and get an IOS test as soon as possible.',
    'referralBasedOn': 'Based on Risk Score: {score}/100',

    // DisclaimerBanner
    'disclaimerTitle': 'Screening tool — not a diagnosis',
    'disclaimerBody':
      'BreathPrint AI is for risk screening only and cannot replace clinical testing such as IOS or spirometry. If symptoms are severe, please see a doctor immediately.',

    // ConfidenceIndicator
    'modelConfidence': 'Model confidence',
    'confidenceHigh': 'High',
    'confidenceModerate': 'Moderate',
    'confidenceLow': 'Low',
    'lowSignalCallout':
      'Low signal quality — the result may be unreliable. We recommend ',
    'lowSignalRerecord': 're-recording',
    'lowSignalOr': ' in a quiet place, or ',
    'lowSignalSeeClinician': 'seeing a clinician directly',

    // ChangeAlert
    'firstScreening':
      'This is your first screening — the system will build a Personalized Acoustic Baseline for comparison in the future.',
    'compareBaselineTitle': 'Compare to personal baseline',
    'riskScoreVsBaseline': 'Risk Score: {current} (avg baseline {baseline})',
    'exposureVsBaseline': 'Exposure Dose: {delta}% vs baseline',
    'worseAdvice': 'Consider re-screening sooner and consult a doctor if symptoms increase.',

    // BaselineChart
    'chartNeedsTwo':
      'At least 2 screenings are needed to show a trend — re-screen in 1–3 months.',
    'baselineTrendTitle': 'Baseline trend',
    'baselineTrendSubtitle': 'Risk Score and Exposure Dose over time',

    // ScreeningHistory
    'noHistory': 'No screening history yet',
    'screeningList': 'Screenings',
    'pendingSync': 'Pending offline sync',
  },
}
