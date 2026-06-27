/* Render "The Brief" news list. Used on the Analysis page (home renders it via app.js). */
(function () {
  const list = document.getElementById("news-list");
  if (!list) return;
  const news = window.NEWS || [];
  list.innerHTML = news
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
          <span class="news-take-label">The KemetLeads take</span>
          <p>${n.take}</p>
        </div>
      </article>`
    )
    .join("");
})();
