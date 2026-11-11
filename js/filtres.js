// =====================================================================
//  Filtres par domaine et bouton « Îlots par domaine »
// =====================================================================

const domainesMasques = new Set();
const legende = document.getElementById("legende");
const basculeIlots = document.getElementById("bascule-ilots"); // premier élément de la légende
for (const [cle, d] of Object.entries(DOMAINES)) {
  const bouton = document.createElement("button");
  bouton.className = "domaine";
  bouton.textContent = d.nom;
  bouton.style.setProperty("--c", d.couleur);
  bouton.title = "Masquer / afficher ce domaine";
  bouton.addEventListener("click", () => {
    if (domainesMasques.has(cle)) domainesMasques.delete(cle);
    else domainesMasques.add(cle);
    bouton.classList.toggle("off", domainesMasques.has(cle));
    cy.nodes(".notion").forEach((noeud) => {
      noeud.style("display", domainesMasques.has(noeud.data("domaine")) ? "none" : "element");
    });
    placer(false).catch(afficherErreurPlacement); // recalcule la carte avec les seules notions visibles, sans toucher à la vue
  });
  legende.appendChild(bouton);
}

// Bouton « Îlots par domaine » : affiche ou masque les cadres et recalcule la carte.
basculeIlots.setAttribute("aria-pressed", String(grouperParDomaine));
basculeIlots.addEventListener("click", () => {
  grouperParDomaine = !grouperParDomaine;
  memoriserPreferenceIlots(grouperParDomaine);
  basculeIlots.setAttribute("aria-pressed", String(grouperParDomaine));
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
