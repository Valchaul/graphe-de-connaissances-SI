// =====================================================================
//  Vérification du contenu de data/notions.js
//  Signale dans un encadré rouge les erreurs de saisie : identifiant en double,
//  domaine ou prérequis inconnu, boucle de prérequis.
// =====================================================================

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

verifierContenu();
