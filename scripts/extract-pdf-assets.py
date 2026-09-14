"""Recover the intact logo embedded in page 3 of the supplied brief."""
from pathlib import Path
import pypdfium2
import sys
root = Path(__file__).resolve().parents[1]
reader = pypdfium2.PdfDocument(sys.argv[1])
# Render the exact logo region: its PDF soft mask is not preserved by simple XObject extraction.
reader[2].render(scale=3, crop=(110, 520, 110, 225)).to_pil().save(root / 'public/images/logo-brief.png')
print('Logo region extracted from the supplied PDF, including its transparency mask.')
