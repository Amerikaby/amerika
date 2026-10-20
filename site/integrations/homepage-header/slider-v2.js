(() => {
  const root = document.querySelector("#amz-hero-v2 .car-showcase");
  if (!root) return;
  const slides = [...root.querySelectorAll(".car-slide")];
  const options = [...root.querySelectorAll(".car-option")];
  const title = root.querySelector(".car-title");
  const price = root.querySelector(".car-price");
  const priceFormat = new Intl.NumberFormat("ru-RU", {maximumFractionDigits: 0});
  const pause = root.querySelector(".car-pause");
  const status = root.querySelector(".slider-sr");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0, timer, paused = reduced.matches, hovered = false, inView = true;
  function canRun() {
    return !paused && !hovered && !document.hidden && inView && !root.contains(document.activeElement);
  }
  function schedule() {
    clearTimeout(timer);
    if (canRun()) timer = setTimeout(() => show(index + 1), 6000);
  }
  function updatePrice() {
    if (!price) return;
    const value = Number(slides[index].dataset.price);
    const hasPrice = Number.isFinite(value) && value > 0;
    price.hidden = !hasPrice;
    price.textContent = hasPrice ? "Примерная цена в Минске с ремонтом — от " + priceFormat.format(value) + " $" : "";
  }
  function show(next, manual = false) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
      slide.setAttribute("aria-hidden", String(i !== index));
      options[i].setAttribute("aria-pressed", String(i === index));
    });
    title.textContent = slides[index].dataset.name;
    updatePrice();
    root.dataset.active = String(index);
    if (manual) status.textContent = title.textContent;
    schedule();
  }
  function setPause(value) {
    paused = value;
    pause.querySelector(".car-icon-play").toggleAttribute("hidden", !paused);
    pause.querySelector(".car-icon-pause").toggleAttribute("hidden", paused);
    pause.setAttribute("aria-label", paused ? "Включить автопереключение" : "Остановить автопереключение");
    pause.setAttribute("aria-pressed", String(paused));
    root.dataset.paused = String(paused);
    schedule();
  }
  options.forEach((button,i) => button.addEventListener("click", () => show(i,true)));
  root.querySelector(".car-prev").addEventListener("click", () => show(index-1,true));
  root.querySelector(".car-next").addEventListener("click", () => show(index+1,true));
  pause.addEventListener("click", () => setPause(!paused));
  root.addEventListener("mouseenter", () => { hovered = true; schedule(); });
  root.addEventListener("mouseleave", () => { hovered = false; schedule(); });
  root.addEventListener("focusin", schedule);
  root.addEventListener("focusout", () => setTimeout(schedule,0));
  root.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault(); show(index + (e.key === "ArrowRight" ? 1 : -1),true);
    }
  });
  let start;
  const stage = root.querySelector(".car-stage");
  stage.addEventListener("pointerdown", e => { start = {x:e.clientX,y:e.clientY}; });
  stage.addEventListener("pointerup", e => {
    if (!start) return;
    const dx=e.clientX-start.x,dy=e.clientY-start.y;
    if (Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)*1.4) show(index+(dx<0?1:-1),true);
    start=null;
  });
  stage.addEventListener("pointercancel", () => {start=null;});
  document.addEventListener("visibilitychange", schedule);
  reduced.addEventListener("change", () => setPause(reduced.matches));
  new IntersectionObserver(entries => {inView=entries[0].isIntersecting;schedule();},{threshold:.25}).observe(root);
  updatePrice();
  setPause(paused);
})();
