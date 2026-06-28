/* Render "The Brief" news list. Used on the Analysis page (home renders it via app.js). */
(function () {
  const list = document.getElementById("news-list");
  if (!list) return;
  const T = (k, e) => (window.t ? window.t(k, e) : e);

  function items() {
    const base = window.NEWS || [];
    const fr = window.klLang && window.klLang() === "fr" && Array.isArray(window.NEWS_FR);
    return base.map((n, i) => (fr && window.NEWS_FR[i] ? Object.assign({}, n, window.NEWS_FR[i]) : n));
  }

  function render() {
    list.innerHTML = items()
      .map(
        (n) => `
      <article class="news-item">
        <div class="news-tags">
          <span class="news-topic">${n.topic}</span>
          <span class="news-region">${n.region}</span>
          <span class="news-date">${n.date}</span>
        </div>
        <h3>${n.headline}</h3>
        <p class="news-summary">${n.summary}</p>
        <div class="news-take">
          <span class="news-take-label">${T("take_label", "The KemetLeads take")}</span>
          <p>${n.take}</p>
        </div>
      </article>`
      )
      .join("");
  }

  render();
  window.addEventListener("kl-lang", render);
})();
