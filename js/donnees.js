/* =====================================================================
   CONTENU DU SITE
   C'est le fichier à modifier pour tenir le site à jour (infos du club,
   horaires, agenda, photos). Les résultats se remplissent dans resultats.html.
   ===================================================================== */

const SITE = {
  brouillon: true,            // true : étiquette « Version de travail » et rappels « À compléter ». Mets false pour la mise en ligne.
  nom: "Ping Bastelicaccia",
  nomOfficiel: "A.S. Bastelicaccia",
  nomComplet: "Association Sportive de Bastelicaccia",
  siret: "491 072 633 00036",
  sigle: "ASB",
  logo: "",                   // ex. "img/logo.png". Vide : pastille avec le sigle.
  accroche: "Le tennis de table à Bastelicaccia.",
  numeroClub: "05990009",
  salle: {
    nom: "Salle omnisports de Bastelicaccia",
    commune: "20129 Bastelicaccia",
    plan: "https://maps.app.goo.gl/rN4DXqvnMib3mTge6",
    gps: "41.928181,8.8238888"  // latitude,longitude du gymnase (pour Plans et Waze)
  },
  contact: {                  // coordonnées publiées par la ligue (liguecorsett.fr, page « Les clubs »)
    nom: "Corine Cavicchi",
    role: "éducatrice du club",
    telephone: "06 40 63 24 10",
    email: "contactasb@laposte.net"
  },
  responsablePublication: "Sébastien Lascombes",
  bureau: [
    { role: "Présidente", nom: "Marie-Pierre Matraja" },
    { role: "Trésorier", nom: "Sébastien Lascombes" },
    { role: "Secrétaire", nom: "Célia Quastana" }
  ],

  /* Horaires d'une semaine normale (planning de présence 2026/2027).
     Une ligne par créneau : début et fin au format "HH:MM". */
  entrainements: [
    { jour: "Lundi",    creneaux: [
      { debut: "16:30", fin: "18:00", groupe: "Enfants" },
      { debut: "18:00", fin: "20:00", groupe: "Compétition adultes" } ] },
    { jour: "Mardi",    creneaux: [
      { debut: "16:30", fin: "18:00", groupe: "Enfants" },
      { debut: "18:00", fin: "20:00", groupe: "Loisir et plus de 60 ans" } ] },
    { jour: "Mercredi", creneaux: [
      { debut: "15:00", fin: "16:00", groupe: "Enfants" },
      { debut: "16:00", fin: "17:30", groupe: "Compétition enfants" },
      { debut: "17:30", fin: "19:00", groupe: "Compétition adultes et jeunes" } ] },
    { jour: "Jeudi",    creneaux: [
      { debut: "16:30", fin: "18:00", groupe: "Enfants" },
      { debut: "18:00", fin: "20:00", groupe: "Loisir" } ] },
    { jour: "Vendredi", creneaux: [
      { debut: "19:15", fin: "20:15", groupe: "Ping féminin" } ] },
    { jour: "Samedi",   creneaux: [
      { debut: "09:00", fin: "10:30", groupe: "Compétition adultes et jeunes" },
      { debut: "10:30", fin: "12:00", groupe: "Compétition enfants" } ] }
  ],
  messageHoraires: "Ces horaires valent pour une semaine normale. Vacances scolaires, compétition, salle indisponible : vérifiez les actualités du club sur Facebook ou Instagram avant de venir.",

  adhesion: "",               // ex. "Licence loisir : … €. Licence compétition : … €. Certificat médical demandé."
  liens: {
    facebook: "https://www.facebook.com/ping.bastelicaccia",
    instagram: "https://www.instagram.com/asbastelicaccia/",
    tiktok: "https://www.tiktok.com/@asbastelicaccia",
    ligue: "https://liguecorsett.fr/",
    calendrierLigue: "https://liguecorsett.fr/competitions/calendrier-des-competitions/",
    fftt: "https://www.fftt.com/"
  },
  sourceCalendrier: "Calendrier : Ligue Corse de Tennis de Table, version 2 (octobre 2026).",
  nePasMettreEnAvant: ["PACA"] // niveaux absents de l'accueil (ils restent dans l'agenda)
};

/* Un événement par ligne.
   date : "AAAA-MM-JJ" · fin : dernier jour si l'épreuve dure plusieurs jours
   type : "equipes" | "individuel" | "jeunes" | "coupe" | "club"
   club : true si le club y participe (l'événement passe alors en tête de l'accueil) */
const EVENEMENTS = [
  { date: "2026-09-19", titre: "Championnat par équipes PACA", detail: "Journée 1", type: "equipes", niveau: "PACA" },
  { date: "2026-09-26", fin: "2026-09-27", titre: "Top 12", type: "individuel", lieu: "Bonifacio" },
  { date: "2026-10-03", titre: "Championnat par équipes PACA", detail: "Journée 2", type: "equipes", niveau: "PACA" },
  { date: "2026-10-04", titre: "Championnat par équipes R1 Corse", detail: "Journée 1", type: "equipes" },
  { date: "2026-10-04", titre: "Championnat par équipes départemental 2A", type: "equipes" },
  { date: "2026-10-10", titre: "Critérium départemental jeunes", type: "jeunes" },
  { date: "2026-10-11", titre: "Critérium régional", type: "individuel", lieu: "Borgo" },
  { date: "2026-10-17", titre: "Championnat par équipes PACA", detail: "Journée 3", type: "equipes", niveau: "PACA" },
  { date: "2026-10-24", titre: "Top jeunes départemental", type: "jeunes" },
  { date: "2026-11-07", titre: "Championnat par équipes PACA", detail: "Journée 4", type: "equipes", niveau: "PACA" },
  { date: "2026-11-08", titre: "Championnat par équipes départemental 2A", type: "equipes" },
  { date: "2026-11-08", titre: "Championnat par équipes R1 Corse", detail: "Journée 2", type: "equipes" },
  { date: "2026-11-14", titre: "Critérium départemental jeunes", type: "jeunes" },
  { date: "2026-11-15", titre: "Critérium régional", type: "individuel", lieu: "Bonifacio" },
  { date: "2026-11-21", titre: "Championnat par équipes PACA", detail: "Journée 5", type: "equipes", niveau: "PACA" },
  { date: "2026-11-21", titre: "Mille tables & une raquette", type: "club", club: true,
    texte: "Opération nationale sport-santé autour de la BPCO. Le club y participe le samedi matin." },
  { date: "2026-11-22", titre: "Championnat par équipes R1 Corse", detail: "Journée 3", type: "equipes" },
  { date: "2026-11-28", titre: "Top jeunes départemental", type: "jeunes" },
  { date: "2026-12-05", titre: "Championnat par équipes PACA", detail: "Journée 6", type: "equipes", niveau: "PACA" },
  { date: "2026-12-06", titre: "Championnat par équipes départemental 2A", type: "equipes" },
  { date: "2026-12-06", titre: "Championnat par équipes R1 Corse", detail: "Finales", type: "equipes", lieu: "Bonifacio" },
  { date: "2026-12-12", titre: "Championnat par équipes PACA", detail: "Journée 7", type: "equipes", niveau: "PACA" },
  { date: "2027-01-09", fin: "2027-01-10", titre: "Vétérans", detail: "Coupe et individuels", type: "individuel", lieu: "Bonifacio" },
  { date: "2027-01-16", titre: "Championnat par équipes PACA", detail: "Journée 13", type: "equipes", niveau: "PACA" },
  { date: "2027-01-17", titre: "Championnat par équipes R1 Corse", detail: "Journée 13", type: "equipes" },
  { date: "2027-01-23", titre: "Championnat par équipes PACA", detail: "Journée 14", type: "equipes", niveau: "PACA" },
  { date: "2027-01-24", titre: "Championnat par équipes départemental 2A", type: "equipes" },
  { date: "2027-01-30", titre: "Critérium départemental jeunes", type: "jeunes" },
  { date: "2027-01-31", titre: "Critérium régional", type: "individuel", lieu: "Bastia" },
  { date: "2027-02-06", titre: "Championnat par équipes PACA", detail: "Journée 15", type: "equipes", niveau: "PACA" },
  { date: "2027-02-07", titre: "Championnat par équipes R1 Corse", detail: "Journée 14", type: "equipes" },
  { date: "2027-02-13", titre: "Top jeunes départemental", type: "jeunes" },
  { date: "2027-02-21", titre: "Qualificatifs des finales par classement", type: "individuel", lieu: "Sartène" },
  { date: "2027-03-06", titre: "Critérium départemental jeunes", type: "jeunes" },
  { date: "2027-03-07", titre: "Critérium régional", type: "individuel", lieu: "Porto-Vecchio" },
  { date: "2027-03-13", titre: "Championnat par équipes PACA", detail: "Journée 16", type: "equipes", niveau: "PACA" },
  { date: "2027-03-14", titre: "Championnat par équipes départemental 2A", type: "equipes" },
  { date: "2027-03-14", titre: "Championnat par équipes R1 Corse", detail: "Journée 15", type: "equipes" },
  { date: "2027-03-20", titre: "Top jeunes départemental", type: "jeunes" },
  { date: "2027-03-27", titre: "Coupe de Corse jeunes", type: "jeunes", lieu: "Ajaccio" },
  { date: "2027-04-10", titre: "Championnat par équipes PACA", detail: "Journée 17", type: "equipes", niveau: "PACA" },
  { date: "2027-04-11", titre: "Championnat par équipes départemental 2A", type: "equipes" },
  { date: "2027-04-24", fin: "2027-04-25", titre: "Championnats de Corse", type: "individuel", lieu: "Porto-Vecchio" },
  { date: "2027-05-08", titre: "Finale régionale Top jeunes", type: "jeunes", lieu: "Borgo" },
  { date: "2027-05-16", titre: "Coupe Acquaviva", detail: "Doubles", type: "coupe", lieu: "Bastia" },
  { date: "2027-05-22", titre: "Championnat par équipes PACA", detail: "Journée 18", type: "equipes", niveau: "PACA" },
  { date: "2027-05-23", titre: "Championnat par équipes R1 Corse", detail: "Finales", type: "equipes", lieu: "Bastia" },
  { date: "2027-05-29", titre: "Championnat par équipes PACA", detail: "Journée 19", type: "equipes", niveau: "PACA" },
  { date: "2027-05-29", titre: "Coupe Avvene", type: "coupe", lieu: "Ajaccio" },
  { date: "2027-05-30", titre: "Coupe Dumani", type: "coupe", lieu: "Ajaccio" },
  { date: "2027-06-06", titre: "Coupe de Corse adultes", type: "coupe", lieu: "Porto-Vecchio" }
];

/* Les sous-galeries de la page Photos, dans l'ordre d'affichage. */
const ALBUMS = [
  { cle: "competition",  nom: "Compétition" },
  { cle: "entrainement", nom: "Entraînement" },
  { cle: "vie-du-club",  nom: "Vie du club" },
  { cle: "stage",        nom: "Stage" }
];

/* Une photo par ligne. Dépose le fichier dans img/galerie/ puis ajoute sa ligne ici.
   album : la clé d'une sous-galerie ci-dessus. Une sous-galerie vide affiche des cases « Placeholder ».
   Les 5 premières photos de la liste apparaissent sur l'accueil. */
const PHOTOS = [
  { src: "img/galerie/image_1.jpeg", legende: "Photo du club", album: "vie-du-club" },
  { src: "img/galerie/image_2.jpeg", legende: "Photo du club", album: "vie-du-club" },
  { src: "img/galerie/image_3.jpeg", legende: "Photo du club", album: "vie-du-club" },
  { src: "img/galerie/image_4.jpeg", legende: "Photo du club", album: "vie-du-club" }
];
