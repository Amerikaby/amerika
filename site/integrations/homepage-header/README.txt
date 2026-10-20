Production homepage and header integration — 2026-10-20
Live page: https://amerika.by/

These files preserve the approved six-car homepage hero and current theme header.
The original homepage content after the hero remains unchanged.

Deployment mapping for the active WordPress theme:
header.php -> wp-content/themes/amerika/header.php
home.php -> wp-content/themes/amerika/templates/home.php
header.css, header.js -> wp-content/themes/amerika/assets/header-20261020/
hero-v2.css, slider-v2.js -> wp-content/themes/amerika/assets/hero-20261020/
amzb-phone-ui.php -> wp-content/mu-plugins/amzb-phone-ui.php

The hero uses the existing equinox.webp, escape.webp, jeep.webp, jetta.webp,
w223.webp and x6.webp images in the hero assets directory.

Behavior:
- At the top, show the secondary links plus the main menu and full phone.
- Scrolling down hides navigation; scrolling up reveals the compact main menu.
- On mobile, a translucent call link stays visible while navigation is hidden.
- Opening the mobile menu or keyboard-focusing navigation reveals the header.
- All phone links remain visible and directly callable; phone_click and form
  analytics are retained. The obsolete phone reveal step is removed.
- SVG slider controls are centered independently of theme font metrics.
- Price captions are supported through optional positive numeric data-price
  attributes on each figure. No prices are set or published pending confirmation.

Verification:
PHP lint and JavaScript syntax checks passed. Live browser checks covered desktop,
mobile and tablet navigation, the scroll directions, mobile submenus, direct tel
links, six model selectors, previous/next, pause/play and the retail calculator.
No horizontal overflow was observed at the checked widths 390, 1024 and 1100.
The original lower homepage template fragment is byte-for-byte unchanged.

Before future changes download the current production files and compare hashes.
Private backups and guarded deployment scripts are retained outside the webroot;
this repository contains the public website UI only.
