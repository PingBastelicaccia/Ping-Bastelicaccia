/* Page Résultats : lit le bloc de texte de resultats.html, trie du plus récent
   au plus ancien et affiche les résultats 30 par 30. */
(() => {
  "use strict";
  const { $, esc, f } = ASB;
  const PAR_PAGE = 30;

  /* ---------- Lecture du bloc de texte ---------- */
  function lireDate(txt) {
    const t = txt.trim();
    let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) return new Date(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2] - 1, +m[1]);
    return null;
  }
  const decouperLigne = (l) => l.split(/\s*[;\t|]\s*/).map((x) => x.trim()).filter((x, i, t) => x !== "" || i < t.length - 1);

  function lire(texte) {
    const lignes = [];
    const erreurs = [];
    let comp = null, ordre = 0;
    texte.split(/\r?\n/).forEach((brute, n) => {
      const l = brute.trim();
      if (!l || l.startsWith("#")) return;
      if (l.startsWith("==")) {
        const [date, ...nom] = decouperLigne(l.replace(/^=+\s*/, ""));
        const d = lireDate(date || "");
        if (!d) { erreurs.push(`ligne ${n + 1} : date illisible « ${date} »`); comp = null; return; }
        comp = { d, nom: nom.join(", ") || "Compétition", ordre: ordre++ };
        return;
      }
      const champs = decouperLigne(l);
      if (champs.length >= 4) { // format complet : date ; compétition ; prénom ; place
        const d = lireDate(champs[0]);
        if (!d) { erreurs.push(`ligne ${n + 1} : date illisible « ${champs[0]} »`); return; }
        lignes.push({ d, comp: champs[1], compOrdre: `${champs[0]}|${champs[1]}`, prenom: champs[2], place: champs[3], n });
        return;
      }
      if (!comp) { erreurs.push(`ligne ${n + 1} : aucune compétition au-dessus (ligne == manquante)`); return; }
      lignes.push({ d: comp.d, comp: comp.nom, compOrdre: comp.ordre, prenom: champs[0], place: champs[1] || "", n });
    });
    return { lignes, erreurs };
  }

  const valeurPlace = (p) => { const m = String(p).match(/\d+/); return m ? Number(m[0]) : Infinity; };
  function placeAffichee(p) {
    const t = String(p).trim();
    if (/^\d+$/.test(t)) return t === "1" ? "1er" : `${t}e`;
    return t || "-";
  }

  /* ---------- Affichage ---------- */
  const { lignes, erreurs } = lire($("#resultats-donnees")?.textContent || "");
  const ordreComp = (a, b) => (typeof a.compOrdre === "number" && typeof b.compOrdre === "number"
    ? a.compOrdre - b.compOrdre : String(a.compOrdre).localeCompare(String(b.compOrdre)));
  lignes.sort((a, b) => b.d - a.d || ordreComp(a, b) || valeurPlace(a.place) - valeurPlace(b.place) || a.n - b.n);
  if (erreurs.length) console.warn("Résultats : lignes ignorées\n" + erreurs.join("\n"));
  $("#res-exemple").hidden = !(SITE.brouillon && lignes.some((l) => /^Exemple\b/i.test(l.prenom)));

  const total = lignes.length;
  const pages = Math.max(1, Math.ceil(total / PAR_PAGE));
  let page = 0;

  /* Navigation entre les pages : « ‹ [ n ] › », en haut et en bas du tableau */
  const fleche = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const ICONES = {
    premiere: fleche("M12 6l-6 6 6 6M18 6l-6 6 6 6"),
    prec: fleche("M15 6l-6 6 6 6"),
    suiv: fleche("M9 6l6 6-6 6"),
    derniere: fleche("M6 6l6 6-6 6M12 6l6 6-6 6")
  };
  const ETIQUETTES = {
    premiere: "Premiers résultats, les plus récents",
    prec: "Page précédente, plus récente",
    suiv: "Page suivante, plus ancienne",
    derniere: "Derniers résultats, les plus anciens"
  };
  function construirePager(el, suffixe) {
    el.innerHTML = `<button class="btn-rond" type="button" data-aller="premiere" aria-label="${ETIQUETTES.premiere}">${ICONES.premiere}</button>`
      + `<button class="btn-rond" type="button" data-aller="prec" aria-label="${ETIQUETTES.prec}">${ICONES.prec}</button>`
      + `<label class="pager-saisie" for="page-${suffixe}"><span class="vh">Page</span><input id="page-${suffixe}" type="number" inputmode="numeric" min="1" max="${pages}" value="1"><span aria-hidden="true">/ ${pages}</span><span class="vh">sur ${pages}</span></label>`
      + `<button class="btn-rond" type="button" data-aller="suiv" aria-label="${ETIQUETTES.suiv}">${ICONES.suiv}</button>`
      + `<button class="btn-rond" type="button" data-aller="derniere" aria-label="${ETIQUETTES.derniere}">${ICONES.derniere}</button>`;
    el.querySelectorAll("[data-aller]").forEach((b) => b.addEventListener("click", () => {
      const cible = { premiere: 0, prec: page - 1, suiv: page + 1, derniere: pages - 1 }[b.dataset.aller];
      aller(cible, el.id === "pager-bas");
    }));
    const saisie = el.querySelector("input");
    const valider = () => aller(Number(saisie.value) - 1, el.id === "pager-bas");
    saisie.addEventListener("change", valider);
    saisie.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { ev.preventDefault(); valider(); } });
  }
  const pagers = [$("#pager-haut"), $("#pager-bas")];
  pagers.forEach((el, i) => { el.hidden = pages < 2; construirePager(el, i ? "bas" : "haut"); });

  function aller(cible, depuisLeBas) {
    const n = Number.isFinite(cible) ? Math.min(pages - 1, Math.max(0, Math.round(cible))) : page;
    page = n;
    afficher();
    if (depuisLeBas) $("#res-haut").scrollIntoView({ behavior: ASB.ANIM ? "smooth" : "auto", block: "start" });
  }

  function afficher() {
    const debut = page * PAR_PAGE;
    const tranche = lignes.slice(debut, debut + PAR_PAGE);
    let precedente = null;
    $("#res-lignes").innerHTML = tranche.length ? tranche.map((l, i) => {
      const cle = `${+l.d}|${l.comp}`;
      const nouvelle = cle !== precedente;
      precedente = cle;
      const v = valeurPlace(l.place);
      const podium = v <= 3 ? ` place-${v}` : "";
      return `<tr class="${nouvelle && i > 0 ? "nouvelle-comp" : ""}">`
        + `<td class="col-date">${esc(f.numerique.format(l.d))}</td>`
        + `<td>${esc(l.comp)}<span class="date-mobile">${esc(f.numerique.format(l.d))}</span></td>`
        + `<td class="col-prenom">${esc(l.prenom)}</td>`
        + `<td class="col-place"><span class="place${podium}">${esc(placeAffichee(l.place))}</span></td></tr>`;
    }).join("") : `<tr><td colspan="4" class="vide">Aucun résultat pour l'instant.</td></tr>`;

    $("#res-compte").textContent = total ? `Résultats ${debut + 1} à ${debut + tranche.length} sur ${total}` : "";
    pagers.forEach((el) => {
      el.querySelector("input").value = page + 1;
      el.querySelector('[data-aller="premiere"]').disabled = page === 0;
      el.querySelector('[data-aller="prec"]').disabled = page === 0;
      el.querySelector('[data-aller="suiv"]').disabled = page >= pages - 1;
      el.querySelector('[data-aller="derniere"]').disabled = page >= pages - 1;
    });
  }
  afficher();
})();
