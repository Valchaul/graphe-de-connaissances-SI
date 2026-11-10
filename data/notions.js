// =====================================================================
//  CONTENU DE LA LEARN MAP
//  C'est le seul fichier à modifier pour ajouter / changer des notions.
//
//  Une notion :
//    id         identifiant unique, sans espace ni accent (ex. "rdm")
//    titre      nom affiché dans le graphe
//    domaine    clé d'un domaine défini dans DOMAINES ci-dessous
//    description  une ou deux phrases
//    prerequis  liste d'ids de notions à connaître avant ([] si aucune)
//    ressources liste de liens { titre: "...", url: "https://..." }
// =====================================================================

const DOMAINES = {
  maths:        { nom: "Mathématiques",           couleur: "#3f5a8a" },
  physique:     { nom: "Physique",                couleur: "#5f6b7a" },
  mecanique:    { nom: "Mécanique",               couleur: "#9a5b3c" },
  energetique:  { nom: "Énergétique",             couleur: "#b07a2a" },
  electricite:  { nom: "Électricité & électronique", couleur: "#2f7a6b" },
  automatique:  { nom: "Automatique",             couleur: "#6b4f8f" },
  signal:       { nom: "Signal",                  couleur: "#2a6f9e" },
  informatique: { nom: "Informatique",            couleur: "#4f7a32" },
  materiaux:    { nom: "Matériaux",               couleur: "#7a6a52" },
  conception:   { nom: "Conception",              couleur: "#94485f" },
};

const WP = (page) => "https://fr.wikipedia.org/wiki/" + page;

const NOTIONS = [
  // ---------------------------------------------------------------- Maths
  {
    id: "analyse", titre: "Analyse réelle", domaine: "maths",
    description: "Fonctions, limites, dérivées, intégrales, développements limités.",
    prerequis: [],
    ressources: [{ titre: "Wikipédia — Analyse réelle", url: WP("Analyse_réelle") }],
  },
  {
    id: "complexes", titre: "Nombres complexes", domaine: "maths",
    description: "Forme algébrique et exponentielle, module, argument, calcul dans ℂ.",
    prerequis: ["analyse"],
    ressources: [{ titre: "Wikipédia — Nombre complexe", url: WP("Nombre_complexe") }],
  },
  {
    id: "algebre-lineaire", titre: "Algèbre linéaire", domaine: "maths",
    description: "Espaces vectoriels, matrices, systèmes linéaires, valeurs propres.",
    prerequis: [],
    ressources: [
      { titre: "Wikipédia — Algèbre linéaire", url: WP("Algèbre_linéaire") },
      { titre: "MIT OCW 18.06 — Linear Algebra (EN)", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/" },
    ],
  },
  {
    id: "equa-diff", titre: "Équations différentielles", domaine: "maths",
    description: "Équations linéaires du 1er et 2e ordre, systèmes différentiels.",
    prerequis: ["analyse", "complexes", "algebre-lineaire"],
    ressources: [
      { titre: "Wikipédia — Équation différentielle", url: WP("Équation_différentielle") },
      { titre: "MIT OCW 18.03 — Differential Equations (EN)", url: "https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/" },
    ],
  },
  {
    id: "probas", titre: "Probabilités & statistiques", domaine: "maths",
    description: "Variables aléatoires, lois usuelles, estimation, tests statistiques.",
    prerequis: ["analyse"],
    ressources: [
      { titre: "Wikipédia — Théorie des probabilités", url: WP("Théorie_des_probabilités") },
      { titre: "Wikipédia — Statistique", url: WP("Statistique") },
    ],
  },
  {
    id: "fourier", titre: "Séries & transformée de Fourier", domaine: "maths",
    description: "Décomposition d'un signal en fréquences, spectre.",
    prerequis: ["analyse", "complexes"],
    ressources: [
      { titre: "Wikipédia — Série de Fourier", url: WP("Série_de_Fourier") },
      { titre: "Wikipédia — Transformation de Fourier", url: WP("Transformation_de_Fourier") },
    ],
  },
  {
    id: "laplace", titre: "Transformée de Laplace", domaine: "maths",
    description: "Outil de résolution des équations différentielles linéaires, base de l'automatique.",
    prerequis: ["equa-diff"],
    ressources: [{ titre: "Wikipédia — Transformation de Laplace", url: WP("Transformation_de_Laplace") }],
  },
  {
    id: "analyse-numerique", titre: "Analyse numérique", domaine: "maths",
    description: "Résolution approchée : interpolation, intégration, schémas d'Euler / Runge-Kutta.",
    prerequis: ["equa-diff", "algorithmique"],
    ressources: [{ titre: "Wikipédia — Analyse numérique", url: WP("Analyse_numérique") }],
  },

  // ------------------------------------------------------------- Physique
  {
    id: "meca-point", titre: "Mécanique du point", domaine: "physique",
    description: "Lois de Newton, travail, énergie, quantité de mouvement.",
    prerequis: ["analyse"],
    ressources: [{ titre: "Wikipédia — Mécanique newtonienne", url: WP("Mécanique_newtonienne") }],
  },
  {
    id: "electromagnetisme", titre: "Électromagnétisme", domaine: "physique",
    description: "Champs électrique et magnétique, induction, équations de Maxwell.",
    prerequis: ["analyse", "algebre-lineaire"],
    ressources: [{ titre: "Wikipédia — Électromagnétisme", url: WP("Électromagnétisme") }],
  },

  // ------------------------------------------------------------ Mécanique
  {
    id: "statique", titre: "Statique du solide", domaine: "mecanique",
    description: "Actions mécaniques, torseurs, principe fondamental de la statique.",
    prerequis: ["meca-point", "algebre-lineaire"],
    ressources: [{ titre: "Wikipédia — Statique", url: WP("Statique") }],
  },
  {
    id: "cinematique", titre: "Cinématique du solide", domaine: "mecanique",
    description: "Torseur cinématique, composition des mouvements, liaisons.",
    prerequis: ["meca-point", "algebre-lineaire"],
    ressources: [{ titre: "Wikipédia — Cinématique", url: WP("Cinématique") }],
  },
  {
    id: "dynamique", titre: "Dynamique du solide", domaine: "mecanique",
    description: "Matrice d'inertie, principe fondamental de la dynamique, théorème de l'énergie cinétique.",
    prerequis: ["statique", "cinematique"],
    ressources: [{ titre: "Wikipédia — Matrice d'inertie", url: WP("Matrice_d'inertie") }],
  },
  {
    id: "rdm", titre: "Résistance des matériaux", domaine: "mecanique",
    description: "Poutres : traction, flexion, torsion, contraintes et déformations.",
    prerequis: ["statique", "comportement-materiaux"],
    ressources: [{ titre: "Wikipédia — Résistance des matériaux", url: WP("Résistance_des_matériaux") }],
  },
  {
    id: "mmc", titre: "Mécanique des milieux continus", domaine: "mecanique",
    description: "Tenseurs des contraintes et des déformations, élasticité linéaire.",
    prerequis: ["rdm", "equa-diff"],
    ressources: [{ titre: "Wikipédia — Mécanique des milieux continus", url: WP("Mécanique_des_milieux_continus") }],
  },
  {
    id: "vibrations", titre: "Vibrations", domaine: "mecanique",
    description: "Oscillateurs, modes propres, résonance, amortissement.",
    prerequis: ["dynamique", "equa-diff"],
    ressources: [{ titre: "Wikipédia — Vibration", url: WP("Vibration") }],
  },
  {
    id: "elements-finis", titre: "Méthode des éléments finis", domaine: "mecanique",
    description: "Discrétisation et simulation numérique des structures.",
    prerequis: ["mmc", "analyse-numerique"],
    ressources: [{ titre: "Wikipédia — Méthode des éléments finis", url: WP("Méthode_des_éléments_finis") }],
  },
  {
    id: "meca-fluides", titre: "Mécanique des fluides", domaine: "mecanique",
    description: "Statique des fluides, Bernoulli, pertes de charge, écoulements visqueux.",
    prerequis: ["meca-point", "equa-diff"],
    ressources: [{ titre: "Wikipédia — Mécanique des fluides", url: WP("Mécanique_des_fluides") }],
  },

  // ---------------------------------------------------------- Énergétique
  {
    id: "thermo", titre: "Thermodynamique", domaine: "energetique",
    description: "Premier et second principes, gaz parfaits, entropie.",
    prerequis: ["analyse", "meca-point"],
    ressources: [{ titre: "Wikipédia — Thermodynamique", url: WP("Thermodynamique") }],
  },
  {
    id: "transferts-thermiques", titre: "Transferts thermiques", domaine: "energetique",
    description: "Conduction, convection, rayonnement, échangeurs.",
    prerequis: ["thermo", "equa-diff"],
    ressources: [{ titre: "Wikipédia — Transfert thermique", url: WP("Transfert_thermique") }],
  },
  {
    id: "machines-thermiques", titre: "Machines thermiques", domaine: "energetique",
    description: "Cycles moteurs et récepteurs : moteurs, turbines, pompes à chaleur.",
    prerequis: ["thermo", "meca-fluides"],
    ressources: [{ titre: "Wikipédia — Machine thermique", url: WP("Machine_thermique") }],
  },

  // ------------------------------------------- Électricité & électronique
  {
    id: "circuits", titre: "Circuits électriques", domaine: "electricite",
    description: "Lois de Kirchhoff, dipôles, régime continu et transitoire.",
    prerequis: ["analyse"],
    ressources: [
      { titre: "Wikipédia — Circuit électrique", url: WP("Circuit_électrique") },
      { titre: "Wikipédia — Lois de Kirchhoff", url: WP("Lois_de_Kirchhoff") },
    ],
  },
  {
    id: "regime-sinusoidal", titre: "Régime sinusoïdal", domaine: "electricite",
    description: "Impédances complexes, puissances, diagrammes de Fresnel.",
    prerequis: ["circuits", "complexes"],
    ressources: [{ titre: "Wikipédia — Impédance (électricité)", url: WP("Impédance_(électricité)") }],
  },
  {
    id: "electronique-analogique", titre: "Électronique analogique", domaine: "electricite",
    description: "Diodes, transistors, amplificateur opérationnel.",
    prerequis: ["regime-sinusoidal"],
    ressources: [{ titre: "Wikipédia — Amplificateur opérationnel", url: WP("Amplificateur_opérationnel") }],
  },
  {
    id: "machines-electriques", titre: "Machines électriques", domaine: "electricite",
    description: "Transformateur, machines à courant continu, synchrones et asynchrones.",
    prerequis: ["regime-sinusoidal", "electromagnetisme"],
    ressources: [{ titre: "Wikipédia — Machine électrique", url: WP("Machine_électrique") }],
  },
  {
    id: "electronique-puissance", titre: "Électronique de puissance", domaine: "electricite",
    description: "Hacheurs, onduleurs, redresseurs, commande des machines.",
    prerequis: ["electronique-analogique", "machines-electriques"],
    ressources: [{ titre: "Wikipédia — Électronique de puissance", url: WP("Électronique_de_puissance") }],
  },

  // ---------------------------------------------------------- Automatique
  {
    id: "modelisation-systemes", titre: "Modélisation des systèmes", domaine: "automatique",
    description: "Schémas-blocs, fonction de transfert, systèmes du 1er et 2e ordre.",
    prerequis: ["laplace"],
    ressources: [{ titre: "Wikipédia — Fonction de transfert", url: WP("Fonction_de_transfert") }],
  },
  {
    id: "analyse-frequentielle", titre: "Réponse fréquentielle", domaine: "automatique",
    description: "Diagrammes de Bode, Nyquist et Black.",
    prerequis: ["modelisation-systemes", "complexes"],
    ressources: [{ titre: "Wikipédia — Diagramme de Bode", url: WP("Diagramme_de_Bode") }],
  },
  {
    id: "stabilite", titre: "Stabilité & performances", domaine: "automatique",
    description: "Critères de stabilité, marges de gain et de phase, précision, rapidité.",
    prerequis: ["analyse-frequentielle"],
    ressources: [{ titre: "Wikipédia — Critère de Nyquist", url: WP("Critère_de_Nyquist") }],
  },
  {
    id: "pid", titre: "Correcteurs PID", domaine: "automatique",
    description: "Action proportionnelle, intégrale, dérivée ; réglage d'un asservissement.",
    prerequis: ["stabilite"],
    ressources: [{ titre: "Wikipédia — Régulateur PID", url: WP("Régulateur_PID") }],
  },
  {
    id: "representation-etat", titre: "Représentation d'état", domaine: "automatique",
    description: "Modèles d'état, commandabilité, observabilité, retour d'état.",
    prerequis: ["modelisation-systemes", "algebre-lineaire"],
    ressources: [{ titre: "Wikipédia — Représentation d'état", url: WP("Représentation_d'état") }],
  },
  {
    id: "automatique-numerique", titre: "Automatique échantillonnée", domaine: "automatique",
    description: "Transformée en Z, correcteurs numériques.",
    prerequis: ["pid", "echantillonnage"],
    ressources: [{ titre: "Wikipédia — Transformation en Z", url: WP("Transformation_en_Z") }],
  },

  // --------------------------------------------------------------- Signal
  {
    id: "signaux", titre: "Signaux & systèmes linéaires", domaine: "signal",
    description: "Convolution, réponse impulsionnelle, spectre d'un signal.",
    prerequis: ["fourier"],
    ressources: [{ titre: "Wikipédia — Traitement du signal", url: WP("Traitement_du_signal") }],
  },
  {
    id: "filtrage", titre: "Filtrage", domaine: "signal",
    description: "Filtres passe-bas, passe-haut, passe-bande ; gabarits.",
    prerequis: ["signaux", "regime-sinusoidal"],
    ressources: [{ titre: "Wikipédia — Filtre linéaire", url: WP("Filtre_linéaire") }],
  },
  {
    id: "echantillonnage", titre: "Échantillonnage & numérisation", domaine: "signal",
    description: "Théorème de Shannon, repliement de spectre, quantification.",
    prerequis: ["signaux"],
    ressources: [{ titre: "Wikipédia — Échantillonnage (signal)", url: WP("Échantillonnage_(signal)") }],
  },

  // --------------------------------------------------------- Informatique
  {
    id: "algorithmique", titre: "Algorithmique & programmation", domaine: "informatique",
    description: "Variables, boucles, fonctions, structures de données (Python).",
    prerequis: [],
    ressources: [
      { titre: "Wikipédia — Algorithmique", url: WP("Algorithmique") },
      { titre: "Tutoriel Python officiel", url: "https://docs.python.org/fr/3/tutorial/" },
    ],
  },
  {
    id: "logique", titre: "Logique combinatoire & séquentielle", domaine: "informatique",
    description: "Algèbre de Boole, portes logiques, bascules, machines à états.",
    prerequis: [],
    ressources: [
      { titre: "Wikipédia — Algèbre de Boole", url: WP("Algèbre_de_Boole_(logique)") },
      { titre: "Wikipédia — Automate fini", url: WP("Automate_fini") },
    ],
  },
  {
    id: "embarque", titre: "Systèmes embarqués", domaine: "informatique",
    description: "Microcontrôleurs, entrées/sorties, interruptions, capteurs.",
    prerequis: ["algorithmique", "logique", "electronique-analogique"],
    ressources: [
      { titre: "Wikipédia — Microcontrôleur", url: WP("Microcontrôleur") },
      { titre: "Wikipédia — Système embarqué", url: WP("Système_embarqué") },
    ],
  },

  // ------------------------------------------------------------ Matériaux
  {
    id: "science-materiaux", titre: "Science des matériaux", domaine: "materiaux",
    description: "Familles de matériaux, structure cristalline, liaisons.",
    prerequis: [],
    ressources: [{ titre: "Wikipédia — Science des matériaux", url: WP("Science_des_matériaux") }],
  },
  {
    id: "comportement-materiaux", titre: "Comportement mécanique des matériaux", domaine: "materiaux",
    description: "Essai de traction, élasticité, plasticité, rupture.",
    prerequis: ["science-materiaux"],
    ressources: [{ titre: "Wikipédia — Essai de traction", url: WP("Essai_de_traction") }],
  },

  // ----------------------------------------------------------- Conception
  {
    id: "dessin-technique", titre: "Dessin technique & CAO", domaine: "conception",
    description: "Lecture de plans, projections, modélisation 3D.",
    prerequis: [],
    ressources: [
      { titre: "Wikipédia — Dessin technique", url: WP("Dessin_technique") },
      { titre: "Wikipédia — Conception assistée par ordinateur", url: WP("Conception_assistée_par_ordinateur") },
    ],
  },
  {
    id: "cotation", titre: "Cotation fonctionnelle (GPS)", domaine: "conception",
    description: "Tolérances dimensionnelles et géométriques, spécification des produits.",
    prerequis: ["dessin-technique"],
    ressources: [{ titre: "Wikipédia — Spécification géométrique des produits", url: WP("Spécification_géométrique_des_produits") }],
  },
  {
    id: "mecanismes", titre: "Conception de mécanismes", domaine: "conception",
    description: "Liaisons mécaniques, schéma cinématique, dimensionnement.",
    prerequis: ["cinematique", "statique", "cotation", "rdm"],
    ressources: [{ titre: "Wikipédia — Liaison mécanique", url: WP("Liaison_mécanique") }],
  },
  {
    id: "ingenierie-systeme", titre: "Ingénierie système", domaine: "conception",
    description: "Analyse du besoin, exigences, architecture fonctionnelle, SysML.",
    prerequis: ["dessin-technique"],
    ressources: [
      { titre: "Wikipédia — Ingénierie des systèmes", url: WP("Ingénierie_des_systèmes") },
      { titre: "Wikipédia — SysML", url: WP("Systems_Modeling_Language") },
    ],
  },
  {
    id: "mecatronique", titre: "Mécatronique", domaine: "conception",
    description: "Intégration mécanique, électronique, commande et informatique.",
    prerequis: ["mecanismes", "pid", "embarque", "electronique-puissance", "ingenierie-systeme"],
    ressources: [{ titre: "Wikipédia — Mécatronique", url: WP("Mécatronique") }],
  },
];
