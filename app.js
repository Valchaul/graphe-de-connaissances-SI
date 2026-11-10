// =====================================================================
//  Application : construit le graphe à partir de data/notions.js
//  (normalement, pas besoin de modifier ce fichier pour ajouter du contenu)
// =====================================================================

// ---------- 1. Vérification du contenu ----------
function verifierContenu() {
  const erreurs = [];
  const ids = new Set();

  for (const n of NOTIONS) {
    if (ids.has(n.id)) erreurs.push(`Identifiant en double : "${n.id}"`);
    ids.add(n.id);
    if (!DOMAINES[n.domaine]) erreurs.push(`"${n.id}" : domaine inconnu "${n.domaine}"`);
  }
  for (const n of NOTIONS) {
    for (const p of n.prerequis || []) {
      if (!ids.has(p)) erreurs.push(`"${n.id}" : prérequis inconnu "${p}"`);
    }
  }

  // Détection de boucles (A demande B qui demande A)
  const parId = Object.fromEntries(NOTIONS.map((n) => [n.id, n]));
  const etat = {}; // 1 = en cours, 2 = fini
  function visiter(id, chemin) {
    if (etat[id] === 2 || !parId[id]) return;
    if (etat[id] === 1) {
      erreurs.push("Boucle de prérequis : " + [...chemin, id].join(" → "));
      return;
    }
    etat[id] = 1;
    for (const p of parId[id].prerequis || []) visiter(p, [...chemin, id]);
    etat[id] = 2;
  }
  NOTIONS.forEach((n) => visiter(n.id, []));

  if (erreurs.length) {
    const boite = document.getElementById("erreurs");
    boite.hidden = false;
    boite.innerHTML =
      "<strong>Problèmes dans data/notions.js :</strong><br>" +
      erreurs.map((e) => "• " + e.replace(/</g, "&lt;")).join("<br>");
  }
  return erreurs.length === 0;
}

const contenuOk = verifierContenu();
const parId = Object.fromEntries(NOTIONS.map((n) => [n.id, n]));

// ---------- 2. Construction du graphe ----------
const LARGEUR_NOEUD = 170;
const HAUTEUR_NOEUD = 46;
const RAYON_COUDES = 12; // arrondi des virages des flèches (px)

const elements = [];
for (const n of NOTIONS) {
  elements.push({
    classes: "notion",
    data: { id: n.id, label: n.titre, couleur: DOMAINES[n.domaine]?.couleur || "#888", domaine: n.domaine },
  });
}
for (const n of NOTIONS) {
  for (const p of n.prerequis || []) {
    if (!parId[p]) continue;
    elements.push({
      // depart / arrivee / poids / distances : tracé de la flèche, rempli par ELK (section 3)
      data: { id: p + "->" + n.id, source: p, target: n.id,
              depart: "0px 0px", arrivee: "0px 0px", poids: "0.5", distances: "0", rayons: "0",
              coude: false },
    });
  }
}

const conteneur = document.getElementById("graphe");
conteneur.classList.add("en-attente"); // masqué tant que le placement n'est pas calculé

const cy = cytoscape({
  container: conteneur,
  elements,
  layout: { name: "preset" }, // les positions sont fournies par ELK (section 3)
  autoungrabify: true,        // notions non déplaçables : les flèches sont calculées pour leur place
  minZoom: 0.15,
  maxZoom: 2.5,
  style: [
    {
      selector: "node.notion",
      style: {
        shape: "round-rectangle",
        width: LARGEUR_NOEUD,
        height: HAUTEUR_NOEUD,
        "background-color": "data(couleur)",
        "background-opacity": 0.07,
        "border-width": 1.5,
        "border-color": "data(couleur)",
        label: "data(label)",
        "font-family": "system-ui, sans-serif",
        "font-size": 12,
        color: "#1f2328",
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": 150,
        "transition-property": "opacity, border-width",
        "transition-duration": "150ms",
      },
    },
    {
      selector: "edge",
      style: {
        width: 1.2,
        "line-color": "#c4bfb4",
        "target-arrow-color": "#c4bfb4",
        "target-arrow-shape": "triangle",
        "arrow-scale": 0.8,
        // Extrémités exactes calculées par ELK (décalage par rapport au centre de la notion)
        "curve-style": "straight",
        "source-endpoint": (e) => e.data("depart"),
        "target-endpoint": (e) => e.data("arrivee"),
        "transition-property": "opacity, line-color",
        "transition-duration": "150ms",
      },
    },
    {
      // Flèches avec coudes : segments à angles droits, coins arrondis
      selector: "edge[?coude]",
      style: {
        "curve-style": "round-segments",
        "edge-distances": "endpoints",
        "segment-weights": (e) => e.data("poids"),
        "segment-distances": (e) => e.data("distances"),
        "segment-radii": (e) => e.data("rayons"),
      },
    },
    {
      // Point de jonction : là où une flèche se divise (comme sur un schéma électrique).
      // Deux lignes qui se coupent SANS point sont un simple croisement.
      selector: "node.jonction",
      style: {
        shape: "ellipse",
        width: 6,
        height: 6,
        "background-color": "#a8a296",
        "border-width": 0,
        events: "no",
        "transition-property": "opacity",
        "transition-duration": "150ms",
      },
    },
    { selector: "node.jonction.chemin", style: { "background-color": "#5b6168", width: 7, height: 7 } },
    { selector: ".attenue", style: { opacity: 0.15 } },
    { selector: "node.choisi", style: { "border-width": 3.5 } },
    { selector: "node.trouve", style: { "border-width": 3.5 } },
    {
      selector: "edge.chemin",
      style: { "line-color": "#5b6168", "target-arrow-color": "#5b6168", width: 2, "z-index": 10 },
    },
  ],
});

// ---------- 3. Placement et tracé des flèches par ELK ----------
// ELK (algorithme "layered") range les notions en colonnes, des bases à gauche
// vers les notions avancées à droite, puis trace chaque flèche à angles droits
// en évitant les notions et en limitant les croisements.
// Liste des réglages : https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html
const OPTIONS_ELK = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.edgeRouting": "ORTHOGONAL",                     // flèches à angles droits
  "elk.padding": "[top=30,left=30,bottom=30,right=30]",
  // Espacements (en pixels). Les écarts entre flèches doivent rester supérieurs
  // à environ 1,2 × RAYON_COUDES, sinon les virages voisins se chevauchent.
  "elk.spacing.nodeNode": 30,                          // écart vertical entre notions
  "elk.layered.spacing.nodeNodeBetweenLayers": 80,     // écart minimal entre colonnes
  "elk.spacing.edgeNode": 18,                          // distance flèche ↔ notion
  "elk.spacing.edgeEdge": 16,                          // distance entre flèches parallèles
  "elk.layered.spacing.edgeNodeBetweenLayers": 30,     // marge flèche ↔ colonne de notions
  "elk.layered.spacing.edgeEdgeBetweenLayers": 16,     // écart entre lignes verticales d'un couloir
  "elk.layered.crossingMinimization.thoroughness": 100, // plus élevé = moins de croisements
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX", // favorise les flèches droites
  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES", // respecte l'ordre du fichier
  "elk.layered.mergeEdges": true,                      // les flèches d'une même notion partent ensemble
};

const elk = new ELK();

// Convertit le tracé ELK (points absolus) au format Cytoscape :
// chaque coude = (position le long du segment départ→arrivée, écart perpendiculaire).
function appliquerTrace(arete, section, centres) {
  const cs = centres[arete.data("source")];
  const ct = centres[arete.data("target")];
  const D = section.startPoint;
  const A = section.endPoint;
  const dx = A.x - D.x;
  const dy = A.y - D.y;
  const l2 = dx * dx + dy * dy || 1;
  const l = Math.sqrt(l2);

  const coudes = section.bendPoints || [];
  const tous = [D, ...coudes, A];
  const longueur = (p, q) => Math.hypot(q.x - p.x, q.y - p.y);

  const poids = [];
  const distances = [];
  const rayons = [];
  coudes.forEach((p, i) => {
    const vx = p.x - D.x;
    const vy = p.y - D.y;
    poids.push(((vx * dx + vy * dy) / l2).toFixed(4));
    distances.push(((-vx * dy + vy * dx) / l).toFixed(2));
    // Rayon adapté : pas plus de la moitié des segments voisins (évite les boucles
    // sur les petits décrochements)
    const avant = longueur(tous[i], p);
    const apres = longueur(p, tous[i + 2]);
    rayons.push(Math.max(0, Math.min(RAYON_COUDES, avant / 2, apres / 2)).toFixed(2));
  });

  arete.data({
    depart: `${(D.x - cs.x).toFixed(2)}px ${(D.y - cs.y).toFixed(2)}px`,
    arrivee: `${(A.x - ct.x).toFixed(2)}px ${(A.y - ct.y).toFixed(2)}px`,
    poids: poids.join(" ") || "0.5",
    distances: distances.join(" ") || "0",
    rayons: rayons.join(" ") || "0",
    coude: poids.length > 0,
  });
}

// Calcule le placement des notions visibles (relancé quand on filtre un domaine).
let dernierPlacement = 0;
async function placer() {
  const numero = ++dernierPlacement;
  const visibles = cy.nodes(".notion").filter((n) => n.style("display") !== "none");
  const ids = new Set(visibles.map((n) => n.id()));
  const aretes = cy.edges().filter((e) => ids.has(e.data("source")) && ids.has(e.data("target")));

  const resultat = await elk.layout({
    id: "racine",
    layoutOptions: OPTIONS_ELK,
    children: visibles.map((n) => ({ id: n.id(), width: LARGEUR_NOEUD, height: HAUTEUR_NOEUD })),
    edges: aretes.map((e) => ({ id: e.id(), sources: [e.data("source")], targets: [e.data("target")] })),
  });

  // Si un autre placement a été demandé entre-temps (clics rapides), on abandonne celui-ci.
  if (numero !== dernierPlacement) return;

  const centres = {};
  for (const c of resultat.children) {
    centres[c.id] = { x: c.x + c.width / 2, y: c.y + c.height / 2 };
  }

  // Points de jonction : plusieurs flèches peuvent partager le même point.
  const jonctions = new Map(); // "x,y" -> { position, aretes: [ids] }
  for (const e of resultat.edges) {
    for (const p of e.junctionPoints || []) {
      const cle = Math.round(p.x) + "," + Math.round(p.y);
      if (!jonctions.has(cle)) jonctions.set(cle, { position: { x: p.x, y: p.y }, aretes: [] });
      jonctions.get(cle).aretes.push(e.id);
    }
  }

  cy.batch(() => {
    for (const [id, pos] of Object.entries(centres)) cy.getElementById(id).position(pos);
    for (const e of resultat.edges) {
      if (e.sections?.length) appliquerTrace(cy.getElementById(e.id), e.sections[0], centres);
    }
    cy.remove(".jonction");
    cy.add([...jonctions].map(([cle, j]) => ({
      group: "nodes",
      classes: "jonction",
      data: { id: "jonction:" + cle, aretes: j.aretes },
      position: j.position,
    })));
  });
  cy.fit(undefined, 40);

  // Si une notion était sélectionnée, on réapplique sa mise en évidence.
  const choisie = cy.nodes(".choisi");
  if (choisie.nonempty() && choisie.style("display") !== "none") choisir(choisie.id(), false);
}

const placementInitial = placer()
  .catch((err) => {
    const boite = document.getElementById("erreurs");
    boite.hidden = false;
    boite.textContent = "Erreur pendant le placement de la carte : " + err.message;
  })
  .finally(() => conteneur.classList.remove("en-attente"));

// ---------- 4. Légende et filtres par domaine ----------
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
    placer(); // recalcule la carte avec les seules notions visibles
  });
  legende.appendChild(bouton);
}

// ---------- 5. Sélection d'une notion ----------
const panneau = document.getElementById("panneau");

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
  cy.elements().not(amont).not(aval).not(noeud).addClass("attenue");
  amont.edges().addClass("chemin");
  aval.edges().addClass("chemin");
  noeud.addClass("choisi");

  // Jonctions : visibles seulement là où au moins deux flèches du chemin se séparent
  cy.nodes(".jonction").forEach((j) => {
    const surChemin = j.data("aretes").filter((id) => cy.getElementById(id).hasClass("chemin"));
    if (surChemin.length >= 2) j.removeClass("attenue").addClass("chemin");
  });

  // Panneau
  const d = DOMAINES[n.domaine];
  const badge = document.getElementById("p-domaine");
  badge.textContent = d?.nom || n.domaine;
  badge.style.setProperty("--c", d?.couleur);
  document.getElementById("p-titre").textContent = n.titre;
  document.getElementById("p-description").textContent = n.description || "";

  const ulRes = document.getElementById("p-ressources");
  ulRes.innerHTML = "";
  for (const r of n.ressources || []) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = r.url;
    a.textContent = r.titre;
    a.target = "_blank";
    a.rel = "noopener";
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

// ---------- 6. Recherche ----------
const sansAccents = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const recherche = document.getElementById("recherche");

recherche.addEventListener("input", () => {
  const q = sansAccents(recherche.value.trim());
  cy.elements().removeClass("attenue choisi chemin trouve");
  if (!q) return;
  const trouves = cy.nodes(".notion").filter((nd) => sansAccents(nd.data("label")).includes(q));
  cy.elements().not(trouves).addClass("attenue");
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

// ---------- 7. Ouverture directe via l'URL (#id-de-notion) ----------
// ELK calcule le placement en arrière-plan : on attend qu'il ait fini.
placementInitial.then(() => {
  if (location.hash.length > 1) {
    choisir(decodeURIComponent(location.hash.slice(1)), true);
  }
});
