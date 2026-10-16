#!/usr/bin/env python3
"""Рыночные цены av.by для страниц моделей (site/data/market-avby.json).

Запуск: python3 site/tools/avby-market.py
Берёт все объявления по каждой модели и году выпуска (2017–2025) через публичный API av.by
и сохраняет по годам: число объявлений, медиану и нижний квартиль цены в $, типичный двигатель, медиану пробега.
Модели задаются в MODELS: (ключ страницы, id марки на av.by, id модели на av.by).
"""
import json, subprocess, time, statistics as st, collections, datetime, pathlib

MODELS = [("chevrolet/equinox", 41, 1596), ("chevrolet/trailblazer", 41, 149), ("chevrolet/trax", 41, 2594),
          ("nissan/rogue", 892, 1929), ("ford/bronco-sport", 330, 10105), ("vw/jetta", 1216, 1223)]
YEARS = range(2017, 2026)
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "market-avby.json"

def post(body):
    for a in range(4):
        r = subprocess.run(["curl", "-sS", "-m", "30", "-X", "POST", "https://api.av.by/offer-types/cars/filters/main/apply",
                            "-H", "content-type: application/json", "-H", "accept: application/json",
                            "-H", "origin: https://cars.av.by", "-H", "user-agent: Mozilla/5.0", "-d", json.dumps(body)],
                           capture_output=True, text=True)
        try:
            return json.loads(r.stdout)
        except ValueError:
            time.sleep(2 + 2 * a)
    raise SystemExit("av.by не отвечает: " + r.stderr[:200])

def collect(bid, mid, year):
    ads, page = [], 1
    while True:
        d = post({"page": page, "sorting": 1, "properties": [
            {"name": "brands", "property": 5, "value": [[{"name": "brand", "value": bid}, {"name": "model", "value": mid}]]},
            {"name": "year", "value": {"min": year, "max": year}}]})
        for a in d.get("adverts", []):
            p = {x["name"]: x.get("value") for x in a["properties"]}
            if str(p.get("year")) != str(year):
                continue
            ads.append({"usd": a["price"]["usd"]["amount"], "cc": p.get("engine_capacity"), "fuel": p.get("engine_type"), "km": p.get("mileage_km")})
        if page >= d.get("pageCount", 1) or page >= 12:
            return ads
        page += 1
        time.sleep(0.5)

result = {"source": "av.by", "date": datetime.date.today().isoformat(), "models": {}}
for key, bid, mid in MODELS:
    years = {}
    for y in YEARS:
        ads = collect(bid, mid, y)
        petrol = [a for a in ads if a["fuel"] == "бензин"] or ads
        if len(petrol) < 5:
            continue
        prices = sorted(a["usd"] for a in petrol)
        cc = collections.Counter(a["cc"] for a in petrol).most_common(1)[0][0]
        km = [a["km"] for a in petrol if a["km"]]
        years[str(y)] = {"n": len(petrol), "median": int(st.median(prices)), "p25": int(st.quantiles(prices, n=4)[0]),
                         "cc": int(round(float(str(cc).replace(",", ".")) * 1000)), "km": int(st.median(km)) if km else None}
        time.sleep(0.3)
    result["models"][key] = years
    print(key, {y: v["n"] for y, v in years.items()})
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1))
print("→", OUT)
