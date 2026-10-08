// Données de démonstration (Phase 1) — alignées sur le schéma de la base.
export const ETAPES = [
  { code: "01_INSCRIPTION", num: "01", label: "Inscription" },
  { code: "02_RECHERCHE", num: "02", label: "Recherche" },
  { code: "03_CONTRAT", num: "03", label: "Contrat" },
  { code: "04_ENTREPRISE", num: "04", label: "Entreprise" },
  { code: "05_BILAN", num: "05", label: "Bilan" },
] as const;

export const mockProfile = {
  prenom: "Léa",
  nom: "Martin",
  email: "lea.martin@email.fr",
  telephone: "06 12 34 56 78",
  annee_scolaire: "2025-2026",
  intitule_formation: "BTS Négociation et Digitalisation de la Relation Client",
  etape_courante: "02_RECHERCHE" as (typeof ETAPES)[number]["code"],
};

export const mockAdmission = {
  statut_dossier: "EN_REVISION" as const,
  statut_cv: "A_CORRIGER" as const,
  commentaire_conseiller:
    "Merci d'ajouter ton expérience de vente saisonnière et de raccourcir le CV à une page.",
  etapes: [
    { label: "Formulaire d'inscription", done: true },
    { label: "Entretien de positionnement", done: true },
    { label: "Validation du CV par le CFA", done: false },
    { label: "Dossier administratif complet", done: false },
  ],
};

export const mockCalendrier = [
  { date: "2026-10-12", heure: "09:00", titre: "Cours — Relation client omnicanale", lieu: "Salle B204", type: "cours" },
  { date: "2026-10-14", heure: "14:00", titre: "Atelier CV & lettre de motivation", lieu: "Espace carrière", type: "atelier" },
  { date: "2026-10-19", heure: "09:00", titre: "Cours — Marketing digital", lieu: "Salle A102", type: "cours" },
  { date: "2026-10-22", heure: "18:00", titre: "Afterwork recruteurs alternance", lieu: "Hall principal", type: "evenement" },
];

export const mockDocuments = [
  { nom: "CV", fichier: "CV_Lea_Martin.pdf", statut: "A_CORRIGER" },
  { nom: "Pièce d'identité", fichier: "CNI_recto_verso.pdf", statut: "VALIDE" },
  { nom: "Diplômes précédents", fichier: null, statut: "MANQUANT" },
];

export const mockActualites = [
  { type: "ATELIER_CV", titre: "Atelier CV : se démarquer en 1 page", date: "14 oct.", lieu: "Espace carrière", description: "Retravaille ton CV avec un conseiller en petit groupe." },
  { type: "EVENEMENT_NETWORKING", titre: "Afterwork recruteurs", date: "22 oct.", lieu: "Hall principal", description: "15 entreprises partenaires recrutent des alternants." },
  { type: "OFFRE_ALTERNANCE", titre: "Nouvelle offre : Chargé(e) de clientèle", date: "Publiée hier", lieu: "Décathlon — Lyon 7e", description: "Alternance 24 mois, rythme 2j/3j." },
];
