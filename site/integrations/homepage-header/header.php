<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package amerika
 */
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<link as="font" href="<?php echo get_site_url(); ?>/wp-content/themes/amerika/lightbox/lg.woff" crossorigin>
	<meta name="p:domain_verify" content="d3e205fe12bb732a047b68d5b4b44548"/>
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site">
	<header id="masthead" class="site-header fixed-top amzh-smart" style="display:;">
		<div class="top">
			<div class="container">
				<div class="top-container">
					<div class="left">
						<div class="top-menu">
							<?php
								wp_nav_menu(
									array(
										'theme_location' => 'top_menu'
									)
								);
							?>
						</div>
					</div>
					
					<div class="right">
						<div class="contacts">
							<div class="adres">
								<a href="https://yandex.by/maps/29630/minsk-district/house/Zk4YcA9oSkYFQFtpfXR3dXxkZQ==/?indoorLevel=1&ll=27.688332%2C53.864071&z=17" target="_blank">Минск, ул. Большое Стиклево, 83, 3 этаж</a>
							</div>
							
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="row-navigation">
			<div class="container">
<div class="amzh-brand">
						<a href="<?php echo get_site_url(); ?>" class="custom-logo-link" rel="home" aria-current="page">
										<img width="200" height="185" src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/logo.svg" class="custom-logo" alt="AMERIKA.BY">
						</a>
					</div>
				<div class="site-branding-mobile">
					<a href="<?php echo get_site_url(); ?>" class="custom-logo-link" rel="home" aria-current="page">
										<img width="200" height="185" src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/logo.svg" class="custom-logo" alt="AMERIKA.BY">
					</a>
				</div>
				<div class="menu-burger-mobile">
					<?php echo do_shortcode('[rmp_menu id="3609"]'); ?>
				</div>
				<nav id="site-navigation" class="main-navigation">
					<div class="menu-main-menu-container">
						<ul id="primary-menu" class="menu">
							<li id="menu-item-30" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-30">
								<a href="#">Автомобили</a>
								<div class="sub-menu-marks auto-menu">
									<div class="d-flex align-items-start">
									  <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
									    <button class="nav-link active" id="auto-usa-tab" data-bs-toggle="pill" data-bs-target="#auto-usa" type="button" role="tab" aria-controls="auto-usa" aria-selected="true">Автомобили из США</button>
									    <button class="nav-link" id="auto-canada-tab" data-bs-toggle="pill" data-bs-target="#auto-canada" type="button" role="tab" aria-controls="auto-canada" aria-selected="false">Автомобили из Канады</button>
									    <button class="nav-link" id="auto-europe-tab" data-bs-toggle="pill" data-bs-target="#auto-europe" type="button" role="tab" aria-controls="auto-europe" aria-selected="false">Автомобили из Европы</button>
									    <button class="nav-link" id="auto-china-tab" data-bs-toggle="pill" data-bs-target="#auto-china" type="button" role="tab" aria-controls="auto-china" aria-selected="false">Автомобили из Китая</button>
									  </div>
									  <div class="tab-content" id="v-pills-tabContent">
									    <div class="tab-pane fade show active" id="auto-usa" role="tabpanel" aria-labelledby="auto-usa-tab">
									    	<div class="all-catalog">
									    		<a href="/auto-usa/">Каталог Авто из Америки <span>&rarr;</span></a> 
									    	</div>
											<?php ShowMenuTermsMarkaUSA(); ?>
									    </div>
									    <div class="tab-pane fade" id="auto-canada" role="tabpanel" aria-labelledby="auto-canada-tab">
									    	<div class="all-catalog">
									    		<a href="/auto-canada/">Каталог Авто из Канады <span>&rarr;</span></a> 
									    	</div>
									    	<?php ShowMenuTermsMarkaCanada(); ?>
									    </div>
									    <div class="tab-pane fade" id="auto-europe" role="tabpanel" aria-labelledby="auto-europe-tab">
									    	<div class="all-catalog">
									    		<a href="/auto-europe/">Каталог Авто из Европы <span>&rarr;</span></a> 
									    	</div>
									    	<?php ShowMenuTermsMarkaEurope(); ?>
									    </div>
									    <div class="tab-pane fade" id="auto-china" role="tabpanel" aria-labelledby="auto-china-tab">
									    	<div class="all-catalog">
									    		<a href="/auto-china/">Каталог Авто из Китая <span>&rarr;</span></a> 
									    	</div>
									    	<?php ShowMenuTermsMarkaChina(); ?>
									    </div>
									  </div>
									</div>
								</div>
							</li>
							<li id="menu-item-31" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-31">
								<a href="#">Электромобили</a>
								<ul class="sub-menu">
									<li id="menu-item-39" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-39">
										<a href="/auto-usa/elektromobily/">Электромобили из США</a> 
									</li>
									<li id="menu-item-40" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-40">
										<a href="/auto-canada/elektromobily/">Электромобили из Канады</a>
									</li>
									<li id="menu-item-143" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-143">
										<a href="/auto-europe/elektromobily/">Электромобили из Европы</a>
									</li>
									<li id="menu-item-143" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-143">
										<a href="/auto-china/elektromobily/">Электромобили из Китая</a>
									</li>
								</ul>
							</li>
							<li id="menu-item-32" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-32">
								<a href="#">Мототехника</a>
							</li>
							<li id="menu-item-33" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-33">
								<a href="/uslugi/">Услуги</a>
								<ul class="sub-menu">
									<li id="menu-item-154" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-154">
										<a href="/uslugi/dostavka-zapchastey/">Доставка запчастей</a>
									</li>
									<li id="menu-item-155" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-155">
										<a href="/uslugi/proverka-istorii-po-bazam/">Проверка истории по базам</a>
									</li>
									<li id="menu-item-156" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-156">
										<a href="/uslugi/otslezhivanie-konteinerov/">Отслеживание контейнеров</a>
									</li>
									<li id="menu-item-157" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-157">
										<a href="/uslugi/rastamozhka-avtomobiley/">Растаможка автомобилей</a></li>
										<li id="menu-item-158" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-158">
											<a href="/uslugi/dostavka-mototehniki/">Доставка мототехники</a>
										</li>
									</ul>
								</li>
								<li id="menu-item-34" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-34">
									<a href="/ceny/">Цены</a>
								</li>
								<li id="menu-item-35" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-35">
									<a href="#">Калькулятор</a>
									<ul class="sub-menu">
										<li id="menu-item-165" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-165">
											<a href="/calc/">Калькулятор доставки для оптовых клиентов</a>
										</li>
										<li class="menu-item menu-item-type-custom menu-item-object-custom amz-retail-menu"><a href="/kalkulyator/">Калькулятор для розничных клиентов</a></li>
                                        <li id="menu-item-164" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-164">
											<a href="/tamozhennyj-kalkulator/">Калькулятор таможни</a>
										</li>
									</ul>
								</li>
								<li id="menu-item-36" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-36">
									<a href="/blog/">Блог</a>
								</li>
							</ul>
						</div>
				</nav>
<div class="amzh-phone contacts"><div class="phone">
								<a href="tel:+375296332828">+375 (29) 633-28-28</a>
							</div></div>
			</div>
		</div>
	</header>
