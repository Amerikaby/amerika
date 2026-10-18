<?php
/** Standalone preview form; uses the existing WordPress mail transport and form 103 recipient. */
if (!defined('ABSPATH')) {
    $bootstrap = dirname(__DIR__, 2) . '/wp-load.php';
    if (!is_file($bootstrap)) { http_response_code(503); header('Content-Type: application/json'); echo '{"ok":false,"message":"Приём заявок временно недоступен."}'; exit; }
    require_once $bootstrap;
}

function amz_preview_validate($input) {
    if (!is_array($input)) return new WP_Error('invalid', 'Проверьте данные формы.');
    if (!empty($input['website'])) return new WP_Error('spam', 'Не удалось отправить заявку. Позвоните нам.');
    if (($input['agree'] ?? false) !== true) return new WP_Error('consent', 'Подтвердите согласие на обработку данных.');
    if (!is_string($input['phone'] ?? null)) return new WP_Error('phone', 'Укажите телефон с кодом страны.');
    $phone = preg_replace('/\D+/', '', $input['phone']);
    if (preg_match('/^(25|29|33|44)\d{7}$/', $phone)) $phone = '375' . $phone;
    if (preg_match('/^80(25|29|33|44)\d{7}$/', $phone)) $phone = '375' . substr($phone, 2);
    if (!preg_match('/^[1-9]\d{8,14}$/', $phone)) return new WP_Error('phone', 'Укажите телефон с кодом страны.');
    $clean = array('phone' => '+' . $phone, 'name' => '', 'car' => '', 'source' => '');
    foreach (array('name'=>120, 'car'=>4000, 'source'=>600, 'landing'=>600, 'referrer'=>600, 'utm_source'=>200, 'utm_medium'=>200, 'utm_campaign'=>200, 'utm_content'=>200, 'utm_term'=>200, 'gclid'=>200, 'yclid'=>200) as $key=>$limit) {
        $value = $input[$key] ?? '';
        if (!is_scalar($value)) return new WP_Error('invalid', 'Проверьте данные формы.');
        $value = sanitize_textarea_field((string)$value);
        if (strlen($value) > $limit * 4) return new WP_Error('length', 'Сократите текст заявки.');
        $clean[$key] = $value;
    }
    return $clean;
}

function amz_preview_deliver($data) {
    $mail = get_post_meta(103, '_mail', true);
    $recipient = is_array($mail) ? trim($mail['recipient'] ?? '') : '';
    if (!is_email($recipient)) return false;
    $lines = array('Заявка с новой версии amerika.by', 'Телефон: ' . $data['phone'], 'Имя: ' . ($data['name'] ?: 'Не указано'), '', 'Пожелания / расчёт:', $data['car'], '', 'Страница: ' . $data['source']);
    foreach (array('landing','referrer','utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','yclid') as $key) {
        if (!empty($data[$key])) $lines[] = $key . ': ' . $data[$key];
    }
    $lines[] = 'Согласие на обработку данных: подтверждено в форме.';
    return wp_mail($recipient, 'Amerika.by — заявка с нового сайта', implode("\n", $lines), array('Content-Type: text/plain; charset=UTF-8', 'From: Amerika.by <info@amerika.by>'));
}

// CLI tests can load the functions and intercept wp_mail without sending any message.
if (PHP_SAPI === 'cli') return;
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
function amz_preview_response($status, $body) { http_response_code($status); echo wp_json_encode($body, JSON_UNESCAPED_UNICODE); exit; }
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'GET') {
    $issued = (string)time(); $nonce = bin2hex(random_bytes(12));
    $token = $issued . '.' . $nonce;
    $token .= '.' . hash_hmac('sha256', $token, wp_salt('nonce'));
    amz_preview_response(200, array('ok'=>true, 'token'=>$token));
}
if ($method !== 'POST') amz_preview_response(405, array('ok'=>false, 'message'=>'Метод не поддерживается.'));
$origin = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$host = strtolower((string)parse_url($origin, PHP_URL_HOST));
if (!in_array($host, array('amerika.by','www.amerika.by'), true)) amz_preview_response(403, array('ok'=>false,'message'=>'Откройте форму на amerika.by.'));
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 24000) amz_preview_response(413, array('ok'=>false,'message'=>'Сократите текст заявки.'));
$raw = file_get_contents('php://input', false, null, 0, 24001);
if (strlen($raw) > 24000) amz_preview_response(413, array('ok'=>false,'message'=>'Сократите текст заявки.'));
$input = json_decode($raw, true);
$data = amz_preview_validate($input);
if (is_wp_error($data)) amz_preview_response(422, array('ok'=>false, 'message'=>$data->get_error_message()));
$token = is_string($input['token'] ?? null) ? explode('.', $input['token']) : array();
if (count($token) !== 3 || !ctype_digit($token[0]) || (int)$token[0] > time()+30 || time()-(int)$token[0]>1800 || !hash_equals(hash_hmac('sha256',$token[0].'.'.$token[1],wp_salt('nonce')),$token[2])) amz_preview_response(403,array('ok'=>false,'message'=>'Обновите страницу и повторите отправку.'));
$id = $input['requestId'] ?? '';
if (!is_string($id) || !preg_match('/^[a-f0-9-]{32,40}$/i',$id)) amz_preview_response(422,array('ok'=>false,'message'=>'Обновите страницу и повторите отправку.'));
$dedupe = 'amz_preview_done_' . hash_hmac('sha256',$id,wp_salt('auth'));
if (get_transient($dedupe)) amz_preview_response(200,array('ok'=>true,'message'=>'Заявка уже передана. Свяжемся с вами в рабочее время.'));
$rate_key = 'amz_preview_rate_' . hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', wp_salt('auth'));
$rate = get_transient($rate_key);
if (!is_array($rate) || $rate['until'] < time()) $rate=array('count'=>0,'until'=>time()+600);
if ($rate['count'] >= 5) amz_preview_response(429,array('ok'=>false,'message'=>'Слишком много заявок. Подождите несколько минут или позвоните нам.'));
$rate['count']++; set_transient($rate_key,$rate,max(1,$rate['until']-time()));
if (!amz_preview_deliver($data)) amz_preview_response(503,array('ok'=>false,'message'=>'Не удалось передать заявку. Позвоните +375 29 633-28-28 или напишите в Telegram.'));
set_transient($dedupe,1,600);
amz_preview_response(200,array('ok'=>true,'message'=>'Заявка передана в Amerika.by. Свяжемся с вами в рабочее время.'));
