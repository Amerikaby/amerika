<?php
// Isolated preview. No production templates, menus or lead endpoints are changed.
define('DONOTCACHEPAGE', true);
require dirname(__DIR__, 2) . '/wp-load.php';
header('X-Robots-Tag: noindex, nofollow');
nocache_headers();
global $wp_query, $post;
$wp_query = new WP_Query(array('page_id'=>17911));
$post = get_post(17911);
setup_postdata($post);
add_filter('wpseo_robots', function(){ return 'noindex, nofollow'; }, 999);
add_filter('wp_robots', function($r){ unset($r['index'],$r['follow']); $r['noindex']=true; $r['nofollow']=true; return $r; }, 999);
add_filter('wpseo_canonical', function(){ return home_url('/kalkulyator/'); }, 999);
// Header/footer also contain CF7 shortcodes: suppress them on this preview only.
add_filter('do_shortcode_tag', function($output,$tag){
    if (in_array($tag,array('contact-form-7','contact-form'),true)) {
        return '<div class="amz-preview-contact"><p>Это тестовая страница. Формы здесь не отправляются.</p><p>Для связи с менеджером: <a href="tel:+375296332828">+375 (29) 633-28-28</a> · <a href="https://t.me/+375296332828">Telegram</a></p></div>';
    }
    return $output;
},10,2);
foreach (array('wpseo_title','wpseo_opengraph_title','wpseo_twitter_title','pre_get_document_title') as $filter) {
    add_filter($filter, function(){ return 'Быстрый и подробный расчёт авто — тест | AMERIKA.BY'; }, 999);
}
$amz_quick_asset = home_url('/newcodex/kalkulyator-quick/');
$amz_quick_base = get_template_directory_uri() . '/assets/retail-20261020/';
wp_enqueue_style('amz-retail', $amz_quick_base.'retail.css', array(), '20261020.3');
wp_enqueue_style('amz-retail-simple', $amz_quick_asset.'detailed.css', array('amz-retail'), '20261029.size1');
wp_enqueue_style('amz-retail-quick', $amz_quick_asset.'quick.css', array('amz-retail-simple'), '20261029.size1');
wp_enqueue_script('amz-retail-rates', $amz_quick_base.'rates.php', array(), null, true);
wp_enqueue_script('amz-retail-size-rates', $amz_quick_asset.'size-rates.js', array('amz-retail-rates'), '20261029.size1', true);
wp_enqueue_script('amz-retail-size-core', $amz_quick_asset.'size-core.js', array('amz-retail-size-rates'), '20261029.size1', true);
wp_enqueue_script('amz-retail-quick-core', $amz_quick_asset.'quick-core.js', array('amz-retail-size-core'), '20261029.size1', true);
wp_add_inline_script('amz-retail-quick-core','window.AMZ_QUICK_POLICY={clearanceAll:false};','before');
wp_enqueue_script('amz-retail-route-policy', $amz_quick_asset.'route-policy.js', array('amz-retail-quick-core'), '20261029.size1', true);
wp_enqueue_script('amz-retail', $amz_quick_asset.'retail-core.js', array('amz-retail-route-policy'), '20261029.size1', true);
wp_enqueue_script('amz-retail-simple', $amz_quick_asset.'detailed.js', array('amz-retail'), '20261029.size1', true);
wp_add_inline_script('amz-retail-simple','window.SIMPLE_CALC_CONFIG='.wp_json_encode(array('ajax'=>admin_url('admin-ajax.php'))).';','before');
wp_enqueue_script('amz-retail-quick-ui', $amz_quick_asset.'quick.js', array('amz-retail-simple'), '20261029.size1', true);
add_filter('script_loader_tag', function($tag,$handle){ return strpos($handle,'amz-retail')===0 ? str_replace('<script ','<script data-nowprocket data-no-minify="1" ',$tag) : $tag; },10,2);
add_filter('style_loader_tag', function($tag,$handle){ return strpos($handle,'amz-retail')===0 ? str_replace('<link ','<link data-no-minify="1" ',$tag) : $tag; },10,2);
get_header();
include __DIR__.'/body.php';
get_footer();
