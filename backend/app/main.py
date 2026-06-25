"""BreathPrint backend — FastAPI.

Endpoints:
  GET  /health        → service + model status
  POST /v1/analyze    → acoustic inference (multipart: breath_audio, cough_audio, metadata)
  POST /chat          → Typhoon-powered assistant (json: {message, ctx})

Run locally:
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
  # then point the frontend at it: VITE_INFERENCE_API_URL / VITE_ASSISTANT_API_URL = http://localhost:8000
"""
from __future__ import annotations

import json
from typing import Any

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import get_settings
from .inference import _model_cache, analyze
from .chat import chat

settings = get_settings()

app = FastAPI(title="BreathPrint Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origin.split(",")] if settings.cors_origin != "*" else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    ctx: dict[str, Any] = {}


@app.get("/health")
def health():
    model_id = settings.hf_audio_model
    model_ready = bool(_model_cache.get(model_id))
    return {
        "status": "ok",
        "audio_model": model_id,
        "audio_model_ready": model_ready,
        "typhoon_configured": bool(settings.typhoon_api_key),
        "typhoon_model": settings.typhoon_model,
    }


@app.post("/v1/analyze")
async def analyze_endpoint(
    breath_audio: UploadFile | None = File(None),
    cough_audio: UploadFile | None = File(None),
    metadata: str = Form(...),
):
    meta = json.loads(metadata) if metadata else {}
    breath = await breath_audio.read() if breath_audio else None
    cough = await cough_audio.read() if cough_audio else None
    if breath == b"":
        breath = None
    if cough == b"":
        cough = None
    return analyze(breath, cough, meta, settings.hf_audio_model)


@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    reply = await chat(req.message, req.ctx)
    return {"reply": reply}
