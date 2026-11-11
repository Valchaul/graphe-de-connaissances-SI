// =====================================================================
//  Filtres par domaine et bouton « Îlots par domaine »
// =====================================================================

const domainesMasques = new Set();
const legende = document.getElementById("legende");
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
    placer().catch(afficherErreurPlacement); // recalcule la carte avec les seules notions visibles
  });
  legende.appendChild(bouton);
}

// Bouton « Îlots par domaine » : affiche ou masque les cadres et recalcule la carte.
const basculeIlots = document.getElementById("bascule-ilots");
basculeIlots.setAttribute("aria-pressed", String(grouperParDomaine));
basculeIlots.addEventListener("click", () => {
  grouperParDomaine = !grouperParDomaine;
  memoriserPreferenceIlots(grouperParDomaine);
  basculeIlots.setAttribute("aria-pressed", String(grouperParDomaine));
  placer().catch(afficherErreurPlacement);
});
