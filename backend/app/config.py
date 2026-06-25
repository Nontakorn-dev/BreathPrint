"""Runtime configuration — all secrets come from environment variables only.
Nothing is hard-coded. Copy backend/.env.example → backend/.env and fill it in
(.env is git-ignored)."""
from __future__ import annotations
import os
from dataclasses import dataclass
from dotenv import load_dotenv

# Load backend/.env (git-ignored) so os.getenv sees TYPHOON_API_KEY etc.
# Runs at import time, before get_settings() reads anything.
load_dotenv()


@dataclass(frozen=True)
class Settings:
    # Typhoon (Thai LLM, OpenAI-compatible) — used by /chat. NEVER commit a key.
    typhoon_api_key: str | None
    typhoon_base_url: str
    typhoon_model: str
    # Real audio model (HuggingFace). Optional — falls back to deterministic mock.
    hf_audio_model: str
    # Phase 1: SSL audio ENCODER for the layer-weighted probe (AG-REPA/CardiacZ seam).
    encoder_model: str
    # CORS: the deployed frontend origin.
    cors_origin: str


def get_settings() -> Settings:
    return Settings(
        typhoon_api_key=os.getenv("TYPHOON_API_KEY") or None,
        typhoon_base_url=os.getenv("TYPHOON_BASE_URL", "https://api.opentyphoon.ai/v1"),
        typhoon_model=os.getenv("TYPHOON_MODEL", "typhoon-v2.5-30b-a3b-instruct"),
        hf_audio_model=os.getenv("HF_AUDIO_MODEL", "MIT/ast-finetuned-audioset-10-10-0.4593"),
        encoder_model=os.getenv("HF_ENCODER_MODEL", "facebook/hubert-base-ls960"),
        cors_origin=os.getenv("CORS_ORIGIN", "*"),
    )
