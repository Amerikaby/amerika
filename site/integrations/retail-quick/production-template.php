<?php
/* Template Name: Розничный калькулятор Amerika */
if (!defined('ABSPATH')) exit;
$amz_dual_asset = get_template_directory_uri() . '/assets/retail-dual-size-20261029/';
$amz_dual_base = get_template_directory_uri() . '/assets/retail-20261020/';
wp_enqueue_style('amz-retail', $amz_dual_base.'retail.css', array(), '20261020.3');
wp_enqueue_style('amz-retail-simple', $amz_dual_asset.'detailed.css', array('amz-retail'), '20261029.size1');
wp_enqueue_style('amz-retail-quick', $amz_dual_asset.'quick.css', array('amz-retail-simple'), '20261029.size1');
wp_enqueue_script('amz-retail-rates', $amz_dual_base.'rates.php', array(), null, true);
wp_enqueue_script('amz-retail-size-rates', $amz_dual_asset.'size-rates.js', array('amz-retail-rates'), '20261029.size1', true);
wp_enqueue_script('amz-retail-size-core', $amz_dual_asset.'size-core.js', array('amz-retail-size-rates'), '20261029.size1', true);
wp_enqueue_script('amz-retail-quick-core', $amz_dual_asset.'quick-core.js', array('amz-retail-size-core'), '20261029.size1', true);
wp_add_inline_script('amz-retail-quick-core','window.AMZ_QUICK_POLICY={clearanceAll:false};','before');
wp_enqueue_script('amz-retail-route-policy', $amz_dual_asset.'route-policy.js', array('amz-retail-quick-core'), '20261029.size1', true);
wp_enqueue_script('amz-retail', $amz_dual_asset.'production-core.js', array('amz-retail-route-policy'), '20261029.size1', true);
wp_enqueue_script('amz-retail-simple', $amz_dual_asset.'detailed.js', array('amz-retail'), '20261029.size1', true);
wp_add_inline_script('amz-retail-simple','window.SIMPLE_CALC_CONFIG='.wp_json_encode(array('ajax'=>admin_url('admin-ajax.php'))).';','before');
wp_enqueue_script('amz-retail-quick-ui', $amz_dual_asset.'quick.js', array('amz-retail-simple'), '20261029.size1', true);
wp_enqueue_script('amz-retail-form', $amz_dual_asset.'form-transport.js', array('amz-retail-quick-ui'), '20261021.prod1', true);
add_filter('script_loader_tag', function($tag,$handle){return strpos($handle,'amz-retail')===0?str_replace('<script ','<script data-nowprocket data-no-minify="1" ',$tag):$tag;},10,2);
add_filter('style_loader_tag', function($tag,$handle){return strpos($handle,'amz-retail')===0?str_replace('<link ','<link data-no-minify="1" ',$tag):$tag;},10,2);
get_header();
include get_template_directory().'/assets/retail-dual-size-20261029/production-body.php';
get_footer();
