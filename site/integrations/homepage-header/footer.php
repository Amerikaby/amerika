<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package amerika
 */
?>


<?php
/* AMZB-PREFOOTER-MARKS-OFF 2026-08-25
 * Сквозной предподвальный блок марок отключён. Он выводил ровно тот же список из
 * 82 каталогов марок, что и мега-меню в шапке (наборы адресов совпадали на 100%),
 * то есть на каждой странице кроме главной дублировались 83 ссылки и ~8 КБ HTML.
 * Число уникальных адресов на странице от этого не меняется, уходят именно дубли.
 * На главной свой блок марок (HomeAutoMarksTabs в templates/home.php), он не тронут.
 * Откат: вернуть false -> !is_front_page(), либо взять footer.php.amzb-bak-20260825.
 */
if ( false ): // было: if (!is_front_page()) - выводили на всех страницах кроме главной
?>
	<div class="pre-footer">
			<div class="container">
				<div class="auto-box">
					    <?php PreFoterAutoMarks(); ?>
			</div>
		</div>
	</div>
<?php endif; ?>



	<footer id="colophon" class="site-footer">
		<div class="container">
			<?php if (wp_is_mobile()) { 
				// MOBILE TEMPLATE 
			?>
			<div class="site-footer-content">
				<div class="one">
					<div class="site-branding">
						<a href="<?php echo get_site_url(); ?>" class="custom-logo-link" rel="home" aria-current="page">
										<img width="200" height="185" src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/logo.svg" class="custom-logo" alt="AMERIKA.BY">
						</a>
					</div>
					<div class="contacts">
						<div class="phone">
							<a href="tel:+375295082228">+375 (29) 508-22-28</a>
						</div>
						<div class="adres">
							<a href="https://yandex.by/maps/29630/minsk-district/house/Zk4YcA9oSkYFQFtpfXR3dXxkZQ==/?indoorLevel=1&ll=27.688332%2C53.864071&z=17" target="_blank">Минск, ул. Большое Стиклево, 83, 3 этаж</a>
						</div>
						<div class="time">
							Пн-Пт: 10:00-19:00
						</div>
						<div class="social">
							<a href="https://www.facebook.com/%D0%90%D0%B2%D1%82%D0%BE%D0%BC%D0%BE%D0%B1%D0%B8%D0%BB%D0%B8-%D0%B8-%D0%BC%D0%BE%D1%82%D0%BE%D1%86%D0%B8%D0%BA%D0%BB%D1%8B-%D0%B8%D0%B7-%D0%A1%D0%A8%D0%90-282521399069668/" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/facebook.svg" alt="Facebook">
							</a>
							<a href="https://www.instagram.com/amerika.by/" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/instagram.svg"  alt="Instagram">
							</a>
							<a href="https://vk.com/amerika_by" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/vk.svg" alt="VK">
							</a>
							<a href="https://m.ok.ru/group/70000000591558" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/odnoklassniki.svg" class="Odnoklassniki" alt="Odnoklassniki">
							</a>
							<a href="https://t.me/amerikaa_by" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/telegram.svg" alt="Telegram">
							</a>
							<a href="https://invite.viber.com/?g2=AQAAkEF%2FhGMFpktyDlEkYS%2BxjYw%2FjoNWL6QNZXfEkrJFMlM2XP%2Bj8zM86NlSyvji&lang=ru" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/viber.svg" alt="Viber">
							</a>
						</div>
					</div>
				</div> 
				<div class="two">
					<div class="foot-menu">
						<?php
						echo '<h3>Автомобили</h3>';
							wp_nav_menu(
								array(
									'theme_location' => 'footer_1'
								)
							);
						?>
					</div>
					<div class="foot-menu">
						<?php
						echo '<h3>Мототехника</h3>';
							wp_nav_menu(
								array(
									'theme_location' => 'footer_4'
								)
							);
						?>
					</div>
				</div>
				<div class="three">
					<div class="foot-menu">
						<?php
						echo '<h3>Электромобили</h3>';
							wp_nav_menu(
								array(
									'theme_location' => 'footer_2'
								)
							);
						?>
					</div>
					<div class="foot-menu">
						<?php
						echo '<h3>Услуги</h3>';
							wp_nav_menu(
								array(
									'theme_location' => 'footer_5'
								)
							);
						?>
					</div>
				</div>
				<div class="fore">
					<div class="foot-menu">
						<?php
						echo '<h3>Калькулятор</h3>';
							wp_nav_menu(
								array(
									'theme_location' => 'footer_3'
								)
							);
						?>
					</div>
					<div class="foot-menu black">
						<?php
							wp_nav_menu(
								array(
									'theme_location' => 'footer_6'
								)
							);
						?>
					</div>
				</div>
					<div class="site-info">
						<a href="<?php echo get_site_url(); ?>">Copyright © <?php echo date('Y'); ?> AMERIKA.BY <br />Все права защищены.</a>
					</div>
				</div>
			</div>
			<?php 
				// CLOSE MOBILE
				} else { 
					// DESCTOP TEMPLATE 
			?>
			<div class="site-footer-content">
				<div class="one">
					<div class="site-branding">
						<a href="<?php echo get_site_url(); ?>" class="custom-logo-link" rel="home" aria-current="page">
										<img width="200" height="185" src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/logo.svg" class="custom-logo" alt="AMERIKA.BY">
						</a>
					</div>
					<div class="contacts">
						<div class="phone">
							<a href="tel:+375296332828">+375 (29) 633-28-28</a>
						</div>
						<div class="adres">
							<a href="https://yandex.by/maps/29630/minsk-district/house/Zk4YcA9oSkYFQFtpfXR3dXxkZQ==/?indoorLevel=1&ll=27.688332%2C53.864071&z=17" target="_blank">Минск, ул. Большое Стиклево, 83, 3 этаж</a>
						</div>
						<div class="time">
							Пн-Пт: 10:00-19:00
						</div>
						<div class="social">
							<a href="https://www.facebook.com/%D0%90%D0%B2%D1%82%D0%BE%D0%BC%D0%BE%D0%B1%D0%B8%D0%BB%D0%B8-%D0%B8-%D0%BC%D0%BE%D1%82%D0%BE%D1%86%D0%B8%D0%BA%D0%BB%D1%8B-%D0%B8%D0%B7-%D0%A1%D0%A8%D0%90-282521399069668/" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/facebook.svg" alt="Facebook">
							</a>
							<a href="https://www.instagram.com/amerika.by/" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/instagram.svg"  alt="Instagram">
							</a>
							<a href="https://vk.com/amerika__by" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/vk.svg" alt="vk">
							</a>
							<a href="https://m.ok.ru/group/70000000591558" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/odnoklassniki.svg" class="Odnoklassniki" alt="Odnoklassniki">
							</a>
							<a href="https://t.me/amerikaa_by" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/telegram.svg" alt="Telegram">
							</a>
							<a href="https://invite.viber.com/?g2=AQAAkEF%2FhGMFpktyDlEkYS%2BxjYw%2FjoNWL6QNZXfEkrJFMlM2XP%2Bj8zM86NlSyvji&lang=ru" target="_blank">
								<img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/viber.svg" alt="Viber">
							</a>
						</div>
					</div>
					<div class="site-info">
						<a href="<?php echo get_site_url(); ?>">Copyright © <?php echo date('Y'); ?> AMERIKA.BY <br />Все права защищены.</a>
					</div>
					<div class="source-logos">
                       <a href="<?php echo get_site_url(); ?>/docs/erip.pdf" target="_blank" rel="nofollow"><img src="<?php echo get_site_url(); ?>/wp-content/themes/img/erip.png" width="75" height="40" alt="Инструкция по оплате через ЕРИП" /></a>
					</div>
				</div>
				<div class="two">
					<div class="foot-menu">
						<?php
						echo '<h3>Автомобили</h3>';
							wp_nav_menu(
								array(
									'theme_location' => 'footer_1'
								)
							);
						?>
					</div>
					<div class="foot-menu">
						<?php
						echo '<h3>Мототехника</h3>';
							wp_nav_menu(
								array(
									'theme_location' => 'footer_4'
								)
							);
						?>
					</div>
				</div>
				<div class="three">
					<div class="foot-menu">
						<?php
						echo '<h3>Электромобили</h3>';
							wp_nav_menu(
								array(
									'theme_location' => 'footer_2'
								)
							);
						?>
					</div>
					<div class="foot-menu">
						<?php
						echo '<h3>Услуги</h3>';
							wp_nav_menu(
								array(
									'theme_location' => 'footer_5'
								)
							);
						?>
					</div>
				</div>
				<div class="fore">
					<div class="foot-menu">
						<?php
						echo '<h3>Калькулятор</h3>';
							wp_nav_menu(
								array(
									'theme_location' => 'footer_3'
								)
							);
						?>
					</div>
					<div class="foot-menu black">
						<?php
							wp_nav_menu(
								array(
									'theme_location' => 'footer_6'
								)
							);
						?>
					</div>
				</div>
				</div>
			<div class="org-info">
				ООО «МирАвтоИмпорт» УНП / 692205841
			</div>
			</div>
			<?php } 
				// CLOSE DESCTOP
			?>
		</div>
	</footer>
</div><!-- #page -->
<?php wp_footer(); ?>
<div class="modal fade" id="KeyCost" aria-hidden="true" aria-labelledby="KeyCostLabel" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
      	<h4 class="modal-title" id="KeyCost">Цена под ключ <span><?php the_title(); ?></span></h4>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
			<?php echo do_shortcode('[contact-form-7 id="3606" title="Цена под ключ"]'); ?>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="СalculateCost" aria-hidden="true" aria-labelledby="СalculateCostLabel" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
      	<h4 class="modal-title" id="СalculateCost">Рассчитать стоимость <span><?php the_title(); ?></span></h4>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
			<?php echo do_shortcode('[contact-form-7 id="3607" title="Рассчитать стоимость"]'); ?>
      </div>
    </div>
  </div>
</div>


<script>
    // The gallery bundle is only needed on pages that actually contain a gallery.
    document.addEventListener('DOMContentLoaded', function() {
        if (!document.getElementById('lightgallery')) return;
        var script = document.createElement('script');
        script.src = '<?php echo esc_url( home_url( '/wp-content/themes/amerika/lightbox/lightgallery-all.min.js' ) ); ?>';
        script.onload = function() { jQuery('#lightgallery').lightGallery(); };
        document.body.appendChild(script);
    });
</script>
<script>
// Load the chat after the first real interaction, or after 12 seconds for a passive visitor.
(function () {
    var loaded = false;
    function loadJivo() {
        if (loaded) return;
        loaded = true;
        ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(function (eventName) {
            window.removeEventListener(eventName, loadJivo, { passive: true });
        });
        var script = document.createElement('script');
        script.src = 'https://code.jivo.ru/widget/MtEKQtxpm2';
        script.async = true;
        document.head.appendChild(script);
    }
    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(function (eventName) {
        window.addEventListener(eventName, loadJivo, { passive: true, once: true });
    });
    window.setTimeout(loadJivo, 12000);
})();
</script>
<!-- Yandex.Metrika counter -->
<script type="text/javascript" >
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
   ym(91733040, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true
   });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/91733040" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZVGQ3SH216"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ZVGQ3SH216');
</script>

<script>
// Make main filter radio buttons bold (GMC, VW, Volvo, etc.)
(function($) {
    function makeMainRadiosBold() {
        // Find the main radiogroup container
        var $mainGroup = $('#search-filter-input-radio-0, [role="radiogroup"].search-filter-input-group').first();
        
        if ($mainGroup.length) {
            // Get all direct children .search-filter-input-radio (these are main items like GMC, VW, Volvo)
            $mainGroup.children('.search-filter-input-radio').each(function() {
                var $mainRadio = $(this);
                
                // Make the main item's label bold (direct child label)
                $mainRadio.children('label').find('.search-filter-input-radio__label').first().css('font-weight', '600');
                
                // Find nested group inside this main item
                var $nestedGroup = $mainRadio.find('.search-filter-input-group');
                if ($nestedGroup.length) {
                    // Make all nested items normal weight
                    $nestedGroup.find('.search-filter-input-radio__label').css('font-weight', '400');
                }
            });
        }
        
        console.log('Main radios made bold:', $mainGroup.children('.search-filter-input-radio').length + ' items');
    }
    
    // Run on document ready
    $(document).ready(function() {
        makeMainRadiosBold();
        
        // Run multiple times with delays
        setTimeout(makeMainRadiosBold, 300);
        setTimeout(makeMainRadiosBold, 600);
        setTimeout(makeMainRadiosBold, 1000);
        setTimeout(makeMainRadiosBold, 2000);
    });
    
    // Watch for dynamic content changes
    if (window.MutationObserver) {
        var observer = new MutationObserver(function(mutations) {
            makeMainRadiosBold();
        });
        
        $(document).ready(function() {
            var targetNode = document.querySelector('.sidebar');
            if (targetNode) {
                observer.observe(targetNode, { childList: true, subtree: true });
            }
        });
    }
    
    // Also run on window load
    $(window).on('load', function() {
        setTimeout(makeMainRadiosBold, 500);
    });
    
})(jQuery);
</script>
</body>
</html>
