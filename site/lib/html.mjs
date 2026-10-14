// HTML-утилиты: экранирование, декодирование сущностей, очистка контента из WordPress.

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»',
  mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', bdquo: '„', times: '×',
  deg: '°', copy: '©', reg: '®', trade: '™', euro: '€', minus: '−', middot: '·', laquo2: '«' };

export function decode(s) {
  return String(s ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d?);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

/** Текст без тегов (для описаний, поиска). */
export const plain = (html) => decode(String(html ?? '')
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

export const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/[\s,.;:–—-]+\S*$/, '') + '…');

function attr(attrs, name) {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(attrs);
  return m ? (m[2] ?? m[3] ?? m[4] ?? '') : null;
}

const KEEP = {
  p: 'p', br: 'br', strong: 'strong', b: 'strong', em: 'em', i: 'em', ul: 'ul', ol: 'ol', li: 'li',
  h1: 'h2', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h4', h6: 'h4', blockquote: 'blockquote',
  table: 'table', thead: 'thead', tbody: 'tbody', tr: 'tr', th: 'th', td: 'td',
  a: 'a', img: 'img', figure: 'figure', figcaption: 'figcaption', hr: 'hr', small: 'small',
};
const VOID = new Set(['br', 'img', 'hr']);
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'noscript', 'form', 'button', 'svg', 'select', 'textarea', 'object', 'video', 'audio']);

/**
 * Чистит HTML из WordPress: оставляет p/ul/ol/li/strong/em/h2–h4/blockquote/таблицы/ссылки/картинки,
 * убирает все классы, стили, span и div-обёртки. mapLink(href) → {href, ext} | null (null = ссылку снять).
 * opts.shiftHeadings: на 1 уровень вниз (h2→h3) — для описаний машин.
 */
export function sanitize(html, mapLink, opts = {}) {
  const out = [];
  const aStack = [];
  let skip = null, skipDepth = 0;
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|([^<]+)|(<)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<!--')) continue;
    if (m[4] !== undefined || m[5] !== undefined) { if (!skip) out.push(m[4] ?? '&lt;'); continue; }
    const closing = m[1] === '/', tag = m[2].toLowerCase(), attrs = m[3] || '';
    if (skip) {
      if (tag === skip) { if (closing) { if (--skipDepth === 0) skip = null; } else if (!/\/\s*$/.test(attrs)) skipDepth++; }
      continue;
    }
    if (DROP_WITH_CONTENT.has(tag)) { if (!closing && !/\/\s*$/.test(attrs)) { skip = tag; skipDepth = 1; } continue; }
    let t = KEEP[tag];
    if (!t) continue; // div, span и прочее: тег убираем, текст оставляем
    if (opts.shiftHeadings && /^h[234]$/.test(t)) t = t === 'h2' ? 'h3' : 'h4';
    if (t === 'a') {
      if (closing) { if (aStack.pop()) out.push('</a>'); continue; }
      const href = attr(attrs, 'href');
      const mapped = href ? mapLink(decode(href)) : null;
      aStack.push(!!mapped);
      if (mapped) out.push(mapped.ext ? `<a href="${esc(mapped.href)}" target="_blank" rel="noopener nofollow">` : `<a href="${esc(mapped.href)}">`);
      continue;
    }
    if (t === 'img') {
      let src = attr(attrs, 'src');
      if (!src || src.startsWith('data:')) continue;
      src = decode(src);
      if (src.startsWith('/')) src = 'https://amerika.by' + src;
      const alt = decode(attr(attrs, 'alt') || '');
      const w = attr(attrs, 'width'), h = attr(attrs, 'height');
      out.push(`<img src="${esc(src)}" alt="${esc(alt)}"${w && /^\d+$/.test(w) ? ` width="${w}"` : ''}${h && /^\d+$/.test(h) ? ` height="${h}"` : ''} loading="lazy" decoding="async">`);
      continue;
    }
    if (t === 'table') { out.push(closing ? '</table></div>' : '<div class="table-wrap"><table>'); continue; }
    if (VOID.has(t)) { if (!closing) out.push(`<${t}>`); continue; }
    if (closing) { out.push(`</${t}>`); continue; }
    if (t === 'td' || t === 'th') {
      const cs = attr(attrs, 'colspan'), rs = attr(attrs, 'rowspan');
      out.push(`<${t}${cs && /^\d+$/.test(cs) ? ` colspan="${cs}"` : ''}${rs && /^\d+$/.test(rs) ? ` rowspan="${rs}"` : ''}>`);
      continue;
    }
    out.push(`<${t}>`);
  }
  let s = out.join('');
  // Пустые абзацы и элементы, лишние переносы
  for (let k = 0; k < 3; k++) s = s.replace(/<(p|li|strong|em|h[234]|blockquote|figure|figcaption)>(\s|&nbsp;|&#160;|<br>)*<\/\1>/g, '');
  s = s.replace(/<p>\s*(<br>\s*)+/g, '<p>').replace(/(<br>\s*)+<\/p>/g, '</p>');
  s = s.replace(/<strong>\s*<\/strong>/g, '').replace(/\n{2,}/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
  return s;
}
