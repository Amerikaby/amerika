<?php
// Public output contains only final retail sea prices. Wholesale source stays on the server.
$file = dirname(__DIR__, 2) . '/inc/calcopt/result_port.txt';
header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: public, max-age=300');
header('X-Content-Type-Options: nosniff');
$raw = is_readable($file) ? file_get_contents($file) : '';
$rows = json_decode('[' . str_replace('\\"', '"', trim($raw)) . ']', true);
if (!is_array($rows)) {
    http_response_code(503);
    echo 'throw new Error("Не удалось загрузить тарифы. Обновите страницу или свяжитесь с менеджером.");';
    exit;
}
$overrideFile = __DIR__ . '/delivery-sea-20261027.json';
$overrides = is_readable($overrideFile) ? json_decode(file_get_contents($overrideFile), true) : null;
if (!is_array($overrides)) { http_response_code(503); echo 'throw new Error("Тарифы доставки временно недоступны. Свяжитесь с менеджером.");'; exit; }
$rates = array('copart'=>array(), 'iaai'=>array());
foreach ($rows as $r) {
    $auction = strtolower($r['platform']);
    $yard = $r['auctionName'];
    if (!isset($rates[$auction]) || isset($rates[$auction][$yard])) continue;
    if (!is_numeric($r['standardAutoKlaipeda']) || !is_numeric($r['motoKlaipeda'])) continue;
    $rates[$auction][$yard] = array('car'=>(float)$r['standardAutoKlaipeda'] + 700, 'moto'=>(float)$r['motoKlaipeda'] + 700);
    $rate = isset($overrides[$auction][$yard]) ? $overrides[$auction][$yard] : null;
    $rates[$auction][$yard]['seaConfirmed'] = is_array($rate);
    if (is_array($rate)) {
        $rates[$auction][$yard]['car'] = $rate['car'];
        $rates[$auction][$yard]['carPoti'] = $rate['carPoti'];
    }
}
echo 'var RETAIL_RATES=' . json_encode($rates, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) . ';';
