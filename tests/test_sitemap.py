import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("sitemap", Path(__file__).resolve().parents[1] / "scripts/generate_sitemap.py")
sitemap = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sitemap)


class SitemapTests(unittest.TestCase):
    def test_indexable_canonical_pages_only_and_dates_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "index.html").write_text('<link rel="canonical" href="https://massoda.me/">')
            (root / "new.html").write_text('<link rel="canonical" href="https://massoda.me/new.html"><meta property="article:modified_time" content="2026-11-26">')
            (root / "404.html").write_text('<meta name="robots" content="noindex, follow">')
            (root / "private.html").write_text('<meta name="robots" content="none">')
            (root / "old.html").write_text('<meta http-equiv="refresh" content="0;url=/">')
            (root / "duplicate.html").write_text('<link rel="canonical" href="https://massoda.me/">')
            (root / "sitemap.xml").write_text('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://massoda.me/</loc><lastmod>2026-11-01</lastmod></url><url><loc>https://massoda.me/deleted.html</loc></url></urlset>')
            content, count = sitemap.generate(root)
            self.assertEqual(count, 2)
            self.assertIn("2026-11-01", content)
            self.assertIn("2026-11-26", content)
            self.assertNotIn("deleted.html", content)
            self.assertNotIn("changefreq", content)
            (root / "sitemap.xml").write_text(content)
            self.assertEqual(sitemap.generate(root)[0], content)

    def test_missing_or_invalid_canonical_fails(self):
        for markup in ('<h1>Missing canonical</h1>', '<link rel="canonical" href="http://massoda.me/">', '<link rel="canonical" href="https://elsewhere.example/">', '<link rel="canonical" href="https://massoda.me/missing.html">'):
            with self.subTest(markup=markup), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                (root / "index.html").write_text(markup)
                with self.assertRaises(ValueError):
                    sitemap.inventory(root)


if __name__ == "__main__":
    unittest.main()
