// =====================================================================
//  Suivi de progression
//  Chacun coche les notions qu'il a acquises. Le choix est mémorisé dans le navigateur
//  (localStorage) : pas de compte, rien n'est envoyé nulle part. Contrepartie : la
//  progression reste propre à ce navigateur et à cet appareil.
// =====================================================================

const CLE_PROGRESSION = "learn-map:acquises";
const CLE_EN_COURS = "learn-map:en-cours";
const CLE_A_REVISER = "learn-map:a-reviser";
let stockageDisponible = true; // devient faux si le navigateur refuse d'écrire (navigation privée…)
let acquises = chargerProgression(); // ensemble des identifiants de notions cochées
let enCours = chargerEnsemble(CLE_EN_COURS); // notions en cours de travail (jamais en même temps qu'acquises)
let aReviser = chargerEnsemble(CLE_A_REVISER); // notions à réviser (peut se combiner avec acquise)
let notionDeLaFiche = null; // notion dont la fiche est ouverte

// ---------- Lecture et écriture ----------
function chargerEnsemble(cle) {
  try {
    const brut = localStorage.getItem(cle);
    const ids = brut ? JSON.parse(brut) : [];
    // On ignore les notions qui n'existent plus (le contenu évolue)
    return new Set(Array.isArray(ids) ? ids.filter((id) => parId[id]) : []);
  } catch {
    stockageDisponible = false;
    return new Set();
  }
}

function chargerProgression() {
  return chargerEnsemble(CLE_PROGRESSION);
}

function sauverProgression() {
  try {
    localStorage.setItem(CLE_PROGRESSION, JSON.stringify([...acquises]));
    localStorage.setItem(CLE_EN_COURS, JSON.stringify([...enCours]));
    localStorage.setItem(CLE_A_REVISER, JSON.stringify([...aReviser]));
    stockageDisponible = true;
  } catch {
    stockageDisponible = false;
  }
}

// ---------- Modifications ----------
function definirAcquises(ids, valeur) {
  for (const id of ids) {
    if (valeur) {
      acquises.add(id);
      enCours.delete(id); // une notion acquise n'est plus « en cours »
    } else acquises.delete(id);
  }
  sauverProgression();
  rafraichirProgression();
}

function basculerAcquise(id) {
  definirAcquises([id], !acquises.has(id));
}

// « En cours » et « À réviser » : un statut par notion, qu'on coche ou décoche
function basculerStatut(id, ensemble) {
  if (ensemble.has(id)) ensemble.delete(id);
  else {
    ensemble.add(id);
    if (ensemble === enCours) acquises.delete(id); // en cours et acquise s'excluent
  }
  sauverProgression();
  rafraichirProgression();
}

function viderProgression() {
  acquises.clear();
  enCours.clear();
  aReviser.clear();
  sauverProgression();
  rafraichirProgression();
}

// ---------- Affichage ----------
// Une notion est « prête à apprendre » quand tous ses prérequis sont acquis et qu'elle ne l'est pas
// encore (ni en cours de travail).
function estPrete(id) {
  return !acquises.has(id) && !enCours.has(id) && (parId[id].prerequis || []).every((p) => acquises.has(p));
}

// Image SVG des pastilles, pour les coins des notions de la carte. Une seule image aussi large que la
// notion (plus le débord) : « prête à apprendre » est dessinée à gauche, les statuts à droite.
const LARGEUR_PASTILLES = LARGEUR_NOEUD + 14;
const DESSIN_PASTILLE = {
  prete: { couleur: "#186ca8", trace: '<path d="M7.3 5.4v7.2L13 9z" fill="#fff"/>' },
  acquise: { couleur: "#2f7d4f", trace: '<path d="M5.4 9.3l2.5 2.6 4.8-5.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' },
  encours: { couleur: "#1d4ed8", trace: '<circle cx="5.4" cy="9" r="1.4" fill="#fff"/><circle cx="9" cy="9" r="1.4" fill="#fff"/><circle cx="12.6" cy="9" r="1.4" fill="#fff"/>' },
  arevoir: { couleur: "#c2610c", trace: '<path d="M12.3 7.6A3.7 3.7 0 1 0 12.7 10.4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M13.3 4.9v3.4H9.9z" fill="#fff"/>' },
};
const imagesPastilles = new Map(); // mémorise les images déjà fabriquées
function imagePastilles(statuts, prete) {
  const cle = (prete ? "prete|" : "|") + statuts.join("+");
  if (!imagesPastilles.has(cle)) {
    const pastille = (nom, x) =>
      `<g transform="translate(${x} 0)"><circle cx="9" cy="9" r="8.2" fill="${DESSIN_PASTILLE[nom].couleur}" stroke="#fff" stroke-width="1.6"/>${DESSIN_PASTILLE[nom].trace}</g>`;
    let dessin = prete ? pastille("prete", 0) : "";
    const debutStatuts = LARGEUR_PASTILLES - (statuts.length * 20 - 2);
    statuts.forEach((s, i) => { dessin += pastille(s, debutStatuts + i * 20); });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR_PASTILLES}" height="18" viewBox="0 0 ${LARGEUR_PASTILLES} 18">${dessin}</svg>`;
    imagesPastilles.set(cle, "data:image/svg+xml;utf8," + encodeURIComponent(svg));
  }
  return imagesPastilles.get(cle);
}

// Compteur de l'en-tête. Les domaines masqués (légende) ne comptent ni parmi les notions
// totales ni parmi les acquises : on mesure la progression sur ce qui est affiché.
function majCompteur() {
  const visibles = NOTIONS.filter(afficheeParDomaineEtNiveau);
  const total = visibles.length;
  const nombre = visibles.filter((n) => acquises.has(n.id)).length;
  document.getElementById("prog-texte").textContent = `${nombre} / ${total} acquises`;
  document.getElementById("prog-remplissage").style.width = (total ? (100 * nombre) / total : 0) + "%";
  document.getElementById("progression").setAttribute("aria-label",
    `Progression : ${nombre} notions acquises sur ${total}. Activer pour effacer.`);
}

// Met à jour tout ce qui montre la progression : carte, compteur, fiche et chemin.
function rafraichirProgression() {
  cy.batch(() => {
    cy.nodes(".notion").forEach((noeud) => {
      const id = noeud.id();
      noeud.toggleClass("acquise", acquises.has(id));
      noeud.toggleClass("encours", enCours.has(id));
      noeud.toggleClass("arevoir", aReviser.has(id));
      // Pastilles dans les coins de la notion : « prête à apprendre » à gauche, statut(s) à droite
      const prete = estPrete(id);
      const statuts = [acquises.has(id) && "acquise", enCours.has(id) && "encours", aReviser.has(id) && "arevoir"].filter(Boolean);
      if (prete || statuts.length) noeud.data({ badge: imagePastilles(statuts, prete), badgeL: LARGEUR_PASTILLES });
      else noeud.removeData("badge badgeL");
    });
  });

  majCompteur();
  if (new Set([...acquises, ...enCours, ...aReviser]).size === 0) fermerConfirmation();
  document.getElementById("prog-alerte").hidden = stockageDisponible;

  if (statutsMasques.size) appliquerFiltres(); // le filtre par statut suit les changements de statut
  if (notionDeLaFiche) {
    majFicheProgression(notionDeLaFiche);
    majChemin(notionDeLaFiche); // redessine la liste du chemin avec les cases cochées
  }
}

// Boutons de statut de la fiche : Acquise, En cours, À réviser
function majFicheProgression(id) {
  notionDeLaFiche = id;
  const acquise = acquises.has(id);
  document.getElementById("p-acquise").setAttribute("aria-pressed", String(acquise));
  document.getElementById("p-encours").setAttribute("aria-pressed", String(enCours.has(id)));
  document.getElementById("p-revoir").setAttribute("aria-pressed", String(aReviser.has(id)));

  // Cocher une notion avancée sans avoir coché ses prérequis : on propose de les cocher aussi
  const manquants = acquise ? cheminVers(id).filter((p) => !acquises.has(p)) : [];
  const aide = document.getElementById("p-acquise-aide");
  aide.hidden = manquants.length === 0;
  if (manquants.length) {
    document.getElementById("p-acquise-aide-texte").textContent =
      `${manquants.length} prérequis ne ${manquants.length > 1 ? "sont" : "est"} pas coché${manquants.length > 1 ? "s" : ""}.`;
    // Noms des prérequis manquants, dans l'ordre d'apprentissage
    const liste = document.getElementById("p-acquise-aide-liste");
    liste.innerHTML = "";
    for (const m of manquants) {
      const li = document.createElement("li");
      li.textContent = parId[m].titre;
      liste.appendChild(li);
    }
  }
}

// ---------- Boutons ----------
document.getElementById("p-acquise").addEventListener("click", () => {
  if (notionDeLaFiche) basculerAcquise(notionDeLaFiche);
});

document.getElementById("p-encours").addEventListener("click", () => {
  if (notionDeLaFiche) basculerStatut(notionDeLaFiche, enCours);
});
document.getElementById("p-revoir").addEventListener("click", () => {
  if (notionDeLaFiche) basculerStatut(notionDeLaFiche, aReviser);
});

document.getElementById("p-acquise-aide-bouton").addEventListener("click", () => {
  if (!notionDeLaFiche) return;
  definirAcquises(cheminVers(notionDeLaFiche), true);
});

// Cliquer sur la barre de progression ouvre une notification qui demande confirmation
const boutonProgression = document.getElementById("progression");
const confirmation = document.getElementById("prog-confirmation");

function fermerConfirmation() {
  confirmation.hidden = true;
  boutonProgression.setAttribute("aria-expanded", "false");
}

boutonProgression.addEventListener("click", () => {
  if (!confirmation.hidden) return fermerConfirmation();
  const n = new Set([...acquises, ...enCours, ...aReviser]).size;
  if (n === 0) return; // rien à effacer
  document.getElementById("prog-question").textContent =
    `Effacer toute la progression ? Les ${n} notion${n > 1 ? "s" : ""} suivie${n > 1 ? "s" : ""} (acquises, en cours ou à réviser) seront remise${n > 1 ? "s" : ""} à zéro.`;
  confirmation.hidden = false;
  boutonProgression.setAttribute("aria-expanded", "true");
  document.getElementById("prog-annuler").focus();
});
document.getElementById("prog-annuler").addEventListener("click", () => {
  fermerConfirmation();
  boutonProgression.focus();
});
document.getElementById("prog-confirmer").addEventListener("click", () => {
  viderProgression();
  fermerConfirmation();
  boutonProgression.focus();
});
// Un clic ailleurs ou Échap referme la notification
document.addEventListener("click", (e) => {
  if (!confirmation.hidden && !e.target.closest(".progression-zone")) fermerConfirmation();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !confirmation.hidden) {
    fermerConfirmation();
    boutonProgression.focus();
    e.stopImmediatePropagation(); // Échap ne ferme pas aussi la fiche
  }
}, true);

// Un autre onglet a modifié la progression : on se met à jour
window.addEventListener("storage", (e) => {
  if (e.key !== CLE_PROGRESSION && e.key !== null) return;
  acquises = chargerProgression();
  enCours = chargerEnsemble(CLE_EN_COURS);
  aReviser = chargerEnsemble(CLE_A_REVISER);
  rafraichirProgression();
});

function fermerFicheProgression() {
  notionDeLaFiche = null;
}
