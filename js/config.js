// =====================================================================
//  Réglages de l'apparence du graphe
//  Les valeurs à ajuster pour changer le rendu (tailles, arrondis, zoom, îlots).
//  Les réglages du placement des notions (espacements…) sont dans placement.js.
// =====================================================================

// Notions indexées par identifiant
const parId = Object.fromEntries(NOTIONS.map((n) => [n.id, n]));

// ---------- Notions et flèches ----------
const LARGEUR_NOEUD = 170;
const HAUTEUR_NOEUD = 46;
const MARGE_TEXTE = 6;     // espace entre le titre et le bord de la notion, de chaque côté (px)
const RAYON_COUDES = 14; // arrondi des virages des flèches (px)

// Croisements : quand deux flèches se coupent sans se rejoindre, l'une est interrompue
// (une petite coupure dans le trait) pour montrer qu'elles ne sont pas reliées.
const COUPURE_DEMI_LONGUEUR = 4; // demi-longueur de la coupure (px)

// Coins arrondis du graphe : mêmes valeurs que --rayon-m et --rayon-l dans style.css.
const RAYON_NOTION = 8;
const RAYON_CADRE = 12;

// ---------- Vue d'ouverture ----------
const ZOOM_OUVERTURE_MAX = 1.2; // à l'ouverture, ne pas grossir au-delà (petites cartes)
const ZOOM_OUVERTURE_MIN = 0.6; // ni réduire en dessous (le texte deviendrait illisible)

// ---------- Îlots par domaine ----------
// Regrouper les notions d'un même domaine dans un cadre (îlot) ou non. Le bouton
// « Îlots par domaine » du panneau des filtres bascule ce réglage ; le choix est mémorisé dans le
// navigateur (s'il l'autorise). Sans mémoire, les îlots sont affichés.
const CLE_ILOTS = "learn-map:ilots";
function lirePreferenceIlots() {
  try { return localStorage.getItem(CLE_ILOTS) !== "non"; } catch { return true; }
}
function memoriserPreferenceIlots(valeur) {
  try { localStorage.setItem(CLE_ILOTS, valeur ? "oui" : "non"); } catch { /* sans mémoire : tant pis */ }
}
let grouperParDomaine = lirePreferenceIlots();
const TAILLE_TITRE_CADRE = 20; // taille (px) du nom de la catégorie, en haut de son cadre
// Marges intérieures d'un cadre ; celle du haut accueille le titre et grandit avec lui.
const MARGES_CADRE = `[top=${TAILLE_TITRE_CADRE + 34},left=22,bottom=22,right=22]`;
