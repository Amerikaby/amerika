/* Ставки калькуляторов. Единственный источник цифр: используется в site.js и при сборке (таблицы пошлин). */
/* Все ставки и тарифы в одном месте. Логистика и сборы аукциона — ориентиры, их нужно сверить с актуальными ценами. */
var CONFIG = {
  usdByn: 2.95,          // курс USD/BYN
  eurUsd: 1.15,          // курс EUR/USD
  serviceByn: 599,       // наша услуга (минимальный тариф)
  leadEndpoint: "",      // сюда подставим вебхук amoCRM; пусто = тестовый режим
  // Счётчики. Пусто = не загружаются. Пример: gtm "GTM-XXXXXXX", ym 12345678, ga4 "G-XXXXXXXXXX".
  // Если подключён GTM, GA4 и Метрику лучше ставить внутри GTM, а здесь оставить пустыми.
  analytics: {gtm: "", ym: "", ga4: ""},
  auctionFixed: 160,     // gate fee, environmental fee, документы, $
  auctionFee: [          // сбор покупателя по цене лота, $
    [500,200],[1000,350],[1500,450],[2000,525],[3000,650],[4000,750],
    [5000,850],[6000,900],[8000,1000],[10000,1100],[15000,1250]
  ],
  auctionFeeTopPct: 0.085, // свыше 15 000 $
  sublot: 100,           // машина не на площадке аукциона (Sublot / Offsite), $ для клиента
  altFuelEur: 175,       // доплата за доставку гибрида или электромобиля, EUR
  inland: {east:450, center:650, west:900},   // если площадка не выбрана — east
  sea: {
    klaipeda: {east:1150, center:1350, west:1900},
    poti:     {east:1300, center:1500, west:2100}
  },
  lastLeg: {klaipeda:650, poti:1700},  // от порта до Минска, $
  euMaxCc: 1900,                       // через ЕС: до 1,9 л, без гибридов и электро
  // Было одной суммой customsExtraByn: 945 BYN. Теперь утильсбор по возрасту + сбор + СВХ/декларант.
  utilByn: {upTo3: 624.92, over3: 1282.02},  // утильсбор, легковые физлиц, с 29.04.2026 (пост. СМ № 195). Для электро: TODO: уточнить льготную ставку
  customsFeeByn: 120,                  // таможенный сбор за оформление, BYN
  svhByn: 200,                         // TODO: уточнить у Леонида: СВХ и услуги декларанта, BYN (сейчас 945 − 624,92 − 120 ≈ 200)
  duty: {                              // физлица, EUR за см³ или % от стоимости
    under3: [[8500,.54,2.5],[16700,.48,3.5],[42300,.48,5.5],[84500,.48,7.5],[169000,.48,15],[Infinity,.48,20]],
    from3to5: [[1000,1.5],[1500,1.7],[1800,2.5],[2300,2.7],[3000,3.0],[Infinity,3.6]],
    over5: [[1000,3.0],[1500,3.2],[1800,3.5],[2300,4.8],[3000,5.0],[Infinity,5.7]]
  },
  // Мотоциклы (ТН ВЭД 8711), физлица. Сборы аукциона и наша услуга такие же, как у машин.
  // Единая ставка за см³ к мотоциклам не применяется: пошлина % от таможенной стоимости + НДС 20%, утильсбора нет.
  moto: {
    inland: {east:350, center:500, west:700},          // TODO: уточнить, доставка по США до порта, $
    sea: {                                              // TODO: уточнить, место в контейнере, $
      klaipeda: {east:600, center:750, west:1000},
      poti:     {east:700, center:850, west:1150}
    },
    lastLeg: {klaipeda:350, poti:900},                  // TODO: уточнить, от порта до Минска, $
    autoPort: "klaipeda",                               // TODO: уточнить маршрут для мотоциклов
    dutyPct: [[250,.14],[800,.15],[Infinity,.10]],      // ДВС: до 250 см³ 14%, 250–800 см³ 15%, свыше 800 см³ 10%
    dutyPctElectric: .14,                               // электромотоцикл 14%
    vat: .20,                                           // НДС от (таможенная стоимость + пошлина)
    utilByn: 0,                                         // утильсбор для мотоциклов не платится (подтвердить у декларанта)
    // Таможенная стоимость = лот + сборы аукциона + доставка до порта ЕАЭС. TODO: уточнить у декларанта, как считают на практике.
    // Льгота по Указу № 140: возврат 50% пошлины и НДС, таможенный сбор полностью.
  },
  // Штаты по направлению к порту отправки в США. Заменим на ваш файл с ценой по каждой площадке.
  states: {
    west: ["CA","OR","WA","NV","AZ","ID","UT","MT","WY","AK","HI"],
    center: ["TX","OK","LA","AR","KS","NE","CO","NM","MO","IA","MN","ND","SD","IL","WI","IN","MS"]
  }
};
var YARDS = {"copart": ["ACE - Carson, CA", "ACE - Perris, CA", "ADESA Boston, MA", "ADESA Great Lakes, OH", "ADESA New Jersey, NJ", "ADESA Sioux Falls, SD", "ADESA Wisconsin, WI", "Abilene, TX", "Adamsburg, PA", "Adesa PA, PA", "Akron-Canton, OH", "Albany, NY", "Albuquerque, NM", "Altoona, PA", "Amarillo, TX", "Anaheim, CA", "Anchorage, AK", "Andrews, TX", "Antelope, CA", "Appleton, WI", "Arizona Auto Auction, AZ", "Asheville, NC", "Ashland, VA", "Atlanta Auto Auction, GA", "Atlanta East, GA", "Atlanta North, GA", "Atlanta South, GA", "Atlanta West, GA", "Augusta, GA", "Austin, TX", "Avenel New Jersey, NJ", "Bakersfield, CA", "Baltimor, MD", "Bangor, ME", "Baton Rouge, LA", "Bay Area, CA", "Bel-Air Auto Auction, MD", "Billings, MT", "Birmingham, AL", "Boise, ID", "Boston - Shirley, MA", "Boston, MA", "Bowlimg Green, KY", "Bridgeport, CT", "Bridgeview, IL", "Buckhannon, WV", "Buffalo, NY", "Burlington, VT", "Candia, NH", "Cartersville, GA", "Casper, WY", "Central Auto Auction, NJ", "Central New Jersey, NJ", "Chambersburg, PA", "Charleston - SC, SC", "Charleston - WV, WV", "Charlotte, NC", "Chattanooga, TN", "Chicago North, IL", "Chicago South, IL", "Chicago West, IL", "China Grove, NC", "Cicero, IL", "Cincinnati, OH", "Clayton, GA", "Clearwater, FL", "Cleveland East, OH", "Cleveland West, OH", "Cleveland, OH", "Clinton, MD", "Colorado Springs, CO", "Columbia MO, MO", "Columbia SC, SC", "Columbus AL, AL", "Columbus OH, OH", "Concord, NC", "Corpus Christi, TX", "Culpeper,VA, VA", "Dallas South, TX", "Dallas, TX", "Danville, VA", "Davenport, IA", "Dayton, OH", "Defuniak Springs, FL", "Denver South, CO", "Denver, CO", "Des Moines, IA", "Detroit, MI", "Dothan, AL", "Dundalk, MD", "Dyer, IN", "Earlington, KY", "East Bay, CA", "East NC, NC", "El Paso, TX", "Eldridge, IA", "Englishtown, NJ", "Erie, PA", "Essex, MD", "Eugene, OR", "Exeter, RI", "Fargo, ND", "Fayetteville, NC", "Flint, MI", "Florence, SC", "Fontana, CA", "Fort Myers, FL", "Fort Wayne, IN", "Fort Worth North, TX", "Four Oaks, NC, NC", "Fredericksburg-South, VA", "Freetown, MA", "Fremont, CA", "Fresno, CA", "Ft. Pierce, FL", "Ft. Worth, TX", "Ft.Lauderdale, FL", "Glassboro East, NJ", "Glassboro West, NJ", "Golden Gate, CA", "Gr.Rapids, MI", "Graham, WA", "Grand Island, NE", "Grantville, PA", "Greater Auto Auction Phoenix, AZ", "Greensboro, NC", "Greenville, SC", "Greer, SC", "Grenada, MS", "Gulf Coast, MS", "Gulfport, MS", "Hammond, IN", "Hampton, VA, VA", "Harrisburg, PA", "Harrisonburg Auto Auction, VA", "Hartford City, IN", "Hartford, CT", "Hartford-South, CT", "Hayward, CA", "Helena, MT", "High Desert, CA", "Honolulu, HI", "Houston East, TX", "Houston, TX", "Houston-North, TX", "Huntsville, AL", "Indianapolis, IN", "Ionia, MI", "Jackson, MS", "Jacksonville East, FL", "Jacksonville West, FL", "Jacksonville, FL", "Kansas City, MO", "Kincheloe, MI", "Knoxville, TN", "Lafayette, LA", "Lansing, MI", "Las Vegas, NV", "Laurel, MD", "Lexington East KY, KY", "Lexington SC, SC", "Lexington West KY, KY", "Lincoln, IL, IL", "Lincoln, NE, NE", "Little Rock, AR", "Long Beach, CA", "Long Island, NY", "Longview, TX", "Los Angeles - Adesa, CA", "Los Angeles, CA", "Louisville, KY", "Lubbock, TX", "Lufkin, TX", "Lumberton, NC", "Lyman, ME", "MCAllen, TX", "Macon, GA", "Madison Heights, MI", "Madison South, WI", "Madison, WI", "Manchester, NH", "Manheim Albany, NY", "Manheim Arena Illinois, IL", "Manheim Arizona, AZ", "Manheim Auto Auction, PA", "Manheim Baltimore-Washington, MD", "Manheim Bishop Brothers, GA", "Manheim California, CA", "Manheim Carleton, MI", "Manheim Central California, CA", "Manheim Central Florida, FL", "Manheim Chicago, IL", "Manheim Cincinnati, OH", "Manheim Colorado, CO", "Manheim Dallas-Ft Worth, TX", "Manheim Darlington, SC", "Manheim Daytona Beach, FL", "Manheim Denver, CO", "Manheim Detroit, MI", "Manheim Fort Lauderdale, FL", "Manheim Fort Myers, FL", "Manheim Fort Wayne, IN", "Manheim Fredericksburg, VA", "Manheim Gateway St Louis, MO", "Manheim Georgia, GA", "Manheim Imperial Auto Auction, PA", "Manheim Imperial Florida, FL", "Manheim Kentucky, KY", "Manheim Lafayette, LA", "Manheim Lakeland, FL", "Manheim Metro Dallas, TX", "Manheim Metro Milwaukee, WI", "Manheim Milwaukee, WI", "Manheim Mississippi, MS", "Manheim Missouri, MO", "Manheim Nashville, TN", "Manheim Nevada, NV", "Manheim New England, MA", "Manheim New Jersey, NJ", "Manheim New Mexico, NM", "Manheim New Orleans, LA", "Manheim New York, NY", "Manheim North Carolina, NC", "Manheim Northstar Minnesota, MN", "Manheim Ohio, OH", "Manheim Oklahoma City, OK", "Manheim Orlando, FL", "Manheim Palm Beach, FL", "Manheim Pennsylvania, PA", "Manheim Pensacola, FL", "Manheim Philadelphia, PA", "Manheim Phoenix, AZ", "Manheim Pittsburg, PA", "Manheim Riverside, CA", "Manheim San Antonio, TX", "Manheim San Diego, CA", "Manheim San Francisco Bay, CA", "Manheim Seattle, WA", "Manheim Skyline Auto Auction, NY", "Manheim Southern California, CA", "Manheim St. Pete, FL", "Manheim Statesville, NC", "Manheim Tampa, FL", "Manheim Tennessee, TN", "Manheim Texas Hobby, TX", "Manheim Utah, UT", "Manheim Virginia (FREDERICKSBURG), VA", "Martinez, CA", "Mebane, GA", "Memphis, TN", "Mentone, CA", "Metro DC, DC", "Miami Central, FL", "Miami North, FL", "Miami South, FL", "Miami, FL", "Middletown, NY", "Milwaukee, WI", "Minneapolis /St. Paul, MN", "Minneapolis North, MN", "Minneapolis, MN", "Missoula, MT", "Mobile, AL", "Mocksville, NC", "Montgomery, AL", "Napa, CA", "Nashville, TN", "National Auto Dealers Exchange, NJ", "New Castle, DE", "New Orleans, LA", "Newburgh, NY", "North Boston, NY", "North Charleston - SC, SC", "North Hollywood, CA", "North Seattle, WA", "Northern New Jersey, NJ", "Northern Virginia, VA", "Ocala, FL", "Ogden, UT", "Oklahoma City, OK", "Omaha, NE", "Orlando North, FL", "Orlando South, FL", "Orlando, FL", "Paducah, KY", "Pasco, WA", "Pensacola, FL", "Peoria, IL", "Permian Basin, TX", "Philadelphia East, PA", "Philadelphia, PA", "Phoenix, AZ", "Pittsburg, PA", "Pittsburgh North, PA", "Pittsburgh South, PA", "Portage, WI", "Portland - Gorham, ME", "Portland North, OR", "Portland South, OR", "Portland West, OR", "Portland, OR", "Providence, RI", "Pulaski, VA", "Punta Gorda, FL", "Puyallup, WA", "Raleigh, NC", "Rancho Cucamonga, CA", "Rapid City, SD", "Redding, CA", "Reno, NV", "Richmond East, VA", "Richmond, VA", "Riverside, CA", "Roanoke, VA", "Rochester, NY", "Rosedale, MD", "Rutland, VT", "Sacramento, CA", "Salisbury, MD", "Salt Lake City, UT", "San Antonio, TX", "San Bernardino, CA", "San Diego, CA", "San Jose, CA", "Santa Clarita, CA", "Sarasota, FL", "Savannah, GA", "Sayreville, NJ", "Scranton, PA", "Seaford, DE", "Seattle, WA", "Shady Spring, WV, WV", "Shreveport, LA", "Sikeston, MO", "Sioux Falls, SD", "So Sacramento, CA", "Somerville, NJ", "South Bend, IN", "South Boston, VA", "Southern Illinois, IL", "Southern New Jersey, NJ", "Spartanburg, SC", "Spokane, WA", "Springfield, MO", "St. Cloud, MN", "St. Louis, MO", "Suffolk, VA", "Sun Valley, CA", "Syracuse, NY", "TOTAL RESOURCE AUC CENTRL PENN, PA", "Tallahassee, FL", "Tampa South, FL", "Tampa, FL", "Tanner, AL", "Taunton, MA", "Templeton, MA", "Tidewater, VA", "Tifton, GA", "Trenton, NJ", "Tucson, AZ", "Tulsa, OK", "Vallejo, CA", "Van Nuys, CA", "Waco, TX", "Walton, KY", "WashingtonDC, DC", "Wayland, MI", "Webster, NY", "West Palm Beach, FL", "West Warren, MA", "Western Colorado, CO", "Wheeling, WV", "Wichita, KS", "Wilmington, NC", "Windham, ME", "York Haven, PA", "York Springs, PA"], "iaai": ["ACE - Carson, CA", "ACE - Perris, CA", "ADESA Boston, MA", "ADESA Great Lakes, OH", "ADESA New Jersey, NJ", "ADESA Sioux Falls, SD", "ADESA Wisconsin, WI", "Abilene, TX", "Adamsburg, PA", "Adesa PA, PA", "Akron-Canton, OH", "Albany, NY", "Albuquerque, NM", "Altoona, PA", "Amarillo, TX", "Anaheim, CA", "Anchorage, AK", "Andrews, TX", "Antelope, CA", "Appleton, WI", "Arizona Auto Auction, AZ", "Asheville, NC", "Ashland, VA", "Atlanta Auto Auction, GA", "Atlanta East, GA", "Atlanta North, GA", "Atlanta South, GA", "Atlanta West, GA", "Augusta, GA", "Austin, TX", "Avenel New Jersey, NJ", "Bakersfield, CA", "Baltimor, MD", "Bangor, ME", "Baton Rouge, LA", "Bay Area, CA", "Bel-Air Auto Auction, MD", "Billings, MT", "Birmingham, AL", "Boise, ID", "Boston - Shirley, MA", "Boston, MA", "Bowlimg Green, KY", "Bridgeport, CT", "Bridgeview, IL", "Buckhannon, WV", "Buffalo, NY", "Burlington, VT", "Candia, NH", "Cartersville, GA", "Casper, WY", "Central Auto Auction, NJ", "Central New Jersey, NJ", "Chambersburg, PA", "Charleston - SC, SC", "Charleston - WV, WV", "Charlotte, NC", "Chattanooga, TN", "Chicago North, IL", "Chicago South, IL", "Chicago West, IL", "China Grove, NC", "Cicero, IL", "Cincinnati, OH", "Clayton, GA", "Clearwater, FL", "Cleveland East, OH", "Cleveland West, OH", "Cleveland, OH", "Clinton, MD", "Colorado Springs, CO", "Columbia MO, MO", "Columbia SC, SC", "Columbus AL, AL", "Columbus OH, OH", "Concord, NC", "Corpus Christi, TX", "Culpeper,VA, VA", "Dallas South, TX", "Dallas, TX", "Danville, VA", "Davenport, IA", "Dayton, OH", "Defuniak Springs, FL", "Denver South, CO", "Denver, CO", "Des Moines, IA", "Detroit, MI", "Dothan, AL", "Dundalk, MD", "Dyer, IN", "Earlington, KY", "East Bay, CA", "East NC, NC", "El Paso, TX", "Eldridge, IA", "Englishtown, NJ", "Erie, PA", "Essex, MD", "Eugene, OR", "Exeter, RI", "Fargo, ND", "Fayetteville, NC", "Flint, MI", "Florence, SC", "Fontana, CA", "Fort Myers, FL", "Fort Wayne, IN", "Fort Worth North, TX", "Four Oaks, NC, NC", "Fredericksburg-South, VA", "Freetown, MA", "Fremont, CA", "Fresno, CA", "Ft. Pierce, FL", "Ft. Worth, TX", "Ft.Lauderdale, FL", "Glassboro East, NJ", "Glassboro West, NJ", "Golden Gate, CA", "Gr.Rapids, MI", "Graham, WA", "Grand Island, NE", "Grantville, PA", "Greater Auto Auction Phoenix, AZ", "Greensboro, NC", "Greenville, SC", "Greer, SC", "Grenada, MS", "Gulf Coast, MS", "Gulfport, MS", "Hammond, IN", "Hampton, VA, VA", "Harrisburg, PA", "Harrisonburg Auto Auction, VA", "Hartford City, IN", "Hartford, CT", "Hartford-South, CT", "Hayward, CA", "Helena, MT", "High Desert, CA", "Honolulu, HI", "Houston East, TX", "Houston, TX", "Houston-North, TX", "Huntsville, AL", "Indianapolis, IN", "Ionia, MI", "Jackson, MS", "Jacksonville East, FL", "Jacksonville West, FL", "Jacksonville, FL", "Kansas City, MO", "Kincheloe, MI", "Knoxville, TN", "Lafayette, LA", "Lansing, MI", "Las Vegas, NV", "Laurel, MD", "Lexington East KY, KY", "Lexington SC, SC", "Lexington West KY, KY", "Lincoln, IL, IL", "Lincoln, NE, NE", "Little Rock, AR", "Long Beach, CA", "Long Island, NY", "Longview, TX", "Los Angeles - Adesa, CA", "Los Angeles, CA", "Louisville, KY", "Lubbock, TX", "Lufkin, TX", "Lumberton, NC", "Lyman, ME", "MCAllen, TX", "Macon, GA", "Madison Heights, MI", "Madison South, WI", "Madison, WI", "Manchester, NH", "Martinez, CA", "Mebane, GA", "Memphis, TN", "Mentone, CA", "Metro DC, DC", "Miami Central, FL", "Miami North, FL", "Miami South, FL", "Miami, FL", "Middletown, NY", "Milwaukee, WI", "Minneapolis /St. Paul, MN", "Minneapolis North, MN", "Minneapolis, MN", "Missoula, MT", "Mobile, AL", "Mocksville, NC", "Montgomery, AL", "Napa, CA", "Nashville, TN", "National Auto Dealers Exchange, NJ", "New Castle, DE", "New Orleans, LA", "Newburgh, NY", "North Boston, NY", "North Charleston - SC, SC", "North Hollywood, CA", "North Seattle, WA", "Northern New Jersey, NJ", "Northern Virginia, VA", "Ocala, FL", "Ogden, UT", "Oklahoma City, OK", "Omaha, NE", "Orlando North, FL", "Orlando South, FL", "Orlando, FL", "Paducah, KY", "Pasco, WA", "Pensacola, FL", "Peoria, IL", "Permian Basin, TX", "Philadelphia East, PA", "Philadelphia, PA", "Phoenix, AZ", "Pittsburg, PA", "Pittsburgh North, PA", "Pittsburgh South, PA", "Portage, WI", "Portland - Gorham, ME", "Portland North, OR", "Portland South, OR", "Portland West, OR", "Portland, OR", "Providence, RI", "Pulaski, VA", "Punta Gorda, FL", "Puyallup, WA", "Raleigh, NC", "Rancho Cucamonga, CA", "Rapid City, SD", "Redding, CA", "Reno, NV", "Richmond East, VA", "Richmond, VA", "Riverside, CA", "Roanoke, VA", "Rochester, NY", "Rosedale, MD", "Rutland, VT", "Sacramento, CA", "Salisbury, MD", "Salt Lake City, UT", "San Antonio, TX", "San Bernardino, CA", "San Diego, CA", "San Jose, CA", "Santa Clarita, CA", "Sarasota, FL", "Savannah, GA", "Sayreville, NJ", "Scranton, PA", "Seaford, DE", "Seattle, WA", "Shady Spring, WV, WV", "Shreveport, LA", "Sikeston, MO", "Sioux Falls, SD", "So Sacramento, CA", "Somerville, NJ", "South Bend, IN", "South Boston, VA", "Southern Illinois, IL", "Southern New Jersey, NJ", "Spartanburg, SC", "Spokane, WA", "Springfield, MO", "St. Cloud, MN", "St. Louis, MO", "Suffolk, VA", "Sun Valley, CA", "Syracuse, NY", "TOTAL RESOURCE AUC CENTRL PENN, PA", "Tallahassee, FL", "Tampa South, FL", "Tampa, FL", "Tanner, AL", "Taunton, MA", "Templeton, MA", "Tidewater, VA", "Tifton, GA", "Trenton, NJ", "Tucson, AZ", "Tulsa, OK", "Vallejo, CA", "Van Nuys, CA", "Waco, TX", "Walton, KY", "WashingtonDC, DC", "Wayland, MI", "Webster, NY", "West Palm Beach, FL", "West Warren, MA", "Western Colorado, CO", "Wheeling, WV", "Wichita, KS", "Wilmington, NC", "Windham, ME", "York Haven, PA", "York Springs, PA"]};
var PORTS = {klaipeda:{name:"Клайпеду (Литва)", short:"Клайпеды", from:"Клайпеда"}, poti:{name:"Поти (Грузия)", short:"Поти", from:"Поти"}};

/* Формулы калькуляторов без DOM. Используются в браузере (site.js) и при сборке (примеры расчёта на страницах машин). */
var CALC_YEAR = new Date().getFullYear();
/* Сбор аукциона, $ */
function auctionFee(p){
  for (var i = 0; i < CONFIG.auctionFee.length; i++) if (p < CONFIG.auctionFee[i][0]) return CONFIG.auctionFee[i][1] + CONFIG.auctionFixed;
  return p * CONFIG.auctionFeeTopPct + CONFIG.auctionFixed;
}
/* Пошлина легкового авто в EUR по таблицам CONFIG.duty: возраст = текущий год минус год выпуска. */
function dutyEur(eur, year, cc){
  var age = CALC_YEAR - year, d = 0, t, i, T = CONFIG.duty;
  if (age < 3) {
    t = T.under3;
    for (i = 0; i < t.length; i++) if (eur <= t[i][0]) { d = Math.max(eur * t[i][1], cc * t[i][2]); break; }
  } else {
    t = age <= 5 ? T.from3to5 : T.over5;
    for (i = 0; i < t.length; i++) if (cc <= t[i][0]) { d = cc * t[i][1]; break; }
  }
  return d;
}
/* Утильсбор легкового авто, BYN: до 3 лет включительно и старше. */
function utilByn(year){ return (CALC_YEAR - year) <= 3 ? CONFIG.utilByn.upTo3 : CONFIG.utilByn.over3; }
/* Мотоцикл: пошлина % от таможенной стоимости по объёму, электро отдельно. */
function motoRate(cc, electric){
  if (electric) return CONFIG.moto.dutyPctElectric;
  var t = CONFIG.moto.dutyPct;
  for (var i = 0; i < t.length; i++) if (cc <= t[i][0]) return t[i][1];
  return t[t.length - 1][1];
}
/* Пошлина + НДС мотоцикла в той же валюте, что и value. */
function motoDutyVat(value, cc, electric){
  var duty = value * motoRate(cc, electric), vat = (value + duty) * CONFIG.moto.vat;
  return {duty:duty, vat:vat};
}
/* Порт по умолчанию: через ЕС только ДВС до 1,9 л. */
function autoPortFor(moto, alt, cc){ return moto ? CONFIG.moto.autoPort : ((!alt && cc <= CONFIG.euMaxCc) ? "klaipeda" : "poti"); }
/* Полная стоимость под ключ, $. o: {moto, year, cc, alt, ev, region, port, sublot, benefit} */
function costOf(price, o){
  var L = o.moto ? CONFIG.moto : CONFIG;   // у мотоциклов своя логистика и таможня
  var fee = auctionFee(price);
  var inland = L.inland[o.region] + (o.sublot ? CONFIG.sublot : 0);
  var sea = L.sea[o.port][o.region], last = L.lastLeg[o.port];
  var extra = (!o.moto && o.alt) ? CONFIG.altFuelEur * CONFIG.eurUsd : 0;
  var duty, cust;
  if (o.moto) {
    // TODO: уточнить у декларанта базу: сейчас лот + сборы аукциона + доставка до порта ЕАЭС
    var dv = motoDutyVat(price + fee + inland + sea, o.cc, o.alt);
    duty = (dv.duty + dv.vat) * (o.benefit ? .5 : 1);
    cust = (CONFIG.moto.utilByn + CONFIG.customsFeeByn + CONFIG.svhByn) / CONFIG.usdByn;
  } else {
    duty = (o.ev ? 0 : dutyEur(price / CONFIG.eurUsd, o.year, o.cc) * CONFIG.eurUsd) * (o.benefit ? .5 : 1);
    cust = (utilByn(o.year) + CONFIG.customsFeeByn + CONFIG.svhByn) / CONFIG.usdByn;
  }
  var ours = CONFIG.serviceByn / CONFIG.usdByn;
  return {price:price, fee:fee, inland:inland, sea:sea, last:last, extra:extra, duty:duty, cust:cust, ours:ours,
          total: price + fee + inland + sea + last + extra + duty + cust + ours};
}

/* Общий скрипт сайта: меню, формы заявок, калькуляторы, каталог, галерея.
   Перед этим файлом при сборке подклеивается config.js (CONFIG, YARDS, PORTS). */
(function(){
"use strict";
var BASE = document.documentElement.getAttribute("data-base") || "/";
var $ = function(id){return document.getElementById(id)};
var qsa = function(sel, root){return Array.prototype.slice.call((root || document).querySelectorAll(sel))};
var nowYear = new Date().getFullYear();
var params = new URLSearchParams(location.search);

/* ---------- Аналитика: счётчики, цели, метки рекламы ---------- */
var A = CONFIG.analytics || {};
window.dataLayer = window.dataLayer || [];
(function(){
  function load(src){ var s = document.createElement("script"); s.async = true; s.src = src; document.head.appendChild(s); }
  if (A.gtm) {
    window.dataLayer.push({"gtm.start": Date.now(), event: "gtm.js"});
    load("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(A.gtm));
  }
  if (A.ga4) {
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", A.ga4);
    load("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(A.ga4));
  }
  if (A.ym) {
    window.ym = window.ym || function(){ (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = +new Date();
    load("https://mc.yandex.ru/metrika/tag.js");
    window.ym(A.ym, "init", {clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true});
  }
})();
/* Цель во все подключённые системы. Имена целей: lead_submit, click_phone, click_telegram, click_viber, click_whatsapp, calc_used, calc_send. */
function track(goal, params){
  params = params || {};
  try {
    window.dataLayer.push(Object.assign({event: goal}, params));
    if (A.ym && window.ym) window.ym(A.ym, "reachGoal", goal, params);
    if (A.ga4 && window.gtag) window.gtag("event", goal, params);
  } catch (e) {}
}
window.amzTrack = track;
/* Метки рекламы: сохраняем при входе на сайт (первая страница сессии) и добавляем в заявку. */
var ATTR_KEYS = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","yclid"];
var attribution = (function(){
  var stored = null;
  try { stored = JSON.parse(sessionStorage.getItem("amz_attr") || "null"); } catch (e) {}
  var found = {}, has = false;
  ATTR_KEYS.forEach(function(k){ var v = params.get(k); if (v) { found[k] = v.slice(0, 200); has = true; } });
  if (!stored || has) {
    stored = Object.assign({}, has ? found : (stored || {}), {landing: (stored && !has && stored.landing) || location.href, referrer: (stored && !has && stored.referrer) || document.referrer || ""});
    try { sessionStorage.setItem("amz_attr", JSON.stringify(stored)); } catch (e) {}
  }
  return stored;
})();
document.addEventListener("click", function(e){
  var a = e.target.closest && e.target.closest("a[href]");
  if (!a) return;
  var h = a.getAttribute("href");
  if (/^tel:/.test(h)) track("click_phone");
  else if (/t\.me\//.test(h)) track("click_telegram");
  else if (/^viber:/.test(h)) track("click_viber");
  else if (/wa\.me\//.test(h)) track("click_whatsapp");
});

/* ---------- Меню на телефоне ---------- */
(function(){
  var btn = $("burger"), panel = $("mnav"), top = document.querySelector(".top");
  if (!btn || !panel) return;
  function setH(){ document.documentElement.style.setProperty("--top-h", top.getBoundingClientRect().height + "px"); }
  function toggle(open){
    btn.setAttribute("aria-expanded", open); panel.hidden = !open;
    document.body.classList.toggle("menu-open", open); setH();
  }
  btn.addEventListener("click", function(){ toggle(btn.getAttribute("aria-expanded") !== "true"); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !panel.hidden) { toggle(false); btn.focus(); } });
  panel.addEventListener("click", function(e){ if (e.target.closest("a")) toggle(false); });
  window.addEventListener("resize", function(){ if (window.innerWidth > 1120 && !panel.hidden) toggle(false); });
})();

/* ---------- Формы заявок ---------- */
qsa("form[data-lead]").forEach(function(form){
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var msg = form.querySelector(".msg"), phoneEl = form.querySelector('[name="phone"]');
    var agree = form.querySelector('[name="agree"]');
    msg.hidden = false;
    if (phoneEl.value.replace(/\D/g, "").length < 9) { msg.textContent = "Укажите телефон, чтобы менеджер мог с вами связаться."; phoneEl.focus(); return; }
    if (agree && !agree.checked) { msg.textContent = "Чтобы отправить заявку, отметьте согласие на обработку персональных данных."; agree.focus(); return; }
    var data = {source: location.href};
    ATTR_KEYS.concat(["landing","referrer"]).forEach(function(k){ if (attribution && attribution[k]) data[k] = attribution[k]; });
    qsa("input[name],textarea[name],select[name]", form).forEach(function(el){ if (el.type !== "checkbox") data[el.name] = el.value; });
    var formName = form.getAttribute("data-lead") || "lead";
    // Конверсия только после успешной отправки, попытка — отдельным событием (опыт krov.by: клик ≠ заявка)
    track("lead_attempt", {form: formName});
    if (!CONFIG.leadEndpoint) {
      msg.textContent = "Это тестовая версия сайта (тестовый режим): заявка никуда не отправлена. После подключения amoCRM она будет сразу приходить менеджеру.";
      return;
    }
    msg.textContent = "Отправляем…";
    fetch(CONFIG.leadEndpoint, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)})
      .then(function(r){ if (!r.ok) throw 0; track("lead_submit", {form: formName}); msg.textContent = "Заявка принята. Менеджер перезвонит в течение часа в рабочее время."; form.reset(); })
      .catch(function(){ msg.textContent = "Не получилось отправить. Позвоните нам: +375 (29) 633-28-28 или напишите в Telegram."; });
  });
});

/* ---------- Общие формулы ---------- */
var fmt = function(n){return Math.round(n).toLocaleString("ru-RU").replace(/,/g," ") + " $"};
var fmtEur = function(n){return Math.round(n).toLocaleString("ru-RU").replace(/,/g," ") + " €"};
var fmtByn = function(n){return Math.round(n).toLocaleString("ru-RU").replace(/,/g," ") + " BYN"};
function fillYears(sel, def){
  for (var y = nowYear; y >= nowYear - 20; y--) {
    var o = document.createElement("option"); o.value = y; o.textContent = y;
    if (y === def) o.selected = true;
    sel.appendChild(o);
  }
}

/* ---------- Калькулятор под ключ ---------- */
(function(){
  if (!$("calcForm")) return;
  var val = function(name){return document.querySelector('#calcForm input[name="' + name + '"]:checked').value};
  fillYears($("year"), nowYear - 4);

  function fillYards(){
    var list = $("yardList"); list.innerHTML = "";
    YARDS[val("auction")].forEach(function(n){ var o = document.createElement("option"); o.value = n; list.appendChild(o); });
  }
  function regionOf(yard){
    var m = /,\s*([A-Z]{2})\s*$/.exec(yard || "");
    if (!m) return null;
    if (CONFIG.states.west.indexOf(m[1]) >= 0) return "west";
    if (CONFIG.states.center.indexOf(m[1]) >= 0) return "center";
    return "east";
  }
  var cost = costOf;
  function options(){
    var moto = val("vtype") === "moto";
    var cc = Math.max(0, +$("volume").value || 0), alt = val("fuel") === "alt";
    var yard = $("yard").value.trim(), region = regionOf(yard) || "east";
    var autoPort = autoPortFor(moto, alt, cc);
    var port = $("port").value === "auto" ? autoPort : $("port").value;
    return {moto:moto, year:+$("year").value, cc:cc, alt:alt, ev:!moto && alt && cc === 0, region:region, yard:yard,
            port:port, autoPort:autoPort, sublot:$("sublot").checked, benefit:$("benefit").checked};
  }
  function calc(){
    var o = options(), budget = val("mode") === "budget";
    var input = Math.max(0, +$("price").value || 0), r;
    if (budget) {
      var lo = 0, hi = input;                 // ищем самую большую ставку, при которой итог укладывается в бюджет
      if (cost(0, o).total > input) hi = 0;
      for (var i = 0; i < 40; i++) { var mid = (lo + hi) / 2; if (cost(mid, o).total <= input) lo = mid; else hi = mid; }
      r = cost(Math.floor(lo / 50) * 50, o);
    } else {
      r = cost(input, o);
    }
    $("priceLabel").textContent = budget ? "Бюджет под ключ, $" : "Цена лота, $";
    $("maxbid").hidden = !budget;
    $("r-max").textContent = fmt(r.price);
    $("evHint").hidden = !o.alt || o.moto;
    $("carOnly").hidden = o.moto;
    $("fuelAlt").textContent = o.moto ? "Электро" : "Гибрид / электро";
    $("r-duty-l").textContent = o.moto ? "Пошлина и НДС 20%" : "Таможенная пошлина";
    $("r-cust-l").textContent = o.moto ? "Таможенный сбор, СВХ, декларант" : "Утильсбор, СВХ, декларант";
    $("motoNote").hidden = !o.moto;

    var P = PORTS[o.port], txt;
    if (o.moto) {
      txt = "Маршрут: через <b>" + P.name + "</b>. Для мотоциклов маршрут подтверждаем при расчёте. Порт можно сменить.";
    } else if (o.port === o.autoPort) {
      txt = "Маршрут: через <b>" + P.name + "</b>, " + (o.port === "klaipeda" ? "двигатель до 1,9 л можно везти через ЕС."
        : (o.alt ? "гибриды и электромобили обычно везём в обход ЕС." : "через ЕС сейчас не везут машины с двигателем больше 1,9 л.")) + " Порт можно сменить.";
    } else if (o.port === "klaipeda") {
      txt = "Через Клайпеду такую машину могут не пропустить: ограничения ЕС для двигателей больше 1,9 л, гибридов и электро. Уточните у менеджера.";
    } else {
      txt = "Маршрут: через <b>" + P.name + "</b>, вы выбрали его сами.";
    }
    $("route").innerHTML = txt;
    $("route").classList.toggle("warn", !o.moto && o.port === "klaipeda" && o.port !== o.autoPort);

    $("r-lot").textContent = fmt(r.price);
    $("r-fee").textContent = fmt(r.fee);
    $("r-inland-l").textContent = "Доставка по США до порта" + (o.yard ? "" : " (в среднем)") + (o.sublot ? ", с Sublot" : "");
    $("r-inland").textContent = fmt(r.inland);
    $("r-sea-l").textContent = "Море до " + P.short;
    $("r-sea").textContent = fmt(r.sea);
    $("r-last-l").textContent = P.from + " → Минск";
    $("r-last").textContent = fmt(r.last);
    $("r-extra-row").hidden = !r.extra;
    $("r-extra-l").textContent = "Доплата за гибрид / электро";
    $("r-extra").textContent = fmt(r.extra);
    $("r-duty").textContent = o.ev ? "0 $ (электро)" : fmt(r.duty);
    $("r-cust").textContent = fmt(r.cust);
    $("r-ours").textContent = fmt(r.ours);
    $("r-total").textContent = fmt(r.total);
    $("r-byn").textContent = "≈ " + Math.round(r.total * CONFIG.usdByn).toLocaleString("ru-RU") + " BYN по курсу " + CONFIG.usdByn;
    return {moto:o.moto, price:Math.round(r.price), year:o.year, cc:o.cc, alt:o.alt, port:o.port, yard:o.yard, budget:budget, total:Math.round(r.total)};
  }

  $("advToggle").addEventListener("click", function(){
    var open = this.getAttribute("aria-expanded") !== "true";
    this.setAttribute("aria-expanded", open); $("adv").hidden = !open;
  });
  qsa('#calcForm input[name="auction"]').forEach(function(r){
    r.addEventListener("change", function(){ fillYards(); $("yard").value = ""; calc(); });
  });
  qsa('#calcForm input[name="mode"]').forEach(function(r){
    r.addEventListener("change", function(){ $("price").value = r.value === "budget" ? 20000 : 12000; calc(); });
  });
  qsa('#calcForm input[name="vtype"]').forEach(function(r){
    r.addEventListener("change", function(){
      var moto = r.value === "moto";
      $("volume").value = moto ? 1000 : 2000;
      if (val("mode") === "price") $("price").value = moto ? 5000 : 12000;
      calc();
    });
  });
  qsa("#calcForm .picks button").forEach(function(b){
    b.addEventListener("click", function(){
      var v = b.dataset.p.split(",");
      document.querySelector('#calcForm input[name="mode"][value="price"]').checked = true;
      $("price").value = v[0]; $("year").value = v[1]; $("volume").value = v[2];
      document.querySelector('#calcForm input[name="fuel"][value="' + v[3] + '"]').checked = true;
      calc();
    });
  });

  /* Подстановка из адреса: ?type=moto&price=9000&year=2021&cc=1500&fuel=alt */
  if (params.get("type") === "moto") document.querySelector('#calcForm input[name="vtype"][value="moto"]').checked = true;
  if (params.get("type") === "moto") $("volume").value = 1000;
  if (+params.get("price") > 0) $("price").value = +params.get("price");
  if (+params.get("year") >= nowYear - 20 && +params.get("year") <= nowYear) $("year").value = +params.get("year");
  if (params.has("cc") && +params.get("cc") >= 0) $("volume").value = +params.get("cc");
  if (params.get("fuel") === "alt") document.querySelector('#calcForm input[name="fuel"][value="alt"]').checked = true;

  fillYards();
  var used = false;
  function onUse(){ calc(); if (!used) { used = true; track("calc_used", {calc: "turnkey"}); } }
  $("calcForm").addEventListener("input", onUse);
  $("calcForm").addEventListener("change", onUse);
  calc();

  var send = $("sendCalc");
  if (send) send.addEventListener("click", function(){
    var r = calc(), box = $("lcar");
    track("calc_send", {total: r.total});
    if (!box) return;
    var f = r.moto ? (r.alt ? "электромотоцикл" : "мотоцикл") : (r.alt ? (r.cc ? "гибрид" : "электро") : "бензин/дизель");
    box.value = "Расчёт с калькулятора: " + (r.budget ? "бюджет " + r.total + " $, ставка до " + r.price + " $" : "лот " + r.price + " $, итого ≈ " + r.total + " $ под ключ")
      + ", " + r.year + " г., " + r.cc + " см³, " + f + (r.yard ? ", площадка " + r.yard : "") + ", через " + PORTS[r.port].name + ".";
  });
})();

/* ---------- Быстрый расчёт на главной ---------- */
(function(){
  var box = $("quick"), dataEl = $("quickData");
  if (!box || !dataEl) return;
  var D = JSON.parse(dataEl.textContent), lotTouched = false, used = false;
  function sel(){ return box.querySelector('input[name="qm"]:checked').value; }
  function model(){ var v = sel(); return v === "other" ? null : D[+v]; }
  /* Строка модели: [год, см³, медиана av.by, ставить до] */
  function row(m){ var y = +$("qYear").value; for (var i = 0; i < m.y.length; i++) if (m.y[i][0] === y) return m.y[i]; return m.y[0]; }
  /* Ставка по умолчанию: заметно ниже границы выгоды, круглая */
  function defLot(r){ return r && r[3] ? Math.max(1000, Math.floor(r[3] * 0.75 / 500) * 500) : 10000; }
  function setYears(list, def){
    var s = $("qYear"), keep = +s.value; s.innerHTML = "";
    list.forEach(function(y){ var o = document.createElement("option"); o.value = y; o.textContent = y; s.appendChild(o); });
    s.value = list.indexOf(keep) >= 0 && def == null ? keep : (def || list[0]);
  }
  function refill(){
    var m = model(), years = [];
    if (m) { setYears(m.y.map(function(r){ return r[0]; }), m.def); }
    else { for (var y = nowYear; y >= nowYear - 15; y--) years.push(y); setYears(years, years.indexOf(+$("qYear").value) >= 0 ? null : nowYear - 4); }
    $("qOther").hidden = !!m;
  }
  function run(){
    var m = model(), r = m ? row(m) : null, o;
    if (!lotTouched) $("qLot").value = defLot(r);
    var lot = Math.max(0, +$("qLot").value || 0), year = +$("qYear").value;
    if (m) {
      o = {moto:false, year:year, cc:r[1], alt:false, ev:false, region:"east", port:autoPortFor(false, false, r[1]), sublot:false, benefit:false};
    } else {
      var fuel = $("qFuel").value, cc = fuel === "ev" ? 0 : Math.max(0, +$("qCc").value || 0), alt = fuel !== "ice";
      o = {moto:false, year:year, cc:cc, alt:alt, ev:fuel === "ev", region:"east", port:autoPortFor(false, alt, cc), sublot:false, benefit:false};
    }
    var c = costOf(lot, o);
    $("qTotal").textContent = fmt(c.total);
    $("qByn").textContent = "≈ " + Math.round(c.total * CONFIG.usdByn).toLocaleString("ru-RU") + " BYN";
    $("qLotHint").hidden = lotTouched;
    $("qCc").disabled = !m && $("qFuel").value === "ev";
    var v = $("qVerdict");
    if (m) {
      var mk = r[2], max = Math.max(c.total, mk), diff = mk - c.total;
      $("qBars").hidden = false;
      $("qMk").textContent = fmt(mk);
      $("qBarUs").style.width = (c.total / max * 100) + "%"; $("qBarMk").style.width = (mk / max * 100) + "%";
      v.className = "qc-verdict " + (diff > 0 ? "good" : "bad");
      v.innerHTML = diff > 0
        ? "Дешевле рынка примерно на <b>" + fmt(diff) + "</b>. Выгодно при ставке до " + fmt(r[3]) + "."
        : (r[3] ? "При такой ставке дороже рынка. " + m.n + " " + r[0] + " выгодно брать при ставке до <b>" + fmt(r[3]) + "</b>."
                : m.n + " " + r[0] + " из США выходит не дешевле рынка. Посмотрите другой год.");
    } else {
      $("qBars").hidden = true;
      v.className = "qc-verdict";
      v.innerHTML = "Маршрут через <b>" + PORTS[o.port].name + "</b>" + (o.port === "poti" ? ": машины больше 1,9 л, гибриды и электро везём в обход ЕС." : ".")
        + " Сравнение с рынком Беларуси для этой машины пришлём вместе с точным расчётом.";
    }
    $("qMore").href = BASE + "kalkulyator/?" + new URLSearchParams({price: String(lot), year: String(year), cc: String(o.cc)}).toString() + (o.alt ? "&fuel=alt" : "") + "#calc";
    return {m:m, o:o, lot:lot, year:year, total:Math.round(c.total)};
  }
  qsa('input[name="qm"]', box).forEach(function(i){ i.addEventListener("change", function(){ lotTouched = false; refill(); run(); }); });
  $("qYear").addEventListener("change", function(){ if (model()) lotTouched = false; run(); });
  $("qLot").addEventListener("input", function(){ lotTouched = true; run(); });
  ["qCc", "qFuel"].forEach(function(id){ $(id).addEventListener("input", run); $(id).addEventListener("change", run); });
  box.addEventListener("change", function(){ if (!used) { used = true; track("calc_used", {calc: "quick"}); } });
  run();
  $("qSend").addEventListener("click", function(){
    var x = run(), lc = $("lcar");
    var name = x.m ? x.m.b + " " + x.m.n : ($("qName").value.trim() || "машина") + ", " + (x.o.ev ? "электро" : x.o.cc + " см³" + (x.o.alt ? ", гибрид" : ""));
    track("calc_send", {total: x.total, calc: "quick"});
    if (lc) lc.value = "Быстрый расчёт: " + name + ", " + x.year + " г., ставка " + x.lot + " $, итого ≈ " + x.total + " $ с растаможкой, через " + PORTS[x.o.port].name + ".";
  });
})();

/* ---------- Таможенный калькулятор ---------- */
(function(){
  var form = $("ccForm");
  if (!form) return;
  var val = function(name){return form.querySelector('input[name="' + name + '"]:checked').value};
  fillYears($("ccYear"), nowYear - 4);
  if (+params.get("year")) $("ccYear").value = +params.get("year");
  if (params.has("cc")) $("ccVolume").value = +params.get("cc");
  if (params.get("type") === "moto") form.querySelector('input[name="cvtype"][value="moto"]').checked = true;
  function run(){
    var moto = val("cvtype") === "moto", ev = val("cfuel") === "ev";
    var cur = val("cur"), price = Math.max(0, +$("ccPrice").value || 0);
    var eur = cur === "eur" ? price : price / CONFIG.eurUsd;
    var cc = ev ? 0 : Math.max(0, +$("ccVolume").value || 0), year = +$("ccYear").value, age = nowYear - year;
    var benefit = $("ccBenefit").checked, k = benefit ? .5 : 1;
    var eurByn = CONFIG.eurUsd * CONFIG.usdByn, duty, vat = 0, util, rule;
    if (moto) {
      var dv = motoDutyVat(eur, cc, ev);
      duty = dv.duty * k; vat = dv.vat * k; util = CONFIG.moto.utilByn;
      rule = "Мотоцикл: " + Math.round(motoRate(cc, ev) * 100) + "% от таможенной стоимости плюс НДС 20%. Ставка за см³ к мотоциклам не применяется, утильсбор не платится.";
    } else {
      duty = ev ? 0 : dutyEur(eur, year, cc) * k; util = utilByn(year);
      if (ev) rule = "Электромобиль: пошлина 0 в пределах годовой квоты.";
      else if (age < 3) rule = "До 3 лет: процент от стоимости, но не меньше минимума за см³. Берётся большее.";
      else rule = "Старше 3 лет: ставка за каждый см³ объёма, стоимость не важна.";
    }
    $("ccFuelEv").textContent = moto ? "Электро" : "Электро (квота)";
    $("ccYearField").hidden = false;
    $("ccMotoNote").hidden = !moto;
    $("ccVolField").hidden = ev;
    $("ccAge").textContent = age < 3 ? "до 3 лет" : (age <= 5 ? "от 3 до 5 лет" : "старше 5 лет");
    $("ccRule").textContent = rule;
    $("cr-duty-eur").textContent = fmtEur(duty) + " ≈ " + fmt(duty * CONFIG.eurUsd);
    $("cr-vat-row").hidden = !moto;
    $("cr-vat").textContent = fmtEur(vat) + " ≈ " + fmt(vat * CONFIG.eurUsd);
    $("cr-util-row").hidden = moto;
    $("cr-util").textContent = fmtByn(util);
    $("cr-fee").textContent = fmtByn(CONFIG.customsFeeByn);
    $("cr-svh").textContent = fmtByn(CONFIG.svhByn);
    var totalByn = (duty + vat) * eurByn + util + CONFIG.customsFeeByn + CONFIG.svhByn;
    $("cr-total").textContent = fmtByn(totalByn);
    $("cr-total-usd").textContent = "≈ " + fmt(totalByn / CONFIG.usdByn) + " · курс: 1 € = " + CONFIG.eurUsd + " $, 1 $ = " + CONFIG.usdByn + " BYN";
  }
  var used = false;
  function onUse(){ run(); if (!used) { used = true; track("calc_used", {calc: "customs"}); } }
  form.addEventListener("input", onUse); form.addEventListener("change", onUse); run();
})();

/* ---------- Галерея на странице машины ---------- */
(function(){
  var g = $("gallery");
  if (!g) return;
  var main = g.querySelector(".main img"), btns = qsa(".thumbs button", g), cnt = g.querySelector(".cnt"), i = 0;
  function show(n){
    if (!btns.length) return;
    i = (n + btns.length) % btns.length;
    var b = btns[i];
    main.src = b.dataset.src; main.alt = b.querySelector("img").alt;
    btns.forEach(function(x, k){ x.setAttribute("aria-current", k === i); });
    if (cnt) cnt.textContent = (i + 1) + " / " + btns.length;
  }
  btns.forEach(function(b, k){ b.addEventListener("click", function(){ show(k); }); });
  var p = g.querySelector(".prev"), n = g.querySelector(".next");
  if (p) p.addEventListener("click", function(){ show(i - 1); });
  if (n) n.addEventListener("click", function(){ show(i + 1); });
})();

/* ---------- Каталог: поиск и фильтр по марке ---------- */
function carCard(c){
  var a = document.createElement("a");
  a.className = "car"; a.href = BASE + "auto-usa/" + c.s + "/";
  var ph = c.i ? '<div class="ph"><img src="' + c.i + '" alt="" loading="lazy" decoding="async" width="300" height="225"></div>'
    : '<div class="ph ph-empty"><span class="pb"></span><b class="pm"></b><small>фото по запросу</small></div>';
  a.innerHTML = ph + '<div class="tx"><h3></h3><div class="meta">' + (c.y ? "<b>" + c.y + "</b>" : "") + "<span></span></div></div>";
  a.querySelector("h3").textContent = c.t; a.querySelector(".meta span").textContent = c.bn || "";
  if (!c.i) { a.querySelector(".pb").textContent = c.bn || ""; a.querySelector(".pm").textContent = c.m || c.t; }
  return a;
}
(function(){
  var form = $("catFilter");
  if (!form) return;
  var grid = $("carGrid"), pager = $("catPager"), count = $("catCount"), more = $("catMore"), data = null, list = [], shown = 0, STEP = 24;
  var q = $("catQ"), brand = $("catBrand");
  if (params.get("q")) q.value = params.get("q");
  function render(reset){
    if (reset) { grid.innerHTML = ""; shown = 0; }
    var frag = document.createDocumentFragment();
    list.slice(shown, shown + STEP).forEach(function(c){ frag.appendChild(carCard(c)); });
    shown = Math.min(list.length, shown + STEP);
    grid.appendChild(frag);
    more.hidden = shown >= list.length;
    if (!list.length) grid.innerHTML = '<p class="empty">Ничего не нашли. Напишите нам, какую машину ищете: подберём на аукционе.</p>';
  }
  function apply(){
    var t = q.value.trim().toLowerCase(), b = brand.value;
    if (!t && !b) { location.href = location.pathname; return; }
    if (b && !t) { location.href = BASE + "usa/" + b + "/"; return; }
    var words = t.split(/\s+/).filter(Boolean);
    list = data.filter(function(c){
      if (b && c.b !== b) return false;
      var hay = (c.t + " " + (c.y || "")).toLowerCase();
      return words.every(function(w){ return hay.indexOf(w) >= 0; });
    });
    count.textContent = "Найдено: " + list.length;
    if (pager) pager.hidden = true;
    render(true);
  }
  function load(cb){
    if (data) return cb();
    count.textContent = "Загружаем…";
    fetch(BASE + "assets/cars.json").then(function(r){ return r.json(); }).then(function(d){ data = d; cb(); })
      .catch(function(){ count.textContent = "Не удалось загрузить список"; });
  }
  var timer;
  q.addEventListener("input", function(){ clearTimeout(timer); timer = setTimeout(function(){ load(apply); }, 250); });
  brand.addEventListener("change", function(){ load(apply); });
  form.addEventListener("submit", function(e){ e.preventDefault(); load(apply); });
  more.addEventListener("click", function(){ render(false); });
  if (q.value) load(apply);
})();

/* ---------- Страница марки: фильтр по модели и «показать ещё» ---------- */
(function(){
  var chips = $("modelChips"), grid = $("carGrid");
  if (!chips || !grid) return;
  var cards = qsa(".car", grid), more = $("brandMore"), STEP = 24, limit = STEP, model = params.get("model") || "";
  function apply(){
    var list = cards.filter(function(c){ return !model || c.dataset.model === model; });
    cards.forEach(function(c){ c.hidden = true; });
    list.slice(0, limit).forEach(function(c){ c.hidden = false; });
    more.hidden = list.length <= limit;
    qsa("button", chips).forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.model === model); });
  }
  chips.addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    model = b.dataset.model; limit = STEP;
    var u = new URL(location.href); if (model) u.searchParams.set("model", model); else u.searchParams.delete("model");
    history.replaceState(null, "", u);
    apply();
  });
  more.addEventListener("click", function(){ limit += STEP; apply(); });
  apply();
})();

/* ---------- Отслеживание по VIN ---------- */
(function(){
  var form = $("vinForm");
  if (!form) return;
  // TODO: когда Atlantic Express Corporation даст адрес отслеживания, открывать его здесь, например:
  // window.open("https://<atlantic-express-tracking>/?vin=" + vin, "_blank", "noopener");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var vin = $("vin").value.trim().toUpperCase().replace(/\s+/g, ""), out = $("vinOut"), msg = $("vinMsg");
    out.hidden = false;
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      msg.textContent = "VIN состоит из 17 символов: латинские буквы (кроме I, O, Q) и цифры. Проверьте номер.";
      $("vinActions").hidden = true; return;
    }
    var text = "Здравствуйте! Подскажите, где сейчас моя машина. VIN: " + vin;
    msg.textContent = "Онлайн-отслеживание подключаем. Пока пришлите VIN менеджеру: он ответит, где машина и когда она будет в Минске.";
    $("vinActions").hidden = false;
    $("vinWa").href = "https://wa.me/375296332828?text=" + encodeURIComponent(text);
    $("vinTg").href = "https://t.me/amerikaa_by";
    var box = $("lcar"); if (box) box.value = "Отслеживание: VIN " + vin;
    try { if (navigator.clipboard) navigator.clipboard.writeText(vin).catch(function(){}); } catch (err) {}
  });
})();
})();
