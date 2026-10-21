<?php
/** Isolated WP doubles. No network, production options, emails or deployment. */
define('ABSPATH', __DIR__);
$endpoint = $argv[1] ?? '';
if (in_array($endpoint, array('js', 'json'), true)) $_GET['amz_nbrb'] = $endpoint;
$options = array(); $hooks = array(); $calls = 0; $purges = 0; $response = null; $checks = 0;
function add_filter($hook, $callback, $priority = 10, $accepted = 1) { $GLOBALS['hooks'][$hook][$priority][] = $callback; }
function add_action($hook, $callback, $priority = 10, $accepted = 1) { add_filter($hook, $callback, $priority, $accepted); }
function apply_filters($hook, $value) {
    $callbacks = $GLOBALS['hooks'][$hook] ?? array(); ksort($callbacks);
    foreach ($callbacks as $group) foreach ($group as $callback) $value = $callback($value);
    return $value;
}
function get_option($key, $default = false) {
    $pre = apply_filters('pre_option_' . $key, false);
    return $pre !== false ? $pre : ($GLOBALS['options'][$key] ?? $default);
}
function get_transient($key) { return apply_filters('pre_transient_' . $key, false); }
function add_option($key, $value, $unused = '', $autoload = null) {
    if (array_key_exists($key, $GLOBALS['options'])) return false;
    $GLOBALS['options'][$key] = $value; return true;
}
function update_option($key, $value, $autoload = null) {
    if (($GLOBALS['options'][$key] ?? null) === $value) return false;
    $GLOBALS['options'][$key] = $value; return true;
}
function wp_cache_delete($key, $group = '') {}
function wp_generate_uuid4() { return bin2hex(random_bytes(16)); }
class FakeWpdb {
    public $options = 'wp_options';
    function prepare($sql, ...$args) { return $args; }
    function query($args) {
        list($key, $token) = $args;
        if (($GLOBALS['options'][$key] ?? null) !== $token) return 0;
        unset($GLOBALS['options'][$key]); return 1;
    }
}
$wpdb = new FakeWpdb();
function wp_remote_get($url, $args) {
    $GLOBALS['calls']++; $GLOBALS['request'] = array($url, $args);
    return $GLOBALS['response'];
}
class WP_Error {}
function is_wp_error($response) { return $response instanceof WP_Error; }
function wp_remote_retrieve_response_code($response) { return $response['status']; }
function wp_remote_retrieve_body($response) { return $response['body']; }
function wp_json_encode($value, $flags = 0) { return json_encode($value, $flags); }
function rocket_clean_domain() { $GLOBALS['purges']++; }
function is_admin() { return false; }
function home_url($path) { return 'https://amerika.by' . $path; }
function wp_parse_url($url, $component) { return parse_url($url, $component); }
function esc_url($url) { return htmlspecialchars($url, ENT_QUOTES); }
function get_template_directory_uri() { return 'https://amerika.by/wp-content/themes/amerika'; }
function add_query_arg($key, $value, $url) {
    $fragment = ''; $hash = strpos($url, '#');
    if ($hash !== false) { $fragment = substr($url, $hash); $url = substr($url, 0, $hash); }
    $parts = explode('?', $url, 2); $query = array(); parse_str($parts[1] ?? '', $query);
    $query[$key] = $value;
    return $parts[0] . '?' . http_build_query($query) . $fragment;
}
function nocache_headers() {}
function wp_next_scheduled($hook) { return $GLOBALS['scheduled'][$hook]['at'] ?? false; }
function wp_schedule_event($at, $recurrence, $hook) {
    $GLOBALS['schedule_calls'] = ($GLOBALS['schedule_calls'] ?? 0) + 1;
    $GLOBALS['scheduled'][$hook] = array('at' => $at, 'recurrence' => $recurrence);
    return true;
}
require __DIR__ . '/../integrations/nbrb-rates/amz-nbrb-rates.php';
if (in_array($endpoint, array('js', 'json'), true)) {
    $options['amz_nbrb_last_good'] = array('USD' => 2.9883, 'EUR' => 3.3514, 'RUB' => 0.035,
        'date' => amz_nbrb_day(), 'fetched_at' => time());
    foreach ($hooks['init'][-1000] as $callback) $callback();
    throw new RuntimeException('Endpoint did not exit');
}

function check($condition, $label) {
    $GLOBALS['checks']++;
    if (!$condition) throw new RuntimeException('FAIL: ' . $label);
}
function rows($date) {
    return array(
        array('Cur_Abbreviation' => 'USD', 'Date' => $date . 'T00:00:00', 'Cur_Scale' => 100, 'Cur_OfficialRate' => 298.83),
        array('Cur_Abbreviation' => 'EUR', 'Date' => $date . 'T00:00:00', 'Cur_Scale' => 1, 'Cur_OfficialRate' => 3.3514),
    );
}
function api($rows, $status = 200) { $GLOBALS['response'] = array('status' => $status, 'body' => json_encode($rows)); }
function reset_state() { $GLOBALS['options'] = array(); $GLOBALS['calls'] = 0; $GLOBALS['purges'] = 0; }
function expire_pair() {
    $GLOBALS['options']['amz_nbrb_last_good']['fetched_at'] = time() - 3601;
    unset($GLOBALS['options']['amz_nbrb_last_attempt']);
}
$today = amz_nbrb_day();
$yesterday = (new DateTimeImmutable($today))->modify('-1 day')->format('Y-m-d');
check(amz_nbrb_day(strtotime('2026-10-21T20:59:59Z')) === '2026-10-21', 'Minsk before midnight');
check(amz_nbrb_day(strtotime('2026-10-21T21:00:00Z')) === '2026-10-22', 'Minsk date changes at UTC21');
check(!amz_nbrb_valid_date('2026-02-30'), 'real calendar date');

$parsed = amz_nbrb_parse_pair(json_encode(rows($today)), $today);
check(abs($parsed['USD'] - 2.9883) < 1e-12, 'normalize official Cur_Scale');
check($parsed['EUR'] === 3.3514, 'EUR per one');
$rubRows = rows($today);
$rubRows[] = array('Cur_Abbreviation' => 'RUB', 'Date' => $today . 'T00:00:00', 'Cur_Scale' => 100, 'Cur_OfficialRate' => 3.5);
$withRub = amz_nbrb_parse_pair(json_encode($rubRows), $today);
check(abs($withRub['RUB'] - 0.035) < 1e-12, 'RUB normalized per ONE ruble');
$badRub = $rubRows; $badRub[2]['Cur_Scale'] = 0;
check(amz_nbrb_parse_pair(json_encode($badRub), $today) === null, 'invalid optional RUB rejects mixed snapshot');
$invalid = array();
$r = rows($today); $r[1]['Date'] = $yesterday . 'T00:00:00'; $invalid[] = $r;
$r = rows($today); unset($r[1]); $invalid[] = $r;
$r = rows($today); $r[] = $r[0]; $invalid[] = $r;
$r = rows($today); $r[1]['Cur_Abbreviation'] = 'RUB'; $invalid[] = $r;
foreach (array(0, -1, 'NaN', '1e999', null, true, array()) as $value) {
    $r = rows($today); $r[0]['Cur_OfficialRate'] = $value; $invalid[] = $r;
    $r = rows($today); $r[0]['Cur_Scale'] = $value; $invalid[] = $r;
}
$r = rows($today); $r[0]['Cur_Scale'] = 1.5; $invalid[] = $r;
foreach ($invalid as $i => $r) check(amz_nbrb_parse_pair(json_encode($r), $today) === null, 'reject malformed pair ' . $i);
check(amz_nbrb_parse_pair('{broken', $today) === null, 'invalid JSON');
check(amz_nbrb_parse_pair('{}', $today) === null, 'not a currency list');

reset_state(); api(rows($today));
$s = amz_nbrb_snapshot();
check(abs($s['USD'] - 2.9883) < 1e-12 && $s['EUR'] === 3.3514 && !$s['stale'] && $s['date'] === $today, 'fetch pair');
check($calls === 1 && $purges === 1, 'one fetch and purge');
check($request[0] === 'https://api.nbrb.by/exrates/rates?ondate=' . $today . '&periodicity=0', 'official daily API requested for Minsk date');
check($request[1]['timeout'] === 5 && $request[1]['redirection'] === 0 && $request[1]['sslverify'], 'bounded verified request');
check(!isset($options['amz_nbrb_refresh_lock']), 'lock released');
for ($i = 0; $i < 10; $i++) check(amz_nbrb_snapshot() === $s, 'all consumers share pair');
check($calls === 1 && $purges === 1, 'no refetch or repurge');
expire_pair(); api($rubRows); $rubSnapshot = amz_nbrb_snapshot();
check(abs($rubSnapshot['RUB'] - 0.035) < 1e-12, 'RUB exposed from stored snapshot');
// Restart the remaining cases with the required pair only.
reset_state(); api(rows($today)); $s = amz_nbrb_snapshot();
foreach (array('carprice_nbrb_rate_per1', 'carprice_nbrb_rate_USD') as $key) check(get_transient($key) === $s['USD'], 'legacy USD transient ' . $key);
check(get_transient('carprice_nbrb_rate_EUR') === $s['EUR'], 'legacy EUR transient');
check(get_option('carprice_nbrb_usd_rate') === $s['USD'], 'legacy schema option');
check(get_option('carprice_nbrb_rate_backup') === $s['USD'], 'legacy backup option');

expire_pair(); amz_nbrb_snapshot();
check($calls === 2 && $purges === 1, 'hourly refresh without duplicate purge');
$r = rows($today); $r[1]['Cur_OfficialRate'] = 3.4;
expire_pair(); api($r); $s = amz_nbrb_snapshot();
check($s['EUR'] === 3.4 && $purges === 2, 'value change clears Rocket once');
amz_nbrb_maybe_purge(); check($purges === 2, 'init does not repeat purge');

$options['amz_nbrb_last_good']['date'] = $yesterday;
$options['amz_nbrb_last_good']['fetched_at'] = time();
$options['amz_nbrb_last_attempt'] = array('at' => time(), 'date' => $yesterday);
amz_nbrb_maybe_purge(); $oldPurges = $purges;
api($r); $before = $calls; $s = amz_nbrb_snapshot();
check($calls === $before + 1 && $s['date'] === $today, 'date changes bypass hourly and old-date retry windows');
check($purges === $oldPurges + 1, 'date alone changes purge fingerprint');

foreach (array(new WP_Error(), array('status' => 500, 'body' => 'bad'), array('status' => 200, 'body' => '{bad'),
    array('status' => 200, 'body' => json_encode(rows($yesterday)))) as $failure) {
    expire_pair(); $options['amz_nbrb_last_good']['date'] = $yesterday;
    $old = $options['amz_nbrb_last_good']; $response = $failure; $before = $calls;
    $s = amz_nbrb_snapshot();
    check($s['stale'] && $s['date'] === $yesterday && $s['USD'] === $old['USD'] && $s['EUR'] === $old['EUR'], 'failure keeps complete dated last-good pair');
    amz_nbrb_snapshot(); check($calls === $before + 1, 'retry suppression');
}
$options['amz_nbrb_last_attempt']['at'] = time() - 301; api(rows($today));
$s = amz_nbrb_snapshot(); check(!$s['stale'] && $s['date'] === $today, 'retry recovers after five minutes');

expire_pair(); $options['amz_nbrb_refresh_lock'] = (time() + 60) . ':other'; $before = $calls;
amz_nbrb_snapshot(); check($calls === $before, 'parallel worker does not fetch');
amz_nbrb_unlock((time() - 1) . ':old'); check(isset($options['amz_nbrb_refresh_lock']), 'old owner cannot release new lock');
$options['amz_nbrb_refresh_lock'] = (time() - 1) . ':expired';
amz_nbrb_snapshot(); check($calls === $before + 1 && !isset($options['amz_nbrb_refresh_lock']), 'expired lock recovered');

reset_state(); $response = new WP_Error();
$s = amz_nbrb_snapshot();
check($s === array('USD' => null, 'EUR' => null, 'date' => null, 'stale' => true, 'source' => 'НБРБ'), 'no invented cold-start rates');
check(get_option('carprice_nbrb_usd_rate') === null && get_transient('carprice_nbrb_rate_per1') === null, 'null safely short-circuits old stored values');
check($calls === 1 && $purges === 0, 'cold failure is bounded');
check(str_contains(amz_nbrb_javascript($s), 'window.AMZ_NBRB=') && str_contains(amz_nbrb_javascript($s), 'window.exchange='), 'both browser interfaces');
ob_start(); foreach ($hooks['wp_head'][1] as $callback) $callback(); $html = ob_get_clean();
check(str_contains($html, 'src="/?amz_nbrb=js"') && !str_contains($html, 'defer') && !str_contains($html, 'async'), 'synchronous same-origin script');
check(str_contains($html, 'nowprocket') && str_contains($html, 'data-no-minify'), 'Rocket script attributes');
foreach (array('rocket_exclude_js', 'rocket_exclude_defer_js', 'rocket_delay_js_exclusions') as $hook) {
    check(in_array('amz_nbrb', apply_filters($hook, array()), true), 'Rocket exclusion ' . $hook);
}
check(isset($hooks['init'][-1000]), 'early public endpoint');
check(isset($hooks['init'][-1100]), 'cron registration precedes endpoint');
amz_nbrb_schedule(); amz_nbrb_schedule();
check($GLOBALS['schedule_calls'] === 1 && $GLOBALS['scheduled']['amz_nbrb_hourly_refresh']['recurrence'] === 'hourly', 'hourly cron scheduled once');
reset_state(); api(rows($today));
foreach ($hooks['amz_nbrb_hourly_refresh'][10] as $callback) $callback();
check($calls === 1 && $options['amz_nbrb_last_good']['date'] === $today, 'cron refresh uses same provider and storage');
$theme = get_template_directory_uri() . '/js/';
foreach (array('calc-script.js', 'calc-script-rozn.js') as $script) {
    check(amz_nbrb_legacy_script_url($theme . $script) === $theme . $script . '?ver=20261021.1', 'version own legacy script ' . $script);
    check(amz_nbrb_legacy_script_url($theme . $script . '?ver=old&language=ru#anchor') === $theme . $script . '?ver=20261021.1&language=ru#anchor', 'replace old version preserving query and fragment');
    check(amz_nbrb_legacy_script_url($theme . $script . '?ver=20261021.1') === $theme . $script . '?ver=20261021.1', 'idempotent script version');
}
foreach (array(null, true, '', '/wp-content/themes/amerika/js/calc-script.js',
    'https://external.example/wp-content/themes/amerika/js/calc-script.js', $theme . 'other.js',
    $theme . 'calc-script.js.map', $theme . 'subdirectory/calc-script.js') as $other) {
    check(amz_nbrb_legacy_script_url($other) === $other, 'only exact own theme URL');
}
check(isset($hooks['the_content'][1]), 'post source version before Rocket output processing');
check(amz_nbrb_version_legacy_scripts('<p>unchanged without WP HTML API</p>') === '<p>unchanged without WP HTML API</p>', 'graceful HTML API guard');
// Execute real endpoint callbacks in child PHP processes; no web server/network.
foreach (array('js', 'json') as $format) {
    $pipes = array();
    $process = proc_open(array(PHP_BINARY, __FILE__, $format), array(1 => array('pipe', 'w'), 2 => array('pipe', 'w')), $pipes);
    $output = stream_get_contents($pipes[1]); $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    check(proc_close($process) === 0 && $stderr === '', 'endpoint clean exit ' . $format);
    if ($format === 'js') {
        check(str_starts_with($output, 'window.AMZ_NBRB=') && str_contains($output, ';window.exchange='), 'endpoint JS bindings');
        $output = explode(';window.exchange=', substr($output, strlen('window.AMZ_NBRB=')))[0];
    }
    $data = json_decode($output, true);
    check($data['date'] === $today && $data['USD'] === 2.9883 && $data['EUR'] === 3.3514 && $data['RUB'] === 0.035
        && $data['stale'] === false, 'endpoint full snapshot ' . $format);
}
echo 'PASS: ' . $checks . " checks: pair/date/scale validation, hourly+midnight refresh, stale fallback, retry+locks, legacy hooks, Rocket purge, synchronous JS.\n";
