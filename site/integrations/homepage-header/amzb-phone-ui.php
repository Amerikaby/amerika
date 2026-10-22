<?php
/**
 * Plugin Name: AMZB Phone UI
 * Description: Open phone numbers, compact navigation and mobile call link.
 * Version: 2.1.0
 */
defined('ABSPATH') || exit;
add_action('wp_enqueue_scripts', function () {
    $base = get_template_directory_uri() . '/assets/header-20261020/';
    wp_enqueue_style('amzh-smart-header', $base . 'header.css', array(), '20261020.2');
    wp_enqueue_script('amzh-smart-header', $base . 'header.js', array(), '20261020.2', true);
}, 100);
// Keep the small navigation script available immediately.
foreach (array('rocket_exclude_js', 'rocket_exclude_css', 'rocket_exclude_cache_busting', 'rocket_exclude_static_dynamic_resources') as $filter) {
    add_filter($filter, function ($excluded) {
        $excluded[] = '.*header-20261020/.*';
        return $excluded;
    });
}
add_filter('script_loader_tag', function ($tag, $handle) {
    return $handle === 'amzh-smart-header' ? str_replace('<script ', '<script data-nowprocket data-no-minify="1" ', $tag) : $tag;
}, 10, 2);
add_action('wp_head', function () {
    if (is_admin()) { return; }
    ?>
<style id="amzb-phone-ui-css">
.amzb-floating-phone{display:none}
.amzb-floating-phone[hidden]{display:none!important}
@media(max-width:1024px){
 .amzb-floating-phone{display:flex;position:fixed;z-index:9991;top:max(8px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);align-items:center;justify-content:center;gap:8px;min-height:40px;padding:8px 16px;border:1px solid rgba(23,42,65,.12);border-radius:24px;background:rgba(248,246,240,.84);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#172a41;font:700 13px/1.3 system-ui,sans-serif;white-space:nowrap;text-decoration:none;box-shadow:0 3px 14px rgba(23,42,65,.08)}
 .amzb-floating-phone svg{width:15px;height:15px;flex:none}
 .amzb-floating-phone:focus-visible{outline:2px solid #d20b34;outline-offset:3px}
 body.admin-bar .amzb-floating-phone{top:54px}
}
</style>
    <?php
}, 100);
add_action('wp_body_open', function () {
    if (is_admin()) { return; }
    ?>
<a class="amzb-floating-phone" href="tel:+375296332828" aria-label="Позвонить в AMERIKA.BY: +375 (29) 633-28-28" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-3l-5-2-2 2a14 14 0 0 1-6-6l2-2-2-5Z"/></svg>+375 (29) 633-28-28</a>
    <?php
});
add_action('wp_footer', function () {
    if (is_admin()) { return; }
    ?>
<script id="amzb-phone-ui-js" data-nowprocket>
(function(){
 'use strict';
 if(document.documentElement.dataset.amzbPhoneUi){return;}
 document.documentElement.dataset.amzbPhoneUi='2';
 var track=<?php echo is_user_logged_in() ? 'false' : 'true'; ?>;
 <?php
 $amz_forms = array();
 foreach (get_posts(array('post_type'=>'wpcf7_contact_form','post_status'=>'publish','numberposts'=>-1)) as $amz_form) {
     $amz_id = (int) $amz_form->ID;
     $amz_type = in_array($amz_id,array(13312,17726),true) ? 'vin_check' : ($amz_id===2212 ? 'contact_request' : (in_array($amz_id,array(103,3606,3607,17650,17725,17910),true) ? 'vehicle_request' : 'website_request'));
     $amz_forms[(string)$amz_id] = array('name'=>get_the_title($amz_id),'type'=>$amz_type);
 }
?>
 var leadForms=<?php echo wp_json_encode($amz_forms,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT); ?>;
 function event(name,params){
  if(!track){return;}
  try{if(typeof window.ym==='function'){window.ym(91733040,'reachGoal',name);}}catch(e){}
  try{if(typeof window.gtag==='function'){window.gtag('event',name,params||{});}}catch(e){}
 }
 document.addEventListener('click',function(e){
  var link=e.target.closest&&e.target.closest('a[href^="tel:"]');
  if(link){event('phone_click',{contact_location:link.closest('.amzb-floating-phone')?'mobile_floating':link.closest('#masthead')?'header':'page'});}
 });
 // One sender for all published CF7 forms. Only confirmed success counts.
 // No submitted name, phone, email, VIN or request identifier is sent to analytics.
 var leadAttempts=new WeakMap();
 function leadForm(e){
  var node=e&&e.target;
  if(!node){return null;}
  if(node.matches&&node.matches('.wpcf7 form')){return node;}
  return node.querySelector?node.querySelector('.wpcf7 form,form'):null;
 }
 function beginLeadAttempt(e){
  var form=leadForm(e);
  if(form){leadAttempts.set(form,{counted:false});}
 }
 document.addEventListener('submit',beginLeadAttempt,true);
 document.addEventListener('wpcf7beforesubmit',beginLeadAttempt,false);
 document.addEventListener('wpcf7mailsent',function(e){
  if(!track){return;}
  var detail=e.detail||{},form=leadForm(e);
  if(!form){return;}
  var status=detail.status||(detail.apiResponse&&detail.apiResponse.status);
  if(status&&status!=='mail_sent'){return;}
  var field=form.querySelector('[name="_wpcf7"]');
  var id=String(detail.contactFormId||(field&&field.value)||'');
  var config=leadForms[id];
  if(!config||typeof window.gtag!=='function'){return;}
  var attempt=leadAttempts.get(form);
  if(!attempt){attempt={counted:false};leadAttempts.set(form,attempt);}
  if(attempt.counted){return;}
  attempt.counted=true;
  try{
   window.gtag('event','generate_lead',{
    send_to:'G-ZVGQ3SH216',form_id:id,form_name:config.name,
    form_type:config.type,method:'contact_form'
   });
  }catch(err){attempt.counted=false;}
 },false);
})();
</script>
    <?php
}, 100);
