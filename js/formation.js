// =====================================================================
//  Filtre par formation
//  Un écran propose quelques formations (FORMATIONS, dans data/notions.js). En choisir une
//  masque les domaines qui n'en font pas partie ; ceux du tronc commun (TRONC_COMMUN)
//  restent affichés. C'est un simple réglage des filtres par domaine : le site ne retient
//  pas la formation, seulement les domaines masqués (filtres.js), que l'on peut ensuite
//  réafficher un à un dans la légende.
//  L'écran s'ouvre au premier lancement, puis à la demande depuis le panneau des filtres.
// =====================================================================

const accueil = document.getElementById("accueil");
const accueilChoix = document.getElementById("accueil-choix");
const accueilFermer = document.getElementById("accueil-fermer");
let premierLancement = false; // vrai tant que l'écran d'ouverture attend une réponse

// Domaines affichés pour une formation (tous si elle n'a pas de liste)
function domainesDeLaFormation(cle) {
  const f = FORMATIONS[cle];
  if (!f || !f.domaines) return Object.keys(DOMAINES);
  return Object.keys(DOMAINES).filter((d) => TRONC_COMMUN.includes(d) || f.domaines.includes(d));
}

// Remplace les domaines masqués, met la légende et les notions à jour (sans recalculer la carte)
function reglerDomainesMasques(masques) {
  domainesMasques.clear();
  for (const d of masques) domainesMasques.add(d);
  majLegende();
  masquerNotionsFiltrees();
}

// Choix d'une formation : ses domaines sont affichés, les autres masqués ; la carte est
// recalculée et recadrée, et les domaines masqués sont mémorisés.
function filtrerPourLaFormation(cle) {
  const affiches = new Set(domainesDeLaFormation(cle));
  premierLancement = false;
  accueil.close();
  deselectionner(); // la notion ouverte peut appartenir à un domaine qui disparaît
  reglerDomainesMasques(Object.keys(DOMAINES).filter((d) => !affiches.has(d)));
  memoriserDomainesMasques();
  placer().catch(afficherErreurPlacement);
}

// Un bouton par formation, avec la liste des catégories qu'elle affiche
const nomsDomaines = (cles) => cles.map((d) => DOMAINES[d].nom).join(", ");
for (const [cle, f] of Object.entries(FORMATIONS)) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "choix-formation";
  const nom = document.createElement("span");
  nom.className = "choix-formation-nom";
  nom.textContent = f.nom;
  const detail = document.createElement("span");
  detail.className = "choix-formation-detail";
  detail.textContent = f.domaines ? nomsDomaines(f.domaines.filter((d) => DOMAINES[d])) : "Toutes les catégories";
  bouton.append(nom, detail);
  bouton.addEventListener("click", () => filtrerPourLaFormation(cle));
  accueilChoix.appendChild(bouton);
}
document.getElementById("accueil-tronc").textContent =
  `Le tronc commun (${nomsDomaines(TRONC_COMMUN.filter((d) => DOMAINES[d]))}) reste toujours visible.`;

// Ouvre l'écran. Au premier lancement, il n'y a pas de bouton « Annuler » : le fermer
// (touche Échap) revient à choisir « Généraliste », qui affiche tout.
function ouvrirAccueil() {
  accueilFermer.hidden = premierLancement;
  accueil.showModal();
}
accueilFermer.addEventListener("click", () => accueil.close());
accueil.addEventListener("cancel", (e) => {
  if (!premierLancement) return; // écran rouvert depuis les filtres : Échap annule simplement
  e.preventDefault();
  filtrerPourLaFormation("generaliste");
});

document.getElementById("filtres-formation-bouton").addEventListener("click", () => {
  fermerFiltres();
  ouvrirAccueil();
});

// Au démarrage (appelé par main.js avant le premier placement) : masque les domaines
// mémorisés, ou ouvre l'écran d'accueil si rien n'est mémorisé (premier lancement).
function demarrerFormation() {
  const memorises = lireDomainesMasques();
  if (!memorises) {
    premierLancement = true;
    ouvrirAccueil();
    return;
  }
  // Le domaine de la notion demandée par l'adresse (#id-de-notion) est affiché le temps de
  // la visite, pour qu'un lien partagé fonctionne.
  const demandee = parId[decodeURIComponent(location.hash.slice(1))];
  reglerDomainesMasques(memorises.filter((d) => !demandee || d !== demandee.domaine));
}
