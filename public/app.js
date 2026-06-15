(function () {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const search = document.getElementById("search");
  const filters = document.getElementById("filters");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  const leaders = window.LEADERS || [];

  let activeFilter = "all";
  let query = "";

  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("stat-count").textContent = leaders.length;

  function matches(l) {
    if (activeFilter !== "all" && l.era !== activeFilter) return false;
    if (!query) return true;
    const hay = `${l.name} ${l.country} ${l.category} ${l.role} ${l.tagline}`.toLowerCase();
    return hay.includes(query);
  }

  function render() {
    const list = leaders.filter(matches);
    grid.innerHTML = list.map(cardHTML).join("");
    empty.hidden = list.length > 0;
    grid.querySelectorAll(".card").forEach((el) => {
      el.addEventListener("click", () => openModal(el.dataset.id));
    });
  }

  function cardHTML(l) {
    return `
      <button class="card" data-id="${l.id}">
        <div class="card-top">
          <span class="card-flag">${l.flag}</span>
          <span class="card-era ${l.era}">${l.era}</span>
        </div>
        <h3>${l.name}</h3>
        <div class="card-meta">${l.flag ? "" : ""}${l.country} · ${l.years}</div>
        <div class="card-role">${l.role}</div>
        <div class="card-tagline">${l.tagline}</div>
        <div class="card-cat">${l.category}</div>
      </button>`;
  }

  function openModal(id) {
    const l = leaders.find((x) => x.id === id);
    if (!l) return;
    const img = (window.LEADER_IMAGES || {})[l.id];
    const visual = img
      ? `<div class="modal-portrait-wrap">
           <span class="modal-flag-fallback">${l.flag}</span>
           <img class="modal-portrait" src="${img}" alt="Portrait of ${l.name}" loading="lazy" onerror="this.style.display='none'">
         </div>`
      : `<div class="modal-flag">${l.flag}</div>`;
    modalContent.innerHTML = `
      ${visual}
      <h2 id="modal-name">${l.name}</h2>
      <div class="modal-meta">${l.country} · ${l.years}</div>
      <div class="modal-role">${l.role}</div>
      <p class="modal-tagline">${l.tagline}</p>
      <div class="modal-section"><h4>The rise</h4><p>${l.rise}</p></div>
      <div class="modal-section"><h4>What they did</h4><p>${l.did}</p></div>
      <div class="modal-section"><h4>The full picture</h4><p>${l.fullPicture}</p></div>
      <div class="modal-section"><h4>Why it matters</h4><p>${l.why}</p></div>
      <blockquote class="modal-quote">“${l.quote}”</blockquote>`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  modal.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    filters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });

  search.addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    render();
  });

  // Featured Leaders slideshow
  const slidesEl = document.getElementById("slides");
  const dotsEl = document.getElementById("slide-dots");
  const counterEl = document.getElementById("slide-counter");
  let slideIndex = 0;
  let slideTimer = null;

  function slideHTML(l) {
    const img = (window.LEADER_IMAGES || {})[l.id];
    const visual = img
      ? `<div class="slide-portrait-wrap">
           <span class="slide-flag-fallback">${l.flag}</span>
           <img class="slide-portrait" src="${img}" alt="Portrait of ${l.name}" loading="lazy" onerror="this.style.display='none'">
           <span class="slide-flag-badge">${l.flag}</span>
         </div>`
      : `<span class="slide-flag">${l.flag}</span>`;
    return `
      <div class="slide" data-id="${l.id}">
        ${visual}
        <span class="card-era ${l.era}">${l.era}</span>
        <h3>${l.name}</h3>
        <div class="slide-meta">${l.country} · ${l.years}</div>
        <div class="slide-role">${l.role}</div>
        <p class="slide-tagline">${l.tagline}</p>
        <blockquote class="slide-quote">“${l.quote}”</blockquote>
        <button class="btn btn-sm slide-cta" data-open-id="${l.id}">Read full profile →</button>
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

  if (slidesEl && leaders.length) {
    slidesEl.innerHTML = leaders.map(slideHTML).join("");
    dotsEl.innerHTML = leaders
      .map((_, i) => `<button class="dot" data-i="${i}" aria-label="Go to leader ${i + 1}"></button>`)
      .join("");
    showSlide(0);
    startAuto();

    document.getElementById("slide-next").addEventListener("click", () => { nextSlide(); startAuto(); });
    document.getElementById("slide-prev").addEventListener("click", () => { prevSlide(); startAuto(); });
    dotsEl.addEventListener("click", (e) => {
      const dot = e.target.closest(".dot");
      if (!dot) return;
      showSlide(parseInt(dot.dataset.i, 10));
      startAuto();
    });
    slidesEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-id]");
      const slide = e.target.closest(".slide");
      const id = btn ? btn.dataset.openId : slide ? slide.dataset.id : null;
      if (id) openModal(id);
    });
    const shell = document.getElementById("slideshow");
    shell.addEventListener("mouseenter", stopAuto);
    shell.addEventListener("mouseleave", startAuto);
    document.addEventListener("keydown", (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || "");
      if (typing || !modal.hidden) return;
      if (e.key === "ArrowRight") { nextSlide(); startAuto(); }
      if (e.key === "ArrowLeft") { prevSlide(); startAuto(); }
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
