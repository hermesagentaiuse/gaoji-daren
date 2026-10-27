import sys
from pypdf import PdfReader

src, dst = sys.argv[1], sys.argv[2]
r = PdfReader(src)
print('pages:', len(r.pages))
total = 0
with open(dst, 'w') as f:
    for i, p in enumerate(r.pages):
        t = p.extract_text() or ''
        total += len(t)
        f.write('\n===== PAGE %d =====\n' % (i + 1) + t)
print('chars:', total)
