// =====================================================================
//  Suivi de progression
//  Chacun coche les notions qu'il a acquises. Le choix est mémorisé dans le navigateur
//  (localStorage) : pas de compte, rien n'est envoyé nulle part. Contrepartie : la
//  progression reste propre à ce navigateur et à cet appareil.
// =====================================================================

const CLE_PROGRESSION = "learn-map:acquises";
let stockageDisponible = true; // devient faux si le navigateur refuse d'écrire (navigation privée…)
let acquises = chargerProgression(); // ensemble des identifiants de notions cochées
let notionDeLaFiche = null; // notion dont la fiche est ouverte

// ---------- Lecture et écriture ----------
function chargerProgression() {
  try {
    const brut = localStorage.getItem(CLE_PROGRESSION);
    const ids = brut ? JSON.parse(brut) : [];
    // On ignore les notions qui n'existent plus (le contenu évolue)
    return new Set(Array.isArray(ids) ? ids.filter((id) => parId[id]) : []);
  } catch {
    stockageDisponible = false;
    return new Set();
  }
}

function sauverProgression() {
  try {
    localStorage.setItem(CLE_PROGRESSION, JSON.stringify([...acquises]));
    stockageDisponible = true;
  } catch {
    stockageDisponible = false;
  }
}

// ---------- Modifications ----------
function definirAcquises(ids, valeur) {
  for (const id of ids) {
    if (valeur) acquises.add(id);
    else acquises.delete(id);
  }
  sauverProgression();
  rafraichirProgression();
}

function basculerAcquise(id) {
  definirAcquises([id], !acquises.has(id));
}

function viderProgression() {
  acquises.clear();
  sauverProgression();
  rafraichirProgression();
}

// ---------- Affichage ----------
// Met à jour tout ce qui montre la progression : carte, compteur, fiche et chemin.
function rafraichirProgression() {
  cy.batch(() => {
    cy.nodes(".notion").forEach((noeud) => {
      const acquise = acquises.has(noeud.id());
      noeud.toggleClass("acquise", acquise);
      noeud.data("etiquette", (acquise ? "✓ " : "") + noeud.data("label"));
    });
  });

  const total = NOTIONS.length;
  const nombre = acquises.size;
  document.getElementById("prog-texte").textContent = `${nombre} / ${total} acquises`;
  document.getElementById("prog-remplissage").style.width = (100 * nombre) / total + "%";
  if (nombre === 0) fermerConfirmation();
  const alerte = document.getElementById("prog-alerte");
  alerte.hidden = stockageDisponible;
  document.getElementById("progression").setAttribute("aria-label",
    `Progression : ${nombre} notions acquises sur ${total}. Activer pour effacer.`);

  if (notionDeLaFiche) {
    majFicheProgression(notionDeLaFiche);
    majChemin(notionDeLaFiche); // redessine la liste du chemin avec les cases cochées
  }
}

// Bouton « Marquer comme acquise » de la fiche
function majFicheProgression(id) {
  notionDeLaFiche = id;
  const acquise = acquises.has(id);
  const bouton = document.getElementById("p-acquise");
  bouton.setAttribute("aria-pressed", String(acquise));
  bouton.textContent = acquise ? "Acquise" : "Marquer comme acquise";

  // Cocher une notion avancée sans avoir coché ses prérequis : on propose de les cocher aussi
  const manquants = acquise ? cheminVers(id).filter((p) => !acquises.has(p)) : [];
  const aide = document.getElementById("p-acquise-aide");
  aide.hidden = manquants.length === 0;
  if (manquants.length) {
    document.getElementById("p-acquise-aide-texte").textContent =
      `${manquants.length} prérequis ne ${manquants.length > 1 ? "sont" : "est"} pas coché${manquants.length > 1 ? "s" : ""}.`;
  }
}

// ---------- Boutons ----------
document.getElementById("p-acquise").addEventListener("click", () => {
  if (notionDeLaFiche) basculerAcquise(notionDeLaFiche);
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
  const n = acquises.size;
  if (n === 0) return; // rien à effacer
  document.getElementById("prog-question").textContent =
    `Effacer toute la progression ? Les ${n} notion${n > 1 ? "s" : ""} cochée${n > 1 ? "s" : ""} seront décochée${n > 1 ? "s" : ""}.`;
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
  rafraichirProgression();
});

function fermerFicheProgression() {
  notionDeLaFiche = null;
}
