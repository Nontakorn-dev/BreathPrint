---
title: BreathPrint Backend
emoji: 🫁
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
tags:
  - medical
  - audio
  - fastapi
---

# BreathPrint Backend

FastAPI service for the BreathPrint lung-screening app.

- `POST /v1/analyze` — acoustic inference with a real pretrained audio model
  (`MIT/ast-finetuned-audioset-10-10-0.4593`) on uploaded breath/cough WAV.
- `POST /chat` — Thai AI assistant powered by Typhoon.
- `GET /health` — status.

## Secrets (Space → Settings → Variables and secrets)

| Key | Value |
|---|---|
| `TYPHOON_API_KEY` | your OpenTyphoon key |
| `CORS_ORIGIN` | the frontend origin, e.g. `https://web-ashen-ten-40.vercel.app` |
| `TYPHOON_MODEL` | `typhoon-v2.5-30b-a3b-instruct` (default) |
| `HF_AUDIO_MODEL` | `MIT/ast-finetuned-audioset-10-10-0.4593` (default) |

> Note: there is no pretrained model for Small Airway Dysfunction (SAD). The
> AudioSet model provides real respiratory acoustic signals; the SAD-risk mapping
> is heuristic pending IOS-labelled data.
