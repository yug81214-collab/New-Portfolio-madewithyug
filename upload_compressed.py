"""
Upload the compressed portfolio assets to Supabase storage.
"""
import os
import sys
from pathlib import Path
import requests

# ---- Config ----
SUPABASE_URL = "https://eofsfitnbipibfapavbn.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZnNmaXRuYmlwaWJmYXBhdmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY1Mzk3OCwiZXhwIjoyMTAxMjI5OTc4fQ.Vm0B0F3S3PfR5tYp_wxxNfPOH_IA7e-6wC4KBDaUjoo"
BUCKET = "site-media"
DRIVE_ASSETS = Path(__file__).parent / "drive_assets"

def upload_file(local_path: Path, storage_path: str) -> str:
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}"
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "video/mp4",
        "x-upsert": "true",
    }
    print(f"  Uploading {local_path.name} -> {storage_path} ...", end="", flush=True)
    with open(local_path, "rb") as f:
        resp = requests.post(url, headers=headers, data=f)
    
    if resp.status_code in (200, 201):
        print(" OK")
        return storage_path
    else:
        print(f" FAIL ({resp.status_code}: {resp.text[:120]})")
        return ""

def main():
    uploads = {
        "ba_edit_video": (DRIVE_ASSETS / "Before_After" / "Edit(My Edit)_compressed.mp4", "portfolio-media/ba_edit.mp4"),
        "ba_raw_video": (DRIVE_ASSETS / "Before_After" / "raw_compressed.mp4", "portfolio-media/ba_raw.mp4"),
        "short2_video": (DRIVE_ASSETS / "short forms" / "Comp 1_8_compressed.mp4", "portfolio-media/s2.mp4"),
        "short5_video": (DRIVE_ASSETS / "short forms" / "valuable edit_2_compressed.mp4", "portfolio-media/s5.mp4"),
    }
    
    print("\n=== Uploading compressed files to Supabase storage ===")
    for key, (local_path, storage_path) in uploads.items():
        if not local_path.exists():
            print(f"  SKIP {key}: file not found at {local_path}")
            continue
        upload_file(local_path, storage_path)
    
    print("\nDone!")

if __name__ == "__main__":
    main()
