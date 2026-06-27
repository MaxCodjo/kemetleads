/* Email + password sign-up / log-in. Renders nav auth state and a self-contained modal. */
(function () {
  const navAuth = document.getElementById("nav-auth");
  if (!navAuth) return;

  const S = {
    en: {
      login: "Log in", signup: "Sign up", logout: "Log out",
      title_signup: "Create your account", title_login: "Welcome back",
      submit_signup: "Create account", submit_login: "Log in",
      pass_signup: "Password (min 8 characters)", pass_login: "Password",
      to_login_text: "Already have an account?", to_login_link: "Log in",
      to_signup_text: "New here?", to_signup_link: "Create an account",
      email_ph: "you@example.com",
    },
    fr: {
      login: "Connexion", signup: "Inscription", logout: "Déconnexion",
      title_signup: "Créez votre compte", title_login: "Bon retour",
      submit_signup: "Créer le compte", submit_login: "Se connecter",
      pass_signup: "Mot de passe (8 caractères min)", pass_login: "Mot de passe",
      to_login_text: "Vous avez déjà un compte ?", to_login_link: "Connexion",
      to_signup_text: "Nouveau ?", to_signup_link: "Créer un compte",
      email_ph: "vous@exemple.com",
    },
  };
  const lang = () => { try { return localStorage.getItem("lang") === "fr" ? "fr" : "en"; } catch (_e) { return "en"; } };
  const t = (k) => S[lang()][k];

  let me = null;   // { email } or null
  let mode = "signup";

  // --- Modal (built once) ---
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "auth-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="modal-backdrop" data-auth-close></div>
    <article class="modal-card auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button class="modal-close" data-auth-close aria-label="Close">×</button>
      <h2 id="auth-title"></h2>
      <form id="auth-form" class="auth-form" novalidate>
        <input type="email" id="auth-email" autocomplete="email" required />
        <input type="password" id="auth-password" autocomplete="current-password" required />
        <button type="submit" class="btn btn-block" id="auth-submit"></button>
      </form>
      <p class="auth-msg" id="auth-msg" role="status"></p>
      <p class="auth-switch"><span id="auth-switch-text"></span> <a href="#" id="auth-switch-link"></a></p>
    </article>`;
  document.body.appendChild(modal);

  const $ = (id) => modal.querySelector("#" + id);
  const emailEl = $("auth-email"), passEl = $("auth-password"), msgEl = $("auth-msg");

  function paintModal() {
    const signup = mode === "signup";
    $("auth-title").textContent = signup ? t("title_signup") : t("title_login");
    $("auth-submit").textContent = signup ? t("submit_signup") : t("submit_login");
    emailEl.placeholder = t("email_ph");
    passEl.placeholder = signup ? t("pass_signup") : t("pass_login");
    passEl.autocomplete = signup ? "new-password" : "current-password";
    $("auth-switch-text").textContent = signup ? t("to_login_text") : t("to_signup_text");
    $("auth-switch-link").textContent = signup ? t("to_login_link") : t("to_signup_link");
  }
  function open(m) { mode = m; msgEl.textContent = ""; msgEl.className = "auth-msg"; paintModal(); modal.hidden = false; document.body.style.overflow = "hidden"; emailEl.focus(); }
  function close() { modal.hidden = true; document.body.style.overflow = ""; }

  modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-auth-close")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
  $("auth-switch-link").addEventListener("click", (e) => { e.preventDefault(); open(mode === "signup" ? "login" : "signup"); });

  $("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.className = "auth-msg";
    msgEl.textContent = "…";
    try {
      const res = await fetch("/api/" + mode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailEl.value.trim(), password: passEl.value }),
      });
      const data = await res.json();
      if (res.ok) { me = { email: data.email }; renderNav(); close(); }
      else { msgEl.classList.add("err"); msgEl.textContent = data.error || "Something went wrong."; }
    } catch (_e) { msgEl.classList.add("err"); msgEl.textContent = "Network error — please try again."; }
  });

  // --- Nav state ---
  function renderNav() {
    if (me) {
      navAuth.innerHTML = `<span class="nav-user" title="${me.email}">${me.email}</span> <a href="#" class="nav-authlink" data-auth="logout">${t("logout")}</a>`;
    } else {
      navAuth.innerHTML = `<a href="#" class="nav-authlink" data-auth="login">${t("login")}</a> <a href="#" class="btn btn-sm" data-auth="signup">${t("signup")}</a>`;
    }
  }
  navAuth.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-auth]");
    if (!a) return;
    e.preventDefault();
    const act = a.dataset.auth;
    if (act === "logout") {
      await fetch("/api/logout", { method: "POST" });
      me = null; renderNav();
    } else { open(act); }
  });

  window.addEventListener("kl-lang", () => { renderNav(); if (!modal.hidden) paintModal(); });

  // Initial state
  renderNav();
  fetch("/api/me").then((r) => r.json()).then((d) => { me = d.email ? { email: d.email } : null; renderNav(); }).catch(() => {});
})();
