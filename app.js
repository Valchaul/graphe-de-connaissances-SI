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
const RAYON_COUDES = 14; // arrondi des virages des flèches (px)

// Coins arrondis du graphe : mêmes valeurs que --rayon-m et --rayon-l dans style.css.
const RAYON_NOTION = 8;
const RAYON_CADRE = 12;

// Croisements : quand deux flèches se coupent sans se rejoindre, l'une est interrompue
// (une petite coupure dans le trait) pour montrer qu'elles ne sont pas reliées.
const COUPURE_DEMI_LONGUEUR = 4; // demi-longueur de la coupure (px)
const ZOOM_OUVERTURE_MAX = 1.2; // à l'ouverture, ne pas grossir au-delà (petites cartes)
const ZOOM_OUVERTURE_MIN = 0.6; // ni réduire en dessous (le texte deviendrait illisible)

// Regrouper les notions d'un même domaine dans un cadre (îlot) ou non. Le bouton
// « Îlots par domaine » de l'en-tête bascule ce réglage ; le choix est mémorisé dans le
// navigateur (s'il l'autorise). Sans mémoire, les îlots sont affichés.
const CLE_ILOTS = "learn-map:ilots";
function lirePreferenceIlots() {
  try { return localStorage.getItem(CLE_ILOTS) !== "non"; } catch { return true; }
}
function memoriserPreferenceIlots(valeur) {
  try { localStorage.setItem(CLE_ILOTS, valeur ? "oui" : "non"); } catch { /* sans mémoire : tant pis */ }
}
let grouperParDomaine = lirePreferenceIlots();
const MARGES_CADRE = "[top=46,left=22,bottom=22,right=22]"; // la marge du haut accueille le titre

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
              coude: false, interrompue: false, tirets: "6 3" },
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
        "corner-radius": RAYON_NOTION,
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
        // Ordre d'empilement : cadres (0) < flèches (1) < chemin (3) < notions (4)
        "z-index-compare": "manual",
        "z-index": 4,
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
    { selector: "node.choisi", style: { "border-width": 3.5 } },
    { selector: "node.trouve", style: { "border-width": 3.5 } },
    {
      selector: "edge.chemin",
      style: { "line-color": "#5b6168", "target-arrow-color": "#5b6168", width: 2, "z-index": 3 },
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

// Rayon d'arrondi de chaque virage (un par point intermédiaire du tracé) : au plus
// RAYON_COUDES, et jamais plus de la moitié des segments voisins (évite les boucles
// sur les petits décrochements).
function rayonsDesCoudes(points) {
  const longueur = (p, q) => Math.hypot(q.x - p.x, q.y - p.y);
  const rayons = [];
  for (let i = 1; i < points.length - 1; i++) {
    const avant = longueur(points[i - 1], points[i]);
    const apres = longueur(points[i], points[i + 1]);
    rayons.push(Math.max(0, Math.min(RAYON_COUDES, avant / 2, apres / 2)));
  }
  return rayons;
}

// Convertit le tracé ELK (points absolus) au format Cytoscape :
// chaque coude = (position le long du segment départ→arrivée, écart perpendiculaire).
// `trace` = { points: [départ, coudes…, arrivée], coupures: [{ debut, fin }] }.
function appliquerTrace(arete, trace, centres) {
  const cs = centres[arete.data("source")];
  const ct = centres[arete.data("target")];
  const D = trace.points[0];
  const A = trace.points[trace.points.length - 1];
  const dx = A.x - D.x;
  const dy = A.y - D.y;
  const l2 = dx * dx + dy * dy || 1;
  const l = Math.sqrt(l2);

  const poids = [];
  const distances = [];
  for (const p of trace.points.slice(1, -1)) {
    const vx = p.x - D.x;
    const vy = p.y - D.y;
    poids.push(((vx * dx + vy * dy) / l2).toFixed(4));
    distances.push(((-vx * dy + vy * dx) / l).toFixed(2));
  }
  const rayons = rayonsDesCoudes(trace.points).map((r) => r.toFixed(2));

  // Coupures : motif de tirets le long du tracé (trait, coupure, trait, coupure, …, trait)
  const coupures = trace.coupures || [];
  const motif = [];
  let curseur = 0;
  for (const c of coupures) {
    motif.push(c.debut - curseur, c.fin - c.debut);
    curseur = c.fin;
  }
  motif.push(100000, 0);

  arete.data({
    depart: `${(D.x - cs.x).toFixed(2)}px ${(D.y - cs.y).toFixed(2)}px`,
    arrivee: `${(A.x - ct.x).toFixed(2)}px ${(A.y - ct.y).toFixed(2)}px`,
    poids: poids.join(" ") || "0.5",
    distances: distances.join(" ") || "0",
    rayons: rayons.join(" ") || "0",
    coude: poids.length > 0,
    interrompue: coupures.length > 0,
    tirets: motif.map((v) => v.toFixed(2)).join(" "),
  });
}

// Repère les croisements entre flèches indépendantes et y ajoute une coupure : la flèche
// horizontale est interrompue de part et d'autre de la verticale (ou, si son segment est
// trop court, c'est la verticale qui l'est). Les flèches qui partagent leur départ ou leur
// arrivée forment un tronc commun : ce sont des jonctions, pas des croisements.
// Remplit `trace.coupures` (positions le long du tracé dessiné) ; renvoie les comptes.
function ajouterCoupures(traces) {
  const EPS = 1;
  const K = 2 - Math.PI / 2; // un arc de cercle est plus court de K × rayon que l'angle droit
  const MARGE_POINTE = 16;   // la pointe de la flèche occupe la fin du dernier segment
  const segments = [];
  traces.forEach((t, ti) => {
    t.coupures = [];
    const rayons = rayonsDesCoudes(t.points);
    let longueurCumulee = 0;
    let arcsCumules = 0; // somme des rayons des virages déjà passés
    for (let i = 0; i < t.points.length - 1; i++) {
      const p = t.points[i];
      const q = t.points[i + 1];
      if (i >= 1) arcsCumules += rayons[i - 1];
      const longueur = Math.hypot(q.x - p.x, q.y - p.y);
      const horizontal = Math.abs(p.y - q.y) < 0.5 && Math.abs(p.x - q.x) > 0.5;
      const vertical = Math.abs(p.x - q.x) < 0.5 && Math.abs(p.y - q.y) > 0.5;
      if (horizontal || vertical) {
        segments.push({
          ti, h: horizontal,
          c: horizontal ? p.y : p.x,                                   // coordonnée fixe
          a: horizontal ? Math.min(p.x, q.x) : Math.min(p.y, q.y),     // bornes triées
          b: horizontal ? Math.max(p.x, q.x) : Math.max(p.y, q.y),
          origine: horizontal ? p.x : p.y,                             // où le segment commence
          sens: (horizontal ? q.x > p.x : q.y > p.y) ? 1 : -1,
          longueur,
          debutDroit: i >= 1 ? rayons[i - 1] : 3,                      // partie rectiligne
          finDroite: i + 1 <= t.points.length - 2 ? rayons[i] : MARGE_POINTE,
          position: longueurCumulee - K * arcsCumules,                 // abscisse sur le tracé dessiné
        });
      }
      longueurCumulee += longueur;
    }
  });
  const horizontaux = segments.filter((s) => s.h);
  const verticaux = segments.filter((s) => !s.h);

  // Croisements : un segment horizontal d'une flèche coupe un segment vertical d'une autre
  const croisements = [];
  for (const h of horizontaux) {
    const A = traces[h.ti];
    for (const v of verticaux) {
      if (v.ti === h.ti) continue;
      const B = traces[v.ti];
      if (A.source === B.source || A.cible === B.cible) continue; // tronc commun : jonction
      if (!(v.c > h.a + EPS && v.c < h.b - EPS && h.c > v.a + EPS && h.c < v.b - EPS)) continue;
      const surJonction = [...A.jonctions, ...B.jonctions].some((j) => Math.hypot(j.x - v.c, j.y - h.c) < 4);
      if (!surJonction) croisements.push({ h, v });
    }
  }

  // Pose les coupures sur les segments horizontaux (ou verticaux). Plusieurs croisements
  // très proches partagent une seule coupure plus longue. Renvoie les croisements qui n'ont
  // pas pu être traités faute de place sur la partie rectiligne du segment.
  function poser(liste, surHorizontal) {
    const parSegment = new Map();
    for (const c of liste) {
      const seg = surHorizontal ? c.h : c.v;
      if (!parSegment.has(seg)) parSegment.set(seg, []);
      parSegment.get(seg).push(c);
    }
    const restes = [];
    for (const [seg, cs] of parSegment) {
      const distance = (c) => ((surHorizontal ? c.v.c : c.h.c) - seg.origine) * seg.sens;
      cs.sort((m, n) => distance(m) - distance(n));
      const groupes = [];
      for (const c of cs) {
        const dernier = groupes[groupes.length - 1];
        if (dernier && distance(c) - distance(dernier[dernier.length - 1]) < 2 * COUPURE_DEMI_LONGUEUR + 6) dernier.push(c);
        else groupes.push([c]);
      }
      for (const g of groupes) {
        const debut = distance(g[0]) - COUPURE_DEMI_LONGUEUR;
        const fin = distance(g[g.length - 1]) + COUPURE_DEMI_LONGUEUR;
        if (debut < seg.debutDroit + 1 || fin > seg.longueur - seg.finDroite - 1) { restes.push(...g); continue; }
        traces[seg.ti].coupures.push({ debut: seg.position + debut, fin: seg.position + fin });
      }
    }
    return restes;
  }

  // D'abord sur la flèche horizontale ; si elle est trop courte, sur la verticale.
  const restes = poser(poser(croisements, true), false);
  traces.forEach((t) => t.coupures.sort((m, n) => m.debut - n.debut));
  return { coupes: croisements.length - restes.length, ignores: restes.length };
}

// Vue d'ouverture : la carte occupe toute la hauteur de l'écran et commence par
// sa gauche (les bases). Comme elle est bien plus large que haute, on la parcourt
// ensuite vers la droite. Si elle tient en entier à ce zoom, elle est centrée.
function cadrerSurLaHauteur() {
  const marge = 40;
  const boite = cy.elements().boundingBox();
  if (boite.w === 0 || boite.h === 0) return;
  // Sur un petit écran, on garde un zoom lisible quitte à déborder aussi en hauteur.
  const zoomHauteur = (cy.height() - 2 * marge) / boite.h;
  const zoom = Math.min(Math.max(zoomHauteur, ZOOM_OUVERTURE_MIN), ZOOM_OUVERTURE_MAX, cy.maxZoom());
  const tientEnLargeur = boite.w * zoom <= cy.width() - 2 * marge;
  cy.viewport({
    zoom,
    pan: {
      x: tientEnLargeur ? (cy.width() - boite.w * zoom) / 2 - boite.x1 * zoom : marge - boite.x1 * zoom,
      y: (cy.height() - boite.h * zoom) / 2 - boite.y1 * zoom,
    },
  });
}

// Calcule le placement des notions visibles (relancé quand on filtre un domaine).
let dernierPlacement = 0;
async function placer() {
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
  cadrerSurLaHauteur();

  // Si une notion était sélectionnée, on réapplique sa mise en évidence.
  const choisie = cy.nodes(".choisi");
  if (choisie.nonempty() && choisie.style("display") !== "none") choisir(choisie.id(), false);
}

function afficherErreurPlacement(err) {
  const boite = document.getElementById("erreurs");
  boite.hidden = false;
  boite.textContent = "Erreur pendant le placement de la carte : " + err.message;
}

const placementInitial = placer()
  .catch(afficherErreurPlacement)
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
  cy.elements().not(amont).not(aval).not(noeud).not(".cadre").addClass("attenue");
  amont.edges().addClass("chemin");
  aval.edges().addClass("chemin");
  noeud.addClass("choisi");

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

// ---------- 7. Ouverture directe via l'URL (#id-de-notion) ----------
// ELK calcule le placement en arrière-plan : on attend qu'il ait fini.
placementInitial.then(() => {
  if (location.hash.length > 1) {
    choisir(decodeURIComponent(location.hash.slice(1)), true);
  }
});
