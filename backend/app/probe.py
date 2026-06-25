"""Phase 1 — SSL audio ENCODER + layer-weighted PROBE (AG-REPA / CardiacZ seam).

This is the research technique (proposal §6–7): use a self-supervised audio
encoder (Dasheng / BEATs / Hubert / Wav2Vec2 — all SSL audio transformers) as a
FEATURE EXTRACTOR, combine its per-layer hidden states with LAYER WEIGHTS (the
SUPERB / AG-REPA "which layer matters" question), and feed a small PROBE HEAD for
the downstream task — instead of using an off-the-shelf classifier head (AST).

Honest status:
  * The encoder runs on the REAL audio and produces REAL hidden-state features +
    per-layer energies. That part is live.
  * The layer-weighting machinery is in place — this is where AG-REPA's FoG-A
    causal layer selection WOULD set the weights (see select_layers_ag_repa).
  * The PROBE HEAD is UNTRAINED: there is no IOS-labelled SAD data yet (Phase 3),
    so `probe_logit` is a deterministic PLACEHOLDER, not a real SAD prediction.

Swap the encoder via HF_ENCODER_MODEL (default facebook/hubert-base-ls960 — a
reliable SSL audio encoder; switch to Dasheng/BEATs when their HF-native loading
is confirmed). The architecture is encoder-agnostic.
"""
from __future__ import annotations

import numpy as np

_ENC: dict = {}


def load_encoder(model_id: str):
    if model_id in _ENC:
        return _ENC[model_id]
    from transformers import AutoModel, AutoFeatureExtractor

    fe = AutoFeatureExtractor.from_pretrained(model_id)
    model = AutoModel.from_pretrained(model_id)
    model.eval()
    _ENC[model_id] = (fe, model)
    return fe, model


def select_layers_ag_repa(num_layers: int) -> np.ndarray:
    """Layer weights — PLACEHOLDER for AG-REPA causal layer selection (FoG-A probe).

    CardiacZ found mid-to-late layers carry the most task-relevant semantics
    (proposal §7). Default: uniform weight on the top ~40% of layers (the
    'causal band'). Replace with the real FoG-A selection once the encoder is
    fixed and probe-training (IOS) data exists.
    """
    w = np.zeros(num_layers, dtype="float32")
    start = max(1, int(num_layers * 0.6))
    w[start:] = 1.0
    s = w.sum()
    return w / s if s > 0 else w


def extract(audio_16k: np.ndarray, model_id: str) -> dict:
    """Encode audio → layer-weighted pooled feature + probe diagnostics."""
    import torch

    fe, model = load_encoder(model_id)
    iv = fe(audio_16k, sampling_rate=16000, return_tensors="pt").input_values
    with torch.no_grad():
        out = model(iv, output_hidden_states=True)

    hs = out.hidden_states  # tuple(len L+1): embeddings + L transformer layers, each (1, T, D)
    L = len(hs)
    D = int(hs[-1].shape[-1])
    weights = select_layers_ag_repa(L)

    stacked = torch.stack(hs, dim=0)  # (L, 1, T, D)
    w = torch.tensor(weights, dtype=stacked.dtype).view(L, 1, 1, 1)
    feat_time = (stacked * w).sum(dim=0)  # (1, T, D)
    pooled = feat_time.mean(dim=1).squeeze(0)  # (D,)

    # Probe head — deterministic but UNTRAINED (fixed random direction; placeholder
    # until IOS-labelled data trains a real SAD probe in Phase 3).
    g = torch.Generator()
    g.manual_seed(42)
    direction = torch.randn(D, generator=g)
    probe_logit = float((pooled * direction).sum())

    return {
        "encoder": model_id,
        "num_layers": L,
        "hidden_dim": D,
        "layer_weights": [round(float(x), 3) for x in weights],
        "feature_norm": round(float(pooled.norm().item()), 3),
        "layer_energy": [round(float(h.norm().item()), 1) for h in hs],
        "probe_logit": round(probe_logit, 4),
        "probe_note": "untrained probe head — needs IOS-labelled data (Phase 3)",
    }
