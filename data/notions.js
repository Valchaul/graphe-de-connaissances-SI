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
//               (EN) dans le titre = ressource en anglais
// =====================================================================

const DOMAINES = {
  maths:           { nom: "Mathématiques",              couleur: "#3f5a8a" },
  physique:        { nom: "Physique",                   couleur: "#5f6b7a" },
  mecanique:       { nom: "Mécanique",                  couleur: "#9a5b3c" },
  energetique:     { nom: "Énergétique",                couleur: "#b07a2a" },
  electricite:     { nom: "Électricité & électronique", couleur: "#2f7a6b" },
  instrumentation: { nom: "Capteurs & instrumentation", couleur: "#7d7a1e" },
  automatique:     { nom: "Automatique",                couleur: "#6b4f8f" },
  signal:          { nom: "Signal",                     couleur: "#2a6f9e" },
  informatique:    { nom: "Informatique",               couleur: "#4f7a32" },
  materiaux:       { nom: "Matériaux",                  couleur: "#7a6a52" },
  conception:      { nom: "Conception",                 couleur: "#94485f" },
  robotique:       { nom: "Robotique",                  couleur: "#b3402f" },
};

// Raccourcis pour les sources les plus utilisées
const WP = (page) => "https://fr.wikipedia.org/wiki/" + page;
const MIT = (cours) => "https://ocw.mit.edu/courses/" + cours + "/";
const ROBOTIQUE_MODERNE = "http://hades.mech.northwestern.edu/index.php/Modern_Robotics";
const PYTHON_ROBOTICS = "https://atsushisakai.github.io/PythonRobotics/";
const DSP_GUIDE = "https://www.dspguide.com/";

const NOTIONS = [
  // ---------------------------------------------------------------- Maths
  {
    id: "analyse", titre: "Analyse réelle", domaine: "maths",
    description: "Fonctions, limites, dérivées, intégrales, développements limités.",
    prerequis: [],
    ressources: [
      { titre: "Exo7 — cours et exercices corrigés", url: "https://exo7.emath.fr/" },
      { titre: "MIT 18.01SC — Single Variable Calculus (EN)", url: MIT("18-01sc-single-variable-calculus-fall-2010") },
      { titre: "Wikipédia — Analyse réelle", url: WP("Analyse_réelle") },
    ],
  },
  {
    id: "complexes", titre: "Nombres complexes", domaine: "maths",
    description: "Forme algébrique et exponentielle, module, argument, calcul dans ℂ.",
    prerequis: ["analyse"],
    ressources: [
      { titre: "Exo7 — cours et exercices corrigés", url: "https://exo7.emath.fr/" },
      { titre: "Wikipédia — Nombre complexe", url: WP("Nombre_complexe") },
    ],
  },
  {
    id: "algebre-lineaire", titre: "Algèbre linéaire", domaine: "maths",
    description: "Espaces vectoriels, matrices, systèmes linéaires, valeurs propres.",
    prerequis: [],
    ressources: [
      { titre: "MIT 18.06 — Linear Algebra (EN)", url: MIT("18-06-linear-algebra-spring-2010") },
      { titre: "3Blue1Brown — Essence of Linear Algebra (vidéos, EN)", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
      { titre: "Wikipédia — Algèbre linéaire", url: WP("Algèbre_linéaire") },
    ],
  },
  {
    id: "equa-diff", titre: "Équations différentielles", domaine: "maths",
    description: "Équations linéaires du 1er et 2e ordre, systèmes différentiels.",
    prerequis: ["analyse", "complexes", "algebre-lineaire"],
    ressources: [
      { titre: "MIT 18.03 — Differential Equations (EN)", url: MIT("18-03-differential-equations-spring-2010") },
      { titre: "Wikipédia — Équation différentielle", url: WP("Équation_différentielle") },
    ],
  },
  {
    id: "probas", titre: "Probabilités & statistiques", domaine: "maths",
    description: "Variables aléatoires, lois usuelles, estimation, tests statistiques.",
    prerequis: ["analyse"],
    ressources: [
      { titre: "MIT 6.041SC — Probabilistic Systems Analysis (EN)", url: MIT("6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013") },
      { titre: "Wikipédia — Théorie des probabilités", url: WP("Théorie_des_probabilités") },
      { titre: "Wikipédia — Statistique", url: WP("Statistique") },
    ],
  },
  {
    id: "fourier", titre: "Séries & transformée de Fourier", domaine: "maths",
    description: "Décomposition d'un signal en fréquences, spectre.",
    prerequis: ["analyse", "complexes"],
    ressources: [
      { titre: "Stanford EE261 — The Fourier Transform and its Applications (EN)", url: "https://see.stanford.edu/Course/EE261" },
      { titre: "3Blue1Brown — But what is the Fourier Transform? (vidéo, EN)", url: "https://www.youtube.com/watch?v=spUNpyF58BY" },
      { titre: "Wikipédia — Série de Fourier", url: WP("Série_de_Fourier") },
      { titre: "Wikipédia — Transformation de Fourier", url: WP("Transformation_de_Fourier") },
    ],
  },
  {
    id: "laplace", titre: "Transformée de Laplace", domaine: "maths",
    description: "Outil de résolution des équations différentielles linéaires, base de l'automatique.",
    prerequis: ["equa-diff"],
    ressources: [
      { titre: "MIT 18.03 — Differential Equations, partie Laplace (EN)", url: MIT("18-03-differential-equations-spring-2010") },
      { titre: "Wikipédia — Transformation de Laplace", url: WP("Transformation_de_Laplace") },
    ],
  },
  {
    id: "analyse-numerique", titre: "Analyse numérique", domaine: "maths",
    description: "Résolution approchée : interpolation, intégration, schémas d'Euler / Runge-Kutta.",
    prerequis: ["equa-diff", "algorithmique"],
    ressources: [
      { titre: "femto-physique — Analyse numérique", url: "https://femto-physique.fr/analyse-numerique/" },
      { titre: "MIT 2.086 — Numerical Computation for Mechanical Engineers (EN)", url: MIT("2-086-numerical-computation-for-mechanical-engineers-fall-2014") },
      { titre: "Wikipédia — Analyse numérique", url: WP("Analyse_numérique") },
    ],
  },
  {
    id: "plusieurs-variables", titre: "Fonctions de plusieurs variables", domaine: "maths",
    description: "Dérivées partielles, gradient, intégrales multiples, changements de variables.",
    prerequis: ["analyse", "algebre-lineaire"],
    ressources: [
      { titre: "MIT 18.02SC — Multivariable Calculus (EN)", url: MIT("18-02sc-multivariable-calculus-fall-2010") },
      { titre: "Khan Academy — Multivariable calculus (EN)", url: "https://www.khanacademy.org/math/multivariable-calculus" },
      { titre: "Wikipédia — Fonction de plusieurs variables", url: WP("Fonction_de_plusieurs_variables") },
    ],
  },
  {
    id: "analyse-vectorielle", titre: "Analyse vectorielle", domaine: "maths",
    description: "Gradient, divergence, rotationnel ; théorèmes de Stokes et d'Ostrogradski.",
    prerequis: ["plusieurs-variables"],
    ressources: [
      { titre: "femto-physique — Outils mathématiques pour la physique", url: "https://femto-physique.fr/omp/" },
      { titre: "MIT 18.02SC — Multivariable Calculus, partie analyse vectorielle (EN)", url: MIT("18-02sc-multivariable-calculus-fall-2010") },
      { titre: "Wikipédia — Analyse vectorielle", url: WP("Analyse_vectorielle") },
    ],
  },
  {
    id: "edp", titre: "Équations aux dérivées partielles", domaine: "maths",
    description: "Équations de la chaleur, des ondes et de Laplace ; séparation des variables.",
    prerequis: ["equa-diff", "analyse-vectorielle", "fourier"],
    ressources: [
      { titre: "MIT 18.303 — Linear Partial Differential Equations (EN)", url: MIT("18-303-linear-partial-differential-equations-fall-2006") },
      { titre: "MIT 18.152 — Introduction to Partial Differential Equations (EN)", url: MIT("18-152-introduction-to-partial-differential-equations-fall-2011") },
      { titre: "Wikipédia — Équation aux dérivées partielles", url: WP("Équation_aux_dérivées_partielles") },
    ],
  },
  {
    id: "optimisation", titre: "Optimisation", domaine: "maths",
    description: "Minimisation d'un critère, gradient, contraintes, optimisation convexe.",
    prerequis: ["plusieurs-variables"],
    ressources: [
      { titre: "Boyd & Vandenberghe — Convex Optimization (livre gratuit, EN)", url: "https://web.stanford.edu/~boyd/cvxbook/" },
      { titre: "MIT 15.093J — Optimization Methods (EN)", url: MIT("15-093j-optimization-methods-fall-2009") },
      { titre: "Wikipédia — Optimisation", url: WP("Optimisation_(mathématiques)") },
    ],
  },

  // ------------------------------------------------------------- Physique
  {
    id: "meca-point", titre: "Mécanique du point", domaine: "physique",
    description: "Lois de Newton, travail, énergie, quantité de mouvement.",
    prerequis: ["analyse"],
    ressources: [
      { titre: "femto-physique — Mécanique", url: "https://femto-physique.fr/mecanique/" },
      { titre: "OpenStax — University Physics vol. 1 (EN)", url: "https://openstax.org/details/books/university-physics-volume-1" },
      { titre: "Wikipédia — Mécanique newtonienne", url: WP("Mécanique_newtonienne") },
    ],
  },
  {
    id: "electromagnetisme", titre: "Électromagnétisme", domaine: "physique",
    description: "Champs électrique et magnétique, induction, équations de Maxwell.",
    prerequis: ["analyse-vectorielle"],
    ressources: [
      { titre: "femto-physique — Électromagnétisme", url: "https://femto-physique.fr/electromagnetisme/" },
      { titre: "MIT 8.02 — Electricity and Magnetism (EN)", url: MIT("8-02-physics-ii-electricity-and-magnetism-spring-2007") },
      { titre: "Wikipédia — Électromagnétisme", url: WP("Électromagnétisme") },
    ],
  },
  {
    id: "ondes", titre: "Ondes & propagation", domaine: "physique",
    description: "Équation d'onde, ondes progressives et stationnaires, interférences, effet Doppler.",
    prerequis: ["meca-point", "equa-diff"],
    ressources: [
      { titre: "MIT 8.03SC — Vibrations and Waves (EN)", url: MIT("8-03sc-physics-iii-vibrations-and-waves-fall-2016") },
      { titre: "OpenStax — University Physics vol. 1, partie ondes (EN)", url: "https://openstax.org/details/books/university-physics-volume-1" },
      { titre: "Wikipédia — Onde", url: WP("Onde") },
    ],
  },
  {
    id: "acoustique", titre: "Acoustique", domaine: "physique",
    description: "Ondes sonores, niveaux en décibels, rayonnement et isolation acoustiques.",
    prerequis: ["ondes"],
    ressources: [
      { titre: "Dan Russell (Penn State) — animations d'acoustique et de vibrations (EN)", url: "https://www.acs.psu.edu/drussell/demos.html" },
      { titre: "Wikipédia — Acoustique", url: WP("Acoustique") },
    ],
  },
  {
    id: "ondes-em", titre: "Ondes électromagnétiques", domaine: "physique",
    description: "Propagation dans le vide et les milieux, polarisation, lignes de transmission, antennes.",
    prerequis: ["electromagnetisme", "ondes"],
    ressources: [
      { titre: "MIT 6.013 — Electromagnetics and Applications (EN)", url: MIT("6-013-electromagnetics-and-applications-spring-2009") },
      { titre: "Wikipédia — Onde électromagnétique", url: WP("Onde_électromagnétique") },
    ],
  },
  {
    id: "optique", titre: "Optique", domaine: "physique",
    description: "Optique géométrique (lentilles, miroirs) et ondulatoire (diffraction, interférences).",
    prerequis: ["ondes"],
    ressources: [
      { titre: "femto-physique — Optique", url: "https://femto-physique.fr/optique/" },
      { titre: "MIT 2.71 — Optics (EN)", url: MIT("2-71-optics-spring-2009") },
      { titre: "OpenStax — University Physics vol. 3 (EN)", url: "https://openstax.org/details/books/university-physics-volume-3" },
      { titre: "Wikipédia — Optique", url: WP("Optique") },
    ],
  },
  {
    id: "semi-conducteurs", titre: "Physique des semi-conducteurs", domaine: "physique",
    description: "Bandes d'énergie, dopage, jonction PN : le fonctionnement des diodes et des transistors.",
    prerequis: ["electromagnetisme", "science-materiaux"],
    ressources: [
      { titre: "MIT 6.012 — Microelectronic Devices and Circuits (EN)", url: MIT("6-012-microelectronic-devices-and-circuits-fall-2009") },
      { titre: "Wikipédia — Semi-conducteur", url: WP("Semi-conducteur") },
      { titre: "Wikipédia — Jonction p-n", url: WP("Jonction_p-n") },
    ],
  },

  // ------------------------------------------------------------ Mécanique
  {
    id: "statique", titre: "Statique du solide", domaine: "mecanique",
    description: "Actions mécaniques, torseurs, principe fondamental de la statique.",
    prerequis: ["meca-point", "algebre-lineaire"],
    ressources: [
      { titre: "Ruina & Pratap — Introduction to Statics and Dynamics (livre gratuit, EN)", url: "http://ruina.tam.cornell.edu/Book/" },
      { titre: "Mechanics Map — statique et dynamique (EN)", url: "https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Mechanics_Map_(Moore_et_al.)" },
      { titre: "Wikipédia — Statique", url: WP("Statique") },
    ],
  },
  {
    id: "cinematique", titre: "Cinématique du solide", domaine: "mecanique",
    description: "Torseur cinématique, composition des mouvements, liaisons.",
    prerequis: ["meca-point", "algebre-lineaire"],
    ressources: [
      { titre: "Mechanics Map — statique et dynamique (EN)", url: "https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Mechanics_Map_(Moore_et_al.)" },
      { titre: "Wikipédia — Cinématique", url: WP("Cinématique") },
    ],
  },
  {
    id: "dynamique", titre: "Dynamique du solide", domaine: "mecanique",
    description: "Matrice d'inertie, principe fondamental de la dynamique, théorème de l'énergie cinétique.",
    prerequis: ["statique", "cinematique"],
    ressources: [
      { titre: "MIT 2.003SC — Engineering Dynamics (EN)", url: MIT("2-003sc-engineering-dynamics-fall-2011") },
      { titre: "Ruina & Pratap — Introduction to Statics and Dynamics (livre gratuit, EN)", url: "http://ruina.tam.cornell.edu/Book/" },
      { titre: "Wikipédia — Matrice d'inertie", url: WP("Matrice_d'inertie") },
    ],
  },
  {
    id: "mecanique-analytique", titre: "Mécanique analytique (Lagrange)", domaine: "mecanique",
    description: "Coordonnées généralisées, équations de Lagrange : la base de la dynamique des robots.",
    prerequis: ["dynamique"],
    ressources: [
      { titre: "MIT 8.09 — Classical Mechanics III (EN)", url: MIT("8-09-classical-mechanics-iii-fall-2014") },
      { titre: "Wikipédia — Mécanique analytique", url: WP("Mécanique_analytique") },
    ],
  },
  {
    id: "rdm", titre: "Résistance des matériaux", domaine: "mecanique",
    description: "Poutres : traction, flexion, torsion, contraintes et déformations.",
    prerequis: ["statique", "comportement-materiaux", "equa-diff"],
    ressources: [
      { titre: "MIT 2.001 — Mechanics & Materials I (EN)", url: MIT("2-001-mechanics-materials-i-fall-2006") },
      { titre: "MechaniCalc — Strength of Materials (EN)", url: "https://www.mechanicalc.com/reference/strength-of-materials" },
      { titre: "MechaniCalc — Beam Stress and Deflection (EN)", url: "https://www.mechanicalc.com/reference/beam-analysis" },
      { titre: "Wikipédia — Résistance des matériaux", url: WP("Résistance_des_matériaux") },
    ],
  },
  {
    id: "mmc", titre: "Mécanique des milieux continus", domaine: "mecanique",
    description: "Tenseurs des contraintes et des déformations, élasticité linéaire.",
    prerequis: ["rdm"],
    ressources: [
      { titre: "continuummechanics.org — cours en ligne illustré (EN)", url: "https://www.continuummechanics.org/" },
      { titre: "Bower — Applied Mechanics of Solids (livre gratuit, EN)", url: "http://solidmechanics.org/contents.php" },
      { titre: "MIT 2.080J — Structural Mechanics (EN)", url: MIT("2-080j-structural-mechanics-fall-2013") },
      { titre: "Wikipédia — Mécanique des milieux continus", url: WP("Mécanique_des_milieux_continus") },
    ],
  },
  {
    id: "vibrations", titre: "Vibrations", domaine: "mecanique",
    description: "Oscillateurs, modes propres, résonance, amortissement.",
    prerequis: ["dynamique", "equa-diff"],
    ressources: [
      { titre: "MIT 2.003SC — Engineering Dynamics, partie vibrations (EN)", url: MIT("2-003sc-engineering-dynamics-fall-2011") },
      { titre: "Wikipédia — Vibration", url: WP("Vibration") },
    ],
  },
  {
    id: "elements-finis", titre: "Méthode des éléments finis", domaine: "mecanique",
    description: "Discrétisation et simulation numérique des structures.",
    prerequis: ["mmc", "analyse-numerique", "edp"],
    ressources: [
      { titre: "MIT 2.092 — Finite Element Analysis of Solids and Fluids (EN)", url: MIT("2-092-finite-element-analysis-of-solids-and-fluids-i-fall-2009") },
      { titre: "Wikipédia — Méthode des éléments finis", url: WP("Méthode_des_éléments_finis") },
    ],
  },
  {
    id: "meca-fluides", titre: "Mécanique des fluides", domaine: "mecanique",
    description: "Statique des fluides, Bernoulli, pertes de charge, écoulements visqueux.",
    prerequis: ["meca-point", "equa-diff", "analyse-vectorielle"],
    ressources: [
      { titre: "femto-physique — Mécanique des fluides", url: "https://femto-physique.fr/mecanique_des_fluides/" },
      { titre: "MIT 2.06 — Fluid Dynamics (EN)", url: MIT("2-06-fluid-dynamics-spring-2013") },
      { titre: "Wikipédia — Mécanique des fluides", url: WP("Mécanique_des_fluides") },
    ],
  },
  {
    id: "hydraulique-pneumatique", titre: "Actionneurs hydrauliques & pneumatiques", domaine: "mecanique",
    description: "Vérins, distributeurs, pompes et compresseurs ; circuits de puissance fluide.",
    prerequis: ["meca-fluides"],
    ressources: [
      { titre: "Fluid Power World — articles techniques (EN)", url: "https://www.fluidpowerworld.com/" },
      { titre: "Wikipédia — Vérin", url: WP("Vérin") },
    ],
  },
  {
    id: "tribologie", titre: "Tribologie", domaine: "mecanique",
    description: "Frottement, usure et lubrification des contacts entre pièces en mouvement.",
    prerequis: ["statique", "comportement-materiaux"],
    ressources: [
      { titre: "MIT 2.800 — Tribology (EN)", url: MIT("2-800-tribology-fall-2004") },
      { titre: "TriboNet — encyclopédie de tribologie (EN)", url: "https://www.tribonet.org/wiki/" },
      { titre: "Wikipédia — Tribologie", url: WP("Tribologie") },
    ],
  },
  {
    id: "tenue-fatigue", titre: "Dimensionnement en fatigue", domaine: "mecanique",
    description: "Dimensionner une pièce soumise à des charges répétées : concentrations de contraintes, coefficients de sécurité.",
    prerequis: ["rdm", "fatigue"],
    ressources: [
      { titre: "eFatigue — calculs et guides de fatigue (EN)", url: "https://www.efatigue.com/" },
      { titre: "MechaniCalc — Fatigue Crack Growth (EN)", url: "https://www.mechanicalc.com/reference/fatigue-crack-growth" },
      { titre: "Wikipédia — Courbe de Wöhler", url: WP("Courbe_de_Wöhler") },
    ],
  },

  // ---------------------------------------------------------- Énergétique
  {
    id: "thermo", titre: "Thermodynamique", domaine: "energetique",
    description: "Premier et second principes, gaz parfaits, entropie.",
    prerequis: ["analyse", "meca-point"],
    ressources: [
      { titre: "femto-physique — Thermodynamique", url: "https://femto-physique.fr/thermodynamique/" },
      { titre: "MIT 16.Unified — Thermodynamics and Propulsion (notes de cours, EN)", url: "https://web.mit.edu/16.unified/www/FALL/thermodynamics/notes/notes.html" },
      { titre: "Yan — Introduction to Engineering Thermodynamics (livre gratuit, EN)", url: "https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Introduction_to_Engineering_Thermodynamics_(Yan)" },
      { titre: "Wikipédia — Thermodynamique", url: WP("Thermodynamique") },
    ],
  },
  {
    id: "transferts-thermiques", titre: "Transferts thermiques", domaine: "energetique",
    description: "Conduction, convection, rayonnement.",
    prerequis: ["thermo", "edp"],
    ressources: [
      { titre: "Lienhard — A Heat Transfer Textbook (livre gratuit, EN)", url: "https://ahtt.mit.edu/" },
      { titre: "MIT 2.051 — Introduction to Heat Transfer (EN)", url: MIT("2-051-introduction-to-heat-transfer-fall-2015") },
      { titre: "Wikipédia — Transfert thermique", url: WP("Transfert_thermique") },
    ],
  },
  {
    id: "machines-thermiques", titre: "Machines thermiques", domaine: "energetique",
    description: "Cycles moteurs et récepteurs : Carnot, Rankine, Brayton, Otto, Diesel.",
    prerequis: ["thermo", "meca-fluides"],
    ressources: [
      { titre: "MIT 16.Unified — Thermodynamics and Propulsion (notes de cours, EN)", url: "https://web.mit.edu/16.unified/www/FALL/thermodynamics/notes/notes.html" },
      { titre: "Wikibooks — Engineering Thermodynamics (EN)", url: "https://en.wikibooks.org/wiki/Engineering_Thermodynamics" },
      { titre: "NASA Glenn — Thermodynamics (EN)", url: "https://www.grc.nasa.gov/www/k-12/airplane/thermo.html" },
      { titre: "Wikipédia — Machine thermique", url: WP("Machine_thermique") },
    ],
  },
  {
    id: "echangeurs", titre: "Échangeurs de chaleur", domaine: "energetique",
    description: "Échangeurs à plaques et tubulaires, méthodes DTLM et NUT, dimensionnement.",
    prerequis: ["transferts-thermiques", "meca-fluides"],
    ressources: [
      { titre: "Lienhard — A Heat Transfer Textbook, ch. 3 (livre gratuit, EN)", url: "https://ahtt.mit.edu/" },
      { titre: "Wikipédia — Échangeur de chaleur", url: WP("Échangeur_de_chaleur") },
    ],
  },
  {
    id: "gestion-thermique", titre: "Gestion thermique des systèmes", domaine: "energetique",
    description: "Refroidir l'électronique et les moteurs : résistances thermiques, dissipateurs, ventilation.",
    prerequis: ["transferts-thermiques", "electronique-puissance"],
    ressources: [
      { titre: "Electronics Cooling — revue technique (EN)", url: "https://www.electronics-cooling.com/" },
      { titre: "Celsia — Heat Sink Blog (EN)", url: "https://celsiainc.com/heat-sink-blog/" },
      { titre: "Wikipédia — Dissipateur thermique", url: WP("Dissipateur_thermique") },
    ],
  },
  {
    id: "turbomachines", titre: "Turbomachines", domaine: "energetique",
    description: "Pompes, ventilateurs, compresseurs et turbines : triangles des vitesses, courbes caractéristiques.",
    prerequis: ["thermo", "meca-fluides"],
    ressources: [
      { titre: "MIT 16.50 — Introduction to Propulsion Systems (EN)", url: MIT("16-50-introduction-to-propulsion-systems-spring-2012") },
      { titre: "NASA Glenn — Propulsion (EN)", url: "https://www.grc.nasa.gov/www/k-12/airplane/shortp.html" },
      { titre: "Wikipédia — Turbomachine", url: WP("Turbomachine") },
    ],
  },
  {
    id: "combustion", titre: "Combustion & moteurs thermiques", domaine: "energetique",
    description: "Réactions de combustion, pouvoir calorifique, moteurs à allumage commandé et Diesel, émissions.",
    prerequis: ["machines-thermiques"],
    ressources: [
      { titre: "MIT 2.61 — Internal Combustion Engines (EN)", url: MIT("2-61-internal-combustion-engines-spring-2017") },
      { titre: "Wikipédia — Combustion", url: WP("Combustion") },
    ],
  },
  {
    id: "froid-pac", titre: "Machines frigorifiques & pompes à chaleur", domaine: "energetique",
    description: "Cycle à compression de vapeur, fluides frigorigènes, coefficient de performance.",
    prerequis: ["machines-thermiques"],
    ressources: [
      { titre: "Yan — Introduction to Engineering Thermodynamics, ch. 6 (livre gratuit, EN)", url: "https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Introduction_to_Engineering_Thermodynamics_(Yan)" },
      { titre: "Wikipédia — Pompe à chaleur", url: WP("Pompe_à_chaleur") },
    ],
  },
  {
    id: "hydrogene", titre: "Piles à combustible & hydrogène", domaine: "energetique",
    description: "Conversion électrochimique de l'énergie, production et stockage de l'hydrogène.",
    prerequis: ["thermo", "batteries"],
    ressources: [
      { titre: "MIT 2.60J — Fundamentals of Advanced Energy Conversion (EN)", url: MIT("2-60j-fundamentals-of-advanced-energy-conversion-spring-2020") },
      { titre: "Wikipédia — Pile à combustible", url: WP("Pile_à_combustible") },
    ],
  },
  {
    id: "energies-renouvelables", titre: "Énergies renouvelables", domaine: "energetique",
    description: "Solaire photovoltaïque et thermique, éolien, hydraulique ; ordres de grandeur et intégration au réseau.",
    prerequis: ["turbomachines", "electronique-puissance", "semi-conducteurs"],
    ressources: [
      { titre: "MIT 22.081J — Introduction to Sustainable Energy (EN)", url: MIT("22-081j-introduction-to-sustainable-energy-fall-2010") },
      { titre: "MIT 2.627 — Fundamentals of Photovoltaics (EN)", url: MIT("2-627-fundamentals-of-photovoltaics-fall-2013") },
      { titre: "PVEducation — cours en ligne sur le photovoltaïque (EN)", url: "https://www.pveducation.org/" },
      { titre: "MacKay — Sustainable Energy, Without the Hot Air (livre gratuit, EN)", url: "https://www.withouthotair.com/" },
      { titre: "Wikipédia — Énergie renouvelable", url: WP("Énergie_renouvelable") },
    ],
  },

  // ------------------------------------------- Électricité & électronique
  {
    id: "circuits", titre: "Circuits électriques", domaine: "electricite",
    description: "Lois de Kirchhoff, dipôles, régime continu et transitoire.",
    prerequis: ["analyse"],
    ressources: [
      { titre: "MIT 6.002 — Circuits and Electronics (EN)", url: MIT("6-002-circuits-and-electronics-spring-2007") },
      { titre: "Fiore — DC Electrical Circuit Analysis (livre gratuit, EN)", url: "https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/DC_Electrical_Circuit_Analysis_-_A_Practical_Approach_(Fiore)" },
      { titre: "Wikipédia — Lois de Kirchhoff", url: WP("Lois_de_Kirchhoff") },
    ],
  },
  {
    id: "regime-sinusoidal", titre: "Régime sinusoïdal", domaine: "electricite",
    description: "Impédances complexes, puissances, diagrammes de Fresnel.",
    prerequis: ["circuits", "complexes"],
    ressources: [
      { titre: "femto-physique — Régime sinusoïdal forcé", url: "https://femto-physique.fr/electrocinetique/regime-sinusoidal.php" },
      { titre: "Fiore — AC Electrical Circuit Analysis (livre gratuit, EN)", url: "https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/AC_Electrical_Circuit_Analysis%3A_A_Practical_Approach_(Fiore)" },
      { titre: "Wikipédia — Impédance (électricité)", url: WP("Impédance_(électricité)") },
    ],
  },
  {
    id: "electronique-analogique", titre: "Électronique analogique", domaine: "electricite",
    description: "Diodes, transistors, amplificateur opérationnel.",
    prerequis: ["regime-sinusoidal"],
    ressources: [
      { titre: "MIT 6.002 — Circuits and Electronics (EN)", url: MIT("6-002-circuits-and-electronics-spring-2007") },
      { titre: "Wikipédia — Amplificateur opérationnel", url: WP("Amplificateur_opérationnel") },
    ],
  },
  {
    id: "machines-electriques", titre: "Machines électriques", domaine: "electricite",
    description: "Transformateur, machines à courant continu, synchrones et asynchrones.",
    prerequis: ["regime-sinusoidal", "electromagnetisme"],
    ressources: [
      { titre: "MIT 6.685 — Electric Machines (EN)", url: MIT("6-685-electric-machines-fall-2013") },
      { titre: "Wikipédia — Machine électrique", url: WP("Machine_électrique") },
    ],
  },
  {
    id: "electronique-puissance", titre: "Électronique de puissance", domaine: "electricite",
    description: "Hacheurs, onduleurs, redresseurs.",
    prerequis: ["electronique-analogique", "machines-electriques", "semi-conducteurs"],
    ressources: [
      { titre: "MIT 6.622 — Power Electronics (EN)", url: MIT("6-622-power-electronics-spring-2023") },
      { titre: "Wikipédia — Électronique de puissance", url: WP("Électronique_de_puissance") },
    ],
  },
  {
    id: "moteurs-speciaux", titre: "Moteurs brushless & pas-à-pas", domaine: "electricite",
    description: "Les moteurs de la mécatronique : principe, pilotage, choix selon l'application.",
    prerequis: ["machines-electriques"],
    ressources: [
      { titre: "Adafruit — All About Stepper Motors (EN)", url: "https://learn.adafruit.com/all-about-stepper-motors" },
      { titre: "Wikipédia — Moteur sans balais", url: WP("Moteur_sans_balais") },
      { titre: "Wikipédia — Moteur pas à pas", url: WP("Moteur_pas_à_pas") },
    ],
  },
  {
    id: "commande-moteurs", titre: "Commande des moteurs & variateurs", domaine: "electricite",
    description: "Boucles de courant, de vitesse et de position ; MLI, variateurs.",
    prerequis: ["electronique-puissance", "moteurs-speciaux", "pid"],
    ressources: [
      { titre: "Motion Control Tips — articles techniques (EN)", url: "https://www.motioncontroltips.com/" },
      { titre: "Wikipédia — Variateur électronique de vitesse", url: WP("Variateur_électronique_de_vitesse") },
    ],
  },
  {
    id: "conversion-an", titre: "Conversion analogique-numérique", domaine: "electricite",
    description: "CAN et CNA : résolution, quantification, fréquence d'échantillonnage.",
    prerequis: ["electronique-analogique", "echantillonnage"],
    ressources: [
      { titre: "The Scientist and Engineer's Guide to DSP, ch. 3 (livre gratuit, EN)", url: DSP_GUIDE },
      { titre: "Wikipédia — Convertisseur analogique-numérique", url: WP("Convertisseur_analogique-numérique") },
    ],
  },
  {
    id: "batteries", titre: "Batteries & stockage d'énergie", domaine: "electricite",
    description: "Technologies d'accumulateurs, charge, autonomie, gestion (BMS).",
    prerequis: ["circuits"],
    ressources: [
      { titre: "Battery University (EN)", url: "https://batteryuniversity.com/" },
      { titre: "Wikipédia — Accumulateur électrique", url: WP("Accumulateur_électrique") },
    ],
  },
  {
    id: "pcb", titre: "Conception de cartes électroniques", domaine: "electricite",
    description: "Schéma, routage et fabrication d'un circuit imprimé (PCB).",
    prerequis: ["electronique-analogique"],
    ressources: [
      { titre: "KiCad — documentation officielle", url: "https://docs.kicad.org/" },
      { titre: "Wikipédia — Circuit imprimé", url: WP("Circuit_imprimé") },
    ],
  },

  // ------------------------------------------- Capteurs & instrumentation
  {
    id: "metrologie", titre: "Métrologie & incertitudes", domaine: "instrumentation",
    description: "Erreurs de mesure, incertitudes de type A et B, propagation, étalonnage.",
    prerequis: ["probas"],
    ressources: [
      { titre: "BIPM — Guide pour l'expression de l'incertitude de mesure (GUM)", url: "https://www.bipm.org/en/committees/jc/jcgm/publications" },
      { titre: "NIST — Technical Note 1297 (EN)", url: "https://www.nist.gov/pml/nist-technical-note-1297" },
      { titre: "Wikipédia — Incertitude de mesure", url: WP("Incertitude_de_mesure") },
    ],
  },
  {
    id: "capteurs", titre: "Capteurs & chaîne de mesure", domaine: "instrumentation",
    description: "Principes physiques des capteurs, sensibilité, linéarité, bande passante.",
    prerequis: ["electronique-analogique", "metrologie"],
    ressources: [
      { titre: "NI — Sensor Fundamentals (EN)", url: "https://www.ni.com/en/shop/data-acquisition/sensor-fundamentals.html" },
      { titre: "Wikipédia — Capteur", url: WP("Capteur") },
    ],
  },
  {
    id: "conditionnement", titre: "Conditionnement & acquisition", domaine: "instrumentation",
    description: "Amplification, filtrage anti-repliement, numérisation d'un signal de capteur.",
    prerequis: ["capteurs", "filtrage", "conversion-an"],
    ressources: [
      { titre: "O'Haver — A Pragmatic Introduction to Signal Processing (EN)", url: "https://terpconnect.umd.edu/~toh/spectrum/" },
      { titre: "The Scientist and Engineer's Guide to DSP (livre gratuit, EN)", url: DSP_GUIDE },
    ],
  },
  {
    id: "capteurs-mouvement", titre: "Codeurs & capteurs de mouvement", domaine: "instrumentation",
    description: "Codeurs incrémentaux et absolus, résolveurs, capteurs de position et de vitesse.",
    prerequis: ["capteurs"],
    ressources: [
      { titre: "US Digital — livres blancs sur les codeurs (EN)", url: "https://www.usdigital.com/support/resources/reference/technical-docs/white-papers/" },
      { titre: "Motion Control Tips — articles sur les codeurs (EN)", url: "https://www.motioncontroltips.com/category/encoders/" },
      { titre: "Wikipédia — Codeur rotatif", url: WP("Codeur_rotatif") },
    ],
  },
  {
    id: "capteurs-effort", titre: "Capteurs de force & de pression", domaine: "instrumentation",
    description: "Jauges de déformation, pont de Wheatstone, cellules de charge, capteurs de pression.",
    prerequis: ["capteurs", "rdm"],
    ressources: [
      { titre: "NI — Measuring Strain with Strain Gages (EN)", url: "https://www.ni.com/en/shop/data-acquisition/sensor-fundamentals/measuring-strain-with-strain-gages.html" },
      { titre: "SparkFun — Getting Started with Load Cells (EN)", url: "https://learn.sparkfun.com/tutorials/getting-started-with-load-cells" },
      { titre: "Wikipédia — Jauge de déformation", url: WP("Jauge_de_déformation") },
      { titre: "Wikipédia — Capteur de pression", url: WP("Capteur_de_pression") },
    ],
  },
  {
    id: "capteurs-temperature", titre: "Capteurs de température", domaine: "instrumentation",
    description: "Thermocouples, sondes à résistance, thermistances ; choix et mise en œuvre.",
    prerequis: ["capteurs"],
    ressources: [
      { titre: "Adafruit — Thermistor (EN)", url: "https://learn.adafruit.com/thermistor" },
      { titre: "Wikipédia — Thermocouple", url: WP("Thermocouple") },
      { titre: "Wikipédia — Thermistance", url: WP("Thermistance") },
    ],
  },
  {
    id: "capteurs-distance", titre: "Capteurs de distance (lidar, ultrasons)", domaine: "instrumentation",
    description: "Télémétrie par temps de vol : ultrasons, infrarouge, lidar ; nuages de points.",
    prerequis: ["capteurs", "ondes"],
    ressources: [
      { titre: "Terabee — Time-of-Flight principle (EN)", url: "https://www.terabee.com/time-of-flight-principle/" },
      { titre: "Adafruit — Ultrasonic Sonar Distance Sensors (EN)", url: "https://learn.adafruit.com/ultrasonic-sonar-distance-sensors" },
      { titre: "Wikipédia — Lidar", url: WP("Lidar") },
      { titre: "Wikipédia — Télémétrie", url: WP("Télémétrie") },
    ],
  },
  {
    id: "plans-experiences", titre: "Plans d'expériences", domaine: "instrumentation",
    description: "Organiser des essais pour identifier les facteurs influents avec un minimum de mesures.",
    prerequis: ["metrologie"],
    ressources: [
      { titre: "NIST — Engineering Statistics Handbook, Process Improvement (EN)", url: "https://www.itl.nist.gov/div898/handbook/pri/pri.htm" },
      { titre: "Wikipédia — Plan d'expériences", url: WP("Plan_d'expériences") },
    ],
  },
  {
    id: "imu", titre: "Capteurs inertiels (IMU)", domaine: "instrumentation",
    description: "Accéléromètres, gyromètres, magnétomètres ; estimation de l'orientation.",
    prerequis: ["capteurs", "dynamique"],
    ressources: [
      { titre: "VectorNav — Inertial Navigation Primer (EN)", url: "https://www.vectornav.com/resources/inertial-navigation-primer" },
      { titre: "Wikipédia — Centrale à inertie", url: WP("Centrale_à_inertie") },
    ],
  },

  // ---------------------------------------------------------- Automatique
  {
    id: "modelisation-systemes", titre: "Modélisation des systèmes", domaine: "automatique",
    description: "Schémas-blocs, fonction de transfert, systèmes du 1er et 2e ordre.",
    prerequis: ["laplace"],
    ressources: [
      { titre: "Åström & Murray — Feedback Systems (livre gratuit, EN)", url: "https://fbswiki.org/wiki/index.php/Main_Page" },
      { titre: "MIT 2.004 — Dynamics and Control II (EN)", url: MIT("2-004-dynamics-and-control-ii-spring-2008") },
      { titre: "Wikipédia — Fonction de transfert", url: WP("Fonction_de_transfert") },
    ],
  },
  {
    id: "analyse-frequentielle", titre: "Réponse fréquentielle", domaine: "automatique",
    description: "Diagrammes de Bode, Nyquist et Black.",
    prerequis: ["modelisation-systemes", "complexes"],
    ressources: [
      { titre: "Brian Douglas — Classical Control Theory (vidéos, EN)", url: "https://www.youtube.com/playlist?list=PLUMWjy5jgHK1NC52DXXrriwihVrYZKqjk" },
      { titre: "Wikipédia — Diagramme de Bode", url: WP("Diagramme_de_Bode") },
    ],
  },
  {
    id: "stabilite", titre: "Stabilité & performances", domaine: "automatique",
    description: "Critères de stabilité, marges de gain et de phase, précision, rapidité.",
    prerequis: ["analyse-frequentielle"],
    ressources: [
      { titre: "Wikibooks — Control Systems (EN)", url: "https://en.wikibooks.org/wiki/Control_Systems" },
      { titre: "Iqbal — Introduction to Control Systems (livre gratuit, EN)", url: "https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Introduction_to_Control_Systems_(Iqbal)" },
      { titre: "Wikipédia — Critère de Nyquist", url: WP("Critère_de_Nyquist") },
    ],
  },
  {
    id: "pid", titre: "Correcteurs PID", domaine: "automatique",
    description: "Action proportionnelle, intégrale, dérivée ; réglage d'un asservissement.",
    prerequis: ["stabilite"],
    ressources: [
      { titre: "Univ. de Sheffield — Control Education (cours, vidéos, exercices, EN)", url: "https://sites.google.com/sheffield.ac.uk/controleducation/" },
      { titre: "APMonitor — Process Dynamics and Control (cours avec TP, EN)", url: "https://apmonitor.com/pdc/index.php/Main/CourseSchedule" },
      { titre: "Wikipédia — Régulateur PID", url: WP("Régulateur_PID") },
    ],
  },
  {
    id: "representation-etat", titre: "Représentation d'état", domaine: "automatique",
    description: "Modèles d'état, commandabilité, observabilité, retour d'état.",
    prerequis: ["modelisation-systemes", "algebre-lineaire"],
    ressources: [
      { titre: "MIT 6.241J — Dynamic Systems and Control (EN)", url: MIT("6-241j-dynamic-systems-and-control-spring-2011") },
      { titre: "Åström & Murray — Feedback Systems (livre gratuit, EN)", url: "https://fbswiki.org/wiki/index.php/Main_Page" },
      { titre: "Wikipédia — Représentation d'état", url: WP("Représentation_d'état") },
    ],
  },
  {
    id: "automatique-numerique", titre: "Automatique échantillonnée", domaine: "automatique",
    description: "Transformée en Z, correcteurs numériques.",
    prerequis: ["pid", "echantillonnage"],
    ressources: [
      { titre: "Iqbal — Introduction to Control Systems, partie systèmes échantillonnés (EN)", url: "https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Introduction_to_Control_Systems_(Iqbal)" },
      { titre: "Wikipédia — Transformation en Z", url: WP("Transformation_en_Z") },
    ],
  },
  {
    id: "identification", titre: "Identification des systèmes", domaine: "automatique",
    description: "Construire le modèle d'un système à partir de mesures expérimentales.",
    prerequis: ["analyse-frequentielle", "probas"],
    ressources: [
      { titre: "MIT 2.160 — Identification, Estimation, and Learning (EN)", url: MIT("2-160-identification-estimation-and-learning-spring-2006") },
      { titre: "Wikipédia — Identification de système", url: WP("Identification_de_système") },
    ],
  },
  {
    id: "kalman", titre: "Estimation & filtre de Kalman", domaine: "automatique",
    description: "Observateurs, fusion de capteurs, estimation d'état en présence de bruit.",
    prerequis: ["representation-etat", "probas"],
    ressources: [
      { titre: "Labbe — Kalman and Bayesian Filters in Python (livre interactif, EN)", url: "https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python" },
      { titre: "kalmanfilter.net — tutoriel pas à pas (EN)", url: "https://www.kalmanfilter.net/" },
      { titre: "Wikipédia — Filtre de Kalman", url: WP("Filtre_de_Kalman") },
    ],
  },
  {
    id: "commande-optimale", titre: "Commande optimale (LQR)", domaine: "automatique",
    description: "Commande minimisant un critère quadratique, compromis performance / énergie.",
    prerequis: ["representation-etat", "optimisation"],
    ressources: [
      { titre: "MIT 16.323 — Principles of Optimal Control (EN)", url: MIT("16-323-principles-of-optimal-control-spring-2008") },
      { titre: "Stanford EE363 — Linear Dynamical Systems (EN)", url: "https://stanford.edu/class/ee363/" },
      { titre: "Wikipédia — Commande optimale", url: WP("Commande_optimale") },
    ],
  },
  {
    id: "non-lineaire", titre: "Systèmes non linéaires", domaine: "automatique",
    description: "Linéarisation, stabilité de Lyapunov, saturations et frottements.",
    prerequis: ["representation-etat"],
    ressources: [
      { titre: "MIT 6.243J — Dynamics of Nonlinear Systems (EN)", url: MIT("6-243j-dynamics-of-nonlinear-systems-fall-2003") },
      { titre: "Tedrake — Underactuated Robotics (cours en ligne, EN)", url: "https://underactuated.mit.edu/" },
      { titre: "Wikipédia — Système non linéaire", url: WP("Système_non_linéaire") },
    ],
  },
  {
    id: "multiphysique", titre: "Modélisation multiphysique", domaine: "automatique",
    description: "Modèle unique d'un système mécanique, électrique et thermique (bond graph, Modelica).",
    prerequis: ["modelisation-systemes", "circuits", "dynamique"],
    ressources: [
      { titre: "Tiller — Modelica by Example (livre gratuit, EN)", url: "https://mbe.modelica.university/" },
      { titre: "OpenModelica — logiciel libre de simulation", url: "https://openmodelica.org/" },
      { titre: "Wikipédia — Graphe de liaisons", url: WP("Graphe_de_liaisons") },
    ],
  },

  // --------------------------------------------------------------- Signal
  {
    id: "signaux", titre: "Signaux & systèmes linéaires", domaine: "signal",
    description: "Convolution, réponse impulsionnelle, spectre d'un signal.",
    prerequis: ["fourier"],
    ressources: [
      { titre: "MIT 6.003 — Signals and Systems (EN)", url: MIT("6-003-signals-and-systems-fall-2011") },
      { titre: "Wikipédia — Traitement du signal", url: WP("Traitement_du_signal") },
    ],
  },
  {
    id: "filtrage", titre: "Filtrage", domaine: "signal",
    description: "Filtres passe-bas, passe-haut, passe-bande ; gabarits.",
    prerequis: ["signaux", "regime-sinusoidal"],
    ressources: [
      { titre: "femto-physique — Filtrage passif", url: "https://femto-physique.fr/electrocinetique/filtrage-passif.php" },
      { titre: "Texas Instruments — Filter Design in Thirty Seconds (note d'application, EN)", url: "https://www.ti.com/lit/an/sloa093/sloa093.pdf" },
      { titre: "MIT RES.6-007 — Signals and Systems, Oppenheim (EN)", url: MIT("res-6-007-signals-and-systems-spring-2011") },
      { titre: "Wikipédia — Filtre linéaire", url: WP("Filtre_linéaire") },
    ],
  },
  {
    id: "echantillonnage", titre: "Échantillonnage & numérisation", domaine: "signal",
    description: "Théorème de Shannon, repliement de spectre, quantification.",
    prerequis: ["signaux"],
    ressources: [
      { titre: "The Scientist and Engineer's Guide to DSP (livre gratuit, EN)", url: DSP_GUIDE },
      { titre: "Wikipédia — Échantillonnage (signal)", url: WP("Échantillonnage_(signal)") },
    ],
  },
  {
    id: "tns", titre: "Traitement numérique du signal", domaine: "signal",
    description: "Transformée de Fourier discrète (FFT), filtres numériques RIF et RII.",
    prerequis: ["echantillonnage", "filtrage"],
    ressources: [
      { titre: "The Scientist and Engineer's Guide to DSP (livre gratuit, EN)", url: DSP_GUIDE },
      { titre: "Downey — Think DSP (livre gratuit, Python, EN)", url: "https://greenteapress.com/wp/think-dsp/" },
      { titre: "MIT 6.341 — Discrete-Time Signal Processing (EN)", url: MIT("6-341-discrete-time-signal-processing-fall-2005") },
      { titre: "Wikipédia — Traitement numérique du signal", url: WP("Traitement_numérique_du_signal") },
    ],
  },
  {
    id: "traitement-image", titre: "Traitement d'images", domaine: "signal",
    description: "Filtrage, détection de contours, segmentation, morphologie.",
    prerequis: ["tns", "algebre-lineaire", "algorithmique"],
    ressources: [
      { titre: "scikit-image — galerie d'exemples (Python, EN)", url: "https://scikit-image.org/docs/stable/auto_examples/" },
      { titre: "Wikipédia — Traitement d'images", url: WP("Traitement_d'images") },
    ],
  },

  // --------------------------------------------------------- Informatique
  {
    id: "algorithmique", titre: "Algorithmique & programmation", domaine: "informatique",
    description: "Variables, boucles, fonctions, structures de données (Python).",
    prerequis: [],
    ressources: [
      { titre: "Tutoriel Python officiel", url: "https://docs.python.org/fr/3/tutorial/" },
      { titre: "MIT 6.0001 — Introduction to Computer Science and Programming in Python (EN)", url: MIT("6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016") },
      { titre: "Wikipédia — Algorithmique", url: WP("Algorithmique") },
    ],
  },
  {
    id: "prog-c", titre: "Programmation C / C++", domaine: "informatique",
    description: "Types, pointeurs, mémoire, compilation : le langage des systèmes embarqués.",
    prerequis: ["algorithmique"],
    ressources: [
      { titre: "Beej's Guide to C Programming (livre gratuit, EN)", url: "https://beej.us/guide/bgc/" },
      { titre: "LearnCpp — tutoriel C++ (EN)", url: "https://www.learncpp.com/" },
      { titre: "Wikipédia — C (langage)", url: WP("C_(langage)") },
    ],
  },
  {
    id: "logique", titre: "Logique combinatoire & séquentielle", domaine: "informatique",
    description: "Algèbre de Boole, portes logiques, bascules, machines à états.",
    prerequis: [],
    ressources: [
      { titre: "MIT 6.004 — Computation Structures (EN)", url: MIT("6-004-computation-structures-spring-2017") },
      { titre: "Wikipédia — Algèbre de Boole", url: WP("Algèbre_de_Boole_(logique)") },
      { titre: "Wikipédia — Automate fini", url: WP("Automate_fini") },
    ],
  },
  {
    id: "fpga", titre: "Logique programmable (FPGA)", domaine: "informatique",
    description: "Description matérielle en VHDL / Verilog, synthèse sur circuit programmable.",
    prerequis: ["logique"],
    ressources: [
      { titre: "HDLBits — exercices Verilog interactifs (EN)", url: "https://hdlbits.01xz.net/wiki/Main_Page" },
      { titre: "fpga4fun — projets FPGA (EN)", url: "https://www.fpga4fun.com/" },
      { titre: "MIT 6.111 — Introductory Digital Systems Laboratory (EN)", url: MIT("6-111-introductory-digital-systems-laboratory-spring-2006") },
      { titre: "Wikipédia — Circuit logique programmable", url: WP("Circuit_logique_programmable") },
    ],
  },
  {
    id: "automates", titre: "Automates programmables & Grafcet", domaine: "informatique",
    description: "API industriels, langages normalisés (IEC 61131-3), description séquentielle.",
    prerequis: ["logique"],
    ressources: [
      { titre: "PLC Academy — tutoriels (EN)", url: "https://www.plcacademy.com/" },
      { titre: "RealPars — cours d'automatisme industriel (EN)", url: "https://realpars.com/" },
      { titre: "Wikipédia — Grafcet", url: WP("Grafcet") },
      { titre: "Wikipédia — Automate programmable industriel", url: WP("Automate_programmable_industriel") },
    ],
  },
  {
    id: "embarque", titre: "Systèmes embarqués", domaine: "informatique",
    description: "Microcontrôleurs, entrées/sorties, timers, interruptions.",
    prerequis: ["prog-c", "logique", "electronique-analogique"],
    ressources: [
      { titre: "Arduino — documentation officielle (EN)", url: "https://docs.arduino.cc/" },
      { titre: "Wikipédia — Microcontrôleur", url: WP("Microcontrôleur") },
      { titre: "Wikipédia — Système embarqué", url: WP("Système_embarqué") },
    ],
  },
  {
    id: "bus-communication", titre: "Bus de communication", domaine: "informatique",
    description: "Liaisons série UART, I2C, SPI et bus CAN entre cartes, capteurs et actionneurs.",
    prerequis: ["embarque"],
    ressources: [
      { titre: "SparkFun — Serial Communication (EN)", url: "https://learn.sparkfun.com/tutorials/serial-communication" },
      { titre: "SparkFun — I2C (EN)", url: "https://learn.sparkfun.com/tutorials/i2c" },
      { titre: "SparkFun — SPI (EN)", url: "https://learn.sparkfun.com/tutorials/serial-peripheral-interface-spi" },
      { titre: "CSS Electronics — CAN Bus Explained (EN)", url: "https://www.csselectronics.com/pages/can-bus-simple-intro-tutorial" },
    ],
  },
  {
    id: "temps-reel", titre: "Systèmes temps réel (RTOS)", domaine: "informatique",
    description: "Tâches, ordonnancement, priorités, synchronisation, respect des échéances.",
    prerequis: ["embarque"],
    ressources: [
      { titre: "FreeRTOS — documentation et livre gratuit (EN)", url: "https://www.freertos.org/" },
      { titre: "Wikipédia — Système temps réel", url: WP("Système_temps_réel") },
    ],
  },
  {
    id: "reseaux-industriels", titre: "Réseaux industriels & IoT", domaine: "informatique",
    description: "Bus de terrain, Ethernet industriel, protocoles pour objets connectés (MQTT).",
    prerequis: ["bus-communication", "automates"],
    ressources: [
      { titre: "MQTT — présentation du protocole (EN)", url: "https://mqtt.org/" },
      { titre: "Wikipédia — Bus de terrain", url: WP("Bus_de_terrain") },
      { titre: "Wikipédia — Internet des objets", url: WP("Internet_des_objets") },
    ],
  },
  {
    id: "apprentissage", titre: "Apprentissage automatique", domaine: "informatique",
    description: "Régression, classification, réseaux de neurones ; apprendre un modèle à partir de données.",
    prerequis: ["probas", "optimisation", "algorithmique"],
    ressources: [
      { titre: "An Introduction to Statistical Learning (livre gratuit, EN)", url: "https://www.statlearning.com/" },
      { titre: "MIT 6.036 — Introduction to Machine Learning (EN)", url: MIT("6-036-introduction-to-machine-learning-fall-2020") },
      { titre: "scikit-learn — guide utilisateur (Python, EN)", url: "https://scikit-learn.org/stable/user_guide.html" },
      { titre: "Wikipédia — Apprentissage automatique", url: WP("Apprentissage_automatique") },
    ],
  },

  // ------------------------------------------------------------ Matériaux
  {
    id: "science-materiaux", titre: "Science des matériaux", domaine: "materiaux",
    description: "Familles de matériaux, structure cristalline, liaisons.",
    prerequis: [],
    ressources: [
      { titre: "MIT 3.091 — Introduction to Solid-State Chemistry (EN)", url: MIT("3-091-introduction-to-solid-state-chemistry-fall-2018") },
      { titre: "Wikipédia — Science des matériaux", url: WP("Science_des_matériaux") },
    ],
  },
  {
    id: "comportement-materiaux", titre: "Comportement mécanique des matériaux", domaine: "materiaux",
    description: "Essai de traction, élasticité, plasticité, rupture.",
    prerequis: ["science-materiaux"],
    ressources: [
      { titre: "MechaniCalc — Mechanical Properties of Materials (EN)", url: "https://www.mechanicalc.com/reference/material-properties" },
      { titre: "Wikipédia — Essai de traction", url: WP("Essai_de_traction") },
    ],
  },
  {
    id: "metaux", titre: "Métaux & traitements thermiques", domaine: "materiaux",
    description: "Aciers, alliages d'aluminium, diagrammes de phases, trempe et revenu.",
    prerequis: ["science-materiaux"],
    ressources: [
      { titre: "DoITPoMS (Cambridge) — Phase Diagrams and Solidification (EN)", url: "https://www.doitpoms.ac.uk/tlplib/phase-diagrams/index.php" },
      { titre: "MIT 3.40J — Physical Metallurgy (EN)", url: MIT("3-40j-physical-metallurgy-fall-2009") },
      { titre: "Wikipédia — Traitement thermique", url: WP("Traitement_thermique") },
    ],
  },
  {
    id: "polymeres-composites", titre: "Polymères & composites", domaine: "materiaux",
    description: "Thermoplastiques, thermodurcissables, élastomères ; matériaux à fibres et stratifiés.",
    prerequis: ["science-materiaux"],
    ressources: [
      { titre: "DoITPoMS (Cambridge) — Polymer Basics (EN)", url: "https://www.doitpoms.ac.uk/tlplib/polymerbasics/index.php" },
      { titre: "DoITPoMS (Cambridge) — Mechanics of Fibre-reinforced Composites (EN)", url: "https://www.doitpoms.ac.uk/tlplib/fibre_composites/index.php" },
      { titre: "MIT 3.064 — Polymer Engineering (EN)", url: MIT("3-064-polymer-engineering-fall-2003") },
      { titre: "Wikipédia — Matériau composite", url: WP("Matériau_composite") },
    ],
  },
  {
    id: "fatigue", titre: "Fatigue & rupture", domaine: "materiaux",
    description: "Endommagement sous charges répétées, courbes de Wöhler, propagation de fissures, ténacité.",
    prerequis: ["comportement-materiaux"],
    ressources: [
      { titre: "MIT 3.35 — Fracture and Fatigue (EN)", url: MIT("3-35-fracture-and-fatigue-fall-2003") },
      { titre: "MechaniCalc — Fracture Mechanics (EN)", url: "https://www.mechanicalc.com/reference/fracture-mechanics" },
      { titre: "Wikipédia — Fatigue (matériau)", url: WP("Fatigue_(matériau)") },
    ],
  },
  {
    id: "corrosion", titre: "Corrosion & durabilité", domaine: "materiaux",
    description: "Mécanismes de corrosion, protection des surfaces, vieillissement des matériaux.",
    prerequis: ["metaux"],
    ressources: [
      { titre: "DoITPoMS (Cambridge) — Kinetics of Aqueous Corrosion (EN)", url: "https://www.doitpoms.ac.uk/tlplib/aqueous_corrosion/index.php" },
      { titre: "Wikipédia — Corrosion", url: WP("Corrosion") },
    ],
  },
  {
    id: "choix-materiaux", titre: "Choix des matériaux", domaine: "materiaux",
    description: "Méthode d'Ashby : indices de performance, cartes de propriétés, compromis masse / coût / tenue.",
    prerequis: ["comportement-materiaux", "metaux", "polymeres-composites"],
    ressources: [
      { titre: "MIT 3.032 — Mechanical Behavior of Materials (EN)", url: MIT("3-032-mechanical-behavior-of-materials-fall-2007") },
      { titre: "The Engineering ToolBox — propriétés des matériaux (EN)", url: "https://www.engineeringtoolbox.com/" },
      { titre: "Wikipédia — Sélection des matériaux", url: WP("Sélection_des_matériaux") },
    ],
  },

  // ----------------------------------------------------------- Conception
  {
    id: "dessin-technique", titre: "Dessin technique & CAO", domaine: "conception",
    description: "Lecture de plans, projections, modélisation 3D.",
    prerequis: [],
    ressources: [
      { titre: "FreeCAD — tutoriels (logiciel libre)", url: "https://wiki.freecad.org/Tutorials" },
      { titre: "Wikipédia — Dessin technique", url: WP("Dessin_technique") },
      { titre: "Wikipédia — Conception assistée par ordinateur", url: WP("Conception_assistée_par_ordinateur") },
    ],
  },
  {
    id: "cotation", titre: "Cotation fonctionnelle (GPS)", domaine: "conception",
    description: "Tolérances dimensionnelles et géométriques, spécification des produits.",
    prerequis: ["dessin-technique"],
    ressources: [
      { titre: "GD&T Basics — guide des symboles de tolérancement (EN)", url: "https://www.gdandtbasics.com/gdt-symbols/" },
      { titre: "Wikipédia — Spécification géométrique des produits", url: WP("Spécification_géométrique_des_produits") },
    ],
  },
  {
    id: "fabrication", titre: "Procédés de fabrication", domaine: "conception",
    description: "Usinage, moulage, tôlerie, impression 3D ; concevoir une pièce fabricable.",
    prerequis: ["dessin-technique", "choix-materiaux"],
    ressources: [
      { titre: "Dan Gelbart — Building Prototypes (18 vidéos, EN)", url: "https://www.youtube.com/watch?v=xMP_AfiNlX4" },
      { titre: "Protolabs Network — base de connaissances sur les procédés (EN)", url: "https://www.hubs.com/knowledge-base/" },
      { titre: "MIT 2.007 — Design and Manufacturing I (EN)", url: MIT("2-007-design-and-manufacturing-i-spring-2009") },
      { titre: "Fab Academy — cours de fabrication numérique (EN)", url: "https://fabacademy.org/" },
      { titre: "Wikipédia — Usinage", url: WP("Usinage") },
      { titre: "Wikipédia — Fabrication additive", url: WP("Fabrication_additive") },
    ],
  },
  {
    id: "mecanismes", titre: "Conception de mécanismes", domaine: "conception",
    description: "Liaisons mécaniques, schéma cinématique, dimensionnement.",
    prerequis: ["cinematique", "statique", "cotation", "rdm"],
    ressources: [
      { titre: "CMU — Introduction to Mechanisms (livre en ligne, EN)", url: "https://www.cs.cmu.edu/~rapidproto/mechanisms/tablecontents.html" },
      { titre: "Slocum (MIT) — FUNdaMENTALS of Design (EN)", url: "http://pergatory.mit.edu/resources/fundamentals.html" },
      { titre: "507 Mechanical Movements — mécanismes animés (EN)", url: "https://507movements.com/" },
      { titre: "Wikipédia — Liaison mécanique", url: WP("Liaison_mécanique") },
    ],
  },
  {
    id: "transmission", titre: "Transmission de puissance", domaine: "conception",
    description: "Engrenages, réducteurs, courroies, vis à billes ; rapport de réduction et rendement.",
    prerequis: ["mecanismes", "tribologie", "tenue-fatigue"],
    ressources: [
      { titre: "KHK — Gear Knowledge (guide technique des engrenages, EN)", url: "https://khkgears.net/new/gear_knowledge/" },
      { titre: "MIT 2.72 — Elements of Mechanical Design (EN)", url: MIT("2-72-elements-of-mechanical-design-spring-2009") },
      { titre: "Wikipédia — Engrenage", url: WP("Engrenage") },
      { titre: "Wikipédia — Réducteur mécanique", url: WP("Réducteur_mécanique") },
    ],
  },
  {
    id: "dimensionnement-actionneurs", titre: "Dimensionnement d'une chaîne d'actionnement", domaine: "conception",
    description: "Choisir moteur, réducteur et variateur à partir de la charge et du profil de mouvement.",
    prerequis: ["transmission", "machines-electriques", "dynamique"],
    ressources: [
      { titre: "MIT 2.75 — Precision Machine Design (EN)", url: MIT("2-75-precision-machine-design-fall-2001") },
      { titre: "Motion Control Tips — articles techniques (EN)", url: "https://www.motioncontroltips.com/" },
    ],
  },
  {
    id: "ingenierie-systeme", titre: "Ingénierie système", domaine: "conception",
    description: "Analyse du besoin, exigences, architecture fonctionnelle, SysML, cycle en V.",
    prerequis: [],
    ressources: [
      { titre: "NASA — Systems Engineering Handbook (EN)", url: "https://www.nasa.gov/reference/systems-engineering-handbook/" },
      { titre: "MIT 16.842 — Fundamentals of Systems Engineering (EN)", url: MIT("16-842-fundamentals-of-systems-engineering-fall-2015") },
      { titre: "SEBoK — Systems Engineering Body of Knowledge (EN)", url: "https://sebokwiki.org/wiki/Guide_to_the_Systems_Engineering_Body_of_Knowledge_(SEBoK)" },
      { titre: "Wikipédia — SysML", url: WP("Systems_Modeling_Language") },
    ],
  },
  {
    id: "surete", titre: "Sûreté de fonctionnement", domaine: "conception",
    description: "Fiabilité, analyse des modes de défaillance (AMDEC), arbres de défaillances.",
    prerequis: ["probas", "ingenierie-systeme"],
    ressources: [
      { titre: "MIT 16.863J — System Safety (EN)", url: MIT("16-863j-system-safety-spring-2016") },
      { titre: "NIST — Engineering Statistics Handbook, Assessing Product Reliability (EN)", url: "https://www.itl.nist.gov/div898/handbook/apr/apr.htm" },
      { titre: "Wikipédia — Sûreté de fonctionnement", url: WP("Sûreté_de_fonctionnement") },
    ],
  },
  {
    id: "mecatronique", titre: "Mécatronique", domaine: "conception",
    description: "Concevoir ensemble la mécanique, l'électronique, la commande et l'informatique d'un système.",
    prerequis: ["dimensionnement-actionneurs", "commande-moteurs", "capteurs-mouvement", "embarque", "ingenierie-systeme", "multiphysique"],
    ressources: [
      { titre: "MIT 2.737 — Mechatronics (EN)", url: MIT("2-737-mechatronics-fall-2014") },
      { titre: "MIT 2.017J — Design of Electromechanical Robotic Systems (EN)", url: MIT("2-017j-design-of-electromechanical-robotic-systems-fall-2009") },
      { titre: "éduscol STI — ressources en sciences de l'ingénieur", url: "https://sti.eduscol.education.fr/" },
      { titre: "Wikipédia — Mécatronique", url: WP("Mécatronique") },
    ],
  },
  {
    id: "projet-mecatronique", titre: "Projet mécatronique : intégration", domaine: "conception",
    description: "Du prototype au système complet : fabrication, cartes, communication, temps réel, sûreté.",
    prerequis: ["mecatronique", "fabrication", "pcb", "bus-communication", "temps-reel", "surete", "batteries", "gestion-thermique"],
    ressources: [
      { titre: "MIT 2.017J — Design of Electromechanical Robotic Systems (projets, EN)", url: MIT("2-017j-design-of-electromechanical-robotic-systems-fall-2009") },
      { titre: "Académie de Grenoble — annuaire de ressources SII", url: "https://sii.web.ac-grenoble.fr/ressources-ingenierie-systeme/page-de-ressources-en-sii-sur-le-web" },
    ],
  },

  // ------------------------------------------------------------ Robotique
  {
    id: "transformations", titre: "Transformations spatiales & rotations", domaine: "robotique",
    description: "Matrices de rotation, transformations homogènes, angles d'Euler, quaternions.",
    prerequis: ["algebre-lineaire", "cinematique"],
    ressources: [
      { titre: "Lynch & Park — Modern Robotics, ch. 3 (livre et vidéos gratuits, EN)", url: ROBOTIQUE_MODERNE },
      { titre: "QUT Robot Academy — leçons vidéo (EN)", url: "https://robotacademy.net.au/" },
      { titre: "Wikipédia — Matrice de rotation", url: WP("Matrice_de_rotation") },
    ],
  },
  {
    id: "cinematique-robots", titre: "Cinématique des robots", domaine: "robotique",
    description: "Modèles géométriques direct et inverse, jacobienne, singularités.",
    prerequis: ["transformations"],
    ressources: [
      { titre: "Lynch & Park — Modern Robotics, ch. 4 à 6 (EN)", url: ROBOTIQUE_MODERNE },
      { titre: "Stanford CS223A — Introduction to Robotics (EN)", url: "https://see.stanford.edu/Course/CS223A" },
      { titre: "MIT 2.12 — Introduction to Robotics (EN)", url: MIT("2-12-introduction-to-robotics-fall-2005") },
      { titre: "Wikipédia — Cinématique inverse", url: WP("Cinématique_inverse") },
    ],
  },
  {
    id: "dynamique-robots", titre: "Dynamique des robots", domaine: "robotique",
    description: "Équations du mouvement d'un bras articulé, couples moteurs nécessaires.",
    prerequis: ["cinematique-robots", "mecanique-analytique"],
    ressources: [
      { titre: "Lynch & Park — Modern Robotics, ch. 8 (EN)", url: ROBOTIQUE_MODERNE },
      { titre: "MIT 2.12 — Introduction to Robotics (EN)", url: MIT("2-12-introduction-to-robotics-fall-2005") },
    ],
  },
  {
    id: "trajectoires", titre: "Génération de trajectoires", domaine: "robotique",
    description: "Profils de vitesse, interpolation polynomiale, trajectoires articulaires et cartésiennes.",
    prerequis: ["cinematique-robots"],
    ressources: [
      { titre: "Lynch & Park — Modern Robotics, ch. 9 (EN)", url: ROBOTIQUE_MODERNE },
      { titre: "PythonRobotics — algorithmes illustrés (EN)", url: PYTHON_ROBOTICS },
    ],
  },
  {
    id: "planification", titre: "Planification de mouvement", domaine: "robotique",
    description: "Trouver un chemin sans collision : espace des configurations, A*, RRT.",
    prerequis: ["trajectoires", "algorithmique"],
    ressources: [
      { titre: "LaValle — Planning Algorithms (livre gratuit, EN)", url: "https://lavalle.pl/planning/" },
      { titre: "PythonRobotics — algorithmes illustrés (EN)", url: PYTHON_ROBOTICS },
      { titre: "Wikipédia — Planification de mouvement", url: WP("Planification_de_mouvement") },
    ],
  },
  {
    id: "commande-robots", titre: "Commande des robots", domaine: "robotique",
    description: "Commande en position, en couple calculé et en effort d'un bras robotisé.",
    prerequis: ["dynamique-robots", "trajectoires", "commande-moteurs", "non-lineaire"],
    ressources: [
      { titre: "Lynch & Park — Modern Robotics, ch. 11 (EN)", url: ROBOTIQUE_MODERNE },
      { titre: "Tedrake — Underactuated Robotics (cours en ligne, EN)", url: "https://underactuated.mit.edu/" },
    ],
  },
  {
    id: "robotique-mobile", titre: "Robotique mobile", domaine: "robotique",
    description: "Modèles cinématiques des robots à roues, odométrie, suivi de trajectoire.",
    prerequis: ["transformations", "capteurs-mouvement"],
    ressources: [
      { titre: "Correll — Introduction to Autonomous Robots (livre gratuit, EN)", url: "https://github.com/correll/Introduction-to-Autonomous-Robots" },
      { titre: "Univ. de Fribourg — Introduction to Mobile Robotics (EN)", url: "http://ais.informatik.uni-freiburg.de/teaching/ss16/robotics/index_en.php" },
      { titre: "Wikipédia — Odométrie", url: WP("Odométrie") },
    ],
  },
  {
    id: "vision", titre: "Vision par ordinateur", domaine: "robotique",
    description: "Modèle de caméra, calibration, détection et suivi d'objets, stéréovision.",
    prerequis: ["traitement-image", "transformations", "optique"],
    ressources: [
      { titre: "Szeliski — Computer Vision: Algorithms and Applications (livre gratuit, EN)", url: "https://szeliski.org/Book/" },
      { titre: "OpenCV — tutoriels (EN)", url: "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html" },
      { titre: "MIT 6.801 — Machine Vision (EN)", url: MIT("6-801-machine-vision-fall-2020") },
      { titre: "Wikipédia — Vision par ordinateur", url: WP("Vision_par_ordinateur") },
    ],
  },
  {
    id: "slam", titre: "Localisation & cartographie (SLAM)", domaine: "robotique",
    description: "Se localiser et construire une carte en même temps, par fusion de capteurs.",
    prerequis: ["robotique-mobile", "kalman", "imu", "vision", "capteurs-distance"],
    ressources: [
      { titre: "Univ. de Fribourg — Introduction to Mobile Robotics (EN)", url: "http://ais.informatik.uni-freiburg.de/teaching/ss16/robotics/index_en.php" },
      { titre: "PythonRobotics — algorithmes illustrés (EN)", url: PYTHON_ROBOTICS },
      { titre: "Wikipédia — Cartographie et localisation simultanées", url: WP("Cartographie_et_localisation_simultanées") },
    ],
  },
  {
    id: "ros", titre: "ROS (Robot Operating System)", domaine: "robotique",
    description: "Architecture logicielle d'un robot : nœuds, messages, simulation avec Gazebo.",
    prerequis: ["prog-c", "embarque"],
    ressources: [
      { titre: "ROS 2 — tutoriels officiels (EN)", url: "https://docs.ros.org/en/rolling/Tutorials.html" },
      { titre: "Gazebo — simulateur de robots (EN)", url: "https://gazebosim.org/" },
      { titre: "Wikipédia — Robot Operating System", url: WP("Robot_Operating_System") },
    ],
  },
  {
    id: "robot-autonome", titre: "Robot autonome : intégration", domaine: "robotique",
    description: "Assembler perception, décision et action dans un robot complet.",
    prerequis: ["commande-robots", "planification", "slam", "ros", "apprentissage"],
    ressources: [
      { titre: "Correll — Introduction to Autonomous Robots (livre gratuit, EN)", url: "https://github.com/correll/Introduction-to-Autonomous-Robots" },
      { titre: "MIT 2.12 — Introduction to Robotics (projets, EN)", url: MIT("2-12-introduction-to-robotics-fall-2005") },
      { titre: "Wikipédia — Robotique", url: WP("Robotique") },
    ],
  },
];
