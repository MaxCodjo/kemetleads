(function () {
  const modal = document.getElementById("modal");
  const leaders = window.LEADERS || [];
  const openModal = (window.KL && window.KL.openModal) || function () {};

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const statCount = document.getElementById("stat-count");
  if (statCount) statCount.textContent = leaders.length;

  // Featured Leaders slideshow
  const slidesEl = document.getElementById("slides");
  const dotsEl = document.getElementById("slide-dots");
  const counterEl = document.getElementById("slide-counter");
  let slideIndex = 0;
  let slideTimer = null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let playing = false;

  function slideHTML(l) {
    const img = (window.LEADER_IMAGES || {})[l.id];
    const photo = img
      ? `<div class="slide-photo">
           <img src="${img}" alt="Portrait of ${l.name}" loading="lazy" onerror="this.closest('.slide-photo').classList.add('no-img')">
           <span class="slide-photo-fallback">${l.flag}</span>
           <span class="slide-flag-badge">${l.flag}</span>
         </div>`
      : `<div class="slide-photo no-img"><span class="slide-photo-fallback">${l.flag}</span></div>`;
    return `
      <div class="slide" data-id="${l.id}">
        ${photo}
        <div class="slide-body">
          <span class="card-era ${l.era}">${l.era}</span>
          <h3>${l.name}</h3>
          <div class="slide-meta">${l.country} · ${l.years}</div>
          <div class="slide-role">${l.role}</div>
          <p class="slide-tagline">${l.tagline}</p>
          <blockquote class="slide-quote">“${l.quote}”</blockquote>
          <div class="slide-actions">
            <button class="btn btn-sm slide-cta" data-open-id="${l.id}">Read full profile →</button>
            <a class="btn btn-sm btn-ghost" href="leaders.html">Explore the leaders</a>
          </div>
        </div>
      </div>`;
  }

  function showSlide(i) {
    const slides = slidesEl.querySelectorAll(".slide");
    const dots = dotsEl.querySelectorAll(".dot");
    if (!slides.length) return;
    slideIndex = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === slideIndex));
    dots.forEach((d, k) => d.classList.toggle("active", k === slideIndex));
    counterEl.textContent = `${slideIndex + 1} / ${slides.length}`;
  }

  function nextSlide() { showSlide(slideIndex + 1); }
  function prevSlide() { showSlide(slideIndex - 1); }

  function startAuto() {
    stopAuto();
    slideTimer = setInterval(nextSlide, 5500);
  }
  function stopAuto() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = null;
  }
  const toggleBtn = document.getElementById("slide-toggle");
  function setPlaying(on) {
    playing = on;
    if (on) startAuto();
    else stopAuto();
    if (toggleBtn) {
      toggleBtn.textContent = on ? "❚❚" : "▶";
      toggleBtn.setAttribute("aria-label", on ? "Pause slideshow" : "Play slideshow");
    }
  }

  if (slidesEl && leaders.length) {
    slidesEl.innerHTML = leaders.map(slideHTML).join("");
    dotsEl.innerHTML = leaders
      .map((_, i) => `<button class="dot" data-i="${i}" aria-label="Go to leader ${i + 1}"></button>`)
      .join("");
    showSlide(0);
    setPlaying(!reduceMotion);
    if (toggleBtn) toggleBtn.addEventListener("click", () => setPlaying(!playing));

    const keepPlaying = () => { if (playing) startAuto(); };
    document.getElementById("slide-next").addEventListener("click", () => { nextSlide(); keepPlaying(); });
    document.getElementById("slide-prev").addEventListener("click", () => { prevSlide(); keepPlaying(); });
    dotsEl.addEventListener("click", (e) => {
      const dot = e.target.closest(".dot");
      if (!dot) return;
      showSlide(parseInt(dot.dataset.i, 10));
      keepPlaying();
    });
    slidesEl.addEventListener("click", (e) => {
      if (e.target.closest("a")) return; // let links (Explore the leaders) navigate
      const btn = e.target.closest("[data-open-id]");
      const slide = e.target.closest(".slide");
      const id = btn ? btn.dataset.openId : slide ? slide.dataset.id : null;
      if (id) openModal(id);
    });
    const shell = document.getElementById("slideshow");
    shell.addEventListener("mouseenter", stopAuto);
    shell.addEventListener("mouseleave", keepPlaying);
    document.addEventListener("keydown", (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || "");
      if (typing || !modal.hidden) return;
      if (e.key === "ArrowRight") { nextSlide(); keepPlaying(); }
      if (e.key === "ArrowLeft") { prevSlide(); keepPlaying(); }
    });
  }

  // News commentary ("The Brief")
  const newsList = document.getElementById("news-list");
  const news = window.NEWS || [];
  if (newsList) {
    newsList.innerHTML = news.map(newsHTML).join("");
  }

  function newsHTML(n) {
    return `
      <article class="news-item">
        <div class="news-tags">
          <span class="news-topic">${n.topic}</span>
          <span class="news-region">${n.region}</span>
          <span class="news-date">${n.date}</span>
        </div>
        <h3>${n.headline}</h3>
        <p class="news-summary">${n.summary}</p>
        <div class="news-take">
          <span class="news-take-label">The KemetLeads take</span>
          <p>${n.take}</p>
        </div>
      </article>`;
  }

  // Newsletter signup
  const form = document.getElementById("subscribe-form");
  const msg = document.getElementById("form-msg");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    msg.className = "form-msg";
    msg.textContent = "Subscribing…";
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        msg.classList.add("ok");
        msg.textContent = data.message || "You're on the list!";
        form.reset();
      } else {
        msg.classList.add("err");
        msg.textContent = data.error || "Something went wrong.";
      }
    } catch (err) {
      msg.classList.add("err");
      msg.textContent = "Network error — please try again.";
    }
  });

  render();
})();
