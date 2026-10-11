<?php
/*
 * Прокси каталога к AuctionsAPI (Copart + IAAI).
 * Браузер обращается только сюда; ключ API хранится на сервере и наружу не уходит.
 *
 * Ключ: файл KEY_FILE (одна строка, вне public_html) или переменная окружения AUCTIONS_API_KEY.
 * Без ключа отвечает {"error":"no_key"}, и страница показывает примерные лоты.
 * Каждый запрос к API тратит лимит тарифа (демо = 100 запросов), поэтому:
 *   - ответы кэшируются в CACHE_DIR;
 *   - счётчик в BUDGET_FILE не даёт превысить BUDGET_LIMIT (сбросить = удалить файл);
 *   - при исчерпанном лимите отдаётся последний кэш, если он есть.
 */

$ROOT = dirname(__DIR__, 2); // /home/i/infoamvz/amerika.by (на уровень выше public_html)
define('KEY_FILE',     $ROOT . '/auctionsapi.key');
define('CACHE_DIR',    $ROOT . '/catalog-cache');
define('BUDGET_FILE',  CACHE_DIR . '/budget.json');
define('BUDGET_LIMIT', 90);     // демо-ключ: 100 запросов всего, 10 оставляем в запасе
define('PER_PAGE',     48);     // демо и Small: максимум 50
define('API_BASE',     'https://auctionsapi.com/api');

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

function out($code, $data) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_key() {
    $env = getenv('AUCTIONS_API_KEY');
    if ($env) return trim($env);
    if (is_readable(KEY_FILE)) return trim((string)file_get_contents(KEY_FILE));
    return '';
}

function int_param($name, $min, $max) {
    if (!isset($_GET[$name]) || $_GET[$name] === '') return null;
    if (!preg_match('/^\d{1,10}$/', (string)$_GET[$name])) out(400, ['error' => 'bad_param', 'param' => $name]);
    $v = (int)$_GET[$name];
    if ($v < $min || $v > $max) out(400, ['error' => 'bad_param', 'param' => $name]);
    return $v;
}

// Повреждения: API молча игнорирует неизвестный текст, поэтому пропускаем только этот список.
$DAMAGES = ['Front End', 'Rear End', 'Side', 'Hail', 'Minor Dent/Scratches', 'Mechanical', 'Normal Wear', 'Undercarriage', 'Water/Flood', 'Burn'];

$ep = isset($_GET['ep']) ? (string)$_GET['ep'] : '';
$query = [];
$ttl = 1800;

switch ($ep) {
    case 'cars':
        $path = '/cars';
        $query = [
            'country' => 'US',
            'vehicle_type' => 1,
            'per_page' => PER_PAGE,
            'sortDirection' => 'desc',
        ];
        foreach ([
            'page' => [1, 200], 'domain_id' => [1, 3], 'manufacturer_id' => [1, 999999], 'model_id' => [1, 9999999],
            'from_year' => [1980, 2030], 'to_year' => [1980, 2030], 'bid_price_to' => [1, 1000000],
            'buy_now_price_to' => [1, 1000000], 'odometer_to_mi' => [1, 1000000], 'next_hours_auction' => [1, 168],
            'body_type' => [1, 100], 'fuel_type' => [1, 7],
        ] as $name => $range) {
            $v = int_param($name, $range[0], $range[1]);
            if ($v !== null) $query[$name] = $v;
        }
        if (isset($query['domain_id']) && !in_array($query['domain_id'], [1, 3], true)) out(400, ['error' => 'bad_param', 'param' => 'domain_id']);
        if (!empty($_GET['buy_now'])) $query['buy_now'] = 1;
        if (isset($_GET['condition']) && $_GET['condition'] === '0') $query['condition'] = 0; // 0 = run and drives
        if (!empty($_GET['damage'])) {
            if (!in_array($_GET['damage'], $DAMAGES, true)) out(400, ['error' => 'bad_param', 'param' => 'damage']);
            $query['damage'] = $_GET['damage'];
        }
        break;
    case 'manufacturers':
        $path = '/manufacturers/cars';
        $ttl = 86400;
        break;
    case 'models':
        $id = int_param('manufacturer_id', 1, 999999);
        if ($id === null) out(400, ['error' => 'bad_param', 'param' => 'manufacturer_id']);
        $path = '/models/' . $id . '/cars';
        $ttl = 86400;
        break;
    case 'vin':
        $vin = strtoupper(isset($_GET['vin']) ? (string)$_GET['vin'] : '');
        if (!preg_match('/^[A-HJ-NPR-Z0-9]{17}$/', $vin)) out(400, ['error' => 'bad_param', 'param' => 'vin']);
        $path = '/search-vin/' . $vin;
        $query = ['prices_history' => 1];
        $ttl = 6 * 3600;
        break;
    case 'lot':
        $lot = strtoupper(isset($_GET['lot']) ? (string)$_GET['lot'] : '');
        $domain = isset($_GET['domain']) ? (string)$_GET['domain'] : '';
        if (!preg_match('/^\d{5,10}[A-Z]?$/', $lot)) out(400, ['error' => 'bad_param', 'param' => 'lot']);
        if (!in_array($domain, ['copart_com', 'iaai_com'], true)) out(400, ['error' => 'bad_param', 'param' => 'domain']);
        $path = '/search-lot/' . $lot . '/' . $domain;
        $query = ['prices_history' => 1];
        $ttl = 6 * 3600;
        break;
    case 'status':
        $b = is_readable(BUDGET_FILE) ? json_decode((string)file_get_contents(BUDGET_FILE), true) : null;
        out(200, ['has_key' => api_key() !== '', 'used' => (int)($b['used'] ?? 0), 'limit' => BUDGET_LIMIT]);
    default:
        out(400, ['error' => 'bad_endpoint']);
}

$key = api_key();
if ($key === '') out(503, ['error' => 'no_key']);

if (!is_dir(CACHE_DIR)) @mkdir(CACHE_DIR, 0750, true);
ksort($query);
$url = API_BASE . $path . ($query ? '?' . http_build_query($query) : '');
$cacheFile = CACHE_DIR . '/' . md5($url) . '.json';

if (is_readable($cacheFile) && filemtime($cacheFile) > time() - $ttl) {
    echo file_get_contents($cacheFile);
    exit;
}

// Счётчик запросов: увеличиваем до обращения к API, под блокировкой.
$fh = fopen(BUDGET_FILE, 'c+');
if (!$fh) out(500, ['error' => 'cache_dir']);
flock($fh, LOCK_EX);
$budget = json_decode((string)stream_get_contents($fh), true) ?: ['used' => 0];
if ($budget['used'] >= BUDGET_LIMIT) {
    flock($fh, LOCK_UN);
    fclose($fh);
    if (is_readable($cacheFile)) { echo file_get_contents($cacheFile); exit; }
    out(429, ['error' => 'budget']);
}
$budget['used']++;
$budget['last'] = gmdate('c');
ftruncate($fh, 0);
rewind($fh);
fwrite($fh, json_encode($budget));
fflush($fh);
flock($fh, LOCK_UN);
fclose($fh);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_TIMEOUT => 45,
    CURLOPT_HTTPHEADER => ['x-api-key: ' . $key, 'accept: application/json'],
]);
$body = curl_exec($ch);
$code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$json = is_string($body) ? json_decode($body, true) : null;
if ($code !== 200 || !is_array($json)) {
    if (is_readable($cacheFile)) { echo file_get_contents($cacheFile); exit; }
    $msg = is_array($json) ? (string)($json['error'] ?? $json['message'] ?? '') : '';
    out($code === 404 || $code === 423 ? 404 : 502, ['error' => 'upstream', 'status' => $code, 'message' => mb_substr($msg, 0, 200)]);
}

// Для списков отдаём только данные и номер следующей страницы.
$result = ['data' => $json['data'] ?? []];
if ($ep === 'cars') {
    $next = $json['links']['next'] ?? null;
    $result['next_page'] = $next ? (int)($query['page'] ?? 1) + 1 : null;
}
$encoded = json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
@file_put_contents($cacheFile, $encoded, LOCK_EX);
echo $encoded;
