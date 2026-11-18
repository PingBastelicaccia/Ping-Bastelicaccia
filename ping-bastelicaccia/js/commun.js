/* =====================================================================
   Fonctionnement commun à toutes les pages : dates, affichage des
   événements, animations, menu, pied de page, rideau entre les pages.
   Rien à modifier ici pour une mise à jour de contenu.
   ===================================================================== */
const ASB = (() => {
  "use strict";

  const RACINE = document.documentElement;
  const ANIM = RACINE.classList.contains("anim");
  const TYPES = {
    equipes:    { nom: "Par équipes" },
    individuel: { nom: "Individuel" },
    jeunes:     { nom: "Jeunes" },
    coupe:      { nom: "Coupes" },
    club:       { nom: "Vie du club" }
  };
  const PAGES = [
    ["accueil", "index.html", "Accueil"],
    ["presentation", "presentation.html", "Présentation"],
    ["agenda", "agenda.html", "Agenda"],
    ["resultats", "resultats.html", "Résultats"],
    ["photos", "photos.html", "Photos"],
    ["contact", "contact.html", "Contact"]
  ];
  const PAGES_PIED = [PAGES[0], PAGES[1], ["entrainements", "entrainements.html", "Entraînements"], ...PAGES.slice(2)];

  /* ---------- Outils ---------- */
  const $ = (sel, racine = document) => racine.querySelector(sel);
  const $$ = (sel, racine = document) => [...racine.querySelectorAll(sel)];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const borne = (v, a, b) => Math.min(b, Math.max(a, v));
  const rappel = (texte) => (SITE.brouillon ? `<span class="a-completer">À compléter : ${esc(texte)}</span>` : "");
  const telLien = (tel) => `tel:+33${tel.replace(/\D/g, "").slice(1)}`;

  /* ---------- Dates ---------- */
  const lire = (iso) => { const [a, m, j] = iso.split("-").map(Number); return new Date(a, m - 1, j); };
  const versIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const aujourdhui = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const ecartJours = (a, b) => Math.round((a - b) / 86400000);
  const debutMois = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const f = {
    jour: new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
    jourSansMois: new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric" }),
    court: new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }),
    numerique: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    semaine: new Intl.DateTimeFormat("fr-FR", { weekday: "long" }),
    moisCourt: new Intl.DateTimeFormat("fr-FR", { month: "short" }),
    moisAn: new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" })
  };
  const premier = (txt) => txt.replace(/(^|\s)1(\s)/, "$11er$2");

  /* Heures : "16:30" devient "16 h 30", "18:00" devient "18 h" */
  const heure = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`; };
  const minutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const plage = (c) => `${heure(c.debut)} à ${heure(c.fin)}`;

  /* ---------- Événements ---------- */
  const evenements = EVENEMENTS
    .map((e, i) => ({ ...e, id: i, d: lire(e.date), f: lire(e.fin || e.date) }))
    .sort((a, b) => a.d - b.d || a.id - b.id);
  const aVenir = (ref) => evenements.filter((e) => e.f >= ref);
  const passes = (ref) => evenements.filter((e) => e.f < ref);
  const duJour = (jour) => evenements.filter((e) => e.d <= jour && e.f >= jour);
  const typeDe = (e) => (TYPES[e.type] ? e.type : "club");
  const dateLongue = (e) => premier(+e.d === +e.f ? f.jour.format(e.d) : `${f.jourSansMois.format(e.d)} et ${f.jour.format(e.f)}`);

  function aLaUne(ref) {
    const liste = aVenir(ref);
    return liste.find((e) => e.club)
      || liste.find((e) => !SITE.nePasMettreEnAvant.includes(e.niveau))
      || liste[0] || null;
  }
  function quand(e, ref) {
    if (e.d <= ref && e.f >= ref) return "aujourd'hui";
    const n = ecartJours(e.d, ref);
    if (n === 1) return "demain";
    if (n > 1 && n <= 14) return `dans ${n} jours`;
    return "";
  }
  function lienAgenda(e) {
    const coller = (d) => versIso(d).replaceAll("-", "");
    const lendemain = new Date(e.f.getFullYear(), e.f.getMonth(), e.f.getDate() + 1);
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: e.detail ? `${e.titre} (${e.detail})` : e.titre,
      dates: `${coller(e.d)}/${coller(lendemain)}`,
      location: e.lieu || "",
      details: SITE.nom
    });
    return `https://calendar.google.com/calendar/render?${p}`;
  }
  function flip(e) {
    const surPlusieurs = +e.d !== +e.f;
    const fin = surPlusieurs ? `<span class="flip-fin">au ${e.f.getDate()}</span>` : "";
    return `<div class="flip" aria-hidden="true"><span class="flip-num">${e.d.getDate()}</span>${fin}<span class="flip-mois">${esc(f.moisCourt.format(e.d))}</span></div>`;
  }
  function ligne(e, ref, options = {}) {
    const type = typeDe(e);
    const surPlusieurs = +e.d !== +e.f;
    const jours = surPlusieurs ? `${f.semaine.format(e.d)} et ${f.semaine.format(e.f)}` : f.semaine.format(e.d);
    const lieu = e.lieu ? `à ${esc(e.lieu)}` : "lieu à préciser";
    const q = quand(e, ref);
    const enCours = q === "aujourd'hui";
    const meta = enCours ? `<strong class="auj">Aujourd'hui</strong>, ${lieu}` : `${cap(jours)}, ${lieu}`;
    const tags = [`<span class="tag"><i class="mk mk-${type}"></i>${esc(TYPES[type].nom)}</span>`];
    if (q && !enCours) tags.push(`<span class="tag">${esc(cap(q))}</span>`);
    if (e.club) tags.push(`<span class="tag tag-club">Le club participe</span>`);
    if (options.ajout) tags.push(`<a class="tag" href="${esc(lienAgenda(e))}">Ajouter à Google Agenda</a>`);
    return `<li class="ev" data-r style="--i:${(options.i || 0) % 6}">${flip(e)}<div>`
      + `<p class="ev-titre"><span class="vh">${esc(cap(dateLongue(e)))} : </span>${esc(e.titre)}${e.detail ? ` <span class="ev-detail">${esc(e.detail)}</span>` : ""}</p>`
      + `<p class="ev-meta">${meta}</p>`
      + (e.texte ? `<p class="ev-texte">${esc(e.texte)}</p>` : "")
      + `<p class="tags">${tags.join("")}</p></div></li>`;
  }
  function parMois(liste) {
    const groupes = new Map();
    for (const e of liste) {
      const cle = `${e.d.getFullYear()}-${e.d.getMonth()}`;
      if (!groupes.has(cle)) groupes.set(cle, { titre: cap(f.moisAn.format(e.d)), liste: [] });
      groupes.get(cle).liste.push(e);
    }
    return [...groupes.values()];
  }

  /* ---------- Horaires d'entraînement ---------- */
  function horaires(aere = false) {
    if (!SITE.entrainements.length) return `<p>Les créneaux sont donnés par le club : un appel ou un message suffit.</p>`;
    return `<ul class="horaires${aere ? " aere" : ""}">${SITE.entrainements.map((j) =>
      `<li><strong>${esc(j.jour)}</strong><ul>${j.creneaux.map((c) =>
        `<li><span class="heure">${esc(plage(c))}</span> <span class="groupe">${esc(c.groupe)}</span></li>`).join("")}</ul></li>`).join("")}</ul>`;
  }
  function resumeHoraires() {
    const jours = SITE.entrainements.filter((j) => j.creneaux.length);
    if (!jours.length) return "";
    const n = jours.reduce((t, j) => t + j.creneaux.length, 0);
    return `${jours.length} jours par semaine, du ${jours[0].jour.toLowerCase()} au ${jours[jours.length - 1].jour.toLowerCase()}, ${n} séances encadrées : enfants, loisir et compétition.`;
  }
  function itineraires() {
    const s = SITE.salle;
    const q = encodeURIComponent(s.nom);
    const liste = [];
    if (s.plan) liste.push(["Google Maps", s.plan]);
    if (s.gps) {
      liste.push(["Plans", `https://maps.apple.com/?ll=${s.gps}&q=${q}`]);
      liste.push(["Waze", `https://waze.com/ul?ll=${s.gps}&navigate=yes`]);
    }
    return liste;
  }
  function carteLieu() {
    const s = SITE.salle;
    const liens = itineraires();
    return `<div class="lieu-carte">
      <span class="lieu-icone" aria-hidden="true">${ICONES.repere}</span>
      <p class="lieu-nom">${esc(s.nom)}</p>
      <p class="lieu-ville">${esc(s.commune)}</p>
      ${liens.length ? `<p class="lieu-ouvrir">Ouvrir l'itinéraire dans</p>
      <p class="lieu-apps">${liens.map(([nom, url], i) => `<a class="btn${i === 0 ? " btn-plein" : ""}" href="${esc(url)}">${esc(nom)}</a>`).join("")}</p>` : ""}
    </div>`;
  }
  function alerteHoraires() {
    const l = SITE.liens;
    const reseaux = [l.facebook && `<a href="${esc(l.facebook)}">Facebook</a>`, l.instagram && `<a href="${esc(l.instagram)}">Instagram</a>`].filter(Boolean).join(" et ");
    return `<p class="alerte" role="note"><span>${esc(SITE.messageHoraires)}${reseaux ? ` Suivre le club sur ${reseaux}.` : ""}</span></p>`;
  }

  /* ---------- Apparitions au défilement ---------- */
  function compter(el) {
    const fin = Number(el.dataset.compte);
    if (!ANIM || !fin) { el.textContent = fin; return; }
    const t0 = performance.now(), duree = 1500;
    const pas = (t) => {
      const k = Math.min(1, (t - t0) / duree);
      el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(pas);
    };
    el.textContent = "0";
    requestAnimationFrame(pas);
  }
  function montrer(el) {
    el.classList.add("vu");
    if (el.dataset.compte) compter(el);
    $$("[data-compte]", el).forEach(compter);
  }
  const obs = ANIM && "IntersectionObserver" in window
    ? new IntersectionObserver((entrees) => {
        for (const e of entrees) if (e.isIntersecting) { montrer(e.target); obs.unobserve(e.target); }
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 })
    : null;
  let lance = false;
  function observer(racine = document) {
    if (!lance) return; // le premier passage se fait à l'ouverture du rideau
    $$("[data-r]:not(.vu)", racine).forEach((el) => (obs ? obs.observe(el) : el.classList.add("vu")));
  }
  function decouper(el) {
    if (el.dataset.coupe) return;
    el.dataset.coupe = "1";
    const texte = el.textContent.trim();
    el.setAttribute("aria-label", texte);
    el.innerHTML = texte.split(/\s+/).map((m, j) => `<span class="mot" aria-hidden="true"><span class="mot-in" style="--j:${j}">${esc(m)}</span></span>`).join(" ");
  }

  /* Le texte tient exactement dans la largeur disponible */
  function ajuster(el) {
    if (!el || !el.offsetWidth) return;
    el.style.fontSize = "";
    const dispo = el.clientWidth;
    const besoin = Math.max(...$$(".mesure", el).map((s) => s.getBoundingClientRect().width));
    if (!besoin || !dispo) return;
    const taille = parseFloat(getComputedStyle(el).fontSize);
    el.style.fontSize = `${Math.floor(taille * (dispo / besoin) * 0.985 * 10) / 10}px`;
  }

  /* Un titre trop long pour l'écran est réduit jusqu'à tenir (sans jamais être agrandi) */
  function retrecir(el) {
    if (!el || !el.offsetWidth) return;
    el.style.fontSize = "";
    const dispo = el.clientWidth;
    const mots = $$(".mot", el);
    const besoin = mots.length ? Math.max(...mots.map((m) => m.getBoundingClientRect().width)) : el.scrollWidth;
    if (besoin > dispo) {
      const taille = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = `${Math.floor(taille * (dispo / besoin) * 0.97 * 10) / 10}px`;
    }
  }

  /* ---------- Photos ---------- */
  /* Mosaïque de l'accueil : [colonnes, lignes] sur ordinateur (6 colonnes), puis sur téléphone (2 colonnes).
     Les cases gardent à peu près le format 4:3 des photos pour ne pas les rogner. */
  const MOSAIQUE = {
    1: [[6, 3, 2, 2]],
    2: [[3, 2, 2, 2], [3, 2, 2, 2]],
    3: [[4, 2, 2, 2], [2, 1, 1, 1], [2, 1, 1, 1]],
    4: [[3, 2, 2, 2], [3, 2, 1, 1], [3, 2, 1, 1], [3, 2, 2, 2]],
    5: [[4, 2, 2, 2], [2, 1, 1, 1], [2, 1, 1, 1], [3, 2, 1, 1], [3, 2, 1, 1]]
  };
  const dispositions = (n) => (MOSAIQUE[Math.min(n, 5)] || []).slice(0, n).map(([dc, dr, mc, mr]) => ({ d: [dc, dr], m: [mc, mr] }));

  function tuile(p, i, disp) {
    const style = `--i:${i % 6}` + (disp ? `;--d-c:${disp.d[0]};--d-r:${disp.d[1]};--m-c:${disp.m[0]};--m-r:${disp.m[1]}` : "");
    return p
      ? `<button class="ph" type="button" data-i="${i}" data-r="clip" style="${style}" aria-label="Agrandir : ${esc(p.legende || "photo")}"><img src="${esc(p.src)}" alt="${esc(p.legende || "")}"></button>`
      : `<div class="ph" data-r="clip" style="${style}" role="img" aria-label="Emplacement de photo"><span>Placeholder</span></div>`;
  }
  function grille(conteneur, photos, nbVides, type) {
    const cases = photos.length ? photos : Array(nbVides).fill(null);
    const disp = type === "mosaique" ? dispositions(cases.length) : [];
    conteneur.innerHTML = cases.map((p, i) => tuile(p, i, disp[i])).join("");
    $$("button.ph", conteneur).forEach((b) => b.addEventListener("click", () => ouvrirVisio(photos, Number(b.dataset.i))));
    observer(conteneur);
  }

  let visio = { liste: [], i: 0 };
  function dialogueVisio() {
    let d = $("#visio");
    if (d) return d;
    d = document.createElement("dialog");
    d.className = "visio";
    d.id = "visio";
    d.setAttribute("aria-label", "Photo en grand");
    d.innerHTML = `<figure><img id="visio-img" alt=""><figcaption id="visio-legende"></figcaption></figure>
      <div class="visio-barre"><button class="btn" type="button" data-pas="-1">Précédente</button><span class="visio-compte" id="visio-compte"></span><button class="btn" type="button" data-pas="1">Suivante</button><button class="btn" type="button" data-fermer>Fermer</button></div>`;
    document.body.append(d);
    $$("[data-pas]", d).forEach((b) => b.addEventListener("click", () => tournerVisio(Number(b.dataset.pas))));
    $("[data-fermer]", d).addEventListener("click", () => d.close());
    d.addEventListener("click", (ev) => { if (ev.target === d) d.close(); });
    d.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowLeft") tournerVisio(-1);
      if (ev.key === "ArrowRight") tournerVisio(1);
    });
    return d;
  }
  function majVisio() {
    const p = visio.liste[visio.i];
    if (!p) return;
    $("#visio-img").src = p.src;
    $("#visio-img").alt = p.legende || "";
    $("#visio-legende").textContent = p.legende || "";
    $("#visio-compte").textContent = `${visio.i + 1} / ${visio.liste.length}`;
  }
  function ouvrirVisio(liste, i) {
    const d = dialogueVisio();
    visio = { liste, i };
    majVisio();
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
  }
  function tournerVisio(pas) {
    const n = visio.liste.length;
    if (!n) return;
    visio.i = (visio.i + pas + n) % n;
    majVisio();
  }

  /* ---------- Icônes ---------- */
  const ICONES = {
    facebook: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.6-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M16.6 3c.3 2.2 1.6 3.7 3.7 3.9v3.1a7.3 7.3 0 0 1-3.6-1.1v6.4a5.7 5.7 0 1 1-5.7-5.7l.9.1v3.2a2.6 2.6 0 1 0 1.7 2.4V3z"/></svg>`,
    repere: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>`
  };

  /* ---------- En-tête, menu et pied de page ---------- */
  const pageActive = document.body.dataset.page || "";
  function marquerPage(racine = document) {
    $$("a[data-lien]", racine).forEach((a) => {
      if (a.dataset.lien === pageActive) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  function remplirChamps() {
    const lireChemin = (chemin) => chemin.split(".").reduce((o, k) => (o == null ? o : o[k]), SITE);
    $$("[data-site]").forEach((el) => { const v = lireChemin(el.dataset.site); if (v != null && v !== "") el.textContent = v; });
    $$("[data-site-lien]").forEach((el) => { const v = lireChemin(el.dataset.siteLien); if (v) el.href = v; });
    $$("[data-brouillon]").forEach((el) => { el.hidden = !SITE.brouillon; });
    const etiquette = $("#etiquette");
    if (etiquette) etiquette.hidden = !SITE.brouillon;
    const pastille = $("#pastille");
    if (pastille) pastille.innerHTML = SITE.logo ? `<img src="${esc(SITE.logo)}" alt="">` : esc(SITE.sigle);
  }

  let menuOuvert = false;
  function construireMenu() {
    const btn = $("#menu-btn");
    if (!btn) return;
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.id = "menu";
    menu.hidden = true;
    const l = SITE.liens;
    menu.innerHTML = `<nav aria-label="Rubriques"><ul class="menu-liens">${PAGES_PIED.map(([cle, url, nom]) =>
      `<li><a href="${url}" data-lien="${cle}">${esc(nom)}</a></li>`).join("")}</ul></nav>`
      + `<p class="menu-pied">${l.facebook ? `<a class="lien" href="${esc(l.facebook)}">Facebook</a>` : ""}${l.instagram ? `<a class="lien" href="${esc(l.instagram)}">Instagram</a>` : ""}${l.tiktok ? `<a class="lien" href="${esc(l.tiktok)}">TikTok</a>` : ""}<a class="lien" href="${telLien(SITE.contact.telephone)}">${esc(SITE.contact.telephone)}</a></p>`;
    $(".barre").after(menu);
    marquerPage(menu);
    btn.addEventListener("click", () => basculerMenu(!menuOuvert));
    document.addEventListener("keydown", (ev) => {
      if (!menuOuvert) return;
      if (ev.key === "Escape") { basculerMenu(false); btn.focus(); }
      if (ev.key === "Tab") {
        const ciblables = [btn, ...$$("a", menu)];
        const i = ciblables.indexOf(document.activeElement);
        if (ev.shiftKey && i <= 0) { ev.preventDefault(); ciblables[ciblables.length - 1].focus(); }
        else if (!ev.shiftKey && i === ciblables.length - 1) { ev.preventDefault(); ciblables[0].focus(); }
      }
    });
    window.matchMedia("(min-width: 72rem)").addEventListener("change", (m) => { if (m.matches) basculerMenu(false); });
  }
  function basculerMenu(ouvrir) {
    const menu = $("#menu"), btn = $("#menu-btn");
    if (!menu || ouvrir === menuOuvert) return;
    menuOuvert = ouvrir;
    btn.setAttribute("aria-expanded", String(ouvrir));
    $(".menu-btn-txt", btn).textContent = ouvrir ? "Fermer" : "Menu";
    document.body.classList.toggle("menu-ouvert", ouvrir);
    if (ouvrir) {
      menu.hidden = false;
      if (ANIM) {
        menu.animate([{ clipPath: "circle(0% at 100% 0%)" }, { clipPath: "circle(150% at 100% 0%)" }], { duration: 700, easing: "cubic-bezier(.77,0,.18,1)" });
        $$(".menu-liens a, .menu-pied", menu).forEach((a, i) => a.animate([{ transform: "translateY(110%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 800, delay: 180 + i * 60, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }));
      }
      $(".menu-liens a", menu).focus({ preventScroll: true });
    } else if (ANIM) {
      menu.animate([{ clipPath: "circle(150% at 100% 0%)" }, { clipPath: "circle(0% at 100% 0%)" }], { duration: 500, easing: "cubic-bezier(.77,0,.18,1)" })
        .finished.then(() => { if (!menuOuvert) menu.hidden = true; });
    } else {
      menu.hidden = true;
    }
  }

  function construirePied() {
    const pied = $("#pied");
    if (!pied) return;
    const s = SITE, l = s.liens, c = s.contact;
    const reseaux = [
      l.facebook && `<a class="reseau reseau-fb" href="${esc(l.facebook)}" aria-label="Page Facebook du club">${ICONES.facebook}</a>`,
      l.instagram && `<a class="reseau reseau-ig" href="${esc(l.instagram)}" aria-label="Compte Instagram du club">${ICONES.instagram}</a>`,
      l.tiktok && `<a class="reseau reseau-tt" href="${esc(l.tiktok)}" aria-label="Compte TikTok du club">${ICONES.tiktok}</a>`
    ].filter(Boolean).join("");
    const annee = new Date().getFullYear();
    const plan = itineraires()[0];
    pied.innerHTML = `<div class="wrap">
      <p class="pied-marque" id="pied-marque" aria-hidden="true"><span class="mesure">${esc(s.nom)}</span></p>
      <div class="pied-grille">
        <div class="pied-club">
          <h2>Le club</h2>
          <p><strong>${esc(s.nomOfficiel)}</strong></p>
          <p>Tennis de table. Club n° ${esc(s.numeroClub)}, affilié à la Fédération française de tennis de table.</p>
        </div>
        <div>
          <h2>Trouver le club</h2>
          <p>${esc(s.salle.nom)}<br>${esc(s.salle.commune)}</p>
          ${plan ? `<a class="pilule" href="${esc(plan[1])}">${ICONES.repere}<span>Itinéraire</span></a>` : ""}
        </div>
        <nav aria-label="Pages du site">
          <h2>Le site</h2>
          <ul class="pied-liste">${PAGES_PIED.map(([cle, url, nom]) => `<li><a href="${url}" data-lien="${cle}">${esc(nom)}</a></li>`).join("")}</ul>
        </nav>
        <div>
          <h2>Contact</h2>
          <ul class="pied-liste">
            <li>${esc(c.nom)}</li>
            ${c.telephone ? `<li><a href="${telLien(c.telephone)}">${esc(c.telephone)}</a></li>` : ""}
            ${c.email ? `<li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ""}
          </ul>
        </div>
        <div>
          <h2>Suivre le club</h2>
          <div class="reseaux">${reseaux}</div>
        </div>
      </div>
      <div class="pied-bas">
        <p><span>© ${annee} ${esc(s.nomOfficiel)}</span><a href="mentions-legales.html" data-lien="mentions">Mentions légales</a><span>Hébergé par Vercel</span></p>
        <p>${esc(s.sourceCalendrier)}</p>
      </div>
    </div>`;
    marquerPage(pied);
  }

  /* ---------- Défilement : l'en-tête se cache en descendant ---------- */
  const auDefilement = [];
  let dernierY = 0, enAttente = false;
  function surDefilement() {
    const barre = $(".barre");
    const y = window.scrollY;
    if (barre && !menuOuvert) {
      barre.classList.toggle("pleine", y > 24 || pageActive !== "accueil");
      if (y > dernierY + 8 && y > 320) barre.classList.add("cachee");
      else if (y < dernierY - 8 || y < 120) barre.classList.remove("cachee");
    }
    dernierY = y;
    auDefilement.forEach((fn) => fn(y));
  }
  window.addEventListener("scroll", () => {
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame(() => { enAttente = false; surDefilement(); });
  }, { passive: true });

  const aLaMiseEnPage = [];
  function mettreEnPage() {
    ajuster($("#pied-marque"));
    $$(".vue-tete h1, .titre-bloc").forEach(retrecir);
    aLaMiseEnPage.forEach((fn) => fn());
    surDefilement();
  }

  /* ---------- Rideau entre les pages ---------- */
  const EASE = "cubic-bezier(.77,0,.18,1)";
  // Le rideau est écrit en tête de chaque page HTML pour couvrir la page dès le premier affichage.
  let rideau = $("#rideau");
  if (!rideau) {
    rideau = document.createElement("div");
    rideau.className = "rideau";
    rideau.id = "rideau";
    rideau.setAttribute("aria-hidden", "true");
    rideau.innerHTML = `<div class="r-g"></div><div class="r-d"></div><span class="r-ligne"></span><span class="r-balle"></span>`;
    document.body.prepend(rideau);
  }
  const bouger = (el, de, a, options) => el.animate([{ transform: de }, { transform: a }], { fill: "forwards", easing: EASE, ...options }).finished;
  async function fermer() {
    rideau.classList.add("actif");
    await Promise.all([
      bouger($(".r-g", rideau), "translateX(-101%)", "translateX(0)", { duration: 560 }),
      bouger($(".r-d", rideau), "translateX(101%)", "translateX(0)", { duration: 560 })
    ]);
  }
  async function ouvrir(delai = 80) {
    await Promise.all([
      bouger($(".r-g", rideau), "translateX(0)", "translateX(-101%)", { duration: 820, delay: delai }),
      bouger($(".r-d", rideau), "translateX(0)", "translateX(101%)", { duration: 820, delay: delai })
    ]);
    rideau.classList.remove("actif");
    RACINE.classList.remove("intro", "arrivee");
  }
  async function intro() {
    const ligneR = $(".r-ligne", rideau), balle = $(".r-balle", rideau);
    await ligneR.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 560, easing: EASE, fill: "forwards" }).finished;
    await balle.animate([{ transform: "scale(0)" }, { transform: "scale(1.2)", offset: 0.6 }, { transform: "scale(1)" }], { duration: 380, easing: "ease-out", fill: "forwards" }).finished;
    balle.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(0)", opacity: 0 }], { duration: 300, delay: 120, fill: "forwards" });
    ligneR.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: 200, fill: "forwards" });
    setTimeout(lancer, 420);
    await ouvrir(220);
    try { sessionStorage.setItem("asb-intro", "1"); } catch (e) { /* stockage indisponible */ }
  }
  async function partir(href) {
    basculerMenu(false);
    await fermer();
    try { sessionStorage.setItem("asb-rideau", "1"); sessionStorage.setItem("asb-intro", "1"); } catch (e) { /* stockage indisponible */ }
    window.location.href = href;
  }
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest("a[href]");
    if (!a || !ANIM || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    const url = new URL(a.href, window.location.href);
    if (url.protocol !== window.location.protocol || url.host !== window.location.host) return;
    if (!/\.html?$|\/$/.test(url.pathname)) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      if (menuOuvert) basculerMenu(false);
      return;
    }
    ev.preventDefault();
    partir(url.href);
  });
  // Retour arrière : la page revient du cache avec le rideau fermé, on le rouvre.
  window.addEventListener("pageshow", (ev) => { if (ev.persisted && rideau.classList.contains("actif")) ouvrir(0); });

  /* ---------- Démarrage ---------- */
  function lancer() {
    if (lance) return;
    lance = true;
    document.body.classList.add("pret");
    observer(document);
  }
  function demarrer() {
    if ("scrollRestoration" in history && pageActive === "accueil") history.scrollRestoration = "manual";
    remplirChamps();
    marquerPage();
    construireMenu();
    construirePied();
    $$(".vue-tete h1, .titre-bloc").forEach(decouper);
    let attente = 0;
    window.addEventListener("resize", () => { cancelAnimationFrame(attente); attente = requestAnimationFrame(mettreEnPage); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(mettreEnPage);
  }
  demarrer();
  // Les scripts de page s'exécutent après celui-ci ; on lance les animations une fois tout le contenu en place.
  /* Arrivée par un lien : toujours en haut de la page (sauf ancre, retour arrière ou rechargement). */
  function arriverEnHaut() {
    const nav = performance.getEntriesByType ? performance.getEntriesByType("navigation")[0] : null;
    if (window.location.hash || (nav && nav.type !== "navigate")) return;
    window.scrollTo(0, 0);
    if (window.self !== window.top) {
      try { document.documentElement.scrollIntoView({ block: "start" }); } catch (e) { /* cadre intégré */ }
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    arriverEnHaut();
    mettreEnPage();
    window.__asbPret = true;
    if (RACINE.classList.contains("intro")) {
      intro().catch(() => { RACINE.classList.remove("intro"); rideau.classList.remove("actif"); lancer(); });
    } else if (RACINE.classList.contains("arrivee")) {
      setTimeout(lancer, 250);
      ouvrir(60).catch(() => { RACINE.classList.remove("arrivee"); });
    } else {
      requestAnimationFrame(lancer);
    }
  });

  return {
    ANIM, TYPES, SITE_PAGES: PAGES,
    $, $$, esc, cap, borne, rappel, telLien,
    lire, versIso, aujourdhui, ecartJours, debutMois, f, premier, heure, minutes, plage,
    evenements, aVenir, passes, duJour, typeDe, dateLongue, aLaUne, quand, lienAgenda, flip, ligne, parMois,
    retrecir, horaires, resumeHoraires, alerteHoraires, itineraires, carteLieu, observer, ajuster, grille, ouvrirVisio, ICONES,
    auDefilement, aLaMiseEnPage, surDefilement
  };
})();
