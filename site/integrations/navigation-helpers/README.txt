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
