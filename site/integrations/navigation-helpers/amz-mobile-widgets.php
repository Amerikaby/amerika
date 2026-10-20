<?php
/**
 * Plugin Name: Amerika — Compact mobile widgets
 * Description: Compact mobile launchers for the existing Jivo chat and AutoCheck form.
 * Version: 1.0.4
 */
defined('ABSPATH') || exit;

add_action('wp_head', static function () {
    if (is_admin()) { return; }
    ?>
<style id="amz-mobile-widgets-style">
@media(max-width:767px){
 body a.free-autocheck{
  position:fixed;left:calc(14px + env(safe-area-inset-left,0px));right:auto;
  bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:none;
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  width:auto;max-width:calc(100vw - 96px);height:40px;min-height:40px;
  margin:0;padding:8px 11px;box-sizing:border-box;border:1px solid rgba(23,42,65,.14);
  border-radius:20px;background:rgba(255,255,255,.94);box-shadow:0 3px 12px rgba(23,42,65,.10);
  font-size:11px;line-height:1.2;font-weight:600;white-space:nowrap;z-index:1030;
 }
 body a.free-autocheck img{width:80px;max-width:80px;height:auto;max-height:24px;object-fit:contain;margin:0}
 body a.free-autocheck:focus-visible{outline:2px solid #d20b34;outline-offset:3px}
 /* Keep Jivo's own launcher and click handlers; change only its compact appearance. */
 #jvLabelWrap{
  left:auto!important;right:calc(14px + env(safe-area-inset-right,0px))!important;
  bottom:calc(14px + env(safe-area-inset-bottom,0px))!important;top:auto!important;
  width:46px!important;min-width:46px!important;max-width:46px!important;
  height:46px!important;min-height:46px!important;max-height:46px!important;
  padding:0!important;margin:0!important;border:1px solid rgba(255,255,255,.2)!important;
  border-radius:50%!important;box-sizing:border-box!important;
  background:#20354f!important;box-shadow:0 3px 12px rgba(23,42,65,.16)!important;
  overflow:hidden!important;cursor:pointer!important;
 }
 #jvLabelWrap>*{display:none!important}
 #jvLabelWrap::before{
  content:"";position:absolute;inset:0;display:block;
  background:center/23px 23px no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 11.5a8 8 0 0 1-8 8 9.4 9.4 0 0 1-3.5-.7L4 20l1.2-4.5a8 8 0 1 1 14.8-4Z'/%3E%3Cpath d='M8 11h.01M12 11h.01M16 11h.01'/%3E%3C/svg%3E");
 }
 #jvLabelWrap::after{content:none!important}
 #jvLabelWrap:focus-visible{outline:2px solid #d20b34;outline-offset:3px}
 /* Jivo's desktop-style close control otherwise falls outside a narrow viewport. */
 #jcont{width:336px!important;max-width:calc(100% - 28px)!important;left:auto!important;right:14px!important}
 #jcont>jdiv{max-width:100%!important}
 #jcont>jdiv:not(#jivo_action){z-index:1!important}
 #jivo_action{z-index:5!important;pointer-events:none!important}
 #jivo_close_button{position:absolute!important;left:auto!important;right:8px!important;top:8px!important;z-index:3;pointer-events:auto!important}
 #jcont [class*="header__"]{left:0!important;right:0!important;width:auto!important;max-width:100%!important}
 #jcont [class*="headerContainer__"]{width:100%!important;min-width:0!important}
 #jcont [class*="info__"]{width:100%!important;min-width:0!important;padding-right:24px!important;box-sizing:border-box!important}
 body.modal-open a.free-autocheck,body.modal-open #jvLabelWrap,
 html.amz-mobile-menu-open a.free-autocheck,html.amz-mobile-menu-open #jvLabelWrap{
  visibility:hidden!important;pointer-events:none!important;
 }
}
</style>
    <?php
}, 110);

add_action('wp_footer', static function () {
    if (is_admin()) { return; }
    ?>
<script id="amz-mobile-widgets-script" data-nowprocket>
(() => {
 "use strict";
 const mobile = matchMedia("(max-width:767px)");
 const enhanced = new WeakMap();
 const mobileAttributes = {"aria-label":"Открыть чат",title:"Написать нам",role:"button",tabindex:"0"};
 let frame = 0;
 function update() {
  frame = 0;
  const autoCheck = document.querySelector("a.free-autocheck");
  if (autoCheck && !autoCheck.hasAttribute("aria-label")) {
   autoCheck.setAttribute("aria-label", "Бесплатный AutoCheck");
  }
  const label = document.getElementById("jvLabelWrap");
  if (label && !enhanced.has(label)) {
   enhanced.set(label, Object.fromEntries(
    Object.keys(mobileAttributes).map(name => [name,label.getAttribute(name)])));
   // The original click area is a child that the compact presentation hides.
   // Preserve the original Jivo root for existing capture-phase analytics.
   label.addEventListener("click", event => {
    if (mobile.matches && window.jivo_api && typeof window.jivo_api.open === "function") {
     event.preventDefault();
     event.stopPropagation();
     window.jivo_api.open({start:"chat"});
    }
   });
   label.addEventListener("keydown", event => {
    if (mobile.matches && (event.key === "Enter" || event.key === " ")) {
     event.preventDefault();
     label.click();
    }
   });
  }
  if (label) {
   const attributes = mobile.matches ? mobileAttributes : enhanced.get(label);
   for (const [name,value] of Object.entries(attributes)) {
    if (value === null) label.removeAttribute(name);
    else if (label.getAttribute(name) !== value) label.setAttribute(name,value);
   }
  }
  document.documentElement.classList.toggle("amz-mobile-menu-open",
   Boolean(document.querySelector('.rmp_menu_trigger[aria-expanded="true"]')));
 }
 function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
 }
 // Jivo is injected after the first interaction or the existing delayed loader.
 new MutationObserver(schedule).observe(document.body, {
  childList:true,subtree:true,attributes:true,attributeFilter:["aria-expanded"]
 });
 mobile.addEventListener("change", schedule);
 update();
})();
</script>
    <?php
}, 110);
