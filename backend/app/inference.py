"""BreathPrint acoustic inference.

Primary path: a REAL pretrained audio model (MIT/ast-finetuned-audioset, trained
on Google AudioSet) extracts respiratory-relevant class probabilities (wheeze,
cough, breathing, snoring, speech) from the uploaded breath/cough audio. Those
real acoustic features feed the calibrated risk score.

Fallback path: if torch/transformers are unavailable or the audio cannot be
decoded, the service degrades to a deterministic mock (the same staged math as
the client). Either way the output is reproducible (no randomness).

IMPORTANT — there is NO pretrained model for Small Airway Dysfunction (SAD). That
is exactly the research gap BreathPrint aims to fill (see ../../docs/MODELS.md
and the proposal §12–13). The AudioSet model therefore provides *real respiratory
acoustic signals*; the mapping from those signals to a "SAD risk score" is still a
heuristic pending IOS-labelled training data. This module documents that honestly.
"""
from __future__ import annotations

import io
from typing import Any

_model_cache: dict[str, Any] = {}
_last_model_error: str | None = None
_last_encoder_error: str | None = None

# AudioSet ontology labels we extract (lower-cased match).
_TARGET_LABELS = {
    "wheeze": "wheeze",
    "cough": "cough",
    "breathing": "breathing",
    "snoring": "snoring",
    "speech": "speech",
    "sigh": "sigh",
    "gasp": "gasp",
}


def _load_model(model_id: str):
    """Lazily load + cache the AST model. Returns (processor, model) or None."""
    global _last_model_error
    if model_id in _model_cache:
        cached = _model_cache[model_id]
        return cached if cached else None
    try:
        import torch  # noqa: F401
        from transformers import ASTForAudioClassification, ASTFeatureExtractor

        processor = ASTFeatureExtractor.from_pretrained(model_id)
        model = ASTForAudioClassification.from_pretrained(model_id)
        model.eval()
        _model_cache[model_id] = (processor, model)
        _last_model_error = None
        return processor, model
    except Exception as exc:  # model unavailable → caller uses deterministic path
        _model_cache[model_id] = None
        _last_model_error = f"{type(exc).__name__}: {exc}"
        print(f"[inference] audio model unavailable ({type(exc).__name__}): {exc}")
        return None


def _decode_audio(data: bytes):
    """Decode audio bytes → (16 kHz mono float32 ndarray, numpy). None on failure.

    WAV/FLAC/OGG decode via soundfile (no ffmpeg). The frontend sends WAV, so this
    works on any host without ffmpeg. webm/opus would need ffmpeg (not assumed).
    """
    try:
        import librosa
        import numpy as np

        y, _ = librosa.load(io.BytesIO(data), sr=16000, mono=True)
        if y is None or len(y) < 1600:  # < ~0.1s
            return None
        return y.astype("float32"), np
    except Exception as exc:
        print(f"[inference] audio decode failed ({type(exc).__name__}): {exc}")
        return None


def _ast_probs(y, np, processor, model) -> dict[str, float]:
    """Run AST on a 16 kHz mono waveform → {feature: probability}."""
    import torch

    inputs = processor(y, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        logits = model(**inputs).logits
    probs = torch.sigmoid(logits)[0].tolist()  # AudioSet is multi-label → sigmoid
    id2label = model.config.id2label
    out: dict[str, float] = {}
    for idx, p in enumerate(probs):
        key = _TARGET_LABELS.get(str(id2label.get(idx, "")).lower())
        if key is not None:
            out[key] = max(out.get(key, 0.0), float(p))
    return out


def analyze(
    breath_bytes: bytes | None,
    cough_bytes: bytes | None,
    meta: dict,
    model_id: str,
    encoder_model_id: str | None = None,
) -> dict:
    symptoms = meta.get("symptoms", {}) or {}
    sym_vals = [float(v) for v in symptoms.values() if isinstance(v, (int, float))]
    symptom_avg = sum(sym_vals) / max(len(sym_vals), 1)
    pm25 = float(meta.get("pm25UgM3", 42.6))
    exposure = float(meta.get("exposureDoseWeekly", 0))
    age = int(meta.get("age", 40))
    smoking = meta.get("smokingStatus", "never")
    pef = meta.get("pefValue")
    screening_id = meta.get("screeningId", "")

    # AST (audio-event classifier) — interpretable probs (wheeze/cough/...).
    loaded = _load_model(model_id) if model_id else None
    features: dict[str, float] | None = None
    decoded: list = []  # keep decoded waveforms to reuse for the encoder
    if loaded and (breath_bytes or cough_bytes):
        processor, model = loaded
        agg: dict[str, float] = {}
        for raw in (breath_bytes, cough_bytes):
            if not raw:
                continue
            dec = _decode_audio(raw)
            if dec is None:
                continue
            decoded.append(dec)
            y, np = dec
            for k, v in _ast_probs(y, np, processor, model).items():
                agg[k] = max(agg.get(k, 0.0), v)
        if agg:
            features = agg

    # Phase 1: SSL encoder + layer-weighted probe (AG-REPA/CardiacZ seam).
    encoder_out: dict | None = None
    if encoder_model_id and decoded:
        try:
            from . import probe

            y, _np = decoded[0]  # run on the breath clip
            encoder_out = probe.extract(y, encoder_model_id)
        except Exception as exc:
            global _last_encoder_error
            _last_encoder_error = f"{type(exc).__name__}: {exc}"
            print(f"[inference] encoder/probe failed ({type(exc).__name__}): {exc}")

    if features is not None:
        risk, confidence, bullets, model_version = _risk_real(
            features, symptom_avg, pm25, exposure, age, smoking, pef, model_id
        )
    else:
        risk, confidence, bullets, model_version = _risk_deterministic(
            symptom_avg, pm25, exposure, age, smoking, pef, screening_id, breath_bytes, cough_bytes
        )

    if encoder_out is not None:
        model_version = f"breathprint-phase1-v1.0 (encoder+probe: {encoder_out['encoder'].split('/')[-1]} + AST)"
        bullets.append(
            f"Phase 1: SSL encoder {encoder_out['num_layers']} layers, dim {encoder_out['hidden_dim']} "
            f"→ layer-weighted probe (AG-REPA seam); probe ยังไม่ได้เทรน (รอข้อมูล IOS)"
        )

    return {
        "risk_score": risk,
        "confidence": confidence,
        "risk_band": _band(risk),
        "explanation_bullets": bullets,
        "time_events": _time_events(),
        "exposure_delta_pct": meta.get("exposureDeltaPct"),
        "referral_level": _referral(risk),
        "model_version": model_version,
        "encoder": encoder_out,
    }


# ----------------------------- real-model scoring -----------------------------
def _risk_real(f, symptom_avg, pm25, exposure, age, smoking, pef, model_id):
    wheeze = f.get("wheeze", 0.0)
    cough = f.get("cough", 0.0)
    breathing = f.get("breathing", 0.0)
    speech = f.get("speech", 0.0)

    pm25_factor = min(pm25 / 50, 2) * 15
    exposure_factor = min(exposure / 1200, 1.5) * 20
    age_factor = 8 if age > 50 else 4 if age > 40 else 0
    smoking_factor = 15 if smoking == "current" else 8 if smoking == "former" else 0
    pef_factor = 12 if (pef and pef < 350) else 0
    # Real acoustic contribution: wheeze + abnormal breathing raise risk.
    acoustic = min(22.0, wheeze * 25 + max(0.0, breathing - 0.5) * 12 + cough * 6)
    risk = max(5, min(95, int(round(25 + symptom_avg * 8 + pm25_factor + exposure_factor + age_factor + smoking_factor + pef_factor + acoustic))))
    # Higher confidence when the model ran and the clip wasn't mostly speech.
    signal = 1.0 - min(1.0, speech)
    confidence = round(max(0.45, min(0.93, 0.55 + signal * 0.25 + (0.13 if (wheeze > 0.3 or breathing > 0.4) else 0.0))), 2)

    bullets = []
    if wheeze > 0.3:
        bullets.append(f"ตรวจพบลักษณะเสียง wheeze (p={wheeze:.2f}) — บ่งชี้ความผิดปกติของทางเดินอากาศ")
    if breathing > 0.5:
        bullets.append(f"รูปแบบเสียงหายใจผิดปกติ (p={breathing:.2f})")
    if cough > 0.4:
        bullets.append(f"ตรวจพบเสียงไอ (p={cough:.2f})")
    if not bullets:
        bullets.append("ไม่พบลักษณะเสียงหายใจผิดปกติชัดเจนจากโมเดลเสียง")
    if pm25 > 35:
        bullets.append(f"PM2.5 ปัจจุบัน {pm25:.1f} µg/m³ — สูงกว่าเกณฑ์ WHO")
    bullets.append(f"วิเคราะห์ด้วยโมเดลเสียงจริง ({model_id.split('/')[-1]}) — ยังไม่ใช่โมเดลเฉพาะ SAD")
    return risk, confidence, bullets, f"breathprint-ast-v1.0 ({model_id})"


# --------------------------- deterministic fallback ---------------------------
def _risk_deterministic(symptom_avg, pm25, exposure, age, smoking, pef, screening_id, breath_bytes, cough_bytes):
    seed = _seed(breath_bytes, cough_bytes, screening_id)
    rng = _mulberry32(seed)
    ie_ratio = round(1.0 + rng() * 1.2, 2)
    hf_decay = round(0.15 + rng() * 0.65, 2)

    pm25_factor = min(pm25 / 50, 2) * 15
    exposure_factor = min(exposure / 1200, 1.5) * 20
    age_factor = 8 if age > 50 else 4 if age > 40 else 0
    smoking_factor = 15 if smoking == "current" else 8 if smoking == "former" else 0
    pef_factor = 12 if (pef and pef < 350) else 0
    acoustic = max(0.0, min(18.0, (ie_ratio - 1) * 10 + (1 - hf_decay) * 8))
    risk = max(5, min(95, int(round(25 + symptom_avg * 8 + pm25_factor + exposure_factor + age_factor + smoking_factor + pef_factor + acoustic))))

    breath_ok = bool(breath_bytes) and len(breath_bytes) > 1000
    cough_ok = bool(cough_bytes) and len(cough_bytes) > 1000
    confidence = round(max(0.2, min(0.95, 0.25 + (0.3 if breath_ok else 0) + (0.15 if cough_ok else 0) + (0.15 if breath_ok and cough_ok else 0.07))), 2)

    bullets = ["โมเดลเสียงไม่พร้อม — แสดงผลจาก heuristic (deterministic)"]
    return risk, confidence, bullets, "breathprint-mock-v2.0"


# --------------------------------- helpers ---------------------------------
def _band(score: int) -> str:
    if score <= 30:
        return "low"
    if score <= 60:
        return "moderate"
    if score <= 80:
        return "high"
    return "very_high"


def _referral(score: int) -> str:
    if score >= 81:
        return "pulmonologist"
    if score >= 61:
        return "ios"
    return "monitor"


def _time_events() -> list[dict]:
    # Deterministic placeholder time-grounding (a real model would localize events).
    return [{"start": 2.1, "end": 2.6, "label": "ลดพลังงานความถี่สูงในช่วงท้ายการหายใจออก"}]


def _seed(breath_bytes, cough_bytes, screening_id: str) -> int:
    import hashlib

    bh = len(breath_bytes or b"")
    ch = len(cough_bytes or b"")
    h = hashlib.sha256(f"{screening_id}|{bh}|{ch}".encode()).digest()
    return int.from_bytes(h[:4], "big")


def _mulberry32(a: int):
    def rand() -> float:
        nonlocal a
        a = (a + 0x6D2B79F5) & 0xFFFFFFFF
        t = a
        t = (t ^ (t >> 15)) * (t | 1)
        t ^= t + (t ^ (t >> 7)) * (t | 61)
        t ^= t >> 14
        return (t & 0xFFFFFFFF) / 4294967296

    return rand
