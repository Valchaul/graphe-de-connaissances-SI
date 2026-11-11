// =====================================================================
//  Survol d'une notion :
//  - met en évidence sa chaîne de prérequis et ses suites, sans cliquer ;
//  - affiche une info-bulle avec sa description.
//  À la souris, il suffit de passer sur la notion. Sur écran tactile, c'est le doigt posé
//  sur la notion qui joue ce rôle : la mise en évidence dure tant qu'il reste posé. Un
//  appui bref ouvre la fiche comme avant ; un appui long (le doigt reste posé) ne l'ouvre
//  pas, pour laisser le temps de regarder.
// =====================================================================

const avecSouris = window.matchMedia("(hover: hover)").matches;
const DELAI_INFOBULLE = 350; // ms de survol avant l'affichage de l'info-bulle

const infobulle = document.createElement("div");
infobulle.className = "infobulle";
infobulle.setAttribute("role", "tooltip");
infobulle.hidden = true;
document.body.appendChild(infobulle);

let minuterie = null;
let notionSurvolee = null;

// ---------- Mise en évidence ----------
// Pas de mise en évidence au survol tant qu'une notion est choisie ou qu'une recherche est en cours :
// ces états ont déjà leur propre mise en évidence.
function evidenceActive() {
  return cy.nodes(".choisi, .trouve").nonempty();
}

function allumer(noeud) {
  const amont = noeud.predecessors();
  const aval = noeud.successors();
  cy.elements().not(amont).not(aval).not(noeud).not(".cadre").addClass("survol-attenue");
  amont.edges().addClass("survol-chemin");
  aval.edges().addClass("survol-chemin");
}

function eteindre() {
  cy.elements().removeClass("survol-attenue survol-chemin");
}

// ---------- Info-bulle ----------
function contenuInfobulle(n) {
  infobulle.replaceChildren();
  const titre = document.createElement("strong");
  titre.textContent = n.titre;
  const meta = document.createElement("span");
  meta.className = "infobulle-meta";
  meta.textContent = `${DOMAINES[n.domaine]?.nom || n.domaine} · ${n.niveau}`;
  infobulle.append(titre, meta);
  if (n.description) {
    const p = document.createElement("p");
    p.textContent = n.description;
    infobulle.appendChild(p);
  }
  if (estPrete(n.id)) {
    const prete = document.createElement("span");
    prete.className = "infobulle-prete";
    prete.textContent = "Prête à apprendre : tous ses prérequis sont acquis";
    infobulle.appendChild(prete);
  }
}

function afficherInfobulle(noeud) {
  contenuInfobulle(parId[noeud.id()]);
  infobulle.hidden = false;
  const zone = conteneur.getBoundingClientRect();
  const b = noeud.renderedBoundingBox({ includeLabels: false });
  const larg = infobulle.offsetWidth;
  const haut = infobulle.offsetHeight;
  // Centrée au-dessus de la notion ; en dessous si elle sortirait de l'écran par le haut
  let x = zone.left + b.x1 + b.w / 2 - larg / 2;
  let y = zone.top + b.y1 - haut - 10;
  if (y < 8) y = zone.top + b.y2 + 10;
  x = Math.max(8, Math.min(x, window.innerWidth - larg - 8));
  infobulle.style.left = x + "px";
  infobulle.style.top = y + "px";
  requestAnimationFrame(() => infobulle.classList.add("visible"));
}

function masquerInfobulle() {
  clearTimeout(minuterie);
  infobulle.classList.remove("visible");
  infobulle.hidden = true;
}

// ---------- Événements ----------
if (avecSouris) {
  cy.on("mouseover", "node.notion", (e) => {
    notionSurvolee = e.target;
    if (!evidenceActive()) allumer(e.target);
    clearTimeout(minuterie);
    minuterie = setTimeout(() => afficherInfobulle(e.target), DELAI_INFOBULLE);
  });
  cy.on("mouseout", "node.notion", () => {
    notionSurvolee = null;
    eteindre();
    masquerInfobulle();
  });
  // Déplacer ou zoomer la carte, ou cliquer : l'info-bulle ne doit pas rester en arrière-plan
  cy.on("viewport tap", () => { masquerInfobulle(); });
}

// ---------- Écran tactile : le doigt posé sur une notion ----------
let appuiLong = false; // vrai après un appui long : panneau.js n'ouvre alors pas la fiche au relâchement
const auDoigt = (e) => (e.originalEvent?.type || "").startsWith("touch");

function finDuToucher() {
  if (!notionSurvolee) return;
  notionSurvolee = null;
  eteindre();
  masquerInfobulle();
}
cy.on("tapstart", "node.notion", (e) => {
  appuiLong = false;
  if (!auDoigt(e) || !appuiDansLaNotion(e)) return;
  notionSurvolee = e.target;
  if (!evidenceActive()) allumer(e.target);
  clearTimeout(minuterie);
  minuterie = setTimeout(() => afficherInfobulle(e.target), DELAI_INFOBULLE);
});
cy.on("taphold", "node.notion", (e) => { if (auDoigt(e) && notionSurvolee) appuiLong = true; });
cy.on("tapend", (e) => { if (auDoigt(e)) finDuToucher(); });
cy.on("viewport", finDuToucher); // le doigt déplace ou zoome la carte : ce n'est plus un toucher de notion
