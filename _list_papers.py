import json
data = json.load(open('/opt/data/gaoji-daren/learn/research.json'))
state = json.load(open('/opt/data/gaoji-daren/.research_state.json'))
read = set(state['read'])
tracks = [t['name'] for t in data['tracks']]
for tname in tracks:
    papers = [p for p in data['papers'] if p['topic'] == tname]
    print(f"=== {tname} ({len(papers)}) ===")
    for p in papers:
        status = 'READ' if p['pid'] in read else ('unread-verified' if p.get('verified') else 'unverified')
        print(f"  {p['pid']:25s} level={str(p.get('level','?')):12s} verified={p.get('verified')} {status}  {p['title'][:60]}")
