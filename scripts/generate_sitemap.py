#!/usr/bin/env python3
"""Generate the public sitemap from indexable HTML canonical URLs.

Run before publishing; CI --check detects missing pages and stale output.
Dates come from explicit modification metadata or the existing sitemap, never
from the build time. No dependencies outside Python's standard library.
"""
import argparse
from datetime import date, datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ORIGIN = "https://massoda.me"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.canonicals = []
        self.noindex = False
        self.redirect = False
        self.modified = None

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "link" and "canonical" in attrs.get("rel", "").lower().split():
            self.canonicals.append(attrs.get("href", ""))
        if tag == "meta":
            name = attrs.get("name", "").lower()
            prop = attrs.get("property", "").lower()
            if name in {"robots", "googlebot", "bingbot"}:
                directives = attrs.get("content", "").lower().replace(",", " ").split()
                self.noindex |= bool({"noindex", "none"}.intersection(directives))
            self.redirect |= attrs.get("http-equiv", "").lower() == "refresh"
            if prop == "article:modified_time" or name == "date-modified":
                self.modified = attrs.get("content")


def valid_date(value):
    if not value:
        return None
    # HTML metadata may contain an ISO datetime; sitemap uses its calendar date.
    parsed = date.fromisoformat(value[:10])
    if parsed > datetime.now().date():
        raise ValueError(f"Future modification date: {value}")
    return parsed.isoformat()


def inventory(root):
    pages = {}
    for path in sorted(root.rglob("*.html")):
        relative = path.relative_to(root)
        if any(part.startswith(".") or part in {"node_modules", "_site", "tests"} for part in relative.parts):
            continue
        page = Page()
        page.feed(path.read_text(encoding="utf-8-sig"))
        if page.noindex or page.redirect:
            continue
        if len(page.canonicals) != 1:
            raise ValueError(f"{relative}: expected exactly one canonical")
        canonical = page.canonicals[0]
        url = urlsplit(canonical)
        if url.scheme != "https" or url.netloc != "massoda.me" or url.query or url.fragment:
            raise ValueError(f"{relative}: invalid canonical {canonical}")
        target = unquote(url.path).lstrip("/")
        if not target or target.endswith("/"):
            target += "index.html"
        if ".." in Path(target).parts:
            raise ValueError(f"{relative}: unsafe canonical path")
        target_path = root / target
        if not target_path.is_file():
            raise ValueError(f"{relative}: canonical target does not exist: {target}")
        # An alternate page canonicalising elsewhere is not a sitemap entry.
        if target_path.resolve() != path.resolve():
            continue
        if canonical in pages:
            raise ValueError(f"Duplicate canonical: {canonical}")
        pages[canonical] = valid_date(page.modified)
    return pages


def generate(root):
    previous = {}
    sitemap = root / "sitemap.xml"
    if sitemap.exists():
        old = ET.parse(sitemap).getroot()
        for entry in old.findall(f"{{{NS}}}url"):
            previous[entry.findtext(f"{{{NS}}}loc")] = valid_date(entry.findtext(f"{{{NS}}}lastmod"))
    pages = inventory(root)
    ET.register_namespace("", NS)
    document = ET.Element(f"{{{NS}}}urlset")
    for url, modified in sorted(pages.items()):
        entry = ET.SubElement(document, f"{{{NS}}}url")
        ET.SubElement(entry, f"{{{NS}}}loc").text = url
        modified = modified or previous.get(url)
        if modified:
            ET.SubElement(entry, f"{{{NS}}}lastmod").text = modified
    ET.indent(document, space="  ")
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(document, encoding="unicode") + "\n", len(pages)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    content, count = generate(ROOT)
    target = ROOT / "sitemap.xml"
    if args.check:
        if not target.exists() or target.read_text(encoding="utf-8") != content:
            parser.exit(1, "Sitemap is stale. Run python3 scripts/generate_sitemap.py and commit sitemap.xml.\n")
        print(f"Sitemap valid: {count} canonical, indexable pages.")
    else:
        target.write_text(content, encoding="utf-8")
        print(f"Generated sitemap.xml with {count} canonical, indexable pages.")


if __name__ == "__main__":
    main()
