"""
BreathPrint Mock Inference API
Mirrors client-side mock — swap for Audio-LLM (Audio Flamingo 3) in production.
"""

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import random

app = FastAPI(title="BreathPrint Inference", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TimeEvent(BaseModel):
    start: float
    end: float
    label: str


class InferenceResponse(BaseModel):
    risk_score: int
    risk_band: str
    explanation_bullets: list[str]
    time_events: list[TimeEvent]
    exposure_delta_pct: float | None
    referral_level: str
    model_version: str


def get_risk_band(score: int) -> str:
    if score <= 30:
        return "low"
    if score <= 60:
        return "moderate"
    if score <= 80:
        return "high"
    return "very_high"


def get_referral(score: int) -> str:
    if score >= 81:
        return "pulmonologist"
    if score >= 61:
        return "ios"
    return "monitor"


@app.get("/health")
def health():
    return {"status": "ok", "model": "breathprint-mock-v1.0"}


@app.post("/v1/analyze", response_model=InferenceResponse)
async def analyze(
    breath_audio: UploadFile = File(...),
    cough_audio: UploadFile = File(...),
    metadata: str = Form(...),
):
    meta = json.loads(metadata)
    symptoms = meta.get("symptoms", {})
    symptom_avg = sum(symptoms.values()) / max(len(symptoms), 1)
    pm25 = meta.get("pm25UgM3", 42.6)
    exposure = meta.get("exposureDoseWeekly", 1000)

    score = int(
        min(
            95,
            max(
                10,
                25
                + symptom_avg * 8
                + pm25 / 50 * 15
                + exposure / 1200 * 20
                + random.randint(-5, 5),
            ),
        )
    )

    bullets = [
        "ระยะหายใจออกยาวขึ้น (I:E ratio ↑)",
        "พลังงานความถี่สูงลดในช่วงท้ายการหายใจออก",
        "พบเหตุการณ์เสียงผิดปกติที่ 2.1–2.6 วินาที (time-grounded)",
    ]
    if pm25 > 35:
        bullets.append(f"PM2.5 ปัจจุบัน {pm25:.1f} µg/m³ — สูงกว่าเกณฑ์ WHO")

    return InferenceResponse(
        risk_score=score,
        risk_band=get_risk_band(score),
        explanation_bullets=bullets,
        time_events=[
            TimeEvent(
                start=2.1,
                end=2.6,
                label="ลดพลังงานความถี่สูงในช่วงท้ายการหายใจออก",
            )
        ],
        exposure_delta_pct=meta.get("exposureDeltaPct"),
        referral_level=get_referral(score),
        model_version="breathprint-mock-v1.0",
    )
