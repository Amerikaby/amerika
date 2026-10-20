Retail calculator integration for the existing WordPress website
Published: 2026-10-20
Public page: https://amerika.by/kalkulyator/

This directory preserves the public UI used on the production page. It does not
replace the theme header, footer, wholesale calculator or customs calculator.

Placement in the active amerika theme:
- templates/retail-template.php
- assets/retail-20261020/retail-body.php
- assets/retail-20261020/retail.css
- assets/retail-20261020/retail.js
- wp-content/mu-plugins/amz-retail-assets.php

Server dependency:
assets/retail-20261020/rates.php supplies final public sea rates as RETAIL_RATES.
The server-side pricing adapter and its source tariff table are maintained
privately and are intentionally not included in this public repository.
Expected shape: {copart:{"YARD - ST":{car:1500,moto:1100}},iaai:{...}}.
Use current rates from the server; do not copy a stale generated cache file.

WordPress option amz_retail_form_id points to the native Contact Form 7 form.
Its fields are your-name, mask-644, calc-params, calc-result, post-url and
post-title. The production outbox integration delivers the form with its
calculation. The copied summary is refreshed before submission.

Navigation:
- The existing hardcoded desktop calculator submenu includes /kalkulyator/.
- The WordPress mobile and footer calculator menus include the same address.
- The homepage "Посчитать цену" link points to /kalkulyator/.

Verification:
- Every supplied yard and both vehicle types were checked against the current
  server tariff adapter; reverse budget tests and invalid input checks passed.
- The desktop and mobile UI, native menus and homepage link were checked live.
- One clearly marked test form reached CRM and Telegram with the calculation.
- Existing wholesale script and data hashes remained unchanged.

WP Rocket caches PHP-generated JavaScript separately from ordinary minification.
The MU plugin excludes this directory from static dynamic resource caching,
minification and query-string cache busting. Keep this exclusion loaded before
the optimizer is initialized. All calculator styles are scoped to
#amz-retail-calc, including Bootstrap row-child and fixed-header offsets.
