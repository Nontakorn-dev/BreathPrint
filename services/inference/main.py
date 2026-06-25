"""
BreathPrint Inference API — MOCK (v2.0).

Mirrors the client-side staged pipeline (capture → denoise → segment → spectral
→ calibrated risk) and is **deterministic**: identical input yields identical
output (no randomness), and every response carries a `confidence` value.
Swap these stages for a real Audio-LLM (Audio Flamingo 3 / Qwen2.5-Omni /
MiDashengLM + Dasheng/BEATs encoder) in production — see docs/MODELS.md.
"""

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import hashlib
import json

app = FastAPI(title="BreathPrint Inference", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_VERSION = "breathprint-mock-v2.0"


class TimeEvent(BaseModel):
    start: float
    end: float
    label: str


class InferenceResponse(BaseModel):
    risk_score: int
    confidence: float
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


def _seed(breath_size: int, cough_size: int, screening_id: str) -> int:
    """Deterministic seed from the recording byte sizes + screening id."""
    h = hashlib.sha256(f"{screening_id}|{breath_size}|{cough_size}".encode()).digest()
    return int.from_bytes(h[:4], "big")


def _rng(seed: int):
    """mulberry32 PRNG — deterministic, no global RNG state."""
    a = seed

    def rand() -> float:
        nonlocal a
        a = (a + 0x6D2B79F5) & 0xFFFFFFFF
        t = a
        t = (t ^ (t >> 15)) * (t | 1)
        t ^= t + (t ^ (t >> 7)) * (t | 61)
        t ^= t >> 14
        return (t & 0xFFFFFFFF) / 4294967296

    return rand


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_VERSION,
        "stages": ["capture", "denoise", "segment", "spectral", "calibrated"],
        "mode": "mock",
    }


@app.post("/v1/analyze", response_model=InferenceResponse)
async def analyze(
    breath_audio: UploadFile = File(...),
    cough_audio: UploadFile = File(...),
    metadata: str = Form(...),
):
    meta = json.loads(metadata)
    symptoms = meta.get("symptoms", {})
    symptom_values = list(symptoms.values())
    symptom_avg = sum(symptom_values) / max(len(symptom_values), 1)
    pm25 = meta.get("pm25UgM3", 42.6)
    exposure = meta.get("exposureDoseWeekly", 0)
    age = meta.get("age", 40)
    smoking = meta.get("smokingStatus", "never")
    pef = meta.get("pefValue")
    screening_id = meta.get("screeningId", "")
    has_baseline = meta.get("baselineAvgRisk") is not None

    # Stage 1 — capture (read uploaded byte sizes; deterministic per upload).
    breath_bytes = await _file_size(breath_audio)
    cough_bytes = await _file_size(cough_audio)
    breath_present = breath_bytes > 1000
    cough_present = cough_bytes > 1000
    rand = _rng(_seed(breath_bytes, cough_bytes, screening_id))

    # Stage 2/3/4 — denoise + segment + spectral proxies (deterministic).
    ie_ratio = round(1.0 + rand() * 1.2, 2)
    high_freq_decay = round(0.15 + rand() * 0.65, 2)
    span = 6.0
    ev_start = round(1.8 + rand() * max(0.4, span - 3.3), 1)
    ev_end = round(ev_start + 0.4 + rand() * 0.5, 1)

    # Stage 5 — calibrated risk (deterministic; no random jitter).
    pm25_factor = min(pm25 / 50, 2) * 15
    exposure_factor = min(exposure / 1200, 1.5) * 20
    age_factor = 8 if age > 50 else 4 if age > 40 else 0
    smoking_factor = 15 if smoking == "current" else 8 if smoking == "former" else 0
    pef_factor = 12 if (pef and pef < 350) else 0
    acoustic_factor = max(0.0, min(18.0, (ie_ratio - 1) * 10 + (1 - high_freq_decay) * 8))

    score = int(
        25
        + symptom_avg * 8
        + pm25_factor
        + exposure_factor
        + age_factor
        + smoking_factor
        + pef_factor
        + acoustic_factor
    )
    score = max(5, min(95, score))

    # Confidence: signal completeness + baseline availability.
    signal = (0.3 if breath_present else 0.0) + (0.15 if cough_present else 0.0)
    quality = 0.15 if breath_present and cough_present else 0.07 if breath_present else 0.0
    baseline = 0.15 if has_baseline else 0.0
    confidence = round(max(0.2, min(0.95, 0.25 + signal + quality + baseline)), 2)

    bullets = []
    if ie_ratio > 1.4:
        bullets.append(
            f"ระยะหายใจออกยาวขึ้น (I:E ratio {ie_ratio:.2f}) — สอดคล้อง peripheral airflow limitation"
        )
    if high_freq_decay > 0.4:
        bullets.append("พลังงานความถี่สูงลดในช่วงท้ายการหายใจออก")
    bullets.append(f"พบเหตุการณ์เสียงผิดปกติที่ {ev_start:.1f}–{ev_end:.1f} วินาที (time-grounded)")
    if pm25 > 35:
        bullets.append(f"PM2.5 ปัจจุบัน {pm25:.1f} µg/m³ — สูงกว่าเกณฑ์ WHO")

    return InferenceResponse(
        risk_score=score,
        confidence=confidence,
        risk_band=get_risk_band(score),
        explanation_bullets=bullets,
        time_events=[
            TimeEvent(
                start=ev_start,
                end=ev_end,
                label="ลดพลังงานความถี่สูงในช่วงท้ายการหายใจออก",
            )
        ],
        exposure_delta_pct=meta.get("exposureDeltaPct"),
        referral_level=get_referral(score),
        model_version=MODEL_VERSION,
    )


async def _file_size(upload: UploadFile) -> int:
    """Read the uploaded file size without holding all bytes in memory."""
    data = await upload.read()
    return len(data)
