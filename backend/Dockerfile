FROM python:3.12-slim

# libsndfile for soundfile (WAV decode); ffmpeg in case webm is ever sent.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libsndfile1 ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# The AST model (~340MB) is downloaded from HuggingFace on first request and
# cached. Set HF_HOME to persist it across restarts if you mount a volume.
ENV HF_HOME=/data/hf_cache

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
