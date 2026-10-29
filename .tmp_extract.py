import sys
from pypdf import PdfReader
pid = sys.argv[1]
r = PdfReader(f"/tmp/papers/{pid}.pdf")
print("pages:", len(r.pages))
total = 0
out = []
for i, pg in enumerate(r.pages):
    t = pg.extract_text() or ""
    total += len(t)
    out.append(f"===== PAGE {i+1} =====\n{t}")
open(f"/tmp/papers/{pid}.txt", "w").write("\n".join(out))
print("chars:", total)
