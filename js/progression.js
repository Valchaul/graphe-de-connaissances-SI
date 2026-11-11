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
// Compteur de l'en-tête. Les domaines masqués (légende) ne comptent ni parmi les notions
// totales ni parmi les acquises : on mesure la progression sur ce qui est affiché.
function majCompteur() {
  const visibles = NOTIONS.filter((n) => !domainesMasques.has(n.domaine));
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
      // Un signe devant le titre : la couleur seule ne suffirait pas à tout le monde
      const signes = (acquises.has(id) ? "✓ " : "") + (enCours.has(id) ? "… " : "") + (aReviser.has(id) ? "↻ " : "");
      noeud.data("etiquette", signes + noeud.data("label"));
    });
  });

  majCompteur();
  if (new Set([...acquises, ...enCours, ...aReviser]).size === 0) fermerConfirmation();
  document.getElementById("prog-alerte").hidden = stockageDisponible;

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
