import json
d=json.load(open('/opt/data/gaoji-daren/learn/research.json'))
for q in d['papers']:
    if q['pid']=='neural-fly':
        print(json.dumps(q, ensure_ascii=False, indent=1)[:6000])
