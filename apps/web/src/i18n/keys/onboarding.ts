import type { Bundle } from '../types'

export const onboarding: Bundle = {
  th: {
    // OnboardingPage hero
    'hero.consent.title': 'เข้าสู่ระบบ',
    'hero.consent.subtitle': 'เข้าสู่แดชบอร์ด BreathPrint ของคุณ',
    'hero.profile.title': 'ตั้งค่าโปรไฟล์',
    'hero.profile.subtitle': 'ข้อมูลสุขภาพพื้นฐานสำหรับการคัดกรอง',

    // ConsentScreen
    'consent.dataNote':
      'ข้อมูลเสียง ตำแหน่ง GPS (snapshot) และประวัติสุขภาพจะถูกเก็บเพื่อการคัดกรอง และวิจัยทางคลินิก ตามมาตรฐาน IRB มหาวิทยาลัยมหิดล',
    'consent.research':
      'ข้าพเจ้ายินยอมให้เก็บข้อมูลเพื่อการคัดกรองและวิจัย โดยเข้าใจว่านี่เป็นเครื่องมือคัดกรอง ไม่ใช่การวินิจฉัย',
    'consent.pdpa':
      'ข้าพเจ้ายินยอมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) และทราบสิทธิในการเพิกถอนความยินยอมหรือขอลบข้อมูลได้ทุกเมื่อ',
    'consent.audio':
      'ข้าพเจ้ายินยอมให้บันทึกเสียงหายใจและเสียงไอผ่านไมโครโฟนมือถือ โดยข้อมูลจะถูกเข้ารหัสและใช้เฉพาะเพื่อการวิเคราะห์',
    'consent.minimization':
      'เก็บ GPS เฉพาะตอนคัดกรอง ไม่ติดตามตำแหน่งตลอดเวลา ข้อมูลเข้ารหัสระหว่างส่งและจัดเก็บ',
    'consent.accept': 'ยอมรับและดำเนินการต่อ',

    // ProfileForm
    'profile.intro': 'ข้อมูลนี้ช่วยปรับการวิเคราะห์และลดความคลาดเคลื่อนจากอุปกรณ์ต่างรุ่น',
    'profile.device': 'อุปกรณ์',
    'profile.ageLabel': 'อายุ (ปี)',
    'profile.agePlaceholder': 'เช่น 45',
    'profile.ageError': 'กรุณากรอกอายุระหว่าง 18–100 ปี',
    'profile.sexLabel': 'เพศ',
    'profile.sex.female': 'หญิง',
    'profile.sex.male': 'ชาย',
    'profile.sex.other': 'อื่นๆ / ไม่ระบุ',
    'profile.smokingLabel': 'สถานะการสูบบุหรี่',
    'profile.smoking.never': 'ไม่เคยสูบ',
    'profile.smoking.former': 'เคยสูบ (เลิกแล้ว)',
    'profile.smoking.current': 'สูบอยู่',
    'profile.submit': 'บันทึกและเริ่มใช้งาน',
  },
  en: {
    // OnboardingPage hero
    'hero.consent.title': 'Sign in',
    'hero.consent.subtitle': 'Access your BreathPrint dashboard',
    'hero.profile.title': 'Set up your profile',
    'hero.profile.subtitle': 'Basic health information for screening',

    // ConsentScreen
    'consent.dataNote':
      'Audio, GPS location (snapshot), and health history will be collected for screening and clinical research, in accordance with IRB standards of Mahidol University.',
    'consent.research':
      'I consent to data collection for screening and research, understanding that this is a screening tool, not a diagnosis.',
    'consent.pdpa':
      'I consent under the Personal Data Protection Act (PDPA) and acknowledge my right to withdraw consent or request data deletion at any time.',
    'consent.audio':
      'I consent to recording breathing and cough sounds via the mobile microphone; the data will be encrypted and used solely for analysis.',
    'consent.minimization':
      'GPS is collected only during screening, with no continuous tracking. Data is encrypted in transit and at rest.',
    'consent.accept': 'Accept and continue',

    // ProfileForm
    'profile.intro': 'This information helps tailor the analysis and reduce bias across different devices.',
    'profile.device': 'Device',
    'profile.ageLabel': 'Age (years)',
    'profile.agePlaceholder': 'e.g. 45',
    'profile.ageError': 'Please enter an age between 18 and 100.',
    'profile.sexLabel': 'Sex',
    'profile.sex.female': 'Female',
    'profile.sex.male': 'Male',
    'profile.sex.other': 'Other / Prefer not to say',
    'profile.smokingLabel': 'Smoking status',
    'profile.smoking.never': 'Never smoked',
    'profile.smoking.former': 'Former smoker (quit)',
    'profile.smoking.current': 'Current smoker',
    'profile.submit': 'Save and get started',
  },
}
