# BreathPrint AI

Mobile-first React PWA for early SAD screening using respiratory audio biomarkers and PM2.5 exposure.

## Quick Start

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:5173 on a mobile device or browser (use HTTPS or localhost for microphone access).

## Features

- PDPA/IRB consent flow
- Health profile setup
- GPS snapshot + PM2.5 (Open-Meteo) + Personal Exposure Dose
- Symptom questionnaire (Likert 0–4)
- Breath + cough audio recording with waveform and quality check
- Optional PEF input
- Mock audio-LLM inference → Risk Score 0–100 + explanation
- Longitudinal baseline tracking and charts
- PWA with offline recording queue
- PDPA data export and delete

## Supabase (optional)

1. Create a Supabase project
2. Run `supabase/migrations/20260624000000_initial_schema.sql`
3. Create storage bucket `audio-recordings`
4. Copy `.env.example` to `.env.local` and fill credentials

Without Supabase, the app uses IndexedDB + local user ID.

## Inference Service (optional)

```bash
cd services/inference
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Build

```bash
cd apps/web
npm run build
npm run preview
```

## Disclaimer

BreathPrint AI is a **screening tool**, not a diagnostic device. Results require clinical confirmation (e.g. IOS).
