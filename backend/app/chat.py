"""Typhoon (Thai LLM, OpenAI-compatible) — AI assistant chat + audio-grounded
result explanation (Phase 2).

The API key is read from the environment (TYPHOON_API_KEY) — NEVER in code.
If the key is absent, callers get a safe local fallback so the app still works.
"""
from __future__ import annotations

import json
from typing import Any

from .config import get_settings

SYSTEM_PROMPT = """คุณคือ "ผู้ช่วย AI" ของ BreathPrint — เครื่องมือคัดกรองภาวะ Small Airway Dysfunction (SAD)
จากเสียงหายใจ/ไอ และ PM2.5 สำหรับบริบทไทย ตอบเป็นภาษาไทยเป็นหลัก (ตอบอังกฤษได้ถ้าผู้ใช้ถามภาษาอังกฤษ)
สุภาพ กระชับ ไม่เกิน 4–6 บรรทัด

กฎเข้มงวด:
- BreathPrint เป็น "เครื่องมือคัดกรอง" ไม่ใช่การวินิจฉัย ห้ามใช้คำว่าวินิจฉัย/รักษา/สั่งยาเด็ดขาด
- แนะนำให้พบแพทย์/ตรวจ IOS เมื่อความเสี่ยงสูง หรือเมื่อมีอาการรุนแรง
- อ้างอิงผลของผู้ใช้ที่ให้มา อย่าแต่งตัวเลขขึ้นเอง"""

EXPLAIN_SYSTEM = """คุณคือ "นักวิเคราะห์เสียง" ของ BreathPrint
รับผลวิเคราะห์เสียงจริง (จากโมเมล AST + SSL encoder) ของผู้ใช้ แล้วเขียน "คำอธิบายผล" เป็นภาษาไทย
2–4 ประโยค กระชับ อธิบายว่าทำไมคะแนนความเสี่ยงจึงออกแบบนั้น โดยอ้างอิงสัญญาณเสียงจริงที่ให้
กฎ: เป็นเครื่องมือคัดกรอง ไม่ใช่วินิจฉัย; ห้ามแต่งตัวเลขนอกเหนือจากที่ให้; ถ้าไม่พบความผิดปกติให้บอกตรงๆ"""

_FALLBACK = (
    "ขออภัย ไม่สามารถเรียกผู้ช่วย AI ได้ในขณะนี้ ลองใหม่อีกครั้ง "
    "หรือดูผลคัดกรองและคำแนะนำส่งตรวจในหน้าผลได้ครับ/ค่ะ"
)


async def _typhoon_complete(system: str, user: str, temperature: float = 0.3, max_tokens: int = 400) -> str | None:
    """Call Typhoon /chat/completions. Returns the assistant text, or None on any failure / no key."""
    settings = get_settings()
    if not settings.typhoon_api_key:
        return None
    import httpx

    payload = {
        "model": settings.typhoon_model,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    headers = {"Authorization": f"Bearer {settings.typhoon_api_key}", "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                f"{settings.typhoon_base_url}/chat/completions", json=payload, headers=headers
            )
        res.raise_for_status()
        return (res.json().get("choices") or [{}])[0].get("message", {}).get("content", "").strip()
    except Exception as exc:
        print(f"[chat] Typhoon failed ({type(exc).__name__}): {exc}")
        return None


def _ctx_summary(ctx: dict[str, Any]) -> str:
    if not ctx:
        return "(ยังไม่มีข้อมูลผู้ใช้)"
    parts: list[str] = []
    p = ctx.get("profile") or {}
    if p:
        parts.append(f"โปรไฟล์: อายุ {p.get('age','?')}, สูบบุหรี่ {p.get('smokingStatus','?')}")
    r = ctx.get("latestResult") or {}
    if r:
        parts.append(
            f"ผลล่าสุด: Risk Score {r.get('riskScore','?')}/100, ระดับ {r.get('riskBand','?')}, "
            f"ความมั่นใจ {round((r.get('confidence') or 0)*100)}%, แนะนำส่งตรวจ {r.get('referralLevel','?')}"
        )
    else:
        parts.append("ผลล่าสุด: ยังไม่มี")
    b = ctx.get("baseline") or {}
    if b:
        parts.append(f"Baseline เฉลี่ย Risk {b.get('avgRiskScore','?')} จาก {b.get('screeningCount','?')} ครั้ง")
    s = ctx.get("latestSession") or {}
    if s:
        parts.append(f"PM2.5 ล่าสุด {s.get('pm25UgM3','?')} µg/m³, Exposure Dose {s.get('exposureDoseWeekly','?')}")
    return "\n".join(parts)


async def chat(message: str, ctx: dict[str, Any]) -> str:
    if not get_settings().typhoon_api_key:
        return (
            "ขออภัย ผู้ช่วย AI ยังไม่ได้เชื่อม LLM (ยังไม่ได้ตั้ง TYPHOON_API_KEY) "
            "ตอนนี้ตอบกลับในโหมดจำกัด — ลองดูผลคัดกรองและคำแนะนำส่งตรวจในหน้าผลได้ครับ/ค่ะ"
        )
    system = f"{SYSTEM_PROMPT}\n\n--- บริบทผู้ใช้ ---\n{_ctx_summary(ctx)}"
    reply = await _typhoon_complete(system, message, temperature=0.3, max_tokens=400)
    return reply or _FALLBACK


async def generate_explanation(findings: dict[str, Any]) -> str | None:
    """Phase 2 — turn the REAL acoustic findings (AST events + encoder features +
    time-grounded event + metadata) into a concise Thai explanation via Typhoon.

    This is an AUDIO-GROUNDED LLM explanation, not a true audio-LLM (the LLM does
    not listen directly — it reads the real features the AST/encoder extracted).
    A true audio-LLM (Audio Flamingo 3) needs a GPU; this runs on free CPU.
    Returns None if Typhoon is unavailable (caller falls back to template bullets).
    """
    user = (
        "ผลวิเคราะห์จริงจากเสียงที่ผู้ใช้อัด (เสียงหายใจ/ไอ):\n"
        f"{json.dumps(findings, ensure_ascii=False)}\n\n"
        "เขียนคำอธิบายผลเป็นไทย (2–4 ประโยค) อ้างอิงสัญญาณเสียงจริงเหล่านี้:"
    )
    return await _typhoon_complete(EXPLAIN_SYSTEM, user, temperature=0.4, max_tokens=300)
