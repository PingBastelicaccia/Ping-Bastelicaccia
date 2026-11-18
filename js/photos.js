/* Page Photos : une sous-galerie par album (Compétition, Entraînement, Vie du club, Stage). */
(() => {
  "use strict";
  const { $, esc } = ASB;
  const albums = ALBUMS.slice();
  // Une photo sans album, ou avec un album inconnu, va dans une rubrique « Autres ».
  const connus = new Set(albums.map((a) => a.cle));
  if (PHOTOS.some((p) => !connus.has(p.album))) albums.push({ cle: "autres", nom: "Autres" });
  const photosDe = (cle) => PHOTOS.filter((p) => (cle === "autres" ? !connus.has(p.album) : p.album === cle));

  $("#albums").innerHTML = albums.map((a) => {
    const n = photosDe(a.cle).length;
    return `<a class="chip" href="#${esc(a.cle)}">${esc(a.nom)} <span class="chip-n">${n}</span></a>`;
  }).join("");

  $("#sous-galeries").innerHTML = albums.map((a) => `<section class="album" id="${esc(a.cle)}" aria-labelledby="t-${esc(a.cle)}">
      <div class="album-tete"><h2 class="titre-bloc" id="t-${esc(a.cle)}" data-r="mots">${esc(a.nom)}</h2><p class="discret" data-r></p></div>
      <div class="galerie" data-album="${esc(a.cle)}"></div>
    </section>`).join("");

  albums.forEach((a) => {
    const photos = photosDe(a.cle);
    const section = $(`#${a.cle}`);
    section.querySelector(".discret").textContent = photos.length
      ? `${photos.length} photo${photos.length > 1 ? "s" : ""}`
      : "Les photos arrivent bientôt.";
    ASB.grille(section.querySelector(".galerie"), photos, 3, "galerie");
  });
})();
