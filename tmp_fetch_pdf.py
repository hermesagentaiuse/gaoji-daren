import sys, urllib.request, io
from pypdf import PdfReader

pid = sys.argv[1]  # arxiv id
url = f"https://arxiv.org/pdf/{pid}"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"})
data = urllib.request.urlopen(req, timeout=120).read()
open(f"/opt/data/gaoji-daren/tmp_{pid.replace('/','_')}.pdf","wb").write(data)
r = PdfReader(io.BytesIO(data))
out = []
total = 0
for i, p in enumerate(r.pages):
    t = p.extract_text() or ""
    total += len(t)
    out.append(f"\n===== PAGE {i+1} ({len(t)} chars) =====\n{t}")
open(f"/opt/data/gaoji-daren/tmp_{pid.replace('/','_')}_fulltext.txt","w").write("".join(out))
print(f"PAGES={len(r.pages)} CHARS={total}")
