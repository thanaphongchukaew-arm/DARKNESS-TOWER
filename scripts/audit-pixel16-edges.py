"""Read-only source framing audit. Does not modify artwork or remove backgrounds."""
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
rows = []
for path in sorted((root / 'art-source/pixel16').glob('*/*.png')):
    with Image.open(path) as image:
        rgba = image.convert('RGBA')
        alpha = rgba.getchannel('A')
        bounds = alpha.point(lambda value: 255 if value >= 96 else 0).getbbox()
        width, height = image.size
        margin = min(bounds[0], bounds[1], width-bounds[2], height-bounds[3]) if bounds else -1
        rows.append({'file': str(path.relative_to(root)), 'width': width, 'height': height,
                     'bounds': bounds, 'margin': margin, 'requiresRepair': margin < 2,
                     'alphaRange': alpha.getextrema()})
report = {'total': len(rows), 'flagged': [row for row in rows if row['requiresRepair']], 'images': rows,
          'note': 'Numeric borders supplement visual review; they do not prove that an already-truncated shape is complete.'}
out = root / 'previews/pixel16/edge-audit.json'
out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'total': report['total'], 'flagged': report['flagged']}, ensure_ascii=False))
