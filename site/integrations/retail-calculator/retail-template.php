<?php
/* Template Name: Розничный калькулятор Amerika */
if (!defined('ABSPATH')) exit;
$asset = get_template_directory_uri() . '/assets/retail-20261020/';
$simple = get_template_directory_uri() . '/assets/retail-simple-20261021/';
wp_enqueue_style('amz-retail', $asset.'retail.css', array(), '20261020.3');
wp_enqueue_style('amz-retail-simple', $simple.'preview.css', array('amz-retail'), '20261021.prod1');
wp_enqueue_script('amz-retail-rates', $asset.'rates.php', array(), null, true);
wp_enqueue_script('amz-retail', $simple.'retail-production.js', array('amz-retail-rates'), '20261021.prod2', true);
wp_enqueue_script('amz-retail-simple', $simple.'preview.js', array('amz-retail'), '20261021.prod3', true);
wp_enqueue_script('amz-retail-form', $simple.'form-transport.js', array('amz-retail-simple'), '20261021.prod1', true);
wp_add_inline_script('amz-retail-simple', 'window.SIMPLE_CALC_CONFIG='.wp_json_encode(array('ajax'=>admin_url('admin-ajax.php'))).';', 'before');
add_filter('script_loader_tag', function($tag,$handle) {
    if (strpos($handle, 'amz-retail')===0) $tag=str_replace('<script ', '<script data-nowprocket data-no-minify="1" ', $tag);
    return $tag;
}, 10, 2);
add_filter('style_loader_tag',function($tag,$handle) {
    return strpos($handle,'amz-retail')===0 ? str_replace('<link ', '<link data-no-minify="1" ', $tag) : $tag;
},10,2);
get_header();
include get_template_directory().'/assets/retail-simple-20261021/production-body.php';
get_footer();
