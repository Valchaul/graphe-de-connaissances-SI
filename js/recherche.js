// =====================================================================
//  Recherche d'une notion par son titre
// =====================================================================

const sansAccents = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const recherche = document.getElementById("recherche");

recherche.addEventListener("input", () => {
  const q = sansAccents(recherche.value.trim());
  cy.elements().removeClass("attenue choisi chemin trouve");
  if (!q) return;
  const trouves = cy.nodes(".notion").filter((nd) => sansAccents(nd.data("label")).includes(q));
  cy.elements().not(trouves).not(".cadre").addClass("attenue");
  trouves.addClass("trouve");
});

recherche.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const premier = cy.nodes(".trouve").first();
  if (premier.nonempty()) {
    choisir(premier.id(), true);
    recherche.blur();
  }
});
