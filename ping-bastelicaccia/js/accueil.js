/* Page d'accueil : prochain rendez-vous, dates à venir, chiffres, infos pratiques, photos. */
(() => {
  "use strict";
  const { $, $$, esc, cap, f, aujourdhui, ecartJours, versIso, aLaUne, aVenir, evenements, typeDe, TYPES, dateLongue, lienAgenda, borne } = ASB;
  const ref = aujourdhui();
  const une = aLaUne(ref);

  /* Pastille du haut de page */
  const pastille = $("#hero-rdv");
  pastille.hidden = !une;
  if (une) {
    pastille.href = `agenda.html#jour-${versIso(une.d)}`;
    pastille.innerHTML = `<span class="point" aria-hidden="true"></span><span><small>Prochain rendez-vous, ${esc(f.court.format(une.d))}</small><strong>${esc(une.titre)}</strong></span>`;
  }

  /* Prochain rendez-vous */
  const zone = $("#rdv-contenu");
  if (une) {
    const n = Math.max(0, ecartJours(une.d, ref));
    const decompte = n === 0
      ? `<p class="decompte" data-r><span class="decompte-n petit">Aujourd'hui</span></p>`
      : `<p class="decompte" data-r><span class="decompte-av">dans</span><span class="decompte-n" data-compte="${n}">${n}</span><span class="decompte-u">${n > 1 ? "jours" : "jour"}</span></p>`;
    const precision = [une.detail, une.lieu ? `à ${une.lieu}` : ""].filter(Boolean).join(", ");
    zone.innerHTML = decompte
      + `<div data-r style="--i:2"><p class="rdv-titre">${esc(une.titre)}</p>`
      + `<p class="rdv-quand">${esc(cap(dateLongue(une)))}${precision ? `, ${esc(precision)}` : ""}</p>`
      + (une.texte ? `<p class="rdv-texte">${esc(une.texte)}</p>` : "")
      + (une.club ? `<p class="tags"><span class="tag tag-club">Le club participe</span></p>` : "")
      + `<p class="actions"><a class="btn btn-plein" href="${esc(lienAgenda(une))}">Ajouter à Google Agenda</a><a class="btn" href="agenda.html#saison">Voir l'agenda</a></p></div>`;
  } else {
    zone.innerHTML = `<p class="rdv-texte" data-r>La saison est terminée. Le prochain calendrier sera affiché ici dès sa sortie.</p>`;
  }

  /* Dates à venir (défilé horizontal) */
  const suite = aVenir(ref).filter((e) => e !== une && !SITE.nePasMettreEnAvant.includes(e.niveau)).slice(0, 8);
  $("#piste").innerHTML = suite.map((e, i) => {
    const type = typeDe(e);
    const surPlusieurs = +e.d !== +e.f;
    const num = surPlusieurs ? `${e.d.getDate()}-${e.f.getDate()}` : e.d.getDate();
    const jours = surPlusieurs ? `${f.semaine.format(e.d)} et ${f.semaine.format(e.f)}` : f.semaine.format(e.d);
    return `<li><a class="carte" href="agenda.html#jour-${versIso(e.d)}" data-r style="--i:${Math.min(i, 4)}">`
      + `<span><span class="carte-num${surPlusieurs ? " plage" : ""}">${num}</span><span class="carte-mois">${esc(cap(f.moisAn.format(e.d)))}</span></span>`
      + `<span class="carte-bas"><span class="tag"><i class="mk mk-${type}"></i>${esc(TYPES[type].nom)}</span>`
      + `<span class="carte-titre">${esc(e.titre)}${e.detail ? ` <span>${esc(e.detail)}</span>` : ""}</span>`
      + `<span class="carte-lieu">${esc(cap(jours))}, ${e.lieu ? `à ${esc(e.lieu)}` : "lieu à préciser"}</span></span></a></li>`;
  }).join("")
    + `<li><a class="carte carte-fin" href="agenda.html#saison" data-r style="--i:${Math.min(suite.length, 4)}"><span class="carte-titre">Toute la saison</span><span>${evenements.length} dates au calendrier</span></a></li>`;

  /* Chiffres de la saison */
  const villes = new Set(evenements.map((e) => e.lieu).filter(Boolean)).size;
  const tours = evenements.filter((e) => /^Critérium régional/.test(e.titre)).length;
  $("#chiffres").innerHTML = [
    [evenements.length, "rendez-vous au calendrier de la saison"],
    [villes, "villes de Corse au programme"],
    [tours, "tours de critérium régional"]
  ].map(([n, label], i) => `<div class="chiffre" data-r style="--i:${i}"><dt>${esc(label)}</dt><dd data-compte="${n}">${n}</dd></div>`).join("");

  /* Venir jouer */
  const s = SITE;
  const bloc = (titre, contenu, i) => `<div data-r style="--i:${i}"><dt>${esc(titre)}</dt><dd>${contenu}</dd></div>`;
  const tel = s.contact.telephone ? `<br><a href="${ASB.telLien(s.contact.telephone)}">${esc(s.contact.telephone)}</a>` : "";
  const mail = s.contact.email ? `<br><a href="mailto:${esc(s.contact.email)}">${esc(s.contact.email)}</a>` : "";
  $("#infos").innerHTML =
    bloc("Salle", `${esc(s.salle.nom)}<br>${esc(s.salle.commune)}${s.salle.plan ? `<br><a href="${esc(s.salle.plan)}">Voir l'itinéraire</a>` : ""}`, 0)
    + bloc("Entraînements", `<p>${esc(ASB.resumeHoraires())}</p><p class="actions"><a class="btn btn-plein" href="entrainements.html">Découvrir nos entraînements</a></p>`, 1)
    + bloc("Contact", `${esc(s.contact.nom)}, ${esc(s.contact.role)}${tel}${mail}`, 2)
    + bloc("Adhésion", s.adhesion ? esc(s.adhesion) : "Tarifs et inscription : renseignements auprès du club.", 3);

  /* Photos */
  ASB.grille($("#accueil-photos"), PHOTOS.slice(0, 5), 5, "mosaique");

  /* Table en 3D : elle bascule pendant qu'on descend */
  const hero = $("#hero");
  ASB.auDefilement.push((y) => {
    if (ASB.ANIM) hero.style.setProperty("--p", borne(y / window.innerHeight, 0, 1).toFixed(4));
    const sec = $("#horizon");
    if (sec.classList.contains("epingle")) {
      const deb = Number(sec.dataset.deb), haut = Number(sec.dataset.haut);
      const k = deb > 0 ? borne((haut - sec.getBoundingClientRect().top) / deb, 0, 1) : 0;
      $("#piste").style.transform = `translate3d(${(-k * Number(sec.dataset.deb)).toFixed(1)}px,0,0)`;
      $("#jauge").style.setProperty("--k", k.toFixed(4));
    }
  });

  /* Défilé horizontal épinglé sur grand écran */
  const grandEcran = window.matchMedia("(min-width: 60rem)");
  function preparerHorizon() {
    const sec = $("#horizon"), piste = $("#piste"), collant = $("#horizon-collant");
    piste.style.transform = "";
    if (ASB.ANIM && grandEcran.matches) {
      // Le bloc reste fixé au milieu de l'écran le temps que les cartes défilent,
      // sans réserver plus de hauteur que nécessaire (pas de grand vide avant ou après).
      sec.classList.add("epingle");
      const deb = Math.max(0, piste.offsetWidth - collant.clientWidth);
      const h = collant.offsetHeight;
      const haut = Math.max(72, (window.innerHeight - h) / 2);
      sec.dataset.deb = deb;
      sec.dataset.haut = haut;
      collant.style.top = `${haut}px`;
      sec.style.height = `${h + deb}px`;
    } else {
      sec.classList.remove("epingle");
      sec.style.height = "";
      collant.style.top = "";
      sec.dataset.deb = 0;
    }
  }
  $("#piste").addEventListener("scroll", () => {
    const p = $("#piste");
    if ($("#horizon").classList.contains("epingle")) return;
    const max = p.scrollWidth - p.clientWidth;
    $("#jauge").style.setProperty("--k", max > 0 ? (p.scrollLeft / max).toFixed(4) : 0);
  }, { passive: true });

  ASB.aLaMiseEnPage.push(() => { ASB.ajuster($("#t-accueil")); preparerHorizon(); });
  $("#defiler").addEventListener("click", () => $("#rdv").scrollIntoView({ behavior: ASB.ANIM ? "smooth" : "auto" }));
})();
