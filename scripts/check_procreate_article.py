#!/usr/bin/env python3
"""Validate the comparison's content, metadata, anchors, and existing assets."""
import json
from pathlib import Path
import re
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
ARTICLE = ROOT / "creative-portfolio/blog-procreate-vs-procreate-dreams.html"


class Article(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.links = []
        self.files = []
        self.videos = []
        self.h1 = 0
        self.article_depth = False
        self.body = []
        self.json_data = []
        self.in_json = False

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "article":
            self.article_depth = True
        if tag == "h1":
            self.h1 += 1
        if tag == "a":
            self.links.append(attrs.get("href", ""))
        if tag in {"link", "script", "source", "img"}:
            value = attrs.get("src") or attrs.get("href")
            if value:
                self.files.append(value)
        if tag == "video":
            self.videos.append(attrs)
            self.files.append(attrs["poster"])
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_json = True

    def handle_endtag(self, tag):
        if tag == "article":
            self.article_depth = False
        if tag == "script":
            self.in_json = False

    def handle_data(self, data):
        if self.article_depth:
            self.body.append(data)
        if self.in_json:
            self.json_data.append(data)


def main():
    page = Article()
    text = ARTICLE.read_text(encoding="utf-8-sig")
    page.feed(text)
    assert page.h1 == 1
    assert len(page.ids) == len(set(page.ids)), "Duplicate IDs"
    assert len(page.videos) == 2
    for video in page.videos:
        assert "controls" in video and "autoplay" not in video
        assert video.get("preload") == "none"
    for href in page.links + page.files:
        parsed = urlsplit(href)
        if parsed.scheme or parsed.netloc:
            continue
        if not parsed.path and parsed.fragment:
            assert unquote(parsed.fragment) in page.ids, href
        if parsed.path:
            target = (ROOT / parsed.path.lstrip("/")) if parsed.path.startswith("/") else ARTICLE.parent / unquote(parsed.path)
            assert target.is_file(), f"Missing local target: {href}"
    words = len(re.findall(r"\b[\w]+(?:[’'-][\w]+)*\b", " ".join(page.body)))
    assert words > 3000, words
    data = json.loads("".join(page.json_data))
    assert data["@type"] == "BlogPosting"
    assert data["dateModified"].startswith("2026-11-26")
    assert "5.4.15" in text and "2.1.3" in text
    assert data["mainEntityOfPage"] in text
    print(f"Article validated: {words} words including heading/byline, two project videos, valid metadata and local links.")


if __name__ == "__main__":
    main()
