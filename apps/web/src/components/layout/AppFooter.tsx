import { Link } from 'react-router-dom'
import { CONTENT_CLASS } from '@/components/layout/PageContainer'

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-line/80 bg-surface/60 backdrop-blur-sm">
      <div className={CONTENT_CLASS}>
        <div className="py-10 lg:py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-extrabold text-brand font-display text-base mb-2">BreathPrint</p>
            <p className="text-muted text-xs leading-relaxed max-w-[220px]">
              แพลตฟอร์ม AI คัดกรอง Small Airway Dysfunction จากเสียงหายใจและ PM2.5
            </p>
          </div>
          <div>
            <p className="font-bold text-ink mb-3 text-xs uppercase tracking-wide">ผลิตภัณฑ์</p>
            <ul className="space-y-2 text-muted text-xs">
              <li><Link to="/screening" className="hover:text-brand transition-colors">เริ่มคัดกรอง</Link></li>
              <li><Link to="/history" className="hover:text-brand transition-colors">ประวัติ</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-ink mb-3 text-xs uppercase tracking-wide">บัญชี</p>
            <ul className="space-y-2 text-muted text-xs">
              <li><Link to="/settings" className="hover:text-brand transition-colors">ตั้งค่า</Link></li>
              <li><Link to="/onboarding" className="hover:text-brand transition-colors">เข้าสู่ระบบ</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-ink mb-3 text-xs uppercase tracking-wide">ข้อกำหนด</p>
            <ul className="space-y-2 text-muted text-xs">
              <li><span>คัดกรอง ไม่ใช่วินิจฉัย</span></li>
              <li><span>PDPA / IRB ready</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-5 text-center text-xs text-muted">
          <p>
            <strong className="text-sub">Medical disclaimer ·</strong> BreathPrint เป็นเครื่องมือคัดกรองเบื้องต้น
            ไม่ใช่อุปกรณ์วินิจฉัยทางการแพทย์
          </p>
          <p className="mt-1">© {new Date().getFullYear()} BreathPrint · Acoustic SAD screening · Northern Thailand PM2.5</p>
        </div>
      </div>
    </footer>
  )
}
