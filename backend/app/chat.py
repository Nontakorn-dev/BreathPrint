"""Typhoon chat (Thai LLM, OpenAI-compatible) for the AI assistant.

The API key is read from the environment (TYPHOON_API_KEY) — it is NEVER in code
or committed. If the key is absent, the endpoint returns a safe local fallback so
the assistant still works (offline/local mode).
"""
from __future__ import annotations

import json
from typing import Any

from .config import get_settings

SYSTEM_PROMPT = """คุณคือ "ผู้ช่วย AI" ของ BreathPrint — เครื่องมือคัดกรองภาวะ Small Airway Dysfunction (SAD)
จากเสียงหายใจ/ไอ และ PM2.5 สำหรับบริบทไทย ตอบเป็นภาษาไทยเป็นหลัก (ตอบอังกฤษได้ถ้าผู้ใช้ถามภาษาอังกฤษ)
กรุ๊บ/กรุ๊บ สุภาพ กระชับ ไม่เกิน 4–6 บรรทัด

กฎเข้มงวด:
- BreathPrint เป็น "เครื่องมือคัดกรอก" ไม่ใช่การวินิจฉัย ห้ามใช้คำว่าวินิจฉัย/รักษา/สั่งยาเด็ดขาด
- แนะนำให้พบแพทย์/ตรวจ IOS เมื่อความเสี่ยงสูง หรือเมื่อมีอาการรุนแรง (หายใจลำบาก เจ็บหน้าอก ตามเหมาะสม)
- อ้างอิงผลของผู้ใช้ที่ให้มาในส่วนบริบท อย่าแต่งตัวเลขขึ้นเอง
- ถ้าข้อมูลบริบทไม่พอ ให้แนะนำให้ผู้ใช้ไปทำการคัดกรองก่อน"""


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
    settings = get_settings()
    if not settings.typhoon_api_key:
        return (
            "ขออภัย ผู้ช่วย AI ยังไม่ได้เชื่อม LLM (ยังไม่ได้ตั้ง TYPHOON_API_KEY) "
            "ตอนนี้ตอบกลับในโหมดจำกัด — ลองดูผลคัดกรองและคำแนะนำส่งตรวจในหน้าผลได้ครับ/ค่ะ"
        )

    import httpx

    payload = {
        "model": settings.typhoon_model,
        "temperature": 0.3,
        "max_tokens": 400,
        "messages": [
            {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n--- บริบทผู้ใช้ ---\n{_ctx_summary(ctx)}"},
            {"role": "user", "content": message},
        ],
    }
    headers = {
        "Authorization": f"Bearer {settings.typhoon_api_key}",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(
                f"{settings.typhoon_base_url}/chat/completions",
                json=payload,
                headers=headers,
            )
        res.raise_for_status()
        data = res.json()
        return (data.get("choices") or [{}])[0].get("message", {}).get("content", "").strip()
    except Exception as exc:
        print(f"[chat] Typhoon call failed ({type(exc).__name__}): {exc}")
        return (
            "ขออภัย ไม่สามารถเรียกผู้ช่วย AI ได้ในขณะนี้ ลองใหม่อีกครั้ง "
            "หรือดูผลคัดกรองและคำแนะนำส่งตรวจในหน้าผลได้ครับ/ค่ะ"
        )
