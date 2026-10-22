<?php
// Link-only review version. Production /kalkulyator/ is untouched.
define('DONOTCACHEPAGE',true);
require dirname(__DIR__,2).'/wp-load.php';
header('X-Robots-Tag: noindex, nofollow');
nocache_headers();
global $wp_query,$post;
$wp_query=new WP_Query(array('page_id'=>17911));
$post=get_post(17911);
setup_postdata($post);
add_filter('wpseo_robots',function(){return 'noindex, nofollow';},999);
add_filter('wp_robots',function($r){unset($r['index'],$r['follow']);$r['noindex']=true;$r['nofollow']=true;return $r;},999);
add_filter('wpseo_canonical',function(){return home_url('/kalkulyator/');},999);
foreach(array('wpseo_title','wpseo_opengraph_title','wpseo_twitter_title') as $filter)add_filter($filter,function(){return 'Калькулятор авто — новая тестовая версия | AMERIKA.BY';},999);
add_filter('pre_get_document_title',function(){return 'Калькулятор авто — новая тестовая версия | AMERIKA.BY';},999);
$asset=home_url('/newcodex/kalkulyator-simple/');
$base=get_template_directory_uri().'/assets/retail-20261020/';
wp_enqueue_style('amz-retail',$base.'retail.css',array(),'20261020.3');
wp_enqueue_style('amz-retail-simple',$asset.'preview.css',array('amz-retail'),'20261022.notice1');
wp_enqueue_script('amz-retail-rates',$base.'rates.php',array(),null,true);
wp_enqueue_script('amz-retail',$asset.'retail.js',array('amz-retail-rates'),'20261021.simple2',true);
wp_enqueue_script('amz-retail-simple',$asset.'preview.js',array('amz-retail'),'20261021.5',true);
wp_add_inline_script('amz-retail-simple','window.SIMPLE_CALC_CONFIG='.wp_json_encode(array('ajax'=>admin_url('admin-ajax.php'))).';','before');
add_filter('script_loader_tag',function($tag,$handle){return strpos($handle,'amz-retail')===0?str_replace('<script ','<script data-nowprocket data-no-minify="1" ',$tag):$tag;},10,2);
add_filter('style_loader_tag',function($tag,$handle){return strpos($handle,'amz-retail')===0?str_replace('<link ','<link data-no-minify="1" ',$tag):$tag;},10,2);
get_header();
include __DIR__.'/preview-body.php';
get_footer();
