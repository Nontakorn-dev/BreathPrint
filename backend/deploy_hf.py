#!/usr/bin/env python3
"""Deploy the BreathPrint backend to a Hugging Face Space (Docker SDK).

One-time setup:
    pip install -U "huggingface_hub[cli]"
    hf auth login            # paste an access token from https://huggingface.co/settings/tokens
                             # (older CLI: `huggingface-cli login`)

Deploy:
    python backend/deploy_hf.py <your-hf-username>

Then set Secrets in the Space settings (TYPHOON_API_KEY, CORS_ORIGIN).
"""
import os
import shutil
import sys
import tempfile

from huggingface_hub import HfApi, create_repo

if len(sys.argv) < 2:
    sys.exit("usage: python backend/deploy_hf.py <hf-username>  (e.g. nontakorn)")

user = sys.argv[1].strip("/")
repo_id = f"{user}/breathprint-backend"

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)  # BreathPrint repo root

stage = tempfile.mkdtemp(prefix="bp_hf_")
try:
    shutil.copytree(os.path.join(root, "backend", "app"), os.path.join(stage, "app"))
    shutil.copy(os.path.join(root, "backend", "requirements.txt"), stage)
    shutil.copy(os.path.join(root, "backend", "Dockerfile.hf"), os.path.join(stage, "Dockerfile"))
    shutil.copy(os.path.join(root, "backend", "SPACE.md"), os.path.join(stage, "README.md"))

    api = HfApi()
    url = create_repo(repo_id, repo_type="space", space_sdk="docker", exist_ok=True)
    api.upload_folder(folder_path=stage, repo_id=repo_id, repo_type="space")

    print("✅ uploaded to:", url)
    print("Space page  : https://huggingface.co/spaces/" + repo_id)
    print("Public API  : https://" + repo_id.replace("/", "-") + ".hf.space")
    print("\nNext → Space → Settings → Variables and secrets, add:")
    print("  TYPHOON_API_KEY = <your OpenTyphoon key>")
    print("  CORS_ORIGIN     = https://web-ashen-ten-40.vercel.app")
finally:
    shutil.rmtree(stage, ignore_errors=True)
