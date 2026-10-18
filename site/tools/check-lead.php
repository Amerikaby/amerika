<?php
// Run with wp eval-file, outside the web root. No real email is sent.
if (PHP_SAPI !== 'cli' || !defined('ABSPATH')) exit(1);
require dirname(__FILE__) . '/lead.php';
function amz_assert($condition,$message) { if (!$condition) throw new Exception($message); }
$input=array('phone'=>'+375 (29) 000-00-00','agree'=>true,'name'=>'QA без отправки','car'=>'Резерв восстановления 3500 $, услуга 990 BYN','source'=>'https://amerika.by/newcodex/kalkulyator/','website'=>'');
$clean=amz_preview_validate($input);
amz_assert(!is_wp_error($clean),'Valid input');amz_assert($clean['phone']==='+375290000000','Normalized phone');
$invalid=$input;$invalid['agree']=false;amz_assert(is_wp_error(amz_preview_validate($invalid)),'Consent required');
$invalid=$input;$invalid['phone']='123';amz_assert(is_wp_error(amz_preview_validate($invalid)),'Phone validation');
$invalid=$input;$invalid['website']='bot';amz_assert(is_wp_error(amz_preview_validate($invalid)),'Honeypot');
$called=0;
add_filter('pre_wp_mail',function($return,$mail)use(&$called){
 $called++;amz_assert(strpos($mail['message'],'+375290000000')!==false,'Phone reaches mail adapter');amz_assert(strpos($mail['message'],'3500')!==false,'Calculation reaches mail adapter');amz_assert(in_array('info@amerika.by',(array)$mail['to'],true),'Existing recipient');return true;
},PHP_INT_MAX,2);
amz_assert(amz_preview_deliver($clean)===true,'Positive mail adapter');amz_assert($called===1,'Transport intercepted exactly once');
add_filter('pre_wp_mail',function(){return false;},PHP_INT_MAX);
amz_assert(amz_preview_deliver($clean)===false,'Transport failure not reported as success');
echo "PASS: validation, normalization, consent, spam trap, recipient, calculation, transport success/failure; actual emails sent: 0\n";
