"""Extract only vehicle-size differences from the owner's AEC PDFs; no base cost publication."""
import sys,re,json,pathlib,hashlib,pdfplumber
folder=pathlib.Path(sys.argv[1]);rates_file=pathlib.Path(sys.argv[2]);here=pathlib.Path(__file__).parent
norm=lambda s:re.sub('[^A-Z0-9]','',str(s).upper())
money=lambda s:float(s.replace('$','').replace(',','')) if s and re.fullmatch(r'\$[\d,.]+',s) else None
sea={};sources=[]
for dest,filename in [('klaipeda','Море Октябрь 2026.pdf'),('poti','Море Поти Октябрь с 13 2026.pdf')]:
 f=folder/filename;sources.append({'filename':filename,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
 tables=pdfplumber.open(f).pages[0].extract_tables();header=tables[1][0]
 indices={norm(h):i for i,h in enumerate(header)};regular=indices['1REGULARCAR'];oversize=indices['OVERSIZECAR'];large=indices.get('1LARGECAR')
 sea[dest]={}
 for row in tables[1][1:]:
  base=money(row[regular]);port=' '.join((row[0] or '').split())
  if base is None:continue
  sea[dest][port]={'crossover':None if large is None or money(row[large]) is None else money(row[large])-base,'large':None if money(row[oversize]) is None else money(row[oversize])-base}
truck_file=folder/'Суша Октябрь с 21 2026.pdf';sources.append({'filename':truck_file.name,'sha256':hashlib.sha256(truck_file.read_bytes()).hexdigest()})
inland={}
with pdfplumber.open(truck_file) as pdf:
 for page in pdf.pages:
  for table in page.extract_tables():
   if not table:continue
   for row in table:
    if len(row)<7 or not row[1]:continue
    match=re.match(r'(.*?)\s*-\s*[^-]+\s*-\s*(Copart|IAAI)\s*$',row[1].replace('\n',' '),re.I)
    base=money(row[3])
    if not match or base is None:continue
    key=match[2].lower()+'|'+norm(match[1]);port=' '.join((row[2] or '').upper().split());port='NEWARK' if port=='NEW YORK' else port
    if port=='HONOLULU':port='PORT OF HONOLULU'
    data={'port':port,'crossover':None if money(row[6]) is None else money(row[6])-base,'large':None if money(row[5]) is None else money(row[5])-base}
    if key in inland and inland[key]!=data:inland[key]=None;continue
    inland[key]=data
text=rates_file.read_text(encoding='utf-8-sig');rates=json.loads(text.split('var RETAIL_RATES=')[1].split(';')[0]);yards={};missing=[]
for auction,rows in rates.items():
 for yard in rows:
  data=inland.get(auction+'|'+norm(re.sub(r'\s*-\s*[A-Z]{2}$','',yard)))
  if data:yards[auction+'|'+yard]=data
  else:missing.append(auction+'|'+yard)
for auction in ['copart','iaai']:
 old=auction+'|PHOENIX - AR';corrected=auction+'|PHOENIX - AZ'
 if old in yards and corrected not in yards:yards[corrected]=yards[old]
result={'validUntil':'2026-10-31','quotes':{'klaipeda':'1686644','poti':'1691115','inland':'1694101'},'sea':sea,'yards':yards}
assert sea['poti']['SAVANNAH']=={'crossover':150,'large':450}
assert sea['klaipeda']['SAVANNAH']=={'crossover':None,'large':300}
assert yards['copart|ATLANTA EAST - GA']['port']=='SAVANNAH'
assert all(d[v] is None or d[v]>=0 for d in yards.values() for v in ['crossover','large'])
(here/'size-rates.js').write_text('/* AEC size differences only, extracted from owner-provided October 2026 quotes. */\nvar AMZ_SIZE_RATES='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print(json.dumps({'matched':len(yards),'unmatched':len(missing),'example':yards['copart|ATLANTA EAST - GA'],'sources':sources},ensure_ascii=False,indent=2))
