<?php
/**
 * Template Name: Домашняя страница
 * The template for displaying all pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site may use a
 * different template.
 *

 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package amerika
 */

wp_enqueue_style( 'amz-home-hero-20261020', get_template_directory_uri() . '/assets/hero-20261020/hero-v2.css', array(), '20261021.1' );

get_header();

?>


	<main id="primary" class="site-main">
<div id="amz-hero-v2"><section class="hero">
  <div class="wrap">
    <div class="hero-copy">
      <p class="eyebrow">Copart · IAAI · Manheim</p>
      <h1>Доставка авто из США в Беларусь <mark>под ключ</mark></h1>
      <p class="lead">Найдём машину на аукционе, привезём в Минск и растаможим. Полную цену видите до ставки.</p>
      <div class="cta-row">
        <a class="btn btn-red btn-xl" href="#consultation">Подобрать машину</a>
        <a class="btn btn-line" href="https://amerika.by/kalkulyator/">Посчитать цену</a>
      </div>
      <p class="cta-sub">Пришлём до 5 вариантов с аукциона и полную цену до Минска. Или напишите: <a href="https://t.me/+375296332828" rel="noopener" target="_blank">Telegram</a>, <a href="viber://chat?number=%2B375296332828">Viber</a>, <a href="https://wa.me/375296332828" rel="noopener" target="_blank">WhatsApp</a>.</p>
      <div class="facts">
        <div><b class="num">10+ лет</b><span>возим авто из США</span></div>
        <div><b class="num">40–70 дней</b><span>от оплаты лота до Минска</span></div>
        <div><b class="num">от 590 BYN</b><span>услуга по договору</span></div>
      </div>
    </div>

    <section aria-label="Американские автомобили" aria-roledescription="карусель" class="car-showcase" data-active="0" role="region">
<div class="car-stage"><figure aria-hidden="false" class="car-slide is-active" data-name="Chevrolet Equinox"><img alt="Chevrolet Equinox — иллюстрация модели" data-no-lazy="1" decoding="async" fetchpriority="high" height="1024" loading="eager" src="/wp-content/themes/amerika/assets/hero-20261020/equinox.webp" width="1536"/></figure><figure aria-hidden="true" class="car-slide" data-name="Ford Escape"><img alt="Ford Escape — иллюстрация модели" data-no-lazy="1" decoding="async" height="1024" loading="eager" src="/wp-content/themes/amerika/assets/hero-20261020/escape.webp" width="1536"/></figure><figure aria-hidden="true" class="car-slide" data-name="Jeep Grand Cherokee"><img alt="Jeep Grand Cherokee — иллюстрация модели" data-no-lazy="1" decoding="async" height="1024" loading="eager" src="/wp-content/themes/amerika/assets/hero-20261020/jeep.webp" width="1536"/></figure><figure aria-hidden="true" class="car-slide" data-name="Volkswagen Jetta"><img alt="Volkswagen Jetta — иллюстрация модели" data-no-lazy="1" decoding="async" height="1024" loading="eager" src="/wp-content/themes/amerika/assets/hero-20261020/jetta.webp" width="1536"/></figure><figure aria-hidden="true" class="car-slide" data-name="Mercedes-Benz S-Class W223"><img alt="Mercedes-Benz S-Class W223 — иллюстрация модели" data-no-lazy="1" decoding="async" height="1024" loading="eager" src="/wp-content/themes/amerika/assets/hero-20261020/w223.webp" width="1536"/></figure><figure aria-hidden="true" class="car-slide" data-name="BMW X6"><img alt="BMW X6 — иллюстрация модели" data-no-lazy="1" decoding="async" height="1024" loading="eager" src="/wp-content/themes/amerika/assets/hero-20261020/x6.webp" width="1536"/></figure></div>
<div class="car-meta"><div><span class="car-kicker">Ваш следующий автомобиль</span><strong class="car-title">Chevrolet Equinox</strong></div>
<div class="car-controls"><button aria-label="Предыдущая машина" class="car-control car-prev" type="button"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button><button aria-label="Остановить автопереключение" aria-pressed="false" class="car-control car-pause" type="button"><svg class="car-icon-pause" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="currentColor"><rect x="7" y="6" width="3" height="12" rx=".75"/><rect x="14" y="6" width="3" height="12" rx=".75"/></svg><svg class="car-icon-play" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="currentColor" hidden><path d="M9 5l10 7-10 7Z"/></svg></button><button aria-label="Следующая машина" class="car-control car-next" type="button"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div></div>
<div aria-label="Выбор модели" class="car-options"><button aria-label="Показать Chevrolet Equinox — от 13 500 $ с доставкой и ремонтом" aria-pressed="true" class="car-option" type="button">Chevrolet<span>Equinox</span><small class="car-option-price">от&nbsp;13&nbsp;500&nbsp;$<br>с доставкой и ремонтом</small></button><button aria-label="Показать Ford Escape" aria-pressed="false" class="car-option" type="button">Ford<span>Escape</span></button><button aria-label="Показать Jeep Grand Cherokee" aria-pressed="false" class="car-option" type="button">Jeep<span>Grand Cherokee</span></button><button aria-label="Показать Volkswagen Jetta" aria-pressed="false" class="car-option" type="button">Volkswagen<span>Jetta</span></button><button aria-label="Показать Mercedes-Benz S-Class W223" aria-pressed="false" class="car-option" type="button">Mercedes-Benz<span>S-Class W223</span></button><button aria-label="Показать BMW X6" aria-pressed="false" class="car-option" type="button">BMW<span>X6</span></button></div>
<p class="car-price" hidden></p>
<p class="car-note">Иллюстрации моделей. Подберём конкретный автомобиль под ваш бюджет.</p>
<span aria-live="polite" class="slider-sr"></span></section>
  </div>
</section><div class="wrap trust-strip"><div><b>Вы платите аукциону</b><span>Нам — за услугу по договору</span></div><div><b>Считаете до ставки</b><span>Лот, доставка, таможня и восстановление</span></div><div><b>Общаетесь с нами в Минске</b><span>Офис, договор и ваш менеджер</span></div></div></div>
<script src="/wp-content/themes/amerika/assets/hero-20261020/slider-v2.js?v=20261020.2" data-nowprocket defer></script>

		<section class="small-banners">
			<div class="container">
				<div class="row">
					<div class="small-banners-content">
						<div class="banner">
							<div class="img">
                                <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/usa.svg" alt="Автомобили из США">
							</div>


							<div class="title-link">
								<h2><a href="/auto-usa/">Авто из США</a></h2>

                                <a href="/auto-usa/">Каталог <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a>

							</div>
						</div>

						<div class="banner">
							<div class="img">
                                <img src="/wp-content/themes/amerika/img/canada.svg" alt="Автомобили из Канады">
							</div>


							<div class="title-link">
								<h2><a href="/auto-canada/">Авто из Канады</a></h2>
                                <a href="/auto-canada/">Каталог <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a>
							</div>
						</div>


						<div class="banner">
							<div class="img">
                                <img src="/wp-content/themes/amerika/img/europa.svg" alt="Автомобили из Европы">
							</div>

							<div class="title-link">
								<h2><a href="/auto-europe/">Авто из Европы</a></h2>

                                <a href="/auto-europe/">Каталог <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a>
							</div>
						</div>


						<div class="banner">
							<div class="img">
                                <img src="/wp-content/themes/amerika/img/china.svg" alt="Автомобили из Китая">
							</div>

							<div class="title-link">
								<h2><a href="/auto-china/">Авто из Китая</a></h2>

                                <a href="/auto-china/">Каталог <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a>
							</div>
						</div>
					</div>	
				</div>
			</div>
		</section>


		<section class="auto-box">
			<div class="container">
				<ul class="nav nav-tabs" id="myTab" role="tablist">

				  <li class="nav-item" role="presentation">
				    <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Под заказ</button>
				  </li>

				  <li class="nav-item" role="presentation">
				    <button class="nav-link" id="home-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="home" aria-selected="false">В наличии</button>
				  </li>

				  <li class="nav-item" role="presentation"> 
				    <button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button" role="tab" aria-controls="contact" aria-selected="false">В пути</button>
				  </li>

				</ul>


				<div class="tab-content" id="myTabContent">
				  <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">

				  	<div class="grid-box">
				  		<?php ShowAutoOnOrder(); ?>
				  	</div>

					<div class="auto-box-button">

						<a href="/situation/on-order/" class="btn red">Все авто под заказ</a>

					</div>

				  </div>

				  <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">

				  	<div class="grid-box">
				  		<?php ShowAutoInStock(); ?>
				  	</div>

					<div class="auto-box-button">

						<a href="/situation/in-stock/" class="btn red">Все авто в наличии</a>

					</div>

				  </div>

				  <div class="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">

				  	<div class="grid-box">
				  		<?php ShowAutoInTransit(); ?>
				  	</div>

					<div class="auto-box-button">

						<a href="/situation/in-transit/" class="btn red">Все авто в пути</a>

					</div>

				</div>

			</div>

		</section>


	<section class="marks-tabs">
		<div class="container">
			<div class="auto-box">
				<?php HomeAutoMarksTabs(); ?>
			</div>
		</div>
	</section>


		<section class="services">

			<div class="container">

				<h2>Наши услуги</h2>

				<div class="services-content">

					<div class="service-box">

						<div class="img">

                            <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/car.svg" alt="" aria-hidden="true" />

						</div>


						<a href="<?php echo get_site_url(); ?>/uslugi/dostavka-avtomobiley/" class="first">Доставка автомобилей</a>

                        <a href="<?php echo get_site_url(); ?>/uslugi/dostavka-avtomobiley/" class="second">Подробнее <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a>

					</div>

					<div class="service-box">

						<div class="img">

                            <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/motorcycle.svg" alt="" aria-hidden="true" />

						</div>


						<a href="<?php echo get_site_url(); ?>/uslugi/dostavka-mototehniki/" class="first">Доставка мототехники</a>

                        <a href="<?php echo get_site_url(); ?>/uslugi/dostavka-mototehniki/" class="second">Подробнее <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a>


					</div>



					<div class="service-box">

						<div class="img">

                            <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/money.svg" alt="" aria-hidden="true" />

						</div>


						<a href="<?php echo get_site_url(); ?>/uslugi/rastamozhka-avtomobiley/" class="first">Растаможка авто</a>

                        <a href="<?php echo get_site_url(); ?>/uslugi/rastamozhka-avtomobiley/" class="second">Подробнее <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a>

					</div>

					<div class="service-box">

						<div class="img">

                            <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/container.svg" alt="" aria-hidden="true" />

						</div>

						<a href="<?php echo get_site_url(); ?>/uslugi/otslezhivanie-konteinerov/" class="first">Отслеживание контейнеров</a>

                        <a href="<?php echo get_site_url(); ?>/uslugi/otslezhivanie-konteinerov/" class="second">Подробнее <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a>

					</div>

				</div>







				<div class="services-content">

					<div class="service-box">

						<div class="img">

                            <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/history.svg" alt="" aria-hidden="true" />

						</div>


						<a href="<?php echo get_site_url(); ?>/uslugi/proverka-istorii-po-bazam/" class="first">Проверка истории по базам</a>

                        <a href="<?php echo get_site_url(); ?>/uslugi/proverka-istorii-po-bazam/" class="second">Подробнее <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a>

					</div>

					<div class="service-box">

						<div class="img">

                            <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/delivery.svg" alt="" aria-hidden="true" />



						</div>

						<a href="<?php echo get_site_url(); ?>/uslugi/dostavka-zapchastey/" class="first">Доставка запчастей</a>

                        <a href="<?php echo get_site_url(); ?>/uslugi/dostavka-zapchastey/" class="second">Подробнее <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a>

					</div>



					<?php if (wp_is_mobile()) { 

					// MOBILE TEMPLATE 

					?>



					<div class="service-triger">

						<h2>Нужна консультация?</h2>

						<span>Отлично, заполните и <a href="/kontakty/">отправьте форму</a> на сайте или перейдите

						в наш чат <a href="https://t.me/+375296332828">Telegram</a>.</span>

					</div>

					<?php 

					// CLOSE MOBILE

					} else { 

					// DESCTOP TEMPLATE 

					?>



					<div class="service-triger">

						<h2>Нужна консультация?</h2>

						<span>Отлично, заполните и <a href="/kontakty/">отправьте форму</a> на сайте или перейдите<br />

						в наш чат <a href="https://t.me/+375296332828">Telegram</a>.</span>

					</div>

					<?php } 

					// CLOSE DESCTOP

					?>

				</div>

			</div>

		</section>


		<section class="avtosport" style="background-image: url(https://amerika.by/wp-content/uploads/2023/08/avrosport_back-scaled.jpg)">

			<div class="container">

				<h2>Мы в автоспорте!</h2>

					<div class="avtosport-flex">

						<div class="avtosport-text">

							<div>Команда Amerika.by не только хорошо разбирается в автомобилях, но и живёт ими!</div>

								<p>Наши пилоты принимают участие в чемпионатах Республики Беларусь по дрифту и кольцевым гонкам Time-Attack.</p>

								<p><b>Пилот Андрей Муравский</b> представляет команду Amerika.by на чемпионате по дрифту в категории PRO2 на автомобиле - Lexus IS 200.</p>

								<p><b>Валерий Захаренко</b> представляет команду Amerika.by на «Открытом чемпионате Республики Беларусь по Time-Attack» на автомобиле - Mini Cooper S.</p>

								<p>Запах жжёной резины, рёв мотора и атмосфера гонок мотивирует нас всё больше поддерживать и развивать автоспорт в РБ. </p>

								<p><b>Приходите, болейте и получайте незаменимые эмоции вместе с нами!</b></p>

							</div>

							<div class="avtosport-slider">
								<?php echo do_shortcode('[print_vertical_thumbnail_slider]'); ?>
							</div>

					</div>

			</div>

		</section>





		<section class="why">

			<div class="container">

				<h2>Почему нам доверяют 🤔</h2>

				<div class="why-content">

					<div class="why-box">

						<span>Восстанавливаем на партнёрском СТО</span>

						<p>При оценке повреждений и восстановлении Вашего авто НЕ прибегаем к услугам сторонних организаций. Наши партнёры делают всё сами, именно это позволяет Вам избежать переплат за ремонт.</p>

					</div>

					<div class="why-box">

						<span>Прозрачность сделки</span>

						<p>Мы работаем по договору, все платежи Вы уплачиваете от своего имени на банковские счета. Перед покупкой мы подробно ознакомим Вас с цифрами предстоящих платежей, а также сроками их оплаты.</p>

					</div>


					<div class="why-box">

						<span>Полный цикл услуг</span>

						<p>Проверка истории авто, расчет всех расходов, ведение клиента от торгов на аукционе до помощи в восстановлении – все это делает для Вас команда Amerika.by. </p>

					</div>

				</div>


				<div class="why-content">

					<div class="why-box">

						<span>Официальные дилеры</span>

						<p>Мы являемся официальными представителями аукционов. Мы сами занимаемся доставкой автомобилей из США и выдерживаем минимальные сроки.</p>

					</div>


					<div class="why-box">

						<span>Опыт</span>

						<p>Наша компания занимается своим делом уже более 9 лет, 80% наших клиентов-клиенты по рекомендации.</p>

					</div>


					<div class="why-box">

						<span>Оплата частями</span>

						<p>Для Вашего комфорта предоставим возможность оплаты частями без переплат. Подробности узнавайте у наших специалистов.</p>

					</div>

				</div>

			</div>

		</section>


		<section id="consultation" class="consultation">

			<div class="container">

				<div class="consultation-content">

					<div class="left">

						<h2>Интересует какая-то конкретная модель?</h2>

						<span class="first">Уже через 60 минут <span class="blue">бесплатно</span>.</span>

						<span class="second">Получите <span class="blue">5 лучших вариантов автомобилей</span>, <br />которые сейчас есть на аукционе.</span>

					</div>



					<div class="right">

						<div class="form-box">

							<?php echo do_shortcode('[contact-form-7 id="103" title="Контактная форма 1"]'); ?>

						</div>

					</div>

				</div>

			</div>

		</section>


		<section class="blog">

			<div class="container">

				<div class="blog-content">

					<h2>Блог и новости</h2>

					<div class="blog-meta">

                    <span>Актуальные новости и статьи у нас в блоге</span> <span><a href="<?php echo get_site_url(); ?>/blog/">Читать все <img src="<?php echo get_site_url(); ?>/wp-content/themes/amerika/img/arrow.svg" alt="" aria-hidden="true"></a></span>

					</div>

					<div class="blog-grids">

						<?php ShowBlog() ?>

					</div>

				</div>

				</div>

			</div>

		</section>

	</main>



<?php
get_footer();
