/* Day/Night theme toggle. Initial theme is set inline in <head> to avoid a flash. */
(function () {
  const root = document.documentElement;
  function apply(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (_e) {}
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      const dark = t === "dark";
      btn.textContent = dark ? "☀" : "☾";
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    apply(root.getAttribute("data-theme") || "light");
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", () =>
      apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark")
    );
  });
})();
