// =====================================================================
//  Démarrage
//  Dernier script chargé : masque les catégories mémorisées (ou demande la formation
//  au premier lancement), lance le premier placement de la carte, puis ouvre la notion demandée
//  par l'adresse (#id-de-notion) s'il y en a une.
// =====================================================================

rafraichirProgression(); // applique la progression mémorisée (carte et compteur)
demarrerFormation();     // masque les catégories mémorisées, ou ouvre l'écran d'accueil (js/formation.js)

const placementInitial = placer()
  .catch(afficherErreurPlacement)
  .finally(() => conteneur.classList.remove("en-attente"));

// ELK calcule le placement en arrière-plan : on attend qu'il ait fini.
placementInitial.then(() => {
  if (location.hash.length > 1) {
    choisir(decodeURIComponent(location.hash.slice(1)), true);
  }
});
