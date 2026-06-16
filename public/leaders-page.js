// Leaders collection page: render the full roster grouped by theme or era,
// with live search. Reuses window.KL.{cardHTML, openModal}.
(function () {
  const leaders = window.LEADERS || [];
  const container = document.getElementById("collection");
  const empty = document.getElementById("empty");
  const search = document.getElementById("search");
  const groupmode = document.getElementById("groupmode");

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  let mode = "theme";
  let query = "";

  // Display order for thematic groups.
  const THEME_ORDER = [
    "Politics & Liberation",
    "Politics & Governance",
    "Global Institutions",
    "Business & Enterprise",
    "Culture & Ideas",
    "Science & Environment",
    "Sport & Society",
  ];

  const ERA_GROUPS = [
    { key: "past", label: "Past — the legacy" },
    { key: "present", label: "Present — shaping today" },
  ];

  function matches(l) {
    if (!query) return true;
    const hay = `${l.name} ${l.country} ${l.category} ${l.role} ${l.tagline}`.toLowerCase();
    return hay.includes(query);
  }

  function groups() {
    const list = leaders.filter(matches);
    if (mode === "era") {
      return ERA_GROUPS.map((g) => ({
        label: g.label,
        items: list.filter((l) => l.era === g.key),
      })).filter((g) => g.items.length);
    }
    // theme
    const byCat = {};
    list.forEach((l) => {
      (byCat[l.category] = byCat[l.category] || []).push(l);
    });
    const ordered = THEME_ORDER.filter((c) => byCat[c]).map((c) => ({ label: c, items: byCat[c] }));
    // include any categories not in THEME_ORDER, just in case
    Object.keys(byCat)
      .filter((c) => !THEME_ORDER.includes(c))
      .forEach((c) => ordered.push({ label: c, items: byCat[c] }));
    return ordered;
  }

  function render() {
    const gs = groups();
    container.innerHTML = gs
      .map(
        (g) => `
        <div class="group">
          <div class="group-head">
            <h2 class="group-title">${g.label}</h2>
            <span class="group-count">${g.items.length}</span>
          </div>
          <div class="grid">${g.items.map(window.KL.cardHTML).join("")}</div>
        </div>`
      )
      .join("");
    empty.hidden = gs.length > 0;
    container.querySelectorAll(".card").forEach((el) => {
      el.addEventListener("click", () => window.KL.openModal(el.dataset.id));
    });
  }

  groupmode.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    groupmode.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    mode = btn.dataset.mode;
    render();
  });

  search.addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    render();
  });

  render();
})();
