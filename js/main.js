// =====================================================================
//  Démarrage
//  Dernier script chargé : lance le premier placement de la carte, puis ouvre la
//  notion demandée par l'adresse (#id-de-notion) s'il y en a une.
// =====================================================================

const placementInitial = placer()
  .catch(afficherErreurPlacement)
  .finally(() => conteneur.classList.remove("en-attente"));

// ELK calcule le placement en arrière-plan : on attend qu'il ait fini.
placementInitial.then(() => {
  if (location.hash.length > 1) {
    choisir(decodeURIComponent(location.hash.slice(1)), true);
  }
});
