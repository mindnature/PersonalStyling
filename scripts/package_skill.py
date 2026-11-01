#!/usr/bin/env python3
"""Build a standard WorkBuddy/Agent Skills ZIP; Python only required by the publisher."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / ".agents" / "skills" / "personal-styling"
OUTPUT = ROOT / "dist" / "personal-styling.zip"

def package(destination=OUTPUT):
    if not (SKILL / "SKILL.md").is_file():
        raise FileNotFoundError(SKILL / "SKILL.md")
    files = sorted(p for p in SKILL.rglob("*") if p.is_file())
    if not files or any(p.is_symlink() for p in files):
        raise ValueError("Skill files missing or contain symlinks")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(destination, "w", compression=ZIP_DEFLATED) as zip_file:
        for file in files:
            rel = Path("personal-styling") / file.relative_to(SKILL)
            zip_file.write(file, rel.as_posix())
    return destination

if __name__ == "__main__":
    path = package()
    print(f"ZIP ready: {path}")
