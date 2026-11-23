# -*- coding: utf-8 -*-
import json, sys
sys.path.insert(0, '/opt/data/research_build')
from quality_gate import S2T

RJ = '/opt/data/gaoji-daren/learn/research.json'
d = json.load(open(RJ, encoding='utf-8'))
for p in d['papers']:
    if p['pid'] == 'learning-to-simulate':
        fixes = {
            '你的 UAV 場景：每架机一个節點': '你的 UAV 場景：每架機一個節點',
            '像训狗先立規矩再餵食。': '像训狗先立規矩再餵食。',
            '从飛行日誌學出': '從飛行日誌學出',
            '推論時間大头在鄰居圖搜尋': '推論時間大头在鄰居圖搜尋',
        }
        # 逐字替換：直接把簡體單字映射成繁體
        def fix(s):
            return ''.join(S2T.get(c, c) for c in s)
        def walk(o):
            if isinstance(o, str): return fix(o)
            if isinstance(o, list): return [walk(x) for x in o]
            if isinstance(o, dict): return {k: walk(v) for k, v in o.items()}
            return o
        for field in ('easy_read', 'study_kit', 'reading_notes'):
            if field in p:
                p[field] = walk(p[field])
json.dump(d, open(RJ, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
# 驗證 easy_read 也掃過
p = [q for q in d['papers'] if q['pid']=='learning-to-simulate'][0]
bad = sorted(set(c for c in json.dumps(p['easy_read'], ensure_ascii=False) if c in S2T))
print('easy_read 簡體殘留:', bad)
