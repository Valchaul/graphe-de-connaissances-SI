// =====================================================================
//  Fiche d'une notion (panneau latéral) et mise en évidence de sa chaîne de prérequis
// =====================================================================

const panneau = document.getElementById("panneau");

// Logo du site d'une ressource. Les logos sont téléchargés une fois pour toutes par
// outils/favicons.js (liste dans data/favicons.js) : le site ne contacte aucun service tiers.
// Les sites sans logo, ou dont le fichier manque, reçoivent une icône générique.
const LOGO_GENERIQUE = "img/lien.svg";
function logoDuLien(url) {
  let site = "";
  try { site = new URL(url).hostname.replace(/^www\./, ""); } catch { /* adresse invalide */ }
  const img = document.createElement("img");
  img.className = "logo-lien";
  img.alt = ""; // décoratif : le titre du lien suffit
  img.width = 16;
  img.height = 16;
  img.src = (typeof FAVICONS !== "undefined" && FAVICONS[site]) || LOGO_GENERIQUE;
  img.addEventListener("error", () => { img.src = LOGO_GENERIQUE; }, { once: true });
  return img;
}

function remplirListeNotions(ul, ids) {
  ul.innerHTML = "";
  if (!ids.length) {
    ul.innerHTML = '<li class="vide">Aucune</li>';
    return;
  }
  for (const id of ids) {
    const n = parId[id];
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.textContent = n.titre;
    const niveau = document.createElement("span"); // rappel du niveau, pour se repérer dans le parcours
    niveau.className = "niveau-liste";
    niveau.textContent = n.niveau;
    b.appendChild(niveau);
    b.style.setProperty("--c", DOMAINES[n.domaine]?.couleur);
    b.addEventListener("click", () => choisir(id, true));
    li.appendChild(b);
    ul.appendChild(li);
  }
}

function choisir(id, centrer) {
  const n = parId[id];
  const noeud = cy.getElementById(id);
  if (!n || noeud.empty()) return;

  // Mise en évidence : la notion, toute sa chaîne de prérequis et ce qu'elle ouvre
  const amont = noeud.predecessors();
  const aval = noeud.successors();
  cy.elements().removeClass("attenue choisi chemin trouve");
  cy.elements().not(amont).not(aval).not(noeud).not(".cadre").addClass("attenue");
  amont.edges().addClass("chemin");
  aval.edges().addClass("chemin");
  noeud.addClass("choisi");

  // Panneau
  const d = DOMAINES[n.domaine];
  const badge = document.getElementById("p-domaine");
  badge.textContent = d?.nom || n.domaine;
  badge.style.setProperty("--c", d?.couleur);
  const badgeNiveau = document.getElementById("p-niveau");
  badgeNiveau.textContent = n.niveau;
  badgeNiveau.title = NIVEAUX[n.niveau] ? `${NIVEAUX[n.niveau].nom} — ${NIVEAUX[n.niveau].detail}` : "";
  document.getElementById("p-titre").textContent = n.titre;
  document.getElementById("p-description").textContent = n.description || "";

  const ulRes = document.getElementById("p-ressources");
  ulRes.innerHTML = "";
  for (const r of n.ressources || []) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = r.url;
    a.target = "_blank";
    a.rel = "noopener";
    const titre = document.createElement("span");
    titre.textContent = r.titre;
    a.append(logoDuLien(r.url), titre);
    li.appendChild(a);
    ulRes.appendChild(li);
  }
  if (!ulRes.children.length) ulRes.innerHTML = '<li class="vide">Aucune ressource pour l\'instant</li>';

  remplirListeNotions(document.getElementById("p-prerequis"), n.prerequis || []);
  remplirListeNotions(
    document.getElementById("p-suivants"),
    NOTIONS.filter((m) => (m.prerequis || []).includes(id)).map((m) => m.id)
  );

  panneau.hidden = false;
  cy.resize();
  if (centrer) {
    // Cadre toute la chaîne (prérequis + suites). Le zoom est plafonné
    // pendant l'animation pour ne pas grossir à l'excès une chaîne courte.
    const chaine = noeud.union(amont.nodes()).union(aval.nodes());
    const zoomMax = cy.maxZoom();
    cy.stop();
    cy.maxZoom(1.2);
    cy.animate({
      fit: { eles: chaine, padding: 50 },
      duration: 350,
      complete: () => cy.maxZoom(zoomMax),
    });
  }

  history.replaceState(null, "", "#" + id); // lien partageable vers la notion
}

function deselectionner() {
  cy.elements().removeClass("attenue choisi chemin trouve");
  panneau.hidden = true;
  cy.resize();
  history.replaceState(null, "", location.pathname);
}

cy.on("tap", "node.notion", (e) => choisir(e.target.id(), false));
cy.on("tap", (e) => { if (e.target === cy) deselectionner(); });
document.getElementById("fermer").addEventListener("click", deselectionner);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") deselectionner(); });
