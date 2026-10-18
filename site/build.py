#!/usr/bin/env python3
"""Builds both sites' pages from one template.

    python3 site/build.py

  site/template.html + site/key/*    -> public/index.html          (keycleaner.gumber.ai)
  site/template.html + site/screen/* -> public/_screen/index.html  (screencleaner.gumber.ai)

The Worker (src/worker.js) serves public/_screen/ files to screencleaner.gumber.ai.
"""
from pathlib import Path

root = Path(__file__).resolve().parent
template = (root / 'template.html').read_text()

for site, out in [('key', 'public/index.html'), ('screen', 'public/_screen/index.html')]:
    page = template
    for part in ('seo', 'intro', 'guide'):
        page = page.replace('{{' + part.upper() + '}}', (root / site / f'{part}.html').read_text().rstrip('\n'))
    assert '{{' not in page, f'unfilled placeholder in {site}'
    dest = root.parent / out
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(page)
    print(f'built {out}')
