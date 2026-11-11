// =====================================================================
//  Vérification du contenu de data/notions.js
//  Signale dans un encadré rouge les erreurs de saisie : identifiant en double,
//  domaine, niveau ou prérequis inconnu, niveau inférieur à celui d'un prérequis,
//  boucle de prérequis, domaine inconnu dans une formation.
// =====================================================================

function verifierContenu() {
  const erreurs = [];
  const ids = new Set();
  const parId = Object.fromEntries(NOTIONS.map((n) => [n.id, n]));
  const rang = Object.fromEntries(Object.keys(NIVEAUX).map((cle, i) => [cle, i])); // L1 = 0 … M2 = 4

  for (const n of NOTIONS) {
    if (ids.has(n.id)) erreurs.push(`Identifiant en double : "${n.id}"`);
    ids.add(n.id);
    if (!DOMAINES[n.domaine]) erreurs.push(`"${n.id}" : domaine inconnu "${n.domaine}"`);
    if (!n.niveau) erreurs.push(`"${n.id}" : niveau manquant (${Object.keys(NIVEAUX).join(", ")})`);
    else if (!NIVEAUX[n.niveau]) erreurs.push(`"${n.id}" : niveau inconnu "${n.niveau}"`);
  }
  for (const [cle, f] of Object.entries(FORMATIONS)) {
    for (const d of [...(f.domaines || []), ...TRONC_COMMUN]) {
      if (!DOMAINES[d]) erreurs.push(`Formation "${cle}" : domaine inconnu "${d}"`);
    }
  }
  for (const n of NOTIONS) {
    for (const p of n.prerequis || []) {
      if (!ids.has(p)) { erreurs.push(`"${n.id}" : prérequis inconnu "${p}"`); continue; }
      const niveauPrerequis = parId[p].niveau;
      if (rang[n.niveau] !== undefined && rang[niveauPrerequis] > rang[n.niveau]) {
        erreurs.push(`"${n.id}" (${n.niveau}) demande "${p}" qui est de niveau ${niveauPrerequis} : ` +
          "une notion ne peut pas être à un niveau inférieur à ses prérequis");
      }
    }
  }

  // Détection de boucles (A demande B qui demande A)
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

verifierContenu();
