/* Lightweight EN/FR i18n for the UI chrome. Elements opt in with:
   data-i18n="key"  (textContent), data-i18n-html="key" (innerHTML),
   data-i18n-ph="key" (placeholder), data-i18n-aria="key" (aria-label). */
(function () {
  const FR = {
    nav_home: "Accueil",
    nav_leaders: "Dirigeants",
    nav_analysis: "Analyse",
    nav_pricing: "Tarifs",
    nav_featured: "À la une",
    cta_newsletter: "Rejoindre l'infolettre",

    hero_eyebrow: "Renseignement · Profils · Héritage",
    hero_h1: "Les dirigeants qui façonnent l'Afrique — hier, aujourd'hui et demain.",
    hero_lede: "Portraits des grands dirigeants de l'Afrique, d'hier et d'aujourd'hui, avec un regard sur l'actualité qui compte. Une plateforme de renseignement indépendante.",
    hero_cta_news: "Rejoindre l'infolettre →",
    hero_cta_explore: "Découvrir les dirigeants",

    value1_h: "De l'analyse, pas des gros titres",
    value1_p: "Nous ne disons pas seulement ce qui s'est passé. Nous expliquons pourquoi cela compte, qui est concerné et ce qui est probable ensuite — pays par pays.",
    value2_h: "Pensé pour la diaspora",
    value2_p: "Que vous investissiez, conseilliez, bâtissiez ou restiez attaché à vos racines, KemetLeads vous garde une longueur d'avance, où que vous soyez dans le monde.",
    value3_h: "Un héritage digne de confiance",
    value3_p: "Des portraits honnêtes qui célèbrent la grandeur tout en racontant toute l'histoire — les réussites comme la complexité.",

    pricing_h: "Adhésion",
    pricing_sub: "Commencez gratuitement. Passez à l'offre supérieure quand l'analyse le mérite.",
    tier_free: "Gratuit",
    tier_pro: "Pro",
    price_mo: "/mois",
    f_free_1: "Profils publics des dirigeants",
    f_free_2: "Blog",
    f_free_3: "Infolettre",
    f_pro_1: "Archives complètes",
    f_pro_2: "Base de données complète des dirigeants",
    f_pro_3: "Rapport trimestriel",
    f_pro_4: "Accès anticipé aux nouveautés",
    badge_popular: "Le plus populaire",
    btn_join_free: "Rejoindre gratuitement",
    btn_start_pro: "Passer à Pro",

    sub_h: "L'Afrique avance vite. Ne la découvrez pas en retard.",
    sub_p: "Recevez gratuitement le point hebdomadaire sur les dirigeants et les forces qui façonnent le continent.",
    sub_btn: "S'abonner gratuitement",
    sub_ph: "vous@exemple.com",

    footer_mission: "Portraits des grands dirigeants de l'Afrique, d'hier et d'aujourd'hui, avec un regard sur l'actualité qui compte. Une plateforme de renseignement indépendante.",

    lp_eyebrow: "La Collection",
    lp_h1: "Les grands dirigeants de l'Afrique",
    lp_lede: "Hier et aujourd'hui — les libérateurs, bâtisseurs, penseurs et réformateurs qui ont façonné un continent. Classés par groupe. Cliquez sur un dirigeant pour le profil complet.",
    ctrl_theme: "Par thème",
    ctrl_era: "Par époque",
    search_ph: "Rechercher par nom, pays ou thème…",
    empty_msg: "Aucun dirigeant ne correspond à votre recherche.",

    an_eyebrow: "Éditorial",
    an_h1: "Pourquoi KemetLeads existe",
    an_lede: "La pensée derrière la plateforme — notre lecture du leadership africain, et pourquoi l'honnêteté est le produit.",
    an_p1: "La plupart des récits sur le leadership africain oscillent entre deux extrêmes : l'adulation sans nuance ou la caricature méprisante. Ni l'un ni l'autre ne sert ceux qui ont vraiment besoin de comprendre le continent.",
    an_p2: "KemetLeads emprunte une troisième voie. Chaque portrait suit la même discipline — <em>l'ascension, ce qu'ils ont fait, le tableau complet, et pourquoi c'est important</em> — célébrant la vraie grandeur sans jamais détourner le regard de la complexité. Des héros de la libération devenus autocrates. Des réformateurs dont le progrès a coûté la liberté. Des bâtisseurs dont la réussite soulève de nouvelles questions.",
    an_p3: "Cette honnêteté est le produit. C'est ce qui transforme un annuaire de noms en un renseignement fiable — pour les affaires, pour les politiques, pour comprendre où va l'Afrique.",
    an_cta: "Découvrir les dirigeants →",
    news_h: "Le Point — notre regard sur l'actualité",
    news_sub: "Nous ne faisons pas que rapporter les faits. Voici ce qu'ils signifient et pourquoi ils comptent — une sélection avec le regard de KemetLeads.",
  };

  let LANG = "en";
  try { LANG = localStorage.getItem("lang") || "en"; } catch (_e) {}

  function tr(el, attr, prop) {
    const key = el.getAttribute(attr);
    if (!key) return;
    if (!el.dataset._en) el.dataset._en = prop === "html" ? el.innerHTML : prop === "text" ? el.textContent : el.getAttribute(prop) || "";
    const val = LANG === "fr" ? (FR[key] || el.dataset._en) : el.dataset._en;
    if (prop === "html") el.innerHTML = val;
    else if (prop === "text") el.textContent = val;
    else el.setAttribute(prop, val);
  }

  function apply() {
    document.documentElement.lang = LANG;
    document.querySelectorAll("[data-i18n]").forEach((el) => tr(el, "data-i18n", "text"));
    document.querySelectorAll("[data-i18n-html]").forEach((el) => tr(el, "data-i18n-html", "html"));
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => tr(el, "data-i18n-ph", "placeholder"));
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => tr(el, "data-i18n-aria", "aria-label"));
    const btn = document.getElementById("lang-toggle");
    if (btn) {
      btn.textContent = LANG === "fr" ? "EN" : "FR";
      btn.setAttribute("aria-label", LANG === "fr" ? "Switch to English" : "Passer en français");
    }
  }

  function setLang(l) {
    LANG = l;
    try { localStorage.setItem("lang", l); } catch (_e) {}
    apply();
  }

  document.addEventListener("DOMContentLoaded", () => {
    apply();
    const btn = document.getElementById("lang-toggle");
    if (btn) btn.addEventListener("click", () => setLang(LANG === "fr" ? "en" : "fr"));
  });
})();
