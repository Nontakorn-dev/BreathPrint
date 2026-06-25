# BreathPrint AI — สรุปโปรเจกต์ + แนวทางโมเดล

> อัปเดตล่าสุด: มิถุนายน 2026 · สถานะ: **Full stack LIVE บน hosting ฟรี**

---

## A. สรุปโปรเจกต์ (สถานะปัจจุบัน)

### 1) สถาปัตยกรรม — แต่ละส่วนรันที่ไหน
```
ผู้ใช้ (มือถือ/เบราว์เซอร์)
   │
   ▼
🟦 Frontend (Vercel) ─────────── web-ashen-ten-40.vercel.app
   │  VITE_INFERENCE_API_URL + VITE_ASSISTANT_API_URL  → HF Space
   ▼
🟧 Backend (HuggingFace Space) ── Pphatsura-breathprint-backend.hf.space
   ├─ /v1/analyze → 🤖 โมเดล AST จริง (วิเคราะห์เสียง)
   └─ /chat       → 🟪 Typhoon (OpenTyphoon cloud)
   │
   └─ ข้อมูลผู้ใช้ → 💾 Browser IndexedDB (ยังไม่มี Supabase)
```

| ส่วน | โฮสต์ | ปิดคอมแล้ว |
|---|---|---|
| Frontend (เว็บ) | ☁️ Vercel | ✅ ยังใช้ได้ |
| Backend + โมเดล + Typhoon proxy | ☁️ HuggingFace Spaces (CPU ฟรี 16GB) | ✅ ยังใช้ได้ |
| Typhoon LLM | ☁️ OpenTyphoon (`api.opentyphoon.ai`) | ✅ ยังใช้ได้ |
| ข้อมูลผู้ใช้ | 💾 แต่ละเบราว์เซอร์ (IndexedDB) | — |
| โค้ด | 🐙 GitHub (public) | — |

**ค่าใช้จ่ายรวม: 0 บาท**

### 2) บัญชีที่ใช้
- **GitHub**: `Nontakorn-dev` (repo: `BreathPrint`)
- **Vercel**: team `ps-projects-d4747c00` (project: `web`)
- **HuggingFace**: `Pphatsura` (Space: `breathprint-backend`)
- **OpenTyphoon**: มี API key (เก็บเป็น HF Secret)

### 3) API ทั้งหมด (Backend — HF Space)

| Method | Path | ทำอะไร |
|---|---|---|
| GET | `/health` | สถานะ (audio_model_ready, typhoon_configured, ฯลฯ) |
| POST | `/v1/analyze` | multipart: `breath_audio`, `cough_audio` (WAV) + `metadata` (JSON) → `{risk_score, confidence, risk_band, explanation_bullets, time_events, referral_level, model_version}` |
| POST | `/chat` | JSON `{message, ctx}` → `{reply}` (Typhoon) |
| GET | `/models` | list โมเดล Typhoon ที่ key เข้าถึงได้ |

**Backend env (HF Secrets)**: `TYPHOON_API_KEY`, `TYPHOON_BASE_URL=https://api.opentyphoon.ai/v1`, `TYPHOON_MODEL=typhoon-v2.5-30b-a3b-instruct`, `HF_AUDIO_MODEL=MIT/ast-finetuned-audioset-10-10-0.4593`, `CORS_ORIGIN`
**Frontend env (Vercel)**: `VITE_INFERENCE_API_URL`, `VITE_ASSISTANT_API_URL` = URL ของ HF Space

### 4) ความสามารถของเว็บ
- คัดกรอง end-to-end: consent (PDPA/IRB) → โปรไฟล์ → GPS + PM2.5 จริง (Open-Meteo) → อาการ → อัดเสียงหายใจ/ไอ (waveform + quality gate) → PEF
- ผลด้วย AI จริง: Risk Score 0–100 + confidence + คำอธิบาย + แนะนำส่งตรวจ (monitor/IOS/แพทย์ปอด) — เสียงถูกวิเคราะห์ด้วยโมเดลจริง
- Chatbot Typhoon ภาษาไทย ตอบจากผลจริงของผู้ใช้
- ไทย/อังกฤษ เต็มรูปแบบ
- History: กราฟ baseline + แนวโน้ม + change-alert
- PWA: ติดตั้งได้ + อัดตอนออฟไลน์ → sync
- PDPA: ส่งออก/ลบข้อมูล
- ⚠️ คัดกรอง **ไม่ใช่วินิจฉัย**

### 5) ลิงก์
**ใช้งาน**
- 🌐 เว็บ live: https://web-ashen-ten-40.vercel.app
- 🔌 Backend API: https://Pphatsura-breathprint-backend.hf.space
- ❤️ /health: https://Pphatsura-breathprint-backend.hf.space/health

**แดชบอร์ด**
- Vercel: https://vercel.com/ps-projects-d4747c00/web
- HF Space: https://huggingface.co/spaces/Pphatsura/breathprint-backend
- HF Settings (secrets): https://huggingface.co/spaces/Pphatsura/breathprint-backend/settings
- HF Logs: https://huggingface.co/spaces/Pphatsura/breathprint-backend/logs
- GitHub: https://github.com/Nontakorn-dev/BreathPrint

**เอกสาร**
- Typhoon API: https://docs.opentyphoon.ai
- โมเมล shortlist + seam: `docs/MODELS.md`

### 6) จัดการ/แก้ไข
```bash
# deploy frontend ใหม่
cd apps/web && npx vercel --prod --yes --scope ps-projects-d4747c00

# deploy backend ใหม่ (ต้อง hf auth login ด้วย token Write ก่อน)
python backend/deploy_hf.py Pphatsura

# dev ในเครื่อง
cd backend && uvicorn app.main:app --port 9000 --reload
cd apps/web && npm run dev      # → localhost:5173
```

### 7) ข้อควรรู้
- 🔑 Typhoon key เคยถูกโพสต์ในแชท → **ควร rotate** แล้วเปลี่ยนใน HF Secret
- ❄️ Cold start (HF free): หลัง restart คำขอแรกช้า ~1–2 นาที (โหลดโมเดล 340MB ซ้ำ; cache `/tmp` ไม่ถาวร)
- ✅ frontend: tests 6/6 ผ่าน, tsc/lint/build เขียว

---

## B. โมเดลเสียง — ตอนนี้คืออะไร และ ต่อไปทำอะไร

### ตอนนี้ใช้อะไร
**`MIT/ast-finetuned-audioset-10-10-0.4593`** = Audio Spectrogram Transformer (ViT บน log-mel spectrogram) ฝึกบน **Google AudioSet** (527 คลาส)
- เราสกัด prob ของคลาสทางเดินหายใจ (wheeze/cough/breathing/snoring/speech) → ป้อนเข้า calibrated risk (heuristic)
- **คล้ายงานวิจัยในระดับตระกูล** (audio transformer ฝึก AudioSet ตระกูลเดียวกับ BEATs/Dasheng/SSAMBA)
- **แต่ยังไม่ใช่เทคนิคของเราจริงๆ**: ใช้ classifier head สำเร็จ ไม่ได้ทำ layer-probing/layer-selection; ไม่ใช่ audio-LLM; เป็น supervised ไม่ใช่ SSL

> AST = **ตัว stand-in ที่หามาใช้ได้เลย** (plug-and-play ไม่ต้องเทรน) เพื่อให้ pipeline เป็นของจริง — novelty ของเรายังไม่อยู่

### Roadmap — ต่อไปทำโมเดลอะไร (ทำให้เป็นงานวิจัยจริง)

| Phase | ทำอะไร | ผลลัพธ์ | ต้องการ |
|---|---|---|---|
| **0 — ปัจจุบัน** ✅ | AST classifier สำเร็จ | pipeline "ของจริง" เสียงเข้าโมเดลจริง (แต่ไม่ใช่งานเรา) | — |
| **1 — encoder + layer-probe** ✅ | **SSL encoder + layer-weighted probe (AG-REPA/CardiacZ seam)** — **ทำแล้ว live** ใช้ `facebook/hubert-base-ls960` (13 layers/768d) เป็น default; สลับเป็น Dasheng/BEATs ได้ที่ env `HF_ENCODER_MODEL` | **เทคนิคของเราทำงานจริง** — encoder รันบนเสียงจริง → hidden states → layer weights → probe (probe ยังไม่ได้เทรน รอข้อมูล IOS) | รายละเอียดใน `/v1/analyze` (ฟิลด์ `encoder`) + `/health` (`encoder_ready`) |
| **2 — LLM explanation + time-grounding** ✅ | **audio-grounded LLM explanation** (Typhoon อธิบายจากผลเสียงจริง AST+encoder+เวลา) + **time-grounding จริง** (หาช่วงเสียงเด่นจาก waveform) — **ทำแล้ว live** | หน้าผลแสดง "AI อธิบายจากการวิเคราะห์เสียงจริง" + time event จริง → ลด black-box | true audio-LLM (Audio Flamingo 3) ต้องมี GPU; ตอนนี้ใช้ Typhoon บน CPU ฟรี (LLM อ่านผลจริง ไม่ได้ฟังเสียงตรงๆ) |
| **3 — โมเดล SAD เฉพาะทาง** 🧬 | เทรน probe บน **ข้อมูล IOS labels** (cohort BreathPrint–Chiang Mai) | โมเดล SAD จริงตาม proposal | **ข้อมูลเสียง + IOS labels** (ยังไม่มีในโลก = ช่องว่างวิจัย), IRB, เวลา |

### จุดเสียบ (seam) ในโค้ด
- **Backend**: `backend/app/inference.py` → ฟังก์ชัน `_load_model` + การสกัด features คือที่เปลี่ยน AST → encoder+probe
- **ลิสต์โมเดล/encoder แนะนำ + วิธี**: `docs/MODELS.md` (proposal §9–10)
- หลักการ probe: CardiacZ (layers 30–31→classifier) + **AG-REPA (FoG-A causal layer selection)** — งานของเราเอง (proposal §7)

### ความซื่อสัตย์เชิงวิทยาศาสตร์
ยัง **ไม่มีโมเดล Small Airway Dysfunction (SAD) สำเร็จรูป** — นี่คือช่องว่างที่ BreathPrint จะเติม จนกว่าจะมีข้อมูล IOS labels เทรน ผล "risk" จะยังเป็น heuristic บนสัญญาณเสียงทางเดินหายใจจริง
