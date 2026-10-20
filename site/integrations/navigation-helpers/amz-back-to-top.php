<?php
/**
 * Plugin Name: Amerika — Back to top
 * Description: A small, accessible return-to-top button that stays clear of the chat and mobile menu.
 * Version: 1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'wp_footer', static function () {
	if ( is_admin() ) {
		return;
	}
	?>
	<style id="amz-back-to-top-style">
		#amz-back-to-top {
			appearance: none;
			box-sizing: border-box;
			position: fixed;
			right: calc(18px + env(safe-area-inset-right, 0px));
			bottom: calc(92px + env(safe-area-inset-bottom, 0px));
			z-index: 20;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			min-width: 0;
			min-height: 0;
			margin: 0;
			padding: 0;
			border: 1px solid rgba(20, 38, 61, .18);
			border-radius: 50%;
			background: rgba(248, 246, 240, .88);
			color: #14263d;
			font-size: 0;
			line-height: 1;
			text-indent: 0;
			box-shadow: 0 2px 8px rgba(20, 38, 61, .06);
			cursor: pointer;
			touch-action: manipulation;
			-webkit-tap-highlight-color: transparent;
		}
		#amz-back-to-top[hidden] {
			display: none !important;
		}
		#amz-back-to-top::before,
		#amz-back-to-top::after {
			display: none;
			content: none;
		}
		#amz-back-to-top svg {
			display: block;
			flex: none;
			width: 19px;
			height: 19px;
			margin: 0;
			pointer-events: none;
		}
		#amz-back-to-top:focus-visible {
			outline: 2px solid #14263d;
			outline-offset: 3px;
		}
		@media (hover: hover) {
			#amz-back-to-top:hover {
				background: #f8f6f0;
				border-color: rgba(20, 38, 61, .42);
			}
		}
		@media (max-width: 700px) {
			#amz-back-to-top {
				width: 38px;
				height: 38px;
				right: calc(14px + env(safe-area-inset-right, 0px));
				bottom: calc(96px + env(safe-area-inset-bottom, 0px));
			}
		}
	</style>
	<button id="amz-back-to-top" type="button" aria-label="Наверх" title="Наверх" hidden>
		<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 15 6-6 6 6"/></svg>
	</button>
	<script id="amz-back-to-top-script" data-nowprocket>
	(() => {
		"use strict";
		const button = document.getElementById("amz-back-to-top");
		if (!button) return;
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const menuSelector = '.rmp_menu_trigger[aria-expanded="true"]';
		let frame = 0;

		function update() {
			const top = window.scrollY || document.documentElement.scrollTop || 0;
			const threshold = Math.max(500, window.innerHeight * 0.8);
			button.hidden = top <= threshold || Boolean(document.querySelector(menuSelector));
		}

		function scheduleUpdate() {
			if (frame) return;
			frame = window.requestAnimationFrame(() => {
				frame = 0;
				update();
			});
		}

		button.addEventListener("click", () => {
			window.scrollTo({
				top: 0,
				left: window.scrollX,
				behavior: reducedMotion.matches ? "instant" : "smooth"
			});
		});
		window.addEventListener("scroll", scheduleUpdate, {passive: true});
		window.addEventListener("resize", scheduleUpdate, {passive: true});
		window.addEventListener("pageshow", scheduleUpdate);

		// Responsive Menu updates this attribute when its mobile panel opens or closes.
		new MutationObserver(changes => {
			if (changes.some(change => change.target.matches(".rmp_menu_trigger"))) {
				scheduleUpdate();
			}
		}).observe(document.body, {
			subtree: true,
			attributes: true,
			attributeFilter: ["aria-expanded"]
		});

		update();
	})();
	</script>
	<?php
}, 99 );
