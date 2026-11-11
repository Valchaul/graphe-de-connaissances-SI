# Graphe de connaissances des Sciences de l'ingénieur

Carte interactive des notions des sciences de l'ingénieur (niveau école d'ingénieur).
Chaque notion indique ses prérequis et renvoie vers des ressources existantes.

[`Découvrez la carte ici`](https://valchaul.github.io/graphe-de-connaissances-SI/)

## Voir le site en local

Double-cliquer sur `index.html` : il s'ouvre dans le navigateur. Aucune installation n'est nécessaire.
(Une connexion internet est requise pour charger les bibliothèques graphiques.)

## Utilisation

- **Clic sur une notion** : affiche sa fiche (ressources, prérequis, suites possibles) et met en évidence
  toute sa chaîne de prérequis.
- **Voir le chemin** : dans la section « Prérequis » de la fiche, ce bouton liste dans l'ordre
  toutes les notions à apprendre avant celle-ci (prérequis directs et indirects), des bases jusqu'à
  la notion visée. Cliquer sur une étape ouvre sa fiche sans perdre le chemin, qui reste affiché
  avec l'étape en cours. À chaque instant, une notion n'apparaît qu'après tous ses prérequis ;
  entre deux notions possibles, la plus basse en niveau passe d'abord. Le même bouton, devenu
  « Masquer le chemin », referme la liste.
- **Suivi de progression** : la fiche propose trois cases. « Acquise » donne à la notion une teinte
  verte et un ✓ sur la carte, et fait avancer le compteur de l'en-tête (« 12 / 183 acquises »).
  « En cours » la teinte en bleu (…) ; elle s'exclut avec « Acquise ». « À réviser » lui
  met un contour orange (↻) et peut se combiner avec « Acquise ». Dans le chemin d'apprentissage, chaque étape a sa case, la prochaine à
  apprendre est repérée et le résumé indique ce qu'il reste à faire. Quand on coche une notion
  dont les prérequis ne le sont pas, un lien propose de les cocher aussi. Un clic sur la
  barre de progression de l'en-tête propose, après confirmation, de tout remettre à zéro.
  La progression est **mémorisée dans le navigateur** (`localStorage`) : pas de compte, rien
  n'est envoyé nulle part. Contrepartie : elle reste propre à ce navigateur et à cet appareil, et
  disparaît si on efface les données du site ou en navigation privée.
- **Statuts sur la carte** : une pastille dans le coin haut droit de chaque notion indique son statut
  (✓ vert pour acquise, trois points bleus pour en cours, flèche orange pour à réviser). Un triangle bleu dans le coin haut gauche
  signale les notions **prêtes à apprendre** (tous leurs prérequis sont acquis).
- **Survol** (souris uniquement) : passer sur une notion allume sa chaîne de prérequis et ses suites,
  et affiche une info-bulle avec sa description. Sur écran tactile, on touche la notion pour ouvrir sa fiche.
- **Recherche** : taper un mot, puis Entrée pour ouvrir le premier résultat.
- **Légende** : cliquer sur un domaine pour le masquer ou l'afficher.
- **Échap** ou clic dans le vide : désélectionner.
- **Lien direct** vers une notion : `index.html#rdm` (l'adresse se met à jour quand on clique).

## Modifier le contenu

Tout le contenu se trouve dans [`data/notions.js`](data/notions.js). Pour ajouter une notion,
copier un bloc existant et l'adapter :

```js
{
  id: "transferts-masse",              // unique, sans espace ni accent
  titre: "Transferts de masse",        // nom affiché
  domaine: "energetique",              // une clé de DOMAINES
  niveau: "M1",                        // une clé de NIVEAUX : L1, L2, L3, M1 ou M2
  description: "Diffusion, loi de Fick.",
  prerequis: ["transferts-thermiques"], // ids des notions à connaître avant
  ressources: [
    { titre: "Wikipédia — Diffusion de la matière", url: WP("Diffusion_de_la_matière") },
    { titre: "Un autre cours", url: "https://exemple.org/cours" },
  ],
},
```

**Niveau.** Chaque notion porte le niveau d'études auquel on la rencontre, de L1 à M2 (pour une
école d'ingénieur : L1-L2 ≈ cycle préparatoire, L3 à M2 ≈ cycle ingénieur). Il s'affiche sur la
fiche, à côté du domaine, et dans les listes de prérequis. Une notion ne peut pas être à un niveau
inférieur à celui de ses prérequis : si cela arrive, l'encadré rouge le signale.

**Logos des ressources.** Chaque lien de la fiche s'affiche avec le logo de son site. Ces logos
sont rangés dans `img/favicons/` et listés dans `data/favicons.js`. Quand tu ajoutes une
ressource d'un site nouveau, lance une fois :

```bash
node outils/favicons.js
```

Le script ne télécharge que les logos manquants (`--refaire` pour tout retélécharger). Les sites
sans logo, ou dont le logo est trop lourd (plus de 45 Ko), reçoivent une icône générique.
Il faut Node 18 ou plus ; rien d'autre à installer.

Le placement dans la carte est automatique : ELK range les notions en colonnes et trace
les flèches à angles droits. Quand une flèche se divise, les branches partent d'un tronc
commun (embranchement en T). Quand deux flèches indépendantes se croisent, l'une est
interrompue par une petite coupure : deux lignes qui se traversent sans se toucher ne sont
pas reliées. L'arrondi des virages et la longueur des coupures se règlent dans
[`js/config.js`](js/config.js) (`RAYON_COUDES`, `COUPURE_DEMI_LONGUEUR`).
Les notions sont regroupées dans un cadre par domaine. Pour revenir à une carte sans cadres,
cliquer sur le bouton « Îlots par domaine » de l'en-tête (le choix est mémorisé dans le navigateur).
Les espacements du placement sont regroupés dans `OPTIONS_ELK`, dans [`js/placement.js`](js/placement.js).

Si une erreur se glisse dans le contenu (prérequis inconnu, identifiant en double, boucle de
prérequis), un encadré rouge l'indique en bas de la page.

## Structure

| Fichier               | Rôle                                                          |
|-----------------------|---------------------------------------------------------------|
| `index.html`          | Structure de la page et ordre de chargement des scripts       |
| `style.css`           | Apparence de l'interface                                      |
| `data/notions.js`     | **Le contenu** : domaines et notions                          |
| `data/favicons.js`    | Liste des logos de sites (généré par `outils/favicons.js`)    |
| `img/`                | Logos téléchargés (`favicons/`) et icône de lien générique    |
| `outils/favicons.js`  | Script de téléchargement des logos (à lancer à la main)       |
| `js/verification.js`  | Détection des erreurs dans le contenu                         |
| `js/config.js`        | Réglages du rendu : tailles, arrondis, zoom, îlots            |
| `js/graphe.js`        | Création du graphe et styles des notions, cadres et flèches   |
| `js/trace.js`         | Tracé des flèches : arrondis et coupures aux croisements      |
| `js/placement.js`     | Placement par ELK et cadrage de la vue                        |
| `js/survol.js`        | Mise en évidence et info-bulle au survol d'une notion         |
| `js/progression.js`   | Suivi de progression : cases à cocher, sauvegarde, compteur   |
| `js/panneau.js`       | Fiche d'une notion et surbrillance de sa chaîne de prérequis  |
| `js/chemin.js`        | Chemin d'apprentissage : ordre des notions à apprendre avant  |
| `js/filtres.js`       | Filtres par domaine et bouton « Îlots par domaine »           |
| `js/recherche.js`     | Recherche par titre                                           |
| `js/main.js`          | Démarrage (lance le placement, ouvre `#id-de-notion`)         |

Les scripts sont de simples fichiers chargés l'un après l'autre par `index.html` : ils
partagent les mêmes variables, et l'ordre de la liste compte (chaque fichier utilise ceux
qui le précèdent). Le site s'ouvre donc toujours par double-clic, sans serveur ni installation.

Bibliothèques utilisées : [Cytoscape.js](https://js.cytoscape.org/) (graphe) et
[ELK / elkjs](https://github.com/kieler/elkjs) (placement automatique).
