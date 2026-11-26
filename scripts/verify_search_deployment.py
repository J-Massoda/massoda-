#!/usr/bin/env python3
"""Wait for the existing Pages deployment, then compare the two public files."""
import hashlib
import os
from pathlib import Path
import time
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
FILES = ("sitemap.xml", "creative-portfolio/blog-procreate-vs-procreate-dreams.html")


def main():
    revision = os.environ.get("GITHUB_SHA", "verification")
    pending = set(FILES)
    for attempt in range(36):
        for path in sorted(pending):
            request = Request(f"https://massoda.me/{path}?verify={revision}", headers={"User-Agent":"MassodaDeploymentCheck/1.0", "Cache-Control":"no-cache"})
            try:
                with urlopen(request, timeout=20) as response:
                    deployed = response.read()
                    expected = (ROOT / path).read_bytes()
                    if response.status == 200 and deployed == expected:
                        print(f"Verified public deployment: {path} ({hashlib.sha256(deployed).hexdigest()})", flush=True)
                        pending.remove(path)
            except OSError as error:
                print(f"Waiting for {path}: {error}", flush=True)
        if not pending:
            return
        print(f"Waiting for Pages, attempt {attempt + 1}/36", flush=True)
        time.sleep(10)
    raise RuntimeError(f"Public files did not match the deployed revision: {sorted(pending)}")


if __name__ == "__main__":
    main()
