"""
Upload portfolio assets to Supabase storage.
Renames .jpg.jpeg -> .jpg and uploads all media files.
"""
import os
import shutil
import sys
from pathlib import Path

# ---- Config ----
SUPABASE_URL = "https://eofsfitnbipibfapavbn.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZnNmaXRuYmlwaWJmYXBhdmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY1Mzk3OCwiZXhwIjoyMTAxMjI5OTc4fQ.Vm0B0F3S3PfR5tYp_wxxNfPOH_IA7e-6wC4KBDaUjoo"
BUCKET = "site-media"
DRIVE_ASSETS = Path(__file__).parent / "drive_assets"

import requests

def upload_file(local_path: Path, storage_path: str) -> str:
    """Upload a file to Supabase storage and return the public URL."""
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_path}"
    
    # Determine content type
    ext = local_path.suffix.lower()
    content_types = {
        ".mp4": "video/mp4",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webm": "video/webm",
    }
    content_type = content_types.get(ext, "application/octet-stream")
    
    headers = {
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": content_type,
        "x-upsert": "true",  # overwrite if exists
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


def rename_jpeg_files(folder: Path):
    """Rename .jpg.jpeg files to .jpg"""
    for f in folder.rglob("*.jpeg"):
        if f.name.endswith(".jpg.jpeg"):
            new_name = f.with_suffix("").with_suffix(".jpg")
            if not new_name.exists():
                print(f"  Renaming {f.name} -> {new_name.name}")
                f.rename(new_name)
            else:
                print(f"  Skipping rename (target exists): {new_name.name}")


def main():
    if not DRIVE_ASSETS.exists():
        print(f"ERROR: drive_assets folder not found at {DRIVE_ASSETS}")
        sys.exit(1)

    print("\n=== Renaming .jpg.jpeg files ===")
    rename_jpeg_files(DRIVE_ASSETS)

    # Map local files to storage paths
    uploads = {}

    # Introduction image
    intro_candidates = list((DRIVE_ASSETS / "Introduction image(my image)").glob("*.jpg"))
    if intro_candidates:
        uploads["intro"] = (intro_candidates[0], "portfolio-media/intro.jpg")

    # Before/After
    ba_edit = DRIVE_ASSETS / "Before_After" / "Edit(My Edit).mp4"
    ba_raw_candidates = list((DRIVE_ASSETS / "Before_After").glob("Raw*.mp4")) + \
                        list((DRIVE_ASSETS / "Before_After").glob("raw*.mp4"))
    
    if ba_edit.exists():
        uploads["ba_edit_video"] = (ba_edit, "portfolio-media/ba_edit.mp4")
    if ba_raw_candidates:
        uploads["ba_raw_video"] = (ba_raw_candidates[0], "portfolio-media/ba_raw.mp4")

    # Long form videos
    long_folder = DRIVE_ASSETS / "Long forms"
    if long_folder.exists():
        long_vids = sorted(long_folder.glob("*.mp4"))
        for i, v in enumerate(long_vids, 1):
            uploads[f"long{i}_video"] = (v, f"portfolio-media/long{i}.mp4")

    # Short form videos
    short_folder = DRIVE_ASSETS / "short forms"
    if short_folder.exists():
        short_vids = sorted(short_folder.glob("*.mp4"))
        for i, v in enumerate(short_vids, 1):
            uploads[f"short{i}_video"] = (v, f"portfolio-media/s{i}.mp4")

    print(f"\n=== Uploading {len(uploads)} files to Supabase storage ===")
    results = {}
    
    for key, (local_path, storage_path) in uploads.items():
        if not local_path.exists():
            print(f"  SKIP {key}: file not found at {local_path}")
            continue
        result = upload_file(local_path, storage_path)
        if result:
            results[key] = f"portfolio-media/{storage_path.split('/')[-1]}"

    print("\n=== Upload Results ===")
    for k, v in results.items():
        print(f"  {k}: {v}")

    print("\n=== Storage Paths for portfolio-assets.ts ===")
    print(f"  intro: {results.get('intro', '')}")
    print(f"  ba_edit_video: {results.get('ba_edit_video', '')}")
    print(f"  ba_raw_video: {results.get('ba_raw_video', '')}")
    for i in range(1, 10):
        key = f"long{i}_video"
        if key in results:
            print(f"  long{i}Video: {results[key]}")
    for i in range(1, 10):
        key = f"short{i}_video"
        if key in results:
            print(f"  short{i}_video: {results[key]}")

    print("\nDone!")


if __name__ == "__main__":
    main()
