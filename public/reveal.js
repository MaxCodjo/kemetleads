/* Scroll-reveal for sections. Respects reduced-motion; above-fold shows instantly. */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const els = document.querySelectorAll("main section");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => {
    // Already in view at load → show with no animation (no hero flash).
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("reveal");
    io.observe(el);
  });
})();
