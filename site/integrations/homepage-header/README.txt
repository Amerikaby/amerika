Production homepage and header integration — 2026-10-20
Live page: https://amerika.by/

These files preserve the approved six-car homepage hero and current theme header.
The original homepage content after the hero remains unchanged.

Deployment mapping for the active WordPress theme:
header.php -> wp-content/themes/amerika/header.php
footer.php -> wp-content/themes/amerika/footer.php
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
- On 2026-10-21 the owner confirmed 10+ years of experience and an Equinox price
  starting at $13,500 including delivery and repair. This price appears as a
  small static caption inside the Equinox selector; other models have no price.
  The optional data-price-based caption below the selectors remains unused.

Verification:
PHP lint and JavaScript syntax checks passed. Live browser checks covered desktop,
mobile and tablet navigation, the scroll directions, mobile submenus, direct tel
links, six model selectors, previous/next, pause/play and the retail calculator.
No horizontal overflow was observed at the checked widths 390, 1024 and 1100.
The original lower homepage template fragment is byte-for-byte unchanged.

Before future changes download the current production files and compare hashes.
Private backups and guarded deployment scripts are retained outside the webroot;
this repository contains the public website UI only.

On 2026-10-21 the owner removed the floating Free AutoCheck promotion on all
screen sizes. Its launcher and associated modal are no longer rendered by
footer.php. Existing CF7 records, other forms and Jivo are retained.

When deploying edited CSS, clear the WP Rocket minified CSS cache as well as
the page cache: rocket_clean_minify(['css']), then rocket_clean_domain().
Clearing only the page cache can keep an old CSS copy despite an enqueue version bump.
