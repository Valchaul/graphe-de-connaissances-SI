#!/usr/bin/env node
// =====================================================================
//  Télécharge le logo (favicon) de chaque site cité dans data/notions.js
//
//  Usage :   node outils/favicons.js            télécharge les logos manquants
//            node outils/favicons.js --refaire  retélécharge tout
//
//  Les logos sont rangés dans img/favicons/ et listés dans data/favicons.js,
//  que le site lit pour afficher un logo devant chaque lien de ressource.
//  Les images sont servies par le site lui-même : les visiteurs ne contactent
//  aucun service tiers. Aucune installation : il suffit de Node 18 ou plus.
//  À relancer quand on ajoute une ressource d'un nouveau site.
// =====================================================================

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RACINE = path.join(__dirname, "..");
const DOSSIER = path.join(RACINE, "img", "favicons");
const FICHIER_LISTE = path.join(RACINE, "data", "favicons.js");
const TAILLE_MAX = 45 * 1024; // au-delà, un logo de 16 px pèserait trop lourd pour ce qu'il apporte
const refaire = process.argv.includes("--refaire");
const UA = "Mozilla/5.0 (X11; Linux x86_64) learn-map-favicons";

// Quelques sites annoncent mal leur logo : on indique ici où le trouver.
const ADRESSES_IMPOSEES = {
  "scikit-learn.org": "https://scikit-learn.org/stable/_static/favicon.ico",
};

// ---------- 1. Sites cités dans le contenu ----------
function lireSites() {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RACINE, "data", "notions.js"), "utf8") + ";this.N = JSON.stringify(NOTIONS);", ctx);
  const sites = new Set();
  for (const n of JSON.parse(ctx.N)) {
    for (const r of n.ressources || []) sites.add(new URL(r.url).hostname.replace(/^www\./, ""));
  }
  return [...sites].sort();
}

// ---------- 2. Reconnaître une image à son contenu (et non à son nom) ----------
function extensionImage(octets) {
  const debut = octets.subarray(0, 12);
  const texte = Buffer.from(octets.subarray(0, 300)).toString("utf8").toLowerCase();
  if (debut[0] === 0x89 && debut.subarray(1, 4).toString() === "PNG") return "png";
  if (debut[0] === 0 && debut[1] === 0 && debut[2] === 1 && debut[3] === 0) return "ico";
  if (debut.subarray(0, 3).toString() === "GIF") return "gif";
  if (debut[0] === 0xff && debut[1] === 0xd8) return "jpg";
  if (debut.subarray(0, 4).toString() === "RIFF" && debut.subarray(8, 12).toString() === "WEBP") return "webp";
  if (texte.includes("<svg") || (texte.startsWith("<?xml") && texte.includes("svg"))) return "svg";
  return null;
}

async function telecharger(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const octets = Buffer.from(await r.arrayBuffer());
  return { octets, url: r.url, type: r.headers.get("content-type") || "" };
}

// ---------- 3. Chercher les adresses possibles du logo d'un site ----------
function candidats(html, urlPage) {
  const liens = [];
  for (const balise of html.match(/<link\b[^>]*>/gi) || []) {
    // valeur entre guillemets doubles, simples, ou sans guillemets (rel=icon)
    const attr = (nom) => {
      const m = balise.match(new RegExp("\\s" + nom + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>\"']+))", "i"));
      return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
    };
    const rel = (attr("rel") || "").toLowerCase();
    const href = attr("href");
    if (!href || !rel.includes("icon") || rel.includes("mask-icon")) continue;
    const taille = parseInt((attr("sizes") || "").split("x")[0], 10) || 0;
    // Préférence : icône ordinaire (de 32 px environ) avant l'icône tactile, plus lourde
    const poids = (rel.includes("apple") ? 100 : 0) + Math.abs((taille || 32) - 32);
    try { liens.push({ url: new URL(href, urlPage).href, poids }); } catch { /* adresse invalide : on l'ignore */ }
  }
  liens.sort((a, b) => a.poids - b.poids);
  return [...new Set([...liens.map((l) => l.url), new URL("/favicon.ico", urlPage).href])];
}

async function logoDuSite(site) {
  let urlPage = "https://" + site + "/";
  let html = "";
  try {
    const page = await telecharger(urlPage);
    urlPage = page.url;
    html = page.octets.toString("utf8");
    const finEntete = html.search(/<\/head>/i); // les balises d'icône sont dans l'en-tête
    if (finEntete > 0) html = html.slice(0, finEntete);
  } catch { /* page d'accueil inaccessible : on tentera /favicon.ico */ }

  const urls = [...(ADRESSES_IMPOSEES[site] ? [ADRESSES_IMPOSEES[site]] : []), ...candidats(html, urlPage)];
  for (const url of urls) {
    try {
      const { octets } = await telecharger(url);
      const extension = extensionImage(octets);
      if (extension && octets.length <= TAILLE_MAX) return { octets, extension };
    } catch { /* on essaie l'adresse suivante */ }
  }
  return null;
}

// ---------- 4. Programme principal ----------
async function main() {
  fs.mkdirSync(DOSSIER, { recursive: true });
  const sites = lireSites();
  const dejaLa = (site) => fs.readdirSync(DOSSIER).some((f) => f.startsWith(site + "."));
  const aFaire = sites.filter((s) => refaire || !dejaLa(s));
  console.log(`${sites.length} sites cités, ${aFaire.length} logo(s) à télécharger.`);

  const echecs = [];
  let suivant = 0;
  async function ouvrier() {
    while (suivant < aFaire.length) {
      const site = aFaire[suivant++];
      const logo = await logoDuSite(site);
      if (!logo) { echecs.push(site); console.log("  ✗ " + site); continue; }
      for (const f of fs.readdirSync(DOSSIER)) if (f.startsWith(site + ".")) fs.unlinkSync(path.join(DOSSIER, f));
      fs.writeFileSync(path.join(DOSSIER, site + "." + logo.extension), logo.octets);
      console.log("  ✓ " + site + "." + logo.extension);
    }
  }
  await Promise.all(Array.from({ length: 8 }, ouvrier));

  // Liste lue par le site : site -> fichier du logo
  const liste = {};
  for (const f of fs.readdirSync(DOSSIER).sort()) {
    const site = f.slice(0, f.lastIndexOf("."));
    if (sites.includes(site)) liste[site] = "img/favicons/" + f;
  }
  const lignes = Object.entries(liste).map(([s, f]) => `  ${JSON.stringify(s)}: ${JSON.stringify(f)},`);
  fs.writeFileSync(FICHIER_LISTE,
    "// Généré par outils/favicons.js : ne pas modifier à la main.\n" +
    "// Associe chaque site cité dans les ressources au fichier de son logo.\n" +
    "const FAVICONS = {\n" + lignes.join("\n") + "\n};\n");

  console.log(`\n${Object.keys(liste).length} logos disponibles, ${echecs.length} sans logo.`);
  if (echecs.length) console.log("Sans logo (une icône générique sera affichée) : " + echecs.join(", "));
}

main();
