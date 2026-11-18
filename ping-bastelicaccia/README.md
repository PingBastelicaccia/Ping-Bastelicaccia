# Ping Bastelicaccia : site du club

Site statique (HTML, CSS, JavaScript), sans base de données ni étape de build. Hébergé sur Vercel, code sur GitHub.

```
├── index.html              Accueil
├── presentation.html       Présentation du club
├── entrainements.html      Planning de la semaine (calculé depuis js/donnees.js)
├── agenda.html             Calendrier du mois + toute la saison
├── resultats.html          Résultats des matchs (le bloc à remplir est en haut du fichier)
├── photos.html             Galerie
├── contact.html            Réseaux, coordonnées, salle et horaires
├── mentions-legales.html
├── css/style.css           Une seule feuille de style pour tout le site
├── js/
│   ├── tete.js             Prépare les animations avant l'affichage
│   ├── donnees.js          LE FICHIER À MODIFIER : infos du club, horaires, agenda, photos
│   ├── commun.js           Fonctionnement partagé : menu, pied de page, rideau, animations
│   └── accueil.js, presentation.js, entrainements.js, agenda.js, resultats.js, photos.js, contact.js
└── img/galerie/            Les photos
```

## Ce qui se modifie, et où

| Je veux changer… | Fichier |
|---|---|
| Téléphone, e-mail, salle, liens Facebook / Instagram | `js/donnees.js`, bloc `SITE` |
| Horaires d'entraînement (accueil, Entraînements, Contact) | `js/donnees.js`, `SITE.entrainements` |
| Une date de l'agenda | `js/donnees.js`, `EVENEMENTS` |
| Une photo | `img/galerie/` puis `js/donnees.js`, `PHOTOS` (avec son album) |
| Bureau, SIRET, réseaux (Facebook, Instagram, TikTok) | `js/donnees.js`, bloc `SITE` |
| Les résultats | `resultats.html`, bloc entre les deux commentaires « RÉSULTATS » |
| Le texte de présentation | `presentation.html` |

Le pied de page et le menu se construisent tout seuls à partir de `SITE` : rien à recopier d'une page à l'autre.

## Ajouter des résultats

En haut de `resultats.html` :

```
== 2026-11-29 ; Critérium régional, Bonifacio
Lucas ; 3
Emma ; 1
Paul ; 12
```

- `==` ouvre une compétition (date puis nom). La date s'écrit `2026-11-29` ou `29/11/2026`.
- En dessous, une ligne par joueur : `prénom ; place`. Deux colonnes copiées d'un tableur se collent telles quelles (la tabulation remplace le `;`).
- L'ordre n'a pas d'importance : le site trie du plus récent au plus ancien.
- 30 lignes par page ; les flèches « ‹ [n] › » en haut et en bas du tableau changent de page.
- Une ligne qui commence par `#` est ignorée.
- Une ligne mal écrite est ignorée et signalée dans la console du navigateur (F12).

Pourquoi pas un fichier JSON : une virgule oubliée suffit à casser tout le fichier, et un JSON se charge avec `fetch`, ce qui ne marche pas quand on ouvre `resultats.html` directement depuis son ordinateur. Le bloc de texte se colle sans précaution et marche partout.

## Ajouter une date ou une photo

```js
{ date: "2027-02-27", titre: "Tournoi du club", type: "club", lieu: "Bastelicaccia", club: true },
```

`type` : `equipes`, `individuel`, `jeunes`, `coupe` ou `club`. `club: true` fait passer la date en tête de l'accueil.

```js
{ src: "img/galerie/2026-11-mille-tables.jpg", legende: "Mille tables & une raquette", album: "vie-du-club" },
```

`album` : `competition`, `entrainement`, `vie-du-club` ou `stage` (liste `ALBUMS` dans `js/donnees.js`). Les 5 premières photos de la liste apparaissent sur l'accueil.

## Avant d'ouvrir le site au public

- [ ] Remplacer les lignes « Exemple » de `resultats.html`.
- [ ] Compléter la présentation (histoire, bureau) dans `presentation.html`.
- [ ] Faire relire les mentions légales par le responsable de la publication.
- [ ] Mettre `brouillon: false` dans `js/donnees.js` : l'étiquette « Version de travail » et les rappels « À compléter » disparaissent.

## Tester en local

Ouvre `index.html` dans le navigateur, ou lance un petit serveur :

```
python -m http.server
```

puis va sur http://localhost:8000.
