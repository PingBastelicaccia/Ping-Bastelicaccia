/* Chargé dans le <head> de chaque page, avant l'affichage :
   prépare les animations (intro à la première visite, rideau entre deux pages). */
(function () {
  var d = document.documentElement;
  var calme = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (calme || !d.animate) return;
  d.classList.add("anim");
  try {
    if (sessionStorage.getItem("asb-rideau") === "1") {
      sessionStorage.removeItem("asb-rideau");
      d.classList.add("arrivee");
    } else if (!sessionStorage.getItem("asb-intro")) {
      d.classList.add("intro");
    }
  } catch (e) { /* stockage indisponible : pas d'intro */ }
  // Filet de sécurité : si le script principal ne démarre pas, tout s'affiche normalement.
  setTimeout(function () { if (!window.__asbPret) d.classList.remove("anim", "intro", "arrivee"); }, 3000);
})();
