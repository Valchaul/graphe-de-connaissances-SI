// =====================================================================
//  Création du graphe (Cytoscape) : éléments et styles
//  Les positions et les tracés des flèches sont calculés ensuite (placement.js).
// =====================================================================

const elements = [];
for (const n of NOTIONS) {
  elements.push({
    classes: "notion",
    // label = titre (sert à la recherche) ; etiquette = ce qui s'affiche (titre ; les statuts sont dessinés par des pastilles (voir progression.js))
    data: { id: n.id, label: n.titre, etiquette: n.titre, couleur: DOMAINES[n.domaine]?.couleur || "#888", domaine: n.domaine },
  });
}
for (const n of NOTIONS) {
  for (const p of n.prerequis || []) {
    if (!parId[p]) continue;
    elements.push({
      // depart / arrivee / poids / distances : tracé de la flèche, rempli par ELK (voir placement.js)
      data: { id: p + "->" + n.id, source: p, target: n.id,
              depart: "0px 0px", arrivee: "0px 0px", poids: "0.5", distances: "0", rayons: "0",
              coude: false, interrompue: false, tirets: "6 3" },
    });
  }
}

const conteneur = document.getElementById("graphe");
conteneur.classList.add("en-attente"); // masqué tant que le placement n'est pas calculé

const cy = cytoscape({
  container: conteneur,
  elements,
  layout: { name: "preset" }, // les positions sont fournies par ELK (voir placement.js)
  autoungrabify: true,        // notions non déplaçables : les flèches sont calculées pour leur place
  minZoom: 0.05,
  maxZoom: 2.5,
  style: [
    {
      selector: "node.notion",
      style: {
        shape: "round-rectangle",
        "corner-radius": RAYON_NOTION,
        width: LARGEUR_NOEUD,
        height: HAUTEUR_NOEUD,
        "background-color": "data(couleur)",
        "background-opacity": 0.07,
        "border-width": 1.5,
        "border-color": "data(couleur)",
        "border-opacity": 0.45, // contour adouci : il contraste moins avec le fond (notions sans statut)
        label: "data(etiquette)",
        "font-family": "system-ui, sans-serif",
        "font-size": 12,
        color: "#1f2328",
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": LARGEUR_NOEUD - 2 * MARGE_TEXTE, // largeur de la notion moins la marge de chaque côté
        "transition-property": "opacity, border-width",
        "transition-duration": "150ms",
        // Ordre d'empilement : cadres (0) < flèches (1) < chemin (3) < notions (4)
        "z-index-compare": "manual",
        "z-index": 4,
      },
    },
    {
      // Notion acquise (cochée par la personne qui visite le site, voir progression.js)
      selector: "node.acquise",
      style: {
        "background-color": "#2f7d4f",
        "background-opacity": 0.16,
        "border-opacity": 1,
        color: "#1d5a37",
      },
    },
    {
      // Notion en cours de travail : teinte bleue
      selector: "node.encours",
      style: { "background-color": "#1d4ed8", "background-opacity": 0.12, "border-color": "#1d4ed8", "border-opacity": 1, color: "#1e3a8a" },
    },
    {
      // Notion à réviser : contour orange épais (se combine avec acquise)
      selector: "node.arevoir",
      style: { "border-color": "#c2610c", "border-width": 2.5, "border-opacity": 1 },
    },
    {
      // Pastilles accrochées aux coins haut de la notion, en une seule image SVG large fabriquée par
      // progression.js : à gauche « prête à apprendre » (triangle bleu), à droite le ou les statuts
      // (coche verte, points bleus, flèche orange). Elles débordent un peu du cadre de la notion.
      selector: "node[badge]",
      style: {
        "background-image": "data(badge)",
        "background-fit": "none",
        "background-clip": "none",
        "background-image-containment": "over",
        "background-width": (e) => e.data("badgeL"),
        "background-height": 18,
        "background-position-x": "0%",
        "background-position-y": "0%",
        "background-offset-x": -7,
        "background-offset-y": -8,
        "bounds-expansion": 12,
      },
    },
    {
      // Cadre d'un domaine (fond très léger, titre en haut)
      selector: "node.cadre",
      style: {
        shape: "round-rectangle",
        width: "data(largeur)",
        height: "data(hauteur)",
        "corner-radius": RAYON_CADRE,
        "background-color": "data(couleur)",
        "background-opacity": 0.035,
        "border-width": 1,
        "border-color": "data(couleur)",
        "border-opacity": 0.35,
        label: "data(label)",
        "font-family": "system-ui, sans-serif",
        "font-size": 13,
        "font-weight": 600,
        "text-transform": "uppercase",
        color: "data(couleur)",
        "text-valign": "top",
        "text-halign": "center",
        "text-margin-y": 30, // ramène le titre à l'intérieur du cadre
        events: "no",
        "z-index-compare": "manual",
        "z-index": 0,
      },
    },
    {
      selector: "edge",
      style: {
        "z-index-compare": "manual",
        "z-index": 1,
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
      // Flèches coupées à un croisement : motif de tirets calculé le long du tracé
      selector: "edge[?interrompue]",
      style: {
        "line-style": "dashed",
        "line-dash-pattern": (e) => e.data("tirets"),
      },
    },
    { selector: ".attenue", style: { opacity: 0.15 } },
    { selector: ".survol-attenue", style: { opacity: 0.15 } }, // mise en évidence au survol (survol.js)
    { selector: "node.choisi", style: { "border-width": 3.5, "border-opacity": 1 } },
    { selector: "node.trouve", style: { "border-width": 3.5, "border-opacity": 1 } },
    {
      selector: "edge.chemin, edge.survol-chemin",
      style: { "line-color": "#5b6168", "target-arrow-color": "#5b6168", width: 2, "z-index": 3 },
    },
  ],
});
