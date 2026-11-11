// =====================================================================
//  Placement des notions et des flèches par ELK
//  Réglages d'ELK, calcul de la carte (relancé à chaque filtre ou changement d'îlots)
//  et cadrage de la vue à l'ouverture.
// =====================================================================

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

// Vue d'ouverture : la carte occupe toute la hauteur de l'écran et commence par
// sa gauche (les bases). Comme elle est bien plus large que haute, on la parcourt
// ensuite vers la droite. Si elle tient en entier à ce zoom, elle est centrée.
function cadrerSurLaHauteur() {
  const marge = 40;
  const boite = cy.elements().boundingBox();
  if (boite.w === 0 || boite.h === 0) return;
  // Sur un petit écran, on garde un zoom lisible quitte à déborder aussi en hauteur.
  const haut = document.getElementById("legende").offsetHeight; // la légende recouvre le haut de la carte
  const zoomHauteur = (cy.height() - haut - 2 * marge) / boite.h;
  const zoom = Math.min(Math.max(zoomHauteur, ZOOM_OUVERTURE_MIN), ZOOM_OUVERTURE_MAX, cy.maxZoom());
  const tientEnLargeur = boite.w * zoom <= cy.width() - 2 * marge;
  cy.viewport({
    zoom,
    pan: {
      x: tientEnLargeur ? (cy.width() - boite.w * zoom) / 2 - boite.x1 * zoom : marge - boite.x1 * zoom,
      y: haut + (cy.height() - haut - boite.h * zoom) / 2 - boite.y1 * zoom,
    },
  });
}

// Calcule le placement des notions visibles (relancé quand on filtre un domaine).
// cadrer = false : la vue (zoom et position) reste telle que la personne l'a laissée.
let dernierPlacement = 0;
let vueCadree = false; // la vue n'a pas encore été cadrée (premier placement pas terminé)
async function placer(cadrer = true) {
  const numero = ++dernierPlacement;
  const visibles = cy.nodes(".notion").filter((n) => n.style("display") !== "none");
  const ids = new Set(visibles.map((n) => n.id()));
  const aretes = cy.edges().filter((e) => ids.has(e.data("source")) && ids.has(e.data("target")));

  const versElk = (n) => ({ id: n.id(), width: LARGEUR_NOEUD, height: HAUTEUR_NOEUD });
  const aretesElk = aretes.map((e) => ({ id: e.id(), sources: [e.data("source")], targets: [e.data("target")] }));

  let graphe;
  if (grouperParDomaine) {
    // Chaque domaine devient un groupe ELK contenant ses notions.
    const options = { ...OPTIONS_ELK };
    delete options["elk.layered.considerModelOrder.strategy"]; // fait planter ELK 0.9.3 avec des groupes
    graphe = {
      id: "racine",
      layoutOptions: { ...options, "elk.hierarchyHandling": "INCLUDE_CHILDREN" },
      children: Object.keys(DOMAINES)
        .map((cle) => ({
          id: "cadre:" + cle,
          layoutOptions: { ...options, "elk.padding": MARGES_CADRE },
          children: visibles.filter((n) => n.data("domaine") === cle).map(versElk),
        }))
        .filter((groupe) => groupe.children.length > 0),
      edges: aretesElk,
    };
  } else {
    graphe = { id: "racine", layoutOptions: OPTIONS_ELK, children: visibles.map(versElk), edges: aretesElk };
  }

  const resultat = await elk.layout(graphe);

  // Si un autre placement a été demandé entre-temps (clics rapides), on abandonne celui-ci.
  if (numero !== dernierPlacement) return;

  // ELK donne les positions relativement au groupe parent : on les ramène à la carte entière.
  const centres = {};
  const decalageDomaine = {}; // domaine -> position du coin de son cadre
  const cadres = [];
  for (const c of resultat.children) {
    if (c.children) {
      const cle = c.id.slice("cadre:".length);
      decalageDomaine[cle] = { x: c.x, y: c.y };
      cadres.push({ cle, x: c.x, y: c.y, largeur: c.width, hauteur: c.height });
      for (const n of c.children) {
        centres[n.id] = { x: c.x + n.x + n.width / 2, y: c.y + n.y + n.height / 2 };
      }
    } else {
      centres[c.id] = { x: c.x + c.width / 2, y: c.y + c.height / 2 };
    }
  }

  // Le tracé d'une flèche interne à un domaine est relatif au cadre de ce domaine ;
  // celui d'une flèche entre deux domaines est déjà relatif à la carte entière.
  const domaineDe = (id) => parId[id].domaine;
  function decalageArete(e) {
    const ds = domaineDe(e.sources[0]);
    if (grouperParDomaine && ds === domaineDe(e.targets[0])) return decalageDomaine[ds];
    return { x: 0, y: 0 };
  }
  const decaler = (p, d) => ({ x: p.x + d.x, y: p.y + d.y });

  // Tracé de chaque flèche en coordonnées de la carte : départ, coudes, arrivée.
  const traces = [];
  for (const e of resultat.edges) {
    if (!e.sections?.length) continue;
    const d = decalageArete(e);
    const s = e.sections[0];
    traces.push({
      id: e.id,
      source: e.sources[0],
      cible: e.targets[0],
      points: [decaler(s.startPoint, d), ...(s.bendPoints || []).map((p) => decaler(p, d)), decaler(s.endPoint, d)],
      jonctions: (e.junctionPoints || []).map((p) => decaler(p, d)),
    });
  }
  ajouterCoupures(traces);

  cy.batch(() => {
    for (const [id, pos] of Object.entries(centres)) cy.getElementById(id).position(pos);
    for (const t of traces) appliquerTrace(cy.getElementById(t.id), t, centres);
    cy.remove(".cadre");
    cy.add(cadres.map((c) => ({
      group: "nodes",
      classes: "cadre",
      data: {
        id: "cadre:" + c.cle,
        label: DOMAINES[c.cle].nom,
        couleur: DOMAINES[c.cle].couleur,
        largeur: c.largeur,
        hauteur: c.hauteur,
      },
      position: { x: c.x + c.largeur / 2, y: c.y + c.hauteur / 2 },
    })));
  });
  // Un placement demandé pendant le tout premier calcul le remplace : il doit alors cadrer la vue à sa place.
  if (cadrer || !vueCadree) cadrerSurLaHauteur();
  vueCadree = true;

  // Si une notion était sélectionnée, on réapplique sa mise en évidence.
  const choisie = cy.nodes(".choisi");
  if (choisie.nonempty() && choisie.style("display") !== "none") choisir(choisie.id(), false);
}

function afficherErreurPlacement(err) {
  const boite = document.getElementById("erreurs");
  boite.hidden = false;
  boite.textContent = "Erreur pendant le placement de la carte : " + err.message;
}
