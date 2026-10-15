// Ручные поправки к данным старого сайта: фото, объёмы двигателей по умолчанию, регистр комплектаций.

/**
 * Машины, у которых в старом WordPress стоят фото не этой машины (проверено глазами по списку
 * new2-photo-mismatch.txt 15.10.2026). Для них показываем нейтральную заглушку с названием.
 * Остальные из списка проверены: имя файла чужое или хеш, но на фото та же машина.
 */
export const PHOTO_BLOCK = new Map([
  ['tesla-model-s', 'стоковое фото Model S (Rectangle-41.png), не лот'],
  ['chevrolet-malibu-lt-2019', 'рекламное фото Malibu с канадским номером (Rectangle-42.png), не лот'],
  ['mazda-3-2018', 'на фото Nissan с V-образной решёткой, не Mazda 3'],
]);
/** Любая картинка-заглушка из WordPress (Rectangle-NN.png) тоже не фото машины. */
export const isStubImage = (url) => /\/rectangle-\d+\.(png|jpe?g)$/i.test(url || '');

/** Комплектации и обозначения, которые пишутся заглавными. */
export const UPPER = new Set(('AWD FWD RWD 4WD 2WD 4X4 4MATIC LS LT LTZ LZ SS RS RST SE SEL SES SLE SLT SL SLX SV SR SR5 S XL XLT XLE XSE LE GT GTI GLI GLS GLE GLC GLA GLB CLA GX EX EXL EX-L LX LXS DX SX ST SXT RT TRD AMG EV PHEV TSI TDI TFSI SRT ZR2 ZL1 GTS CX LTD ' +
  'II III IV HD GS ES IS NX RX UX SI XC TL TLX RDX MDX ILX ZX ZS GL GLX GT-LINE XRS SL-LINE N EVO ECO SXL').split(' '));
const MIXED = { 'premium plus': 'Premium Plus' };

/** Нормализует регистр комплектаций в названии: «Awd Ls» → «AWD LS», «1.5t Se» → «1.5T SE». */
export function fixTitleCase(title) {
  let t = title.replace(/\bHyndai\b/g, 'Hyundai');
  t = t.replace(/[A-Za-z0-9][A-Za-z0-9\-\/.]*/g, (w) => {
    const up = w.toUpperCase();
    if (UPPER.has(up)) return up;
    if (/^\d(\.\d)?[tT]$/.test(w)) return up;               // 1.5t → 1.5T
    if (/^\d+[a-z]$/.test(w) && w.length <= 5) return w;     // 530i, 328d — как есть
    return w;
  });
  for (const [k, v] of Object.entries(MIXED)) t = t.replace(new RegExp(k, 'ig'), v);
  return t;
}

/**
 * Типичный объём двигателя для модели (см³), если в описании его нет. 0 = электромобиль.
 * Используется только для примера расчёта и всегда подписан как «типичный для модели».
 */
const MODEL_CC = {
  jetta: 1400, equinox: 1500, encore: 1400, malibu: 1500, terrain: 1500, tiguan: 2000, civic: 2000, golf: 1400,
  escape: 1500, accord: 1500, rogue: 2500, 'seria-3': 2000, 'cx-5': 2500, a3: 2000, bolt: 0, 'cr-v': 1500,
  trailblazer: 1300, trax: 1400, forester: 2500, camry: 2500, a4: 2000, rav4: 2500, q5: 2000, edge: 2000,
  mustang: 2300, tucson: 2000, sportage: 2400, outback: 2500, ecosport: 1000, 'hr-v': 1800, x3: 2000,
  'seria-2': 2000, fit: 1500, corolla: 1800, renegade: 2400, fusion: 1500, cruze: 1400, 3: 2500, taos: 1500,
  'eclipse-cross': 1500, giulia: 2000, bronco: 1500, xc60: 2000, 'santa-fe': 2400, q3: 2000, q50: 3000,
  stelvio: 2000, compass: 2400, sentra: 2000, outlander: 2500, 'c-hr': 2000, 'outlander-sport': 2000, k5: 1600,
  s60: 2000, 6: 2500, countryman: 1500, xc40: 2000, crosstrek: 2000, passat: 2000, kona: 2000, elantra: 2000,
  camaro: 2000, 'seria-4': 2000, cooper: 1500, kicks: 1600, optima: 2400, mirage: 1200, 'seria-5': 2000,
  envision: 2000, sorento: 2500, explorer: 2300, 'f-pace': 2000, glb: 2000, 500: 1400, clubman: 1500, versa: 1600,
  soul: 2000, leaf: 0, seltos: 2000, rio: 1600, journey: 2400, murano: 3500, cla: 2000, 'model-3': 0, envista: 1200,
  a5: 2000, highlander: 3500, sonata: 2500, 'cx-3': 2000, cherokee: 2400, x2: 2000, spark: 1400, 'rogue-sport': 2000,
  'class-c': 2000, accent: 1600, stinger: 2000, prius: 1800, regal: 2000, q7: 2000, 'mx-5': 2000, xc90: 2000, x1: 2000,
  'model-y': 0, 'model-x': 0, 'model-s': 0, i3: 0, 'ioniq-5': 0, 'id-4': 0, 'prius-prime': 1800, 'prius-c': 1500,
  insight: 1500, ux: 2000, 'cx-30': 2500, 'cx-50': 2500, forte: 2000, atlas: 2000, arteon: 2000, blazer: 2000,
  altima: 2500, focus: 2000, yaris: 1500, '4runner': 4000, rdx: 2000, tlx: 2000, xt4: 2000, acadia: 2000,
  pacifica: 3600, sienna: 2500, wrangler: 2000, '124-spider': 1400, '500l': 1400,
};
/** Объём по умолчанию с поправкой на поколение. null = неизвестно. */
export function defaultCc(modelSlug, year) {
  if (modelSlug === 'trax' && year >= 2024) return 1200;
  if (modelSlug === 'tucson' && year >= 2022) return 2500;
  if (modelSlug === 'equinox' && year >= 2025) return 1500;
  return Object.prototype.hasOwnProperty.call(MODEL_CC, modelSlug) ? MODEL_CC[modelSlug] : null;
}
export const EV_MODELS = new Set(['bolt', 'leaf', 'model-3', 'model-y', 'model-x', 'model-s', 'i3', 'ioniq-5', 'id-4']);
