"""Deep-merge a JSON patch {uz:{...}, ru:{...}, en:{...}} into src/i18n/*.json."""
import json, sys

def merge(a, b):
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(a.get(k), dict):
            merge(a[k], v)
        else:
            a[k] = v

patch = json.load(open(sys.argv[1]))
for lang, data in patch.items():
    p = f'src/i18n/{lang}.json'
    d = json.load(open(p))
    merge(d, data)
    with open(p, 'w') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write('\n')
