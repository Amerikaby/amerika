Small return-to-top button — published 2026-10-20

Install amz-back-to-top.php in wp-content/mu-plugins/.
The control appears after scrolling beyond max(500px, 80% of viewport height).
It is 40px on desktop and 38px on mobile, positioned above the chat launcher.
It scrolls smoothly to the top, respects reduced motion, and stays hidden when
the mobile navigation menu is open. CSS is scoped to its unique element ID.

Live checks: desktop and 375px mobile, click returns to scrollY=0, the control
hides at the top and in the open mobile menu, and no horizontal overflow occurs.

Separately, the site owner requested temporarily disabling Google reCAPTCHA.
The Contact Form 7 reCAPTCHA option was backed up privately and cleared through
the CF7 settings API. Neither a badge-hiding CSS workaround nor a global spam
bypass was added. The existing honeypot and normal form validation remain.
The final page contains no reCAPTCHA script, iframe or response input.
A marked test form was accepted and delivered through the normal lead pipeline.

Compact mobile chat and AutoCheck — published 2026-10-20

Install amz-mobile-widgets.php in wp-content/mu-plugins/.
At widths up to 767px the existing Jivo label becomes a 46px circle at bottom
right, while the original .free-autocheck Bootstrap trigger becomes a 172x40px
pill at bottom left. Both stay clear of the return-to-top button and hide while
the mobile navigation or a Bootstrap modal is open.

Jivo's existing #jvLabelWrap element remains in place, preserving document-level
capture analytics. The mobile click uses the documented jivo_api.open method:
https://www.jivo.ru/docs/widget/#open
The original inner label is hidden in the compact design, so relying on its
native child click area does not work. The existing chat, callbacks, contact
handling, AutoCheck form 13312 and desktop widget styles are retained.
Mobile accessibility attributes are restored to their original values on desktop.
The Jivo window is constrained to the narrow viewport and its close button
is placed inside the upper-right corner above the chat header.

AutoCheck is emitted after wp_footer in the existing theme. The enhancement
therefore handles its late insertion, along with Jivo's lazy-loaded markup.

Live checks at 320px and 390px: the launchers do not overlap each other or the
return-to-top control; AutoCheck opens its existing form; Jivo opens and closes
with its close button inside the viewport. Desktop label sizes and attributes
return to their original values at 1280px. PHP lint passes.
