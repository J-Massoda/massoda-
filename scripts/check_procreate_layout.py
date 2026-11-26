#!/usr/bin/env python3
"""Render the comparison in installed Chrome at phone and desktop widths."""
from html.parser import HTMLParser
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
ARTICLE = ROOT / "creative-portfolio/blog-procreate-vs-procreate-dreams.html"


class Result(HTMLParser):
    result = None

    def handle_starttag(self, tag, attributes):
        if tag == "body":
            self.result = dict(attributes).get("data-layout-check")


def main():
    chrome = shutil.which("google-chrome") or shutil.which("chromium")
    if not chrome:
        raise RuntimeError("Chrome is required for the rendered layout check")
    probe = ARTICLE.with_name(".procreate-layout-check.html")
    script = '''<script>window.addEventListener('load',()=>setTimeout(()=>{
      const article=document.querySelector('article'), table=document.querySelector('.cp-comparison-table');
      document.body.setAttribute('data-layout-check',JSON.stringify({
        viewport:window.innerWidth, width:document.documentElement.scrollWidth,
        article:article.getBoundingClientRect().width,
        table:table.getBoundingClientRect().width,
        font:parseFloat(getComputedStyle(article.querySelector('.cp-richtext p')).fontSize),
        videos:[...article.querySelectorAll('video')].every(v=>v.paused)
      }));},1200));</script>'''
    probe.write_text(ARTICLE.read_text().replace("</body>", script + "</body>"))
    try:
        for width in (390, 1440):
            with tempfile.TemporaryDirectory() as profile:
                command = [chrome,"--headless","--no-sandbox","--disable-dev-shm-usage",f"--user-data-dir={profile}",f"--window-size={width},1000","--force-device-scale-factor=1","--hide-scrollbars","--virtual-time-budget=10000","--dump-dom",probe.as_uri()]
                process = subprocess.run(command, capture_output=True, text=True, timeout=90)
                if process.returncode:
                    raise RuntimeError(process.stderr[-3000:])
                result = Result()
                result.feed(process.stdout)
                assert result.result, "Layout probe did not run"
                data = json.loads(result.result)
                assert data["width"] <= data["viewport"] + 1, data
                assert data["article"] <= data["viewport"] + 1, data
                assert data["table"] <= data["article"] + 1, data
                assert data["font"] >= 15, data
                assert data["videos"], "Project videos must wait for user playback"
                print(f"Rendered layout passed at {width}px: {data}")
    finally:
        probe.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
