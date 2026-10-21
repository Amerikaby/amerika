<?php
/**
 * Plugin Name: Amerika Unified NBRB Rates
 * Description: One dated, persistent USD/EUR pair for PHP and browser consumers.
 * Version: 1.0.0
 * Install as wp-content/mu-plugins/amz-nbrb-rates.php. No seeded exchange rates.
 */
defined('ABSPATH') || exit;

function amz_nbrb_day($timestamp = null) {
    return (new DateTimeImmutable('@' . ($timestamp ?? time())))
        ->setTimezone(new DateTimeZone('Europe/Minsk'))->format('Y-m-d');
}

function amz_nbrb_valid_date($date) {
    if (!is_string($date) || !preg_match('/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/D', $date, $m)) return false;
    return checkdate((int) $m[2], (int) $m[3], (int) $m[1]);
}

function amz_nbrb_positive($number) {
    return (is_int($number) || is_float($number) || is_string($number))
        && is_numeric($number) && is_finite((float) $number) && (float) $number > 0;
}

/** Accept both currencies together, with exactly the requested official date. */
function amz_nbrb_parse_pair($body, $date) {
    $rows = json_decode($body, true);
    if (!amz_nbrb_valid_date($date) || !is_array($rows) || !array_is_list($rows)) return null;
    $pair = array();
    foreach ($rows as $row) {
        if (!is_array($row)) return null;
        $currency = $row['Cur_Abbreviation'] ?? null;
        if (!in_array($currency, array('USD', 'EUR', 'RUB'), true)) continue;
        if (isset($pair[$currency]) || !isset($row['Date']) || !is_string($row['Date'])
            || !preg_match('/^' . preg_quote($date, '/') . '(?:T00:00:00)?$/D', $row['Date'])
            || !amz_nbrb_positive($row['Cur_Scale'] ?? null)
            || floor((float) $row['Cur_Scale']) !== (float) $row['Cur_Scale']
            || !amz_nbrb_positive($row['Cur_OfficialRate'] ?? null)) return null;
        $rate = (float) $row['Cur_OfficialRate'] / (float) $row['Cur_Scale'];
        if (!amz_nbrb_positive($rate)) return null;
        $pair[$currency] = $rate;
    }
    if (!isset($pair['USD'], $pair['EUR'])) return null;
    $pair['date'] = $date;
    return $pair;
}

function amz_nbrb_last_good($today) {
    $pair = get_option('amz_nbrb_last_good', null);
    if (!is_array($pair) || !amz_nbrb_positive($pair['USD'] ?? null)
        || !amz_nbrb_positive($pair['EUR'] ?? null)
        || !amz_nbrb_valid_date($pair['date'] ?? null) || $pair['date'] > $today
        || (array_key_exists('RUB', $pair) && !amz_nbrb_positive($pair['RUB']))) return null;
    return $pair;
}

/** Compare-and-delete: an expired owner must never release a newer owner's lock. */
function amz_nbrb_unlock($token) {
    global $wpdb;
    $deleted = $wpdb->query($wpdb->prepare(
        "DELETE FROM {$wpdb->options} WHERE option_name = %s AND option_value = %s",
        'amz_nbrb_refresh_lock', $token
    ));
    if ($deleted) {
        wp_cache_delete('amz_nbrb_refresh_lock', 'options');
        wp_cache_delete('notoptions', 'options');
    }
}

function amz_nbrb_lock($now) {
    $old = get_option('amz_nbrb_refresh_lock', null);
    if (is_string($old) && (int) $old < $now) amz_nbrb_unlock($old);
    $token = ($now + 60) . ':' . wp_generate_uuid4();
    return add_option('amz_nbrb_refresh_lock', $token, '', false) ? $token : null;
}

function amz_nbrb_due($pair, $now, $today) {
    $fetched = is_array($pair) ? (int) ($pair['fetched_at'] ?? 0) : 0;
    return !$pair || $pair['date'] !== $today || $fetched <= $now - 3600 || $fetched > $now + 30;
}

function amz_nbrb_retry_due($now, $today) {
    $attempt = get_option('amz_nbrb_last_attempt', array());
    return !is_array($attempt) || ($attempt['date'] ?? '') !== $today
        || (int) ($attempt['at'] ?? 0) <= $now - 300 || (int) ($attempt['at'] ?? 0) > $now + 30;
}

/** BYN per ONE unit of USD/EUR. Null pair means unavailable, never a guessed rate. */
function amz_nbrb_snapshot() {
    $now = time();
    $today = amz_nbrb_day($now);
    $pair = amz_nbrb_last_good($today);
    if (amz_nbrb_due($pair, $now, $today) && amz_nbrb_retry_due($now, $today)) {
        $token = amz_nbrb_lock($now);
        if ($token) {
            try {
                // Another worker may have completed between our first read and lock acquisition.
                $pair = amz_nbrb_last_good($today);
                if (amz_nbrb_due($pair, $now, $today) && amz_nbrb_retry_due($now, $today)) {
                    update_option('amz_nbrb_last_attempt', array('at' => $now, 'date' => $today), false);
                    $response = wp_remote_get('https://api.nbrb.by/exrates/rates?ondate=' . $today . '&periodicity=0', array(
                        'timeout' => 5, 'redirection' => 0, 'sslverify' => true,
                        'limit_response_size' => 262144, 'headers' => array('Accept' => 'application/json'),
                    ));
                    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                        $fresh = amz_nbrb_parse_pair(wp_remote_retrieve_body($response), $today);
                        if ($fresh) {
                            $fresh['fetched_at'] = $now;
                            // Never advertise a pair that failed to persist.
                            update_option('amz_nbrb_last_good', $fresh, false);
                            $pair = amz_nbrb_last_good($today);
                            amz_nbrb_maybe_purge();
                        }
                    }
                }
            } finally {
                amz_nbrb_unlock($token);
            }
        }
    }
    $snapshot = array('USD' => $pair ? (float) $pair['USD'] : null,
        'EUR' => $pair ? (float) $pair['EUR'] : null,
        'date' => $pair ? $pair['date'] : null,
        'stale' => amz_nbrb_due($pair, $now, $today), 'source' => 'НБРБ');
    if ($pair && isset($pair['RUB'])) $snapshot['RUB'] = (float) $pair['RUB'];
    return $snapshot;
}

/** Date or values changed: one purge, independent of hourly fetch timestamps. */
function amz_nbrb_maybe_purge() {
    if (!function_exists('rocket_clean_domain')) return;
    $pair = amz_nbrb_last_good(amz_nbrb_day());
    if (!$pair) return;
    $fingerprint = hash('sha256', wp_json_encode(array($pair['date'], (float) $pair['USD'], (float) $pair['EUR'], $pair['RUB'] ?? null)));
    if (get_option('amz_nbrb_rocket_fingerprint', '') === $fingerprint) return;
    if (update_option('amz_nbrb_rocket_fingerprint', $fingerprint, false)) rocket_clean_domain();
}

function amz_nbrb_usd() { return amz_nbrb_snapshot()['USD']; }
function amz_nbrb_eur() { return amz_nbrb_snapshot()['EUR']; }
foreach (array('pre_option_carprice_nbrb_usd_rate', 'pre_option_carprice_nbrb_rate_backup',
    'pre_transient_carprice_nbrb_rate_per1', 'pre_transient_carprice_nbrb_rate_USD') as $hook) {
    add_filter($hook, 'amz_nbrb_usd', PHP_INT_MAX);
}
add_filter('pre_transient_carprice_nbrb_rate_EUR', 'amz_nbrb_eur', PHP_INT_MAX);

function amz_nbrb_javascript($snapshot) {
    return 'window.AMZ_NBRB=' . wp_json_encode($snapshot, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT)
        . ';window.exchange={USD:window.AMZ_NBRB.USD,EUR:window.AMZ_NBRB.EUR,RUB:window.AMZ_NBRB.RUB};';
}

// MU plugins load after advanced-cache.php; also exclude amz_nbrb in the page-cache configuration.
if (isset($_GET['amz_nbrb']) && in_array($_GET['amz_nbrb'], array('js', 'json'), true)) {
    if (!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);
}
add_action('init', function () {
    $format = $_GET['amz_nbrb'] ?? null;
    if (!in_array($format, array('js', 'json'), true)) return;
    $snapshot = amz_nbrb_snapshot();
    nocache_headers();
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('X-Content-Type-Options: nosniff');
    header('Content-Type: ' . ($format === 'js' ? 'application/javascript' : 'application/json') . '; charset=UTF-8');
    echo $format === 'js' ? amz_nbrb_javascript($snapshot) : wp_json_encode($snapshot);
    exit;
}, -1000);

add_action('wp_head', function () {
    if (is_admin()) return;
    // Relative URL stays on the current origin, including www and preview hosts.
    $path = wp_parse_url(home_url('/'), PHP_URL_PATH) ?: '/';
    echo '<script id="amz-nbrb-rates" data-nowprocket nowprocket data-no-minify="1" src="'
        . esc_url($path . '?amz_nbrb=js') . '"></script>' . "\n";
}, 1);
add_action('init', 'amz_nbrb_maybe_purge', 20);

// WP-Cron runs with general site traffic (or the host's scheduled wp-cron.php).
// Register before the endpoint exits, so even a cached page's script request can schedule it.
function amz_nbrb_schedule() {
    if (!wp_next_scheduled('amz_nbrb_hourly_refresh')) {
        wp_schedule_event(time() + 60, 'hourly', 'amz_nbrb_hourly_refresh');
    }
}
add_action('init', 'amz_nbrb_schedule', -1100);
add_action('amz_nbrb_hourly_refresh', 'amz_nbrb_snapshot');

/** These two legacy bundles are embedded in post HTML, outside wp_enqueue_script. */
function amz_nbrb_legacy_script_url($src) {
    if (!is_string($src)) return $src;
    $base = rtrim(get_template_directory_uri(), '/') . '/js/';
    $path = preg_split('/[?#]/', $src, 2)[0];
    if (!in_array($path, array($base . 'calc-script.js', $base . 'calc-script-rozn.js'), true)) return $src;
    return add_query_arg('ver', '20261021.1', $src);
}

function amz_nbrb_version_legacy_scripts($content) {
    if (!is_string($content) || !class_exists('WP_HTML_Tag_Processor')) return $content;
    $html = new WP_HTML_Tag_Processor($content);
    while ($html->next_tag('SCRIPT')) {
        $src = $html->get_attribute('src');
        $versioned = amz_nbrb_legacy_script_url($src);
        if ($versioned !== $src) $html->set_attribute('src', $versioned);
    }
    return $html->get_updated_html();
}
add_filter('the_content', 'amz_nbrb_version_legacy_scripts', 1);

function amz_nbrb_rocket_exclusions($files) {
    $files[] = 'amz_nbrb';
    $files[] = 'AMZ_NBRB';
    return $files;
}
foreach (array('rocket_exclude_js', 'rocket_exclude_defer_js', 'rocket_delay_js_exclusions',
    'rocket_excluded_inline_js_content', 'rocket_defer_inline_exclusions',
    'rocket_exclude_cache_busting', 'rocket_exclude_static_dynamic_resources') as $hook) {
    add_filter($hook, 'amz_nbrb_rocket_exclusions');
}
add_filter('rocket_cache_reject_uri', function ($uris) {
    $uris[] = '/.*[?&]amz_nbrb=(js|json)(&.*)?$';
    return $uris;
});
