import json
import sys
import unittest
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / ".agents" / "skills" / "personal-styling"
sys.path.insert(0, str(ROOT / "scripts"))
from search_looks import CONFIDENCE, load_database, query_score, search


class OutfitDatabaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = load_database()
        cls.entries = cls.data["entries"]

    def test_source_records_are_structured_and_counted(self):
        self.assertEqual(self.data["records_count"], len(self.entries))
        self.assertGreaterEqual(len(self.entries), 16)
        self.assertEqual(len({e["id"] for e in self.entries}), len(self.entries))
        self.assertGreaterEqual(len({e["creator"] for e in self.entries}), 5)
        kinds = {e["kind"] for e in self.entries}
        self.assertEqual(kinds, {"creator_outfit", "creator_video", "celebrity_editorial", "brand_lookbook", "curator_video"})

    def test_every_record_has_verifiable_source_and_uncertainty(self):
        for e in self.entries:
            with self.subTest(id=e["id"]):
                for key in ["id", "creator", "title", "kind", "source_url",
                            "source_segment", "verified_on", "confidence",
                            "limitations", "rights", "pieces", "methods",
                            "styles", "shapes", "materials", "scenes"]:
                    self.assertIn(key, e)
                u = urlparse(e["source_url"])
                self.assertEqual(u.scheme, "https")
                self.assertTrue(u.netloc and u.netloc != "www.example.com")
                self.assertEqual(e["verified_on"], "2026-11-04")
                self.assertIn(e["confidence"], CONFIDENCE)
                self.assertEqual(e["user_preference"], "unknown")
                self.assertEqual(e["rights"], "link_only_no_image_redistribution")
                self.assertGreater(len(e["limitations"]), 12)
                self.assertTrue(e["methods"])
                self.assertEqual(set(e["pieces"]), {"outerwear", "top", "bottom", "shoes", "accessories"})
                for k, v in e["pieces"].items():
                    self.assertTrue(v is None or isinstance(v, str), (e["id"], k))
                published = e["published_on"]
                if published is not None:
                    self.assertRegex(published, r"^20\d{2}-\d{2}-\d{2}$")

    def test_videos_are_not_complete_outfit_lookalikes(self):
        for e in self.entries:
            if e["kind"] in {"creator_video", "curator_video"}:
                self.assertEqual(e["confidence"], "low")
                self.assertTrue(e["pieces"]["bottom"] is None)
                self.assertTrue(e["pieces"]["shoes"] is None)

    def test_case_retrieval_with_filters(self):
        plaid = search(self.data, "格纹", min_confidence="medium")
        self.assertTrue(plaid)
        self.assertTrue(all(query_score(e, "格纹") > 0 for e in plaid))
        self.assertTrue(all(e["confidence"] in ("medium", "high") for e in plaid))
        self.assertTrue(all(plaid.count(e) == 1 for e in plaid))
        knit = search(self.data, "针织", kind="creator_outfit")
        self.assertTrue(knit)
        self.assertTrue(all(e["kind"] == "creator_outfit" for e in knit))
        features = search(self.data, "机能", min_confidence="low")
        self.assertTrue(any(e["id"] == "STAR-WANG-001" for e in features))

    def test_diverse_results_cap_same_creator(self):
        found = search(self.data, "", min_confidence="low", limit=30, max_per_creator=2)
        creators = [e["creator"] for e in found]
        self.assertGreaterEqual(len(set(creators)), 5)
        self.assertLessEqual(max(creators.count(c) for c in set(creators)), 2)

    def test_low_evidence_excluded_without_opt_in(self):
        a = search(self.data, "胶囊")
        b = search(self.data, "胶囊", min_confidence="low")
        self.assertFalse(a)
        self.assertTrue(b)
        self.assertTrue(all(e["confidence"] == "low" for e in b))

    def test_no_actual_image_copies_in_skill(self):
        disallowed_ext = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
        self.assertFalse(any(p.suffix.casefold() in disallowed_ext for p in SKILL.rglob("*") if p.is_file()))
        self.assertFalse(any(k in json.dumps(self.data, ensure_ascii=False)
                             for k in ["data:image/", "api_key", "用户正脸照", "个人身份证"]))


if __name__ == "__main__":
    unittest.main()
