#!/usr/bin/env python3
"""Search curated outfit references. Uses only the standard library, no API, no photos."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / ".agents" / "skills" / "personal-styling" / "references" / "outfit-cases.json"
CONFIDENCE = {"low": 0, "medium": 1, "high": 2}
ALIASES = {
    "宽裤": ["宽松长裤", "廓形长裤", "宽直裤", "宽松牛仔裤", "弯刀裤", "宽松", "宽直型"],
    "格纹": ["格子", "格纹", "千鸟格"],
    "宽松": ["廓形", "微落肩", "弯刀", "宽松", "松弛"],
    "老师": ["高校日常", "高校", "通勤", "学院", "轻熟"],
    "外套": ["茄克", "夹克", "外套", "开衫", "皮衣"],
    "学院风": ["学院", "Ivy", "针织", "知识分子"],
}
def load_database(path: Path = DB) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not isinstance(data.get("entries"), list):
        raise ValueError("Invalid outfit database")
    return data

def fields(entry: dict) -> dict:
    return {
        "name": " ".join(str(entry.get(x) or "") for x in ["title", "creator", "source_segment"]),
        "styles": " ".join(entry.get("styles") or []),
        "shapes": " ".join(entry.get("shapes") or []),
        "colors": " ".join(entry.get("colors") or []),
        "materials": " ".join(entry.get("materials") or []),
        "scenes": " ".join(entry.get("scenes") or []),
        "pieces": " ".join(str(x or "") for x in (entry.get("pieces") or {}).values()),
        "methods": " ".join(entry.get("methods") or []),
    }

def query_score(entry: dict, query: str) -> int:
    tokens = [t.casefold() for t in re.split(r"[\s,，、;/；]+", query.strip()) if t]
    if not tokens:
        return 1
    f = fields(entry)
    weights = {"name": 5, "styles": 4, "shapes": 4, "pieces": 3,
               "colors": 3, "materials": 3, "scenes": 2, "methods": 2}
    total = 0
    for token in tokens:
        variants = [token] + ALIASES.get(token, [])
        best = max((w for name, w in weights.items()
                    if any(v.casefold() in f[name].casefold() for v in variants)), default=0)
        if not best:
            return 0
        total += best
    return total

def search(data: dict, query: str = "", style: str = "", scene: str = "",
           creator: str = "", kind: str = "", min_confidence: str = "medium",
           limit: int = 8, max_per_creator: int = 2) -> list[dict]:
    if min_confidence not in CONFIDENCE:
        raise ValueError("Invalid confidence threshold")
    if limit < 1 or max_per_creator < 1:
        raise ValueError("Limit must be positive")
    candidates = []
    for entry in data["entries"]:
        if CONFIDENCE.get(entry.get("confidence"), -1) < CONFIDENCE[min_confidence]:
            continue
        if kind and entry.get("kind") != kind:
            continue
        if creator and creator.casefold() not in entry.get("creator", "").casefold():
            continue
        if style and not any(style.casefold() in s.casefold() for s in entry.get("styles", [])):
            continue
        if scene and not any(scene.casefold() in s.casefold() for s in entry.get("scenes", [])):
            continue
        relevance = query_score(entry, query)
        if not relevance:
            continue
        candidates.append((relevance, CONFIDENCE[entry["confidence"]], entry))
    candidates.sort(key=lambda row: (-row[0], -row[1], row[2]["id"]))
    seen = {}
    results = []
    for score, _, record in candidates:
        name = record["creator"]
        if seen.get(name, 0) >= max_per_creator:
            continue
        seen[name] = seen.get(name, 0) + 1
        results.append({**record, "relevance": score})
        if len(results) >= limit:
            break
    return results

def main() -> None:
    parser = argparse.ArgumentParser(description="Search sourced Chinese/Asian menswear outfit references; no external API.")
    parser.add_argument("query", nargs="?", default="", help="e.g. '格纹 松弛' or '皮衣'")
    parser.add_argument("--style", default="", help="style label filter")
    parser.add_argument("--scene", default="", help="scene label filter")
    parser.add_argument("--creator", default="", help="creator name substring")
    parser.add_argument("--kind", default="", choices=["", "creator_outfit", "creator_video", "celebrity_editorial", "brand_lookbook", "curator_video"])
    parser.add_argument("--min-confidence", default="medium", choices=list(CONFIDENCE))
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--per-creator", type=int, default=2)
    parser.add_argument("--json", action="store_true", help="Output machine-readable records")
    args = parser.parse_args()
    results = search(load_database(), args.query, style=args.style, scene=args.scene,
                     creator=args.creator, kind=args.kind, min_confidence=args.min_confidence,
                     limit=args.limit, max_per_creator=args.per_creator)
    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
        return
    if not results:
        print("未找到满足证据级别和标签条件的案例；可放宽关键词或查看原始来源。")
        return
    for x in results:
        print(f"[{x['id']}] {x['title']}")
        print(f"  {x['source_label']} / {x['creator']} / confidence={x['confidence']}")
        print(f"  版型：{'、'.join(x['shapes'])}；风格：{'、'.join(x['styles'])}")
        print(f"  原始来源：{x['source_url']}（{x['source_segment']}）")
        print(f"  提醒：{x['limitations']}")
        print()

if __name__ == "__main__":
    main()
