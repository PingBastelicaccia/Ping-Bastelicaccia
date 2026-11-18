/* Page Agenda : calendrier du mois, liste du jour ou du mois, puis toute la saison avec filtres. */
(() => {
  "use strict";
  const { $, $$, esc, cap, f, premier, lire, versIso, aujourdhui, debutMois, evenements, aVenir, passes, duJour, typeDe, ligne, parMois, TYPES } = ASB;

  /* ---------- Calendrier ---------- */
  const bornes = evenements.length
    ? { min: debutMois(evenements[0].d), max: debutMois(evenements[evenements.length - 1].f) }
    : { min: debutMois(aujourdhui()), max: debutMois(aujourdhui()) };
  const dansBornes = (m) => (m < bornes.min ? bornes.min : m > bornes.max ? bornes.max : m);
  let moisAffiche = dansBornes(debutMois(aujourdhui()));
  let jourChoisi = null;

  function afficherAgenda() {
    const ref = aujourdhui();
    const an = moisAffiche.getFullYear(), mois = moisAffiche.getMonth();
    const nbJours = new Date(an, mois + 1, 0).getDate();
    const decalage = (moisAffiche.getDay() + 6) % 7;
    const chevron = (sens) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${sens < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}"/></svg>`;
    let cases = "";
    for (let i = 0; i < decalage; i++) cases += "<span></span>";
    for (let j = 1; j <= nbJours; j++) {
      const jour = new Date(an, mois, j);
      const liste = duJour(jour);
      const types = [...new Set(liste.map(typeDe))].slice(0, 4);
      const estAuj = +jour === +ref ? " est-auj" : "";
      const marques = `<span class="cal-mks">${types.map((t) => `<i class="mk mk-${t}"></i>`).join("")}</span>`;
      if (liste.length) {
        const iso = versIso(jour);
        const nb = `${liste.length} événement${liste.length > 1 ? "s" : ""}`;
        cases += `<button type="button" class="cal-jour${estAuj}" data-jour="${iso}" aria-pressed="${iso === jourChoisi}" aria-label="${esc(cap(premier(f.jour.format(jour))))}, ${nb}${estAuj ? ", aujourd'hui" : ""}"><span class="cal-n">${j}</span>${marques}</button>`;
      } else {
        cases += `<span class="cal-jour${estAuj}"><span class="cal-n">${j}</span>${marques}</span>`;
      }
    }
    const semaine = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
    $("#cal").innerHTML =
      `<div class="cal-nav"><button class="btn-rond" type="button" id="cal-prec" aria-label="Mois précédent"${+moisAffiche <= +bornes.min ? " disabled" : ""}>${chevron(-1)}</button>`
      + `<p class="cal-titre" aria-live="polite">${esc(cap(f.moisAn.format(moisAffiche)))}</p>`
      + `<button class="btn-rond" type="button" id="cal-suiv" aria-label="Mois suivant"${+moisAffiche >= +bornes.max ? " disabled" : ""}>${chevron(1)}</button></div>`
      + `<div class="cal-sem" aria-hidden="true">${semaine.map((s) => `<span>${s}</span>`).join("")}</div>`
      + `<div class="cal-grille">${cases}</div>`;
    $("#cal-prec").addEventListener("click", () => changerMois(-1));
    $("#cal-suiv").addEventListener("click", () => changerMois(1));
    $$("#cal .cal-jour[data-jour]").forEach((b) => b.addEventListener("click", () => {
      jourChoisi = jourChoisi === b.dataset.jour ? null : b.dataset.jour;
      afficherAgenda();
      const actif = $(`#cal .cal-jour[data-jour="${b.dataset.jour}"]`);
      if (actif) actif.focus({ preventScroll: true });
    }));

    const duMois = evenements.filter((e) => e.f >= moisAffiche && e.d < new Date(an, mois + 1, 1));
    const liste = jourChoisi ? duJour(lire(jourChoisi)) : duMois;
    $("#agenda-titre").textContent = jourChoisi ? cap(premier(f.jour.format(lire(jourChoisi)))) : cap(f.moisAn.format(moisAffiche));
    $("#agenda-evs").innerHTML = liste.length
      ? liste.map((e, i) => ligne(e, ref, { ajout: true, i })).join("")
      : `<li class="vide">Rien de prévu ce mois-ci.</li>`;
    $("#agenda-retour").hidden = !jourChoisi;
    ASB.observer($("#agenda-evs"));
  }
  function changerMois(pas) {
    const cible = new Date(moisAffiche.getFullYear(), moisAffiche.getMonth() + pas, 1);
    if (cible < bornes.min || cible > bornes.max) return;
    moisAffiche = cible;
    jourChoisi = null;
    afficherAgenda();
    const bouton = $(pas < 0 ? "#cal-prec" : "#cal-suiv");
    (bouton.disabled ? $(pas < 0 ? "#cal-suiv" : "#cal-prec") : bouton).focus({ preventScroll: true });
  }

  /* Lien direct vers un jour : agenda.html#jour-2026-11-22 */
  function lireAncre() {
    const m = window.location.hash.match(/^#jour-(\d{4}-\d{2}-\d{2})$/);
    if (!m) return false;
    moisAffiche = dansBornes(debutMois(lire(m[1])));
    jourChoisi = duJour(lire(m[1])).length ? m[1] : null;
    return true;
  }

  /* ---------- Toute la saison ---------- */
  let filtre = "tout";
  function afficherFiltres() {
    const boutons = [["tout", "Tout"], ...Object.entries(TYPES).map(([cle, t]) => [cle, t.nom])];
    $("#filtres").innerHTML = boutons.map(([cle, nom]) =>
      `<button class="chip" type="button" data-filtre="${cle}" aria-pressed="${cle === filtre}">${cle === "tout" ? "" : `<i class="mk mk-${cle}"></i>`}${esc(nom)}</button>`).join("");
    $$("#filtres .chip").forEach((b) => b.addEventListener("click", () => {
      filtre = b.dataset.filtre;
      $$("#filtres .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
      afficherSaison();
    }));
  }
  function afficherSaison() {
    const ref = aujourdhui();
    const garde = (e) => filtre === "tout" || e.type === filtre;
    const futurs = aVenir(ref).filter(garde);
    const anciens = passes(ref).filter(garde).reverse();
    $("#matchs-liste").innerHTML = futurs.length
      ? parMois(futurs).map((g) => `<h3 class="mois" data-r>${esc(g.titre)}</h3><ul class="evs">${g.liste.map((e, i) => ligne(e, ref, { i })).join("")}</ul>`).join("")
      : `<p class="vide">Plus rien de prévu dans cette catégorie cette saison.</p>`;
    const bloc = $("#matchs-passes");
    bloc.hidden = anciens.length === 0;
    bloc.innerHTML = `<summary>Déjà joué cette saison (${anciens.length})</summary><ul class="evs">${anciens.map((e) => ligne(e, ref)).join("")}</ul>`;
    $$("[data-r]", bloc).forEach((el) => el.classList.add("vu"));
    $("#matchs-etat").textContent = `${futurs.length} à venir, ${anciens.length} déjà joué${anciens.length > 1 ? "s" : ""}.`;
    ASB.observer($("#matchs-liste"));
  }

  $("#legende").innerHTML = Object.entries(TYPES).map(([cle, t]) => `<li><i class="mk mk-${cle}"></i>${esc(t.nom)}</li>`).join("");
  $("#agenda-tout").addEventListener("click", () => { jourChoisi = null; afficherAgenda(); });
  window.addEventListener("hashchange", () => { if (lireAncre()) { afficherAgenda(); $("#cal").scrollIntoView({ block: "start" }); } });
  lireAncre();
  afficherAgenda();
  afficherFiltres();
  afficherSaison();
})();
