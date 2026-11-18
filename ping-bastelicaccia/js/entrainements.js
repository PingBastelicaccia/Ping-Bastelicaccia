/* Page Entraînements : prochaine séance, planning de la semaine, salle. */
(() => {
  "use strict";
  const { $, $$, esc, cap, heure, minutes, plage } = ASB;

  const NOMS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const parJour = new Map(SITE.entrainements.map((j) => [j.jour, j.creneaux]));
  // Semaine du lundi au samedi (un jour sans séance reste affiché, vide), plus le dimanche s'il a des séances.
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].concat((parJour.get("Dimanche") || []).length ? ["Dimanche"] : []);
  const tous = jours.flatMap((j) => (parJour.get(j) || []).map((c) => ({ ...c, jour: j })));

  /* Une couleur par public, dans l'ordre d'apparition */
  const groupes = [...new Set(tous.map((c) => c.groupe))];
  const couleur = (g) => `c${groupes.indexOf(g) % 8}`;

  /* ---------- Prochaine séance ---------- */
  const maintenant = new Date();
  const minutesNow = maintenant.getHours() * 60 + maintenant.getMinutes();
  const aujourdhui = NOMS[maintenant.getDay()];
  function prochaine() {
    for (let k = 0; k < 8; k++) {
      const nom = NOMS[(maintenant.getDay() + k) % 7];
      const liste = (parJour.get(nom) || []).slice().sort((a, b) => minutes(a.debut) - minutes(b.debut));
      for (const c of liste) {
        if (k === 0 && minutes(c.fin) <= minutesNow) continue;
        const enCours = k === 0 && minutes(c.debut) <= minutesNow;
        return { ...c, jour: nom, k, enCours };
      }
    }
    return null;
  }
  const p = prochaine();
  if (p) {
    const quand = p.enCours ? "En ce moment" : p.k === 0 ? "Aujourd'hui" : p.k === 1 ? "Demain" : cap(p.jour);
    $("#prochaine").innerHTML = `<p class="prochaine-label">${p.enCours ? "Séance en cours" : "Prochaine séance"}</p>`
      + `<p class="prochaine-quand">${esc(quand)}, ${esc(heure(p.debut))}</p>`
      + `<p class="prochaine-groupe"><i class="pastille-groupe ${couleur(p.groupe)}"></i>${esc(p.groupe)}, jusqu'à ${esc(heure(p.fin))}</p>`;
  } else {
    $("#prochaine").hidden = true;
  }

  /* ---------- Filtre par public ---------- */
  let choix = "tous";
  $("#publics-filtre").innerHTML = [["tous", "Tous les publics"], ...groupes.map((g) => [g, g])].map(([cle, nom]) =>
    `<button class="chip" type="button" data-groupe="${esc(cle)}" aria-pressed="${cle === choix}">${cle === "tous" ? "" : `<i class="pastille-groupe ${couleur(cle)}"></i>`}${esc(nom)}</button>`).join("");
  $$("#publics-filtre .chip").forEach((b) => b.addEventListener("click", () => {
    choix = b.dataset.groupe;
    $$("#publics-filtre .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $$("[data-groupe-seance]").forEach((el) => el.classList.toggle("estompe", choix !== "tous" && el.dataset.groupeSeance !== choix));
  }));

  /* ---------- Planning : grille (ordinateur) ---------- */
  const debut = Math.floor(Math.min(...tous.map((c) => minutes(c.debut))) / 60) * 60;
  const fin = Math.ceil(Math.max(...tous.map((c) => minutes(c.fin))) / 60) * 60;
  const heures = [];
  for (let h = debut; h <= fin; h += 60) heures.push(h);
  const pos = (m) => `${((m - debut) / (fin - debut)) * 100}%`;

  /* Deux séances en même temps se partagent la colonne côte à côte */
  function couloirs(liste) {
    const tri = liste.slice().sort((a, b) => minutes(a.debut) - minutes(b.debut));
    const out = [];
    let groupe = [], finGroupe = -1;
    const fermer = () => {
      const voies = [];
      groupe.forEach((c) => {
        let v = voies.findIndex((f) => f <= minutes(c.debut));
        if (v < 0) { v = voies.length; voies.push(0); }
        voies[v] = minutes(c.fin);
        c.voie = v;
      });
      groupe.forEach((c) => { c.voies = voies.length; out.push(c); });
      groupe = [];
    };
    tri.forEach((c0) => {
      const c = { ...c0 };
      if (groupe.length && minutes(c.debut) >= finGroupe) fermer();
      groupe.push(c);
      finGroupe = Math.max(finGroupe, minutes(c.fin));
    });
    if (groupe.length) fermer();
    return out;
  }
  const seance = (c) => `<div class="seance ${couleur(c.groupe)}${c.voies > 1 ? " etroit" : ""}" data-groupe-seance="${esc(c.groupe)}" style="top:${pos(minutes(c.debut))};height:calc(${pos(minutes(c.fin))} - ${pos(minutes(c.debut))});left:calc(${(c.voie / c.voies) * 100}% + 3px);width:calc(${100 / c.voies}% - 6px)">`
    + `<span class="seance-heure">${esc(plage(c))}</span><span class="seance-groupe">${esc(c.groupe)}</span></div>`;
  const ligneMaintenant = (j) => (j === aujourdhui && minutesNow > debut && minutesNow < fin
    ? `<span class="maintenant" style="top:${pos(minutesNow)}" aria-hidden="true"></span>` : "");

  $("#grille").style.setProperty("--n", jours.length);
  $("#grille").style.setProperty("--heures", (fin - debut) / 60);
  $("#grille").innerHTML =
    `<div class="g-tete" aria-hidden="true"></div>`
    + jours.map((j) => `<div class="g-tete${j === aujourdhui ? " est-auj" : ""}"><span>${esc(j)}</span>${j === aujourdhui ? `<span class="vh">, aujourd'hui</span>` : ""}</div>`).join("")
    + `<div class="g-heures" aria-hidden="true">${heures.map((h) => `<span style="top:${pos(h)}">${esc(heure(`${h / 60}:00`))}</span>`).join("")}</div>`
    + jours.map((j) => {
      const liste = parJour.get(j) || [];
      return `<div class="g-jour${j === aujourdhui ? " est-auj" : ""}">${couloirs(liste).map(seance).join("")}${ligneMaintenant(j)}</div>`;
    }).join("");

  /* ---------- Planning : liste par jour (téléphone) ---------- */
  $("#liste-jours").innerHTML = jours.map((j, i) => {
    const liste = (parJour.get(j) || []).slice().sort((a, b) => minutes(a.debut) - minutes(b.debut));
    return `<li class="jour-carte${j === aujourdhui ? " est-auj" : ""}" data-r style="--i:${i % 4}">`
      + `<h3><span>${esc(j)}</span>${j === aujourdhui ? `<small>Aujourd'hui</small>` : ""}</h3>`
      + `<ul>${liste.map((c) => `<li class="${couleur(c.groupe)}" data-groupe-seance="${esc(c.groupe)}"><span class="heure">${esc(plage(c))}</span><span>${esc(c.groupe)}</span></li>`).join("")}</ul>`
      + `</li>`;
  }).join("");

  $("#alerte").innerHTML = ASB.alerteHoraires();
  $("#lieu-carte").innerHTML = ASB.carteLieu();
  $("#resume").textContent = ASB.resumeHoraires();
})();
