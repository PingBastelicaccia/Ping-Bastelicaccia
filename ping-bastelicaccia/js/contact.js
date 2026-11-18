/* Page Contact : réseaux du club, coordonnées, salle et horaires. */
(() => {
  "use strict";
  const { $, esc, telLien } = ASB;
  const l = SITE.liens, c = SITE.contact;

  const canal = (nom, desc, url, action, i, plein = true) => (url
    ? `<li class="canal" data-r style="--i:${i}"><div><p class="canal-nom">${esc(nom)}</p><p class="canal-desc">${desc}</p></div><a class="btn${plein ? " btn-plein" : ""}" href="${esc(url)}">${esc(action)}</a></li>`
    : "");
  $("#canaux").innerHTML =
    canal("Page Facebook du club", "Les nouvelles et les photos publiées par le club.", l.facebook, "Ouvrir Facebook", 0)
    + canal("Page Instagram du club", "Les photos et les stories du club.", l.instagram, "Ouvrir Instagram", 1)
    + canal("Compte TikTok du club", "Les vidéos du club.", l.tiktok, "Ouvrir TikTok", 2)
    + canal("Écrire au club",
      `${esc(c.nom)}, ${esc(c.role)} : <a href="${telLien(c.telephone)}">${esc(c.telephone)}</a>, <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`,
      c.email ? `mailto:${c.email}` : "", "Envoyer un e-mail", 3, false);

  $("#lieu").innerHTML =
    `<div data-r>${ASB.carteLieu()}</div>`
    + `<div class="lieu-horaires" data-r style="--i:1"><h3 class="sous-titre">Horaires d'entraînement</h3>${ASB.horaires(true)}${ASB.alerteHoraires()}`
    + `<p class="actions"><a class="btn" href="entrainements.html">Voir le planning de la semaine</a></p></div>`;
})();
