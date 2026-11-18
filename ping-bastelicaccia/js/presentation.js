/* Page Présentation : publics (calculés depuis les horaires), équipe et fiche du club (depuis js/donnees.js). */
(() => {
  "use strict";
  const { $, esc, plage, minutes, telLien } = ASB;

  /* Texte affiché sous chaque public. Un public absent de cette liste s'affiche sans texte. */
  const DESCRIPTIONS = {
    "Enfants": "Découvrir le ping et progresser en s'amusant, dès 5 ans, après l'école.",
    "Compétition enfants": "Pour les jeunes joueurs qui disputent les compétitions.",
    "Compétition adultes et jeunes": "Les compétiteurs, jeunes et adultes, à la même table.",
    "Compétition adultes": "La séance des compétiteurs adultes.",
    "Loisir et plus de 60 ans": "Jouer pour le plaisir, à son rythme, sans enjeu de résultat.",
    "Loisir": "Jouer pour le plaisir, quel que soit son niveau.",
    "Ping féminin": "Un créneau réservé aux joueuses, tous niveaux."
  };

  const ordreJour = (j) => ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].indexOf(j);
  const creneaux = SITE.entrainements.flatMap((j) => j.creneaux.map((c) => ({ ...c, jour: j.jour })));
  const groupes = new Map();
  creneaux.forEach((c) => {
    if (!groupes.has(c.groupe)) groupes.set(c.groupe, []);
    groupes.get(c.groupe).push(c);
  });
  // Mêmes couleurs que sur la page Entraînements (ordre d'apparition des publics)
  const ordre = [...groupes.keys()];
  const couleur = (g) => `c${ordre.indexOf(g) % 8}`;
  $("#publics").innerHTML = [...groupes].map(([nom, liste], i) =>
    `<article class="public ${couleur(nom)}" data-r style="--i:${i % 3}">`
    + `<h3><i class="pastille-groupe" aria-hidden="true"></i>${esc(nom)}</h3>`
    + (DESCRIPTIONS[nom] ? `<p>${esc(DESCRIPTIONS[nom])}</p>` : "")
    + `<dl class="public-creneaux">${liste.sort((a, b) => ordreJour(a.jour) - ordreJour(b.jour) || minutes(a.debut) - minutes(b.debut))
      .map((c) => `<div><dt>${esc(c.jour)}</dt><dd class="heure">${esc(plage(c))}</dd></div>`).join("")}</dl></article>`).join("");
  const nb = $("#nb-seances");
  if (nb) { nb.textContent = creneaux.length; nb.dataset.compte = creneaux.length; }

  const s = SITE;
  const membres = [...s.bureau, { role: "Éducatrice, animatrice fédérale", nom: s.contact.nom }];
  $("#equipe").innerHTML = membres.map((m, i) => `<div data-r style="--i:${i}"><dt>${esc(m.role)}</dt><dd>${esc(m.nom)}</dd></div>`).join("");

  const l = s.liens;
  const reseaux = [["Facebook", l.facebook], ["Instagram", l.instagram], ["TikTok", l.tiktok]].filter(([, u]) => u)
    .map(([nom, u]) => `<a href="${esc(u)}">${nom}</a>`).join(", ");
  const lignes = [
    ["Nom", s.nomComplet],
    ["SIRET", s.siret],
    ["Numéro de club FFTT", s.numeroClub],
    ["Adresse", `${s.salle.nom}, ${s.salle.commune}`],
    ["Téléphone", s.contact.telephone ? `<a href="${telLien(s.contact.telephone)}">${esc(s.contact.telephone)}</a>` : "", true],
    ["E-mail", s.contact.email ? `<a href="mailto:${esc(s.contact.email)}">${esc(s.contact.email)}</a>` : "", true],
    ["Réseaux", reseaux, true]
  ].filter(([, v]) => v);
  $("#fiche").innerHTML = lignes.map(([t, v, html], i) => `<div data-r style="--i:${i % 4}"><dt>${esc(t)}</dt><dd>${html ? v : esc(v)}</dd></div>`).join("");
})();
