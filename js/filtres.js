// =====================================================================
//  Filtres par domaine (mémorisés dans le navigateur) et case « Îlots par domaine »
// =====================================================================

const domainesMasques = new Set();

// Les catégories masquées sont mémorisées dans le navigateur (s'il l'autorise) : on retrouve
// la carte telle qu'on l'a laissée. Sans rien de mémorisé, c'est un premier lancement.
const CLE_DOMAINES = "learn-map:domaines-masques";
function lireDomainesMasques() {
  try {
    const liste = JSON.parse(localStorage.getItem(CLE_DOMAINES));
    return Array.isArray(liste) ? liste.filter((d) => DOMAINES[d]) : null;
  } catch { return null; }
}
function memoriserDomainesMasques() {
  try { localStorage.setItem(CLE_DOMAINES, JSON.stringify([...domainesMasques])); } catch { /* sans mémoire : tant pis */ }
}
const niveauxMasques = new Set(); // niveaux décochés dans « Filtres » (js/filtres-avances.js)
const statutsMasques = new Set(); // statuts décochés : "aucun", "acquise", "encours", "arevoir"

// Statuts d'une notion (plusieurs possibles : acquise et à réviser). Sans statut : ["aucun"].
function statutsDe(id) {
  const s = [];
  if (acquises.has(id)) s.push("acquise");
  if (enCours.has(id)) s.push("encours");
  if (aReviser.has(id)) s.push("arevoir");
  return s.length ? s : ["aucun"];
}
// Domaine et niveau : ce qui compte aussi pour le compteur de progression
function afficheeParDomaineEtNiveau(n) {
  return !domainesMasques.has(n.domaine) && !niveauxMasques.has(n.niveau);
}
// Statut : une notion reste affichée si au moins un de ses statuts est coché
function afficheeParStatut(n) {
  return statutsMasques.size === 0 || statutsDe(n.id).some((s) => !statutsMasques.has(s));
}

// Applique tous les filtres (domaine, niveau, statut) : masque les notions, puis recalcule la carte
// avec les seules notions visibles, sans toucher à la vue.
function appliquerFiltres() {
  masquerNotionsFiltrees();
  placer(false).catch(afficherErreurPlacement);
}
// Masque les notions filtrées et met le compteur à jour, sans recalculer la carte
function masquerNotionsFiltrees() {
  majCompteur(); // le compteur de progression ne compte que les domaines et niveaux affichés
  cy.nodes(".notion").forEach((noeud) => {
    const n = parId[noeud.id()];
    noeud.style("display", afficheeParDomaineEtNiveau(n) && afficheeParStatut(n) ? "element" : "none");
  });
}
const legende = document.getElementById("legende");
const basculeIlots = document.getElementById("bascule-ilots"); // case à cocher du panneau des filtres
const boutonsDomaines = {}; // clé du domaine -> son bouton dans la légende
// Barre les domaines masqués dans la légende (après un clic ou un changement de formation)
function majLegende() {
  for (const [cle, bouton] of Object.entries(boutonsDomaines)) bouton.classList.toggle("off", domainesMasques.has(cle));
}
for (const [cle, d] of Object.entries(DOMAINES)) {
  const bouton = document.createElement("button");
  bouton.className = "domaine";
  bouton.textContent = d.nom;
  bouton.style.setProperty("--c", d.couleur);
  bouton.title = "Masquer / afficher ce domaine";
  bouton.addEventListener("click", () => {
    if (domainesMasques.has(cle)) domainesMasques.delete(cle);
    else domainesMasques.add(cle);
    memoriserDomainesMasques();
    majLegende();
    appliquerFiltres();
  });
  boutonsDomaines[cle] = bouton;
  legende.appendChild(bouton);
}

// Case « Îlots par domaine » : affiche ou masque les cadres et recalcule la carte.
basculeIlots.checked = grouperParDomaine;
basculeIlots.addEventListener("change", () => {
  grouperParDomaine = basculeIlots.checked;
  memoriserPreferenceIlots(grouperParDomaine);
  placer(false).catch(afficherErreurPlacement);
});

// La légende est transparente : elle recouvre le haut de la carte au lieu de lui prendre de la place.
function ajusterLegende() {
  legende.style.marginBottom = -legende.offsetHeight + "px";
  document.documentElement.style.setProperty("--h-legende", legende.offsetHeight + "px"); // la fiche se place dessous
  cy.resize();
}
ajusterLegende();
window.addEventListener("resize", ajusterLegende);
