"""Refresh the published inventory snapshot from WordPress, without private data.

Run from the repository root. Requires beautifulsoup4. Saves only after every
archive and REST count has been verified; a failed fetch preserves the old data.
"""
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen
from bs4 import BeautifulSoup

ORIGIN = 'https://amerika.by'
ROOT = Path(__file__).resolve().parents[1]

def read(url):
    with urlopen(url, timeout=40) as response:
        return response.read()

terms = json.loads(read(ORIGIN + '/wp-json/wp/v2/situation?per_page=100'))
items = {}
for status in ('in-stock', 'in-transit'):
    term = next(t for t in terms if t['slug'] == status)
    archive = ORIGIN + '/situation/' + status + '/'
    pending, visited, found = [archive], set(), set()
    while pending:
        url = pending.pop(0)
        if url in visited:
            continue
        visited.add(url)
        soup = BeautifulSoup(read(url), 'html.parser')
        for a in soup.select('a.page-numbers[href]'):
            link = a['href']
            if link.startswith(archive) and link not in visited:
                pending.append(link)
        for card in soup.select('article.item[id^="post-"]'):
            ident = int(card['id'].removeprefix('post-'))
            found.add(ident)
            link = card.select_one('h2 a[href]')
            img = card.select_one('.thumbnail img')
            price = re.search(r'([\d\s.,]+)\s*\$', card.select_one('.title .right').get_text(' ', strip=True))
            specs = {}
            for row in card.select('[class$="haracteristics"] > div'):
                text = row.get_text(' ', strip=True)
                if ':' in text:
                    k, v = text.split(':', 1)
                    specs[k.strip()] = v.strip()
            statuses = [a['href'].rstrip('/').split('/')[-1] for a in card.select('.situation a')]
            if 'prodano' in statuses or (set(statuses) >= {'in-stock', 'in-transit'}):
                raise ValueError(f'Ambiguous availability for record {ident}: {statuses}')
            item = {
                'id': ident, 'title': link.get_text(' ', strip=True), 'source': link['href'],
                'status': status, 'sourceStatuses': statuses,
                'priceUsd': int(re.sub(r'\D', '', price[1])) if price else None,
                'image': img.get('data-lazy-src') or img['src'],
                'width': int(img.get('width', 640)), 'height': int(img.get('height', 480)),
                'region': card.select_one('.region').get_text(' ', strip=True), 'specs': specs,
            }
            assert item['source'].startswith(ORIGIN + '/auto-')
            assert item['image'].startswith(ORIGIN + '/wp-content/')
            assert status in statuses
            items[ident] = item
    if len(found) != term['count']:
        raise ValueError(f'{status}: HTML contains {len(found)}, REST taxonomy reports {term["count"]}')
    print(status, len(found), flush=True)

for kind in sorted({x['source'].split('/')[3] for x in items.values()}):
    selected = [x for x in items.values() if x['source'].split('/')[3] == kind]
    ids = ','.join(str(x['id']) for x in selected)
    records = json.loads(read(ORIGIN + '/wp-json/wp/v2/' + kind + '?per_page=100&include=' + ids))
    assert {x['id'] for x in records} == {x['id'] for x in selected}
    for record in records:
        item = items[record['id']]
        term = next(t for t in terms if t['slug'] == item['status'])
        assert term['id'] in record['situation']
        gallery = [item['image']]
        for group in record.get('acf', {}).get('photo_gallery', {}).get('gallery', []):
            for image in (group if isinstance(group, list) else [group]):
                url = image.get('full_image_url') or image.get('url')
                if url and url.startswith(ORIGIN + '/wp-content/') and url not in gallery:
                    gallery.append(url)
        item['gallery'] = gallery
        item['modified'] = record['modified']

snapshot = {'checkedAt': datetime.now(timezone.utc).isoformat(), 'source': ORIGIN, 'items': list(items.values())}
dest = ROOT / 'data' / 'availability.json'
dest.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Saved', len(items), 'distinct WordPress records', flush=True)
