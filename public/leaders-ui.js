// Shared UI used by both the homepage and the Leaders collection page:
// card rendering + the profile modal. Exposes window.KL.{cardHTML, openModal}.
window.KL = window.KL || {};
(function () {
  const leaders = window.LEADERS || [];
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");

  const loc = (l) => (window.locLeader ? window.locLeader(l) : l);
  const ll = (k, v) => (window.locLabel ? window.locLabel(k, v) : v);
  const T = (k, e) => (window.t ? window.t(k, e) : e);

  function cardHTML(l) {
    const x = loc(l);
    const img = (window.LEADER_IMAGES || {})[l.id];
    const photo = img
      ? `<div class="card-photo">
           <img src="${img}" alt="Portrait of ${l.name}" loading="lazy" onerror="this.closest('.card-photo').classList.add('no-img')">
           <span class="card-photo-fallback">${l.flag}</span>
         </div>`
      : `<div class="card-photo no-img"><span class="card-photo-fallback">${l.flag}</span></div>`;
    return `
      <button class="card" data-id="${l.id}">
        ${photo}
        <div class="card-body">
          <div class="card-top">
            <span class="card-flag">${l.flag}</span>
            <span class="card-era ${l.era}">${ll("era", l.era)}</span>
          </div>
          <h3>${l.name}</h3>
          <div class="card-meta">${ll("country", l.country)} · ${l.years}</div>
          <div class="card-role">${x.role}</div>
          <div class="card-tagline">${x.tagline}</div>
          <div class="card-cat">${ll("category", l.category)}</div>
        </div>
      </button>`;
  }

  function openModal(id) {
    if (!modal || !modalContent) return;
    const l = leaders.find((x) => x.id === id);
    if (!l) return;
    const x = loc(l);
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
      <div class="modal-meta">${ll("country", l.country)} · ${l.years}</div>
      <div class="modal-role">${x.role}</div>
      <p class="modal-tagline">${x.tagline}</p>
      <div class="modal-section"><h4>${T("lbl_rise", "The rise")}</h4><p>${x.rise}</p></div>
      <div class="modal-section"><h4>${T("lbl_did", "What they did")}</h4><p>${x.did}</p></div>
      <div class="modal-section"><h4>${T("lbl_full", "The full picture")}</h4><p>${x.fullPicture}</p></div>
      <div class="modal-section"><h4>${T("lbl_why", "Why it matters")}</h4><p>${x.why}</p></div>
      <blockquote class="modal-quote">“${x.quote}”</blockquote>`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-close")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  window.KL.cardHTML = cardHTML;
  window.KL.openModal = openModal;
  window.KL.closeModal = closeModal;
})();
