<?php
/*
Plugin Name: Amerika Retail Calculator Assets
Description: Keep the retail calculator's dynamic rates current and its scoped CSS independent.
*/
if (!defined('ABSPATH')) exit;
function amz_retail_asset_exclusions($files) {
    $files[]='.*retail-20261020/.*';
    $files[]='.*retail-simple-20261021/.*';
    return $files;
}
foreach(array('rocket_exclude_js','rocket_exclude_css','rocket_exclude_cache_busting','rocket_exclude_static_dynamic_resources') as $filter) {
    add_filter($filter,'amz_retail_asset_exclusions');
}
