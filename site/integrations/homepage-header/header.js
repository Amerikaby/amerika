(() => {
  function start() {
    const header = document.querySelector("#masthead.amzh-smart");
    if (!header) return;
    let lastY = scrollY, direction = 0, travel = 0, queued = false, keyboard = false;
    const menuButton = header.querySelector(".rmp_menu_trigger");
    const floatingPhone = document.querySelector(".amzb-floating-phone");
    const mobile = matchMedia("(max-width:1024px)");
    const menuOpen = () => menuButton?.getAttribute("aria-expanded") === "true";
    function syncPhone() {
      if (!floatingPhone) return;
      floatingPhone.hidden = !(mobile.matches && header.classList.contains("is-hidden") && !menuOpen());
    }
    function show() {
      header.classList.remove("is-hidden");
      syncPhone();
    }
    function update() {
      queued = false;
      const y = Math.max(0, Math.min(scrollY, document.documentElement.scrollHeight - innerHeight));
      const delta = y - lastY;
      header.classList.toggle("is-compact", y > 100);
      if (y <= 16 || menuOpen() || (keyboard && header.contains(document.activeElement))) {
        show(); travel = 0;
      } else if (Math.abs(delta) > 0) {
        const nextDirection = Math.sign(delta);
        if (nextDirection !== direction) { travel = 0; direction = nextDirection; }
        travel += Math.abs(delta);
        if (direction > 0 && y > 110 && travel >= 16) header.classList.add("is-hidden");
        if (direction < 0 && travel >= 12) show();
      }
      syncPhone();
      lastY = y;
    }
    addEventListener("scroll", () => {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    addEventListener("keydown", e => { if (e.key === "Tab") keyboard = true; });
    addEventListener("pointerdown", () => { keyboard = false; }, { passive: true });
    header.addEventListener("focusin", () => { if (keyboard) show(); });
    if (menuButton) new MutationObserver(() => { if (menuOpen()) show(); else syncPhone(); })
      .observe(menuButton, { attributes: true, attributeFilter: ["aria-expanded"] });
    addEventListener("resize", () => { lastY = scrollY; travel = 0; update(); });
    update();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
