# BreathPrint Backend

FastAPI service with two jobs:

1. **`POST /v1/analyze`** — acoustic inference. Runs a **real pretrained audio
   model** (`MIT/ast-finetuned-audioset-10-10-0.4593`, trained on Google AudioSet) on the
   uploaded breath/cough audio, extracts respiratory-relevant class probabilities
   (wheeze, cough, breathing, snoring, speech), and folds them into a calibrated
   risk score + confidence. Falls back to a deterministic mock if torch is
   unavailable or audio can't be decoded.
2. **`POST /chat`** — AI assistant powered by **Typhoon** (Thai LLM,
   OpenAI-compatible). Context-aware (sees the user's latest result / baseline /
   exposure). The Typhoon key lives in the environment only — never in code.

> **Honesty note:** there is no pretrained model for Small Airway Dysfunction
> (SAD) — that's BreathPrint's research gap. The AudioSet model provides *real
> respiratory acoustic signals*; the SAD-risk mapping is still heuristic pending
> IOS-labelled training data. See `../docs/MODELS.md`.

## Run locally

```bash
cd backend
cp .env.example .env        # then put your TYPHOON_API_KEY in .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The AST model (~340MB) downloads from HuggingFace on the first `/v1/analyze`
request and is cached.

Health check: `GET /health` → `{ audio_model_ready, typhoon_configured, ... }`.

## Frontend wiring

In `apps/web/.env.local`:
```
VITE_INFERENCE_API_URL=http://localhost:8000
VITE_ASSISTANT_API_URL=http://localhost:8000
```

The frontend uploads **WAV** (it converts the recorded webm via WebAudio first),
so this service needs **no ffmpeg** to decode. (The Docker image includes ffmpeg
anyway, in case webm is ever sent.)

## Deploy

This service needs a long-running host with enough RAM for torch + the AST model
(≈1–2GB) — **not Vercel**. Good fits: Render, Railway, Fly.io, a VPS, or
HuggingFace Spaces. Build with the included `Dockerfile`. Set the env vars
(`TYPHOON_API_KEY`, `CORS_ORIGIN`, …) in the host's secret settings — do not bake
them into the image.
