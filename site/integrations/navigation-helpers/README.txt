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

Compact mobile chat — published 2026-10-20, updated 2026-10-21

Install amz-mobile-widgets.php in wp-content/mu-plugins/.
At widths up to 767px the existing Jivo label becomes a 46px circle at bottom
right. It stays clear of the return-to-top button and hides while the mobile
navigation or a Bootstrap modal is open.

On 2026-10-21 the owner requested removing Free AutoCheck entirely from the
floating interface. Its launcher and modal are removed in the theme footer
(see ../homepage-header/footer.php); the former compact AutoCheck rules and
enhancement are removed from this plugin. The CF7 record itself is retained.

Jivo's existing #jvLabelWrap element remains in place, preserving document-level
capture analytics. The mobile click uses the documented jivo_api.open method:
https://www.jivo.ru/docs/widget/#open
The original inner label is hidden in the compact design, so relying on its
native child click area does not work. The existing chat, callbacks, contact
handling and desktop chat styles are retained.
Mobile accessibility attributes are restored to their original values on desktop.
The Jivo window is constrained to the narrow viewport and its close button
is placed inside the upper-right corner above the chat header.

The enhancement handles Jivo's lazy-loaded markup.

Live checks at 320px and 390px: the chat launcher does not overlap the
return-to-top control; Jivo opens and closes
with its close button inside the viewport. Desktop label sizes and attributes
return to their original values at 1280px. PHP lint passes.
