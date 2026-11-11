// =====================================================================
//  Chemin d'apprentissage
//  Le bouton « Voir le chemin » (section Prérequis de la fiche) liste, dans l'ordre,
//  toutes les notions à apprendre avant la notion affichée (prérequis directs et
//  indirects). Le même bouton, devenu « Masquer le chemin », referme la liste.
// =====================================================================

// Chemin actuellement affiché dans la fiche, ou null :
// { but: id de la notion visée, etapes: [ids dans l'ordre d'apprentissage] }
let parcours = null;
let notionAffichee = null; // notion dont la fiche est ouverte

// Toutes les notions à connaître avant `id`, dans un ordre d'apprentissage valide :
// un prérequis passe toujours avant ce qui en dépend. Quand plusieurs notions sont
// possibles, on prend d'abord le niveau le plus bas, puis l'ordre de data/notions.js.
function cheminVers(id) {
  const requis = new Set();
  const pile = [...(parId[id].prerequis || [])];
  while (pile.length) {
    const p = pile.pop();
    if (requis.has(p)) continue;
    requis.add(p);
    pile.push(...(parId[p].prerequis || []));
  }

  const rangNiveau = Object.fromEntries(Object.keys(NIVEAUX).map((cle, i) => [cle, i]));
  const position = Object.fromEntries(NOTIONS.map((n, i) => [n.id, i]));
  const avant = (a, b) => rangNiveau[parId[a].niveau] - rangNiveau[parId[b].niveau] || position[a] - position[b];

  // Nombre de prérequis qu'il reste à apprendre avant de pouvoir aborder chaque notion
  const restants = new Map([...requis].map((p) => [p, (parId[p].prerequis || []).filter((q) => requis.has(q)).length]));
  const disponibles = [...requis].filter((p) => restants.get(p) === 0);
  const ordre = [];
  while (disponibles.length) {
    disponibles.sort(avant);
    const p = disponibles.shift();
    ordre.push(p);
    for (const suite of requis) {
      if (!(parId[suite].prerequis || []).includes(p)) continue;
      restants.set(suite, restants.get(suite) - 1);
      if (restants.get(suite) === 0) disponibles.push(suite);
    }
  }
  return ordre;
}

// Met à jour la zone « chemin » de la fiche. Appelée à chaque affichage d'une fiche.
// Le chemin reste affiché quand on passe d'une étape à une autre ; il disparaît dès
// qu'on ouvre une notion qui n'en fait pas partie.
function majChemin(id) {
  notionAffichee = id;
  if (parcours && parcours.but !== id && !parcours.etapes.includes(id)) parcours = null;

  const zone = document.getElementById("p-chemin-zone");
  const bouton = document.getElementById("p-chemin-bouton");
  const section = document.getElementById("p-chemin");

  const etapes = parcours ? parcours.etapes : cheminVers(id);
  if (!parcours && etapes.length === 0) { zone.hidden = true; return; } // notion de départ : rien à apprendre avant
  zone.hidden = false;

  // Un seul bouton : « Voir le chemin » l'affiche, « Masquer le chemin » le referme
  bouton.setAttribute("aria-expanded", String(parcours !== null));
  section.hidden = parcours === null;
  if (parcours) {
    bouton.replaceChildren("Masquer le chemin");
    remplirChemin();
  } else {
    const compte = document.createElement("span");
    compte.className = "compte";
    compte.textContent = `${etapes.length} notion${etapes.length > 1 ? "s" : ""}`;
    bouton.replaceChildren("Voir le chemin", compte);
  }
}

function remplirChemin() {
  const but = parId[parcours.but];
  const etapes = parcours.etapes;
  const niveauDepart = parId[etapes[0]].niveau;
  document.getElementById("p-chemin-resume").textContent =
    `${etapes.length} notion${etapes.length > 1 ? "s" : ""} à apprendre avant « ${but.titre} », ` +
    (niveauDepart === but.niveau ? `niveau ${but.niveau}.` : `de ${niveauDepart} à ${but.niveau}.`);

  const liste = document.getElementById("p-chemin-liste");
  liste.innerHTML = "";
  const tous = [...etapes, parcours.but];
  tous.forEach((id, i) => {
    const n = parId[id];
    const li = document.createElement("li");
    li.style.setProperty("--c", DOMAINES[n.domaine]?.couleur);
    if (id === notionAffichee) {
      li.classList.add("courant");
      li.setAttribute("aria-current", "step");
    }
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.textContent = n.titre;
    bouton.addEventListener("click", () => choisir(id, true));
    const niveau = document.createElement("span");
    niveau.className = "niveau-liste";
    niveau.textContent = n.niveau;
    li.append(bouton, niveau);
    if (i === tous.length - 1) {
      li.classList.add("but");
      const etiquette = document.createElement("span");
      etiquette.className = "etiquette-but";
      etiquette.textContent = "objectif";
      li.appendChild(etiquette);
    }
    liste.appendChild(li);
  });
}

function reinitialiserChemin() {
  parcours = null;
  notionAffichee = null;
}

document.getElementById("p-chemin-bouton").addEventListener("click", () => {
  if (parcours) { // le chemin est ouvert : on le masque
    parcours = null;
    majChemin(notionAffichee);
    return;
  }
  parcours = { but: notionAffichee, etapes: cheminVers(notionAffichee) };
  majChemin(notionAffichee);
  document.getElementById("p-chemin").scrollIntoView({ block: "nearest", behavior: "smooth" });
});
