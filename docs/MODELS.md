# BreathPrint — Sound Model Shortlist & Integration Seam

The current inference layer (`apps/web/src/lib/inference.ts` and `services/inference/main.py`)
is a **deterministic MOCK** (`breathprint-mock-v2.0`): a staged pipeline
(capture → denoise → segment → spectral → calibrated risk) that derives stable
pseudo-features from the recording so results are reproducible, but no real ML
runs. This document is the menu of real models to drop into that seam.

Source: `BreathPrint/BreathPrint_AI_Proposal.html` §9 (Audio-LLM) and §10 (encoder).
Last reviewed against the proposal (v2.0, 2026).

---

## 1) Audio-LLM (the "explainable" core) — proposal §9

| Model (year) | Encoder → LLM | Why it fits BreathPrint | Verdict |
|---|---|---|---|
| **Audio Flamingo 3 (2025, NVIDIA/UMD)** | AF-Whisper → linear | Fully open (weights+data+code), native **LoRA + CoT**, covers non-speech sound events, 10-min context | ✅ **PRIMARY** |
| Qwen2.5-Omni 7B (2025, Alibaba) | block-enc → Thinker-Talker | Best-open MMAU ~65.6; near drop-in from Qwen2-Audio | drop-in upgrade |
| MiDashengLM 7B (2025, Xiaomi) | **Dasheng** → Qwen2.5-Omni | One encoder for both classify + explain; faster; open | unified stack |
| Audio Flamingo Next (2026, NVIDIA/UMD) | AF-Whisper, 30-min | **Time-grounding** (locates abnormal sounds in time) — maps to our `timeEvents` | watch / upgrade |
| SALMONN (2024, Tsinghua/ByteDance) | Whisper + **BEATs** → Q-Former | Dual-encoder, good sound-event coverage | alternative |
| Qwen2-Audio (2024, Alibaba) | Whisper → linear | Old baseline | baseline only |
| Gemini 2.5 / GPT-4o audio | closed | Can't fine-tune or pull layers | baseline/comparison only |

**Recommendation:** **Audio Flamingo 3** as primary (open + LoRA + explains + good on non-speech);
**Qwen2.5-Omni 7B** as the low-risk drop-in; **MiDashengLM** for a unified Dasheng stack.

## 2) Encoder (the acoustic representation) — proposal §10

| Encoder (year) | Type | AudioSet mAP | Note | Verdict |
|---|---|---|---|---|
| **Dasheng (2024)** | MAE @272k hrs | ~49.7 | Open, multi-size; encoder of MiDashengLM | ✅ **LLM-ready** |
| **BEATs (2022/23)** | SSL + acoustic tokenizer | 48.6 | Standard encoder for audio-LLMs (SALMONN); proven on respiratory | ✅ **proven** |
| DASS (2024/25) | Distilled SSM | 47.2–50.2 | First SSM to beat transformers on AudioSet; long audio | SSM successor to SSAMBA |
| EAT (2024) | Bootstrap SSL | ~49.5 | 10–15× faster to train than BEATs | efficient |
| M2D / M2D-CLAP (2024–25) | Masked Modeling Duo | 48.5–49.0 | Has **ICBHI specialization** (medical-aware) | medical |
| AST / PaSST / HTS-AT | Supervised transformer | 45.9–47.1 | Common respiratory backbone | classic baseline |

**Recommendation:** **Dasheng** (accurate + feeds MiDashengLM → one encoder for classify + explain)
or **BEATs** (proven on respiratory + pairs with SALMONN). If keeping the state-space line
(succeeding the old SSAMBA), use **DASS**. Consider **M2D-X** for its ICBHI specialization.

> The proposal also specifies a **layer-weighted probe head** (causal layer
> selection from AG-REPA via the FoG-A probe) on a mid-to-late layer band
> (e.g. 24–31 of ~32) for the classification logit, with the LLM's
> autoregressive head producing the explanation. This dual-head design is the
> "modification of VLM layers" the proposal argues for.

---

## 3) Where to plug a real model in

The mock already mirrors the target shape, so swapping is localized:

**Frontend (`apps/web/src/lib/inference.ts`)** — two pure stages are the seam:
- `spectralFeaturesStage(req, capture, rng)` → replace with **encoder embeddings**
  (Dasheng/BEATs) of the breath/cough audio.
- `calibratedRiskStage(...)` → replace the heuristic with the **layer-weighted
  probe** (classification logit) + keep the calibration + confidence logic.
- `timeEvents` come from segmentation today; with Audio Flamingo Next they'd come
  from the model's time-grounding.

**Inference service (`services/inference/main.py`)** — `/v1/analyze` already
accepts the real `breath_audio`/`cough_audio` uploads + `metadata` and returns
the matching schema (`risk_score`, `confidence`, `risk_band`,
`explanation_bullets`, `time_events`, `referral_level`, `model_version`). To go
live:
1. Add the model + encoder to `services/inference/requirements.txt`
   (e.g. `torch`, `torchaudio`, `transformers`, the AF3 / Dasheng package).
2. Load the model at startup; in `analyze()` run the encoder → layer-probe →
   explanation head on the uploaded bytes.
3. Set `MODEL_VERSION` to the real model id; flip the client to the remote path
   via `VITE_INFERENCE_API_URL`.

The deterministic mock can stay as the offline fallback (no GPU) — `runInference`
already routes to remote when `VITE_INFERENCE_API_URL` is set, else local mock.

## 4) Training-recipe techniques to carry over (proposal §11)

When real data (the proposed **BreathPrint–Chiang Mai** cohort with IOS labels)
is available, apply: Patch-Mix contrastive learning, stethoscope/device-guided
SCL (critical for varied phone mics), metadata-as-text fusion, learned denoising
front-end, patient-consistent multi-cycle learning, and class-balanced losses +
temperature-scaled calibration.

## 5) Ground truth (proposal §12)

Label early SAD with **Impulse Oscillometry (IOS): R5–R20, AX, X5** (more
sensitive than spirometry). Spirometry is the comparator to beat, not the label.
