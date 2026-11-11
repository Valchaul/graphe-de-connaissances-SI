// =====================================================================
//  Tracé des flèches
//  Conversion du tracé calculé par ELK au format Cytoscape, arrondi des virages,
//  et coupures aux croisements entre flèches indépendantes.
// =====================================================================

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
