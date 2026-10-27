import re, sys
txt = open('/tmp/commnet_full.txt').read()
lines = txt.split('\n')
seen = set()
out = []
for ln in lines:
    s = ln.strip()
    if not s:
        continue
    if s.startswith('====='):
        out.append(ln)
        continue
    # drop page-line-number-only and math-garble-only lines
    if re.fullmatch(r'[\d\s\.,;:\-\(\)\[\]@]{1,6}', s):
        continue
    key = re.sub(r'\s+', '', s)[:150]
    if key in seen:
        continue
    seen.add(key)
    out.append(ln)
clean = '\n'.join(out)
open('/tmp/commnet_clean.txt', 'w').write(clean)
print('clean chars:', len(clean))
print('clean lines:', len(out))
