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
    def test_skill_frontmatter(self):
        content = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        self.assertTrue(content.startswith("---\n"))
        _, header, body = content.split("---", 2)
        for key in [
            "name", "description", "display_name", "display_name_en",
            "description_zh", "description_en", "version", "author"
        ]:
            self.assertRegex(header, rf"(?m)^{re.escape(key)}:")
        self.assertRegex(header, r"(?m)^name: personal-styling$")
        self.assertIn("三套", body)
        self.assertIn("不需要", body)

    def test_all_reference_links_exist(self):
        body = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        paths = re.findall(r"@references/([a-z][a-z0-9-]*\.md)", body)
        self.assertGreaterEqual(len(set(paths)), 4)
        for item in set(paths):
            self.assertTrue((SKILL / "references" / item).is_file(), item)

    def test_no_runtime_dependencies_in_skill(self):
        self.assertFalse((SKILL / "package.json").exists())
        self.assertFalse((SKILL / ".env").exists())
        self.assertFalse((SKILL / "node_modules").exists())
        self.assertFalse((SKILL / "scripts").exists())
        content = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        for unsafe in ["sk-" + "proj-", "OPENAI_" + "API_KEY="]:
            self.assertNotIn(unsafe, content)

    def test_zip_structure(self):
        with TemporaryDirectory() as temporary:
            filename = package(Path(temporary) / "skill.zip")
            with ZipFile(filename) as archive:
                files = archive.namelist()
                self.assertIn("personal-styling/SKILL.md", files)
                self.assertIn("personal-styling/references/examples.md", files)
                self.assertTrue(all(p.startswith("personal-styling/") for p in files))
                self.assertTrue(all(not p.startswith("/") and ".." not in Path(p).parts for p in files))


if __name__ == "__main__":
    unittest.main()
