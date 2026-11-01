import json
import re
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZipFile
import sys

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / ".agents" / "skills" / "personal-styling"
sys.path.insert(0, str(ROOT / "scripts"))
from package_skill import package


class SkillPackageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.content = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        _, cls.header, cls.body = cls.content.split("---", 2)

    def test_frontmatter_and_version(self):
        self.assertTrue(self.content.startswith("---\n"))
        for key in ["name", "description", "display_name", "display_name_en",
                    "description_zh", "description_en", "version", "author"]:
            self.assertRegex(self.header, rf"(?m)^{re.escape(key)}:")
        self.assertRegex(self.header, r"(?m)^name: personal-styling$")
        self.assertRegex(self.header, r"(?m)^version: 2\.2\.0$")

    def test_references_all_exist(self):
        refs = set(re.findall(r"@references/([a-z][a-z0-9-]*\.md)", self.body))
        self.assertGreaterEqual(len(refs), 10)
        for name in refs:
            self.assertTrue((SKILL / "references" / name).is_file(), name)

    def test_mandatory_style_and_operations(self):
        for text in ["中国大陆", "日韩简约", "看得见", "三套", "预算", "发型",
                     "衣橱", "反馈", "隐私", "不得", "无需"]:
            self.assertIn(text, self.body, text)

    def test_no_runtime_dependencies_in_skill(self):
        for forbidden in ["package.json", ".env", "node_modules", "scripts"]:
            self.assertFalse((SKILL / forbidden).exists())
        for bad in ["OPENAI_" + "API_KEY=", "sk-" + "proj-"]:
            self.assertNotIn(bad, self.content)

    def test_evals_schema_and_coverage(self):
        cases = json.loads((ROOT / "evals" / "cases.json").read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(cases), 12)
        ids = [c["id"] for c in cases]
        self.assertEqual(len(ids), len(set(ids)))
        required_categories = {"image", "outfits", "budget", "wardrobe", "climate", "revision", "tools", "hair"}
        self.assertTrue(required_categories.issubset({c["category"] for c in cases}))
        for case in cases:
            self.assertIsInstance(case["input"], str)
            self.assertTrue(case["input"].strip())
            self.assertGreaterEqual(len(case["expected"]), 2)
            self.assertTrue(case["forbidden"])

    def test_verified_lookbook_index(self):
        payload = json.loads((SKILL / "references" / "curated-look-index.json").read_text(encoding="utf-8"))
        looks = payload["looks"]
        self.assertGreaterEqual(len(looks), 4)
        self.assertEqual(len({look["id"] for look in looks}), len(looks))
        for look in looks:
            for required in ["id", "source_name", "source_type", "source_url",
                             "verified_on", "observed_pieces", "evidence_quality", "do_not_assume"]:
                self.assertTrue(look.get(required), f"{look.get('id')}: {required}")
            self.assertTrue(look["source_url"].startswith("https://"), look["id"])
            self.assertTrue(any(host in look["source_url"] for host in ["uniqlo.cn", "uniqlo.com/cn/", "peacebird.com"]))
            self.assertRegex(look["verified_on"], r"^20\d{2}-\d{2}-\d{2}$")
        kinds = {look["source_type"] for look in looks}
        self.assertIn("official_product_photo", kinds)
        self.assertIn("official_gallery_entry", kinds)

    def test_source_first_behavior_and_rights(self):
        body = self.body
        for phrase in ["真实穿搭案例探索模式", "原始网址", "用户筛选",
                       "来源链接", "不能", "版权"]:
            self.assertIn(phrase, body)
        guide = (SKILL / "references" / "style-discovery.md").read_text(encoding="utf-8")
        for phrase in ["喜欢/不喜欢", "真实案例", "不臆测", "用户不喜欢"]:
            self.assertIn(phrase, guide)
        library = (SKILL / "references" / "lookbook-library.md").read_text(encoding="utf-8")
        self.assertIn("2026-11-01", library)
        self.assertIn("不是已抓取", library)

    def test_zip_structure_contains_all_refs(self):
        with TemporaryDirectory() as temporary:
            filename = package(Path(temporary) / "personal-styling.zip")
            with ZipFile(filename) as archive:
                paths = archive.namelist()
                self.assertIn("personal-styling/SKILL.md", paths)
                self.assertIn("personal-styling/references/fit-and-hair.md", paths)
                self.assertIn("personal-styling/references/budget-and-wardrobe.md", paths)
                self.assertIn("personal-styling/references/lookbook-library.md", paths)
                self.assertIn("personal-styling/references/style-discovery.md", paths)
                self.assertIn("personal-styling/references/curated-look-index.json", paths)
                self.assertIn("personal-styling/references/quality-review.md", paths)
                self.assertTrue(all(p.startswith("personal-styling/") for p in paths))
                self.assertTrue(all(not p.startswith("/") and ".." not in Path(p).parts for p in paths))
                self.assertTrue(all(not p.endswith(".py") and not p.endswith(".env") for p in paths))


if __name__ == "__main__":
    unittest.main()
