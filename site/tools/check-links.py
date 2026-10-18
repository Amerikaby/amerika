from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlparse,unquote
import sys,json
root=Path(sys.argv[1]).resolve();base='/newcodex/'
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=set()
 def handle_starttag(self,t,a):
  a=dict(a)
  if 'id' in a:self.ids.add(a['id'])
  if t=='a' and 'href'in a:self.links.append(a['href'])
pages={}
for p in root.rglob('*.html'):
 parser=Links();parser.feed(p.read_text(encoding='utf-8'));pages[p]=parser
bad=[]
for p,parser in pages.items():
 url='https://amerika.by'+base+p.relative_to(root).as_posix()
 for h in parser.links:
  u=urlparse(urljoin(url,h))
  if u.netloc!='amerika.by' or not u.path.startswith(base):continue
  target=root/unquote(u.path[len(base):]);target=target/'index.html' if target.is_dir() or u.path.endswith('/') else target
  if not target.exists():bad.append([str(p.relative_to(root)),h,'missing file'])
  elif u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:bad.append([str(p.relative_to(root)),h,'missing anchor'])
result={'pages':len(pages),'broken':bad};print(json.dumps(result,ensure_ascii=False))
sys.exit(bool(bad))
