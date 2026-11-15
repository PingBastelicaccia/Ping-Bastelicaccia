# Ping Bastelicaccia : site du club

Site statique, sans base de données ni build : tout tient dans `index.html`.

```
ping-bastelicaccia/
├── index.html        le site (contenu modifiable tout en haut du <script>)
├── img/galerie/      les photos du club
├── .nojekyll         dit à GitHub Pages de servir les fichiers tels quels
└── README.md
```

## Mettre à jour le contenu

Ouvre `index.html` et va à la section **1. CONTENU DU SITE** (début du `<script>`). Trois blocs :

| Bloc | Ce que tu y changes |
|---|---|
| `SITE` | nom, salle, contact, horaires d'entraînement, tarifs, liens Discord / WhatsApp / Facebook, mentions légales |
| `EVENEMENTS` | l'agenda : une ligne par date |
| `PHOTOS` | la galerie : une ligne par photo |

### Ajouter une date

```js
{ date: "2027-02-27", titre: "Tournoi du club", type: "club", lieu: "Bastelicaccia", club: true },
```

- `type` : `equipes`, `individuel`, `jeunes`, `coupe` ou `club`.
- `fin: "2027-02-28"` si l'épreuve dure plusieurs jours.
- `club: true` affiche « Le club participe » et fait passer la date en tête de l'accueil.
- Les dates passées basculent toutes seules dans « Déjà joué ». Rien à supprimer.

### Ajouter une photo

1. Dépose le fichier dans `img/galerie/` (JPEG, 1600 px de large suffisent, moins de 400 Ko).
2. Ajoute sa ligne dans `PHOTOS` :

```js
{ src: "img/galerie/2026-11-mille-tables-01.jpg", legende: "Mille tables & une raquette", album: "Mille tables" },
```

Dès qu'il y a une vraie photo, les images d'exemple disparaissent.

### Horaires d'entraînement

```js
entrainements: [
  { jour: "Mardi", horaire: "18 h à 20 h", public: "Adultes, loisir et compétition" },
],
```

## Mettre en ligne avec GitHub Pages

1. Crée un dépôt public sur GitHub, par exemple `ping-bastelicaccia`.
2. Envoie le contenu de ce dossier à la racine du dépôt (`index.html` doit être au premier niveau).
3. Dans le dépôt : **Settings** puis **Pages**.
4. Sous « Build and deployment », « Source » : **Deploy from a branch**.
5. Choisis la branche `main` et le dossier `/ (root)`, puis **Save**.
6. Le site arrive sur `https://TON-PSEUDO.github.io/ping-bastelicaccia/` (compte jusqu'à dix minutes la première fois).

Ensuite, chaque `git push` sur `main` republie le site.

## Avant d'ouvrir le site au public

- [ ] Le bureau du club a validé le contenu.
- [ ] La personne citée dans « Contact » est d'accord pour que son numéro soit affiché.
- [ ] Chaque photo a l'accord des personnes visibles, et celui des parents pour les mineurs.
- [ ] `SITE.mentions` est rempli (responsable de la publication, hébergeur).
- [ ] Horaires, tarifs et liens Discord / WhatsApp sont renseignés.
- [ ] `brouillon: false` dans `SITE` : le bandeau et les rappels « À compléter » disparaissent.

## À savoir

- **Sources.** Les dates viennent du calendrier 2026/2027 de la Ligue Corse de Tennis de Table (version 2, octobre 2026) : https://liguecorsett.fr/competitions/calendrier-des-competitions/. Si la ligue publie une version 3, compare et corrige `EVENEMENTS`.
- **Championnat PACA.** Les journées PACA sont dans l'agenda mais pas sur l'accueil (`nePasMettreEnAvant`). Vide cette liste si le club y a une équipe.
- **Polices.** Sofia Sans est chargée depuis Google Fonts. Pour ne dépendre d'aucun serveur tiers, télécharge les fichiers de police et sers-les depuis le dépôt.
- **Forum.** Pas de forum sur le site : les échanges passent par Discord ou WhatsApp, dont les liens se règlent dans `SITE.liens`.
