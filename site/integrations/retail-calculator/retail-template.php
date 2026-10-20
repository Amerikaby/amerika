<?php
/* Template Name: Розничный калькулятор Amerika */
if (!defined('ABSPATH')) exit;
$asset = get_template_directory_uri() . '/assets/retail-20261020/';
wp_enqueue_style('amz-retail', $asset.'retail.css', array(), '20261020.3');
wp_enqueue_script('amz-retail-rates', $asset.'rates.php', array(), null, true);
wp_enqueue_script('amz-retail', $asset.'retail.js', array('amz-retail-rates'), '20261020.1', true);
add_filter('script_loader_tag', function($tag,$handle) {
    if (strpos($handle, 'amz-retail')===0) $tag=str_replace('<script ', '<script data-nowprocket data-no-minify="1" ', $tag);
    return $tag;
}, 10, 2);
add_filter('style_loader_tag',function($tag,$handle) {
    return $handle==='amz-retail' ? str_replace('<link ', '<link data-no-minify="1" ', $tag) : $tag;
},10,2);
get_header();
include get_template_directory().'/assets/retail-20261020/retail-body.php';
get_footer();
