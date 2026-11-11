// =====================================================================
//  Filtres par niveau (L1 à M2) et par statut (acquise, en cours, à réviser, sans statut)
//  Une puce enfoncée = ce niveau / ce statut est affiché. Les ensembles niveauxMasques et
//  statutsMasques sont dans filtres.js, qui applique aussi les filtres par domaine.
// =====================================================================

const STATUTS = [
  { cle: "aucun", nom: "Sans statut" },
  { cle: "acquise", nom: "Acquise" },
  { cle: "encours", nom: "En cours" },
  { cle: "arevoir", nom: "À réviser" },
];

const boutonFiltres = document.getElementById("filtres-bouton");
const panneauFiltres = document.getElementById("filtres-panneau");
const boutonReset = document.getElementById("filtres-reset");

// Une puce par niveau ou par statut
function creerPuce(conteneur, texte, titre, masques, cle) {
  const puce = document.createElement("button");
  puce.type = "button";
  puce.className = "puce-filtre";
  puce.textContent = texte;
  if (titre) puce.title = titre;
  puce.setAttribute("aria-pressed", "true");
  puce.addEventListener("click", () => {
    if (masques.has(cle)) masques.delete(cle);
    else masques.add(cle);
    puce.setAttribute("aria-pressed", String(!masques.has(cle)));
    appliquerFiltres();
    majBoutonFiltres();
  });
  conteneur.appendChild(puce);
}
for (const [cle, n] of Object.entries(NIVEAUX)) {
  creerPuce(document.getElementById("filtres-niveaux"), cle, `${n.nom} — ${n.detail}`, niveauxMasques, cle);
}
for (const s of STATUTS) {
  creerPuce(document.getElementById("filtres-statuts"), s.nom, "", statutsMasques, s.cle);
}

// Le bouton montre combien de filtres sont actifs et s'enfonce dès qu'il y en a un
function majBoutonFiltres() {
  const n = niveauxMasques.size + statutsMasques.size;
  document.getElementById("filtres-compte").textContent = n ? String(n) : "";
  boutonFiltres.setAttribute("aria-pressed", String(n > 0));
  boutonFiltres.setAttribute("aria-label", n ? `Filtres : ${n} actif${n > 1 ? "s" : ""}` : "Filtres");
  boutonReset.hidden = n === 0;
}

boutonReset.addEventListener("click", () => {
  niveauxMasques.clear();
  statutsMasques.clear();
  panneauFiltres.querySelectorAll(".puce-filtre").forEach((p) => p.setAttribute("aria-pressed", "true"));
  appliquerFiltres();
  majBoutonFiltres();
});

// Ouverture et fermeture du panneau (clic ailleurs ou Échap pour le refermer)
function fermerFiltres() {
  panneauFiltres.hidden = true;
  boutonFiltres.setAttribute("aria-expanded", "false");
}
boutonFiltres.addEventListener("click", () => {
  const ouvrir = panneauFiltres.hidden;
  panneauFiltres.hidden = !ouvrir;
  boutonFiltres.setAttribute("aria-expanded", String(ouvrir));
});
document.addEventListener("click", (e) => {
  if (!panneauFiltres.hidden && !e.target.closest(".filtres-zone")) fermerFiltres();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !panneauFiltres.hidden) {
    fermerFiltres();
    boutonFiltres.focus();
    e.stopImmediatePropagation(); // Échap ne ferme pas aussi la fiche
  }
}, true);
