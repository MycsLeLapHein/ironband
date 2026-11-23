# KetoFit

**Prise de masse · 70 % Kettlebell / 30 % Bandes élastiques**

Application web installable (PWA) conçue pour un programme hybride de prise de masse au kettlebell et aux bandes élastiques. 100 % statique : HTML, CSS et JavaScript, sans build, sans dépendance, prête à être publiée sur GitHub Pages et installée depuis Google Chrome sur Android.

---

## 1. Ce que contient l’application

| Écran | Contenu |
|---|---|
| **Séance** | Séance du jour, 4 durées (15/30/45/60 min), 3 variantes (Semaine A/B/C), bouton « Varier les exercices 🎲 », échauffement et étirements dépliables, coche des séries, validation |
| **Séance guidée** | Mode plein écran pas à pas : une série à la fois, GIF en grand, repos automatique, série suivante, bilan et validation |
| **Programme** | Les 7 jours de la semaine, statut de chaque séance, variantes, 7 règles de prise de masse |
| **Biblio** | 50 exercices filtrables par matériel (Tout / Kettlebell / Bandes), par muscle et par recherche |
| **Modale Technique** | GIF en grand, position de départ, exécution pas à pas, tempo, erreur de débutant, guide des charges |
| **Minuteur** | Panneau flottant 45/60/90 s, compte à rebours circulaire, vibration + bip à 0 s |
| **PWA** | Manifest, icônes, service worker hors-ligne, bouton « Installer l’app » |

### Le mot du jour

21 phrases de motivation uniques (prise de masse, constance, nutrition, dépassement de soi). Une phrase différente s’affiche à chaque ouverture, sans répétition immédiate : le tirage évite la dernière phrase et les dernières déjà vues (mémorisées dans `localStorage`). Le bouton ↻ permet de passer à la suivante.

### Durées et volumes

| Durée | Exercices | Répartition | Séries | Repos |
|---|---|---|---|---|
| **15 min** (Express) | 3 | 2 Kettlebell + 1 Bande | 3 | 45–60 s |
| **30 min** (Standard) | 5 | 3 Kettlebell + 2 Bandes | 3 | 60–90 s |
| **45 min** (Complet) | 6 | 4 Kettlebell + 2 Bandes | 4 | 90 s |
| **60 min** (Volume max) | 8 | 5 Kettlebell + 3 Bandes | 4 | 90–120 s |

Chaque séance respecte la structure **Bloc 1 · Kettlebell (force & volume)** puis **Bloc 2 · Bandes élastiques (congestion & isolation)**.

### Planification

- **Jour 1 — Lundi** : Haut du corps, poussée (pectoraux, épaules, triceps)
- **Jour 2 — Mardi** : Bas du corps & chaîne postérieure (cuisses, fessiers, lombaires)
- **Jour 3 — Mercredi** : Repos actif
- **Jour 4 — Jeudi** : Haut du corps, tirage (dos, arrière d’épaule, biceps)
- **Jour 5 — Vendredi** : Full body, épaules & bras
- **Jour 6 & 7 — Samedi/Dimanche** : Repos

Les exercices sont piochés dans la bibliothèque selon la cible musculaire de chaque emplacement. Un compteur d’utilisation privilégie les exercices les moins récemment vus, et un contrôle évite de répéter le même mouvement dans les deux blocs.

### Mode séance guidée (plein écran)

Le bouton **« ▶ Mode séance guidée »** (sous le titre de la séance) lance un parcours pas à pas :

- demande le **plein écran** (si le navigateur l’autorise) et un **Wake Lock** pour garder l’écran allumé ;
- reprend à la **première série non cochée**, puis affiche une série à la fois : GIF en grand, nom, « Série 2 / 4 », répétitions, tempo et conseil de charge ;
- **« Série terminée »** coche la série, lance un **repos décompté en anneau** (avec « +15 s » et « Passer le repos »), puis enchaîne automatiquement sur la série suivante puis l’exercice suivant ;
- « Passer la série » avance sans la cocher ; la croix ou `Échap` quitte à tout moment ;
- à la fin : bilan séries/exercices/format, puis **« Valider ma séance »** ou fermeture sans valider.

Toutes les cases cochées en mode guidé se retrouvent dans la séance normale.

### Logo et identité

Le logo fourni (`icons/ketofit-mark.png`, décliné en icônes PWA 192/512/maskable et apple-touch) remplace l’ancien visuel : kettlebell noire, bande orange, arc orange → vert. L’en-tête reprend le nom **KetoFit** (Keto blanc, Fit orange italique) et le sous-titre du programme.

---

## 2. Déploiement sur GitHub Pages

Aucun outil à installer, aucun build.

1. Crée un dépôt public sur GitHub, par exemple `ketofit`.
2. Dépose **tout le contenu de ce dossier** à la racine du dépôt (`index.html` doit être à la racine, pas dans un sous-dossier).
3. Dans le dépôt : **Settings → Pages**.
4. Source : **Deploy from a branch**. Branche : `main`. Dossier : `/ (root)`. Enregistre.
5. Attends une à deux minutes : l’adresse s’affiche en haut de la page, du type
   `https://<ton-pseudo>.github.io/ketofit/`.
6. Ouvre cette adresse en **HTTPS** sur ton téléphone. Le HTTPS est obligatoire pour que Chrome propose l’installation et pour que le service worker fonctionne.

> Toutes les URL sont relatives (`./`), l’application fonctionne donc aussi bien à la racine d’un domaine que dans un sous-dossier `/ketofit/`.

### Mettre à jour le site

Modifie les fichiers, puis incrémente la version du cache en haut de `sw.js` :

```js
const CACHE_VERSION = 'ketofit-v1.1.0';
```

Le service worker supprime l’ancien cache au prochain chargement. Incrémenter cette valeur force la mise à jour des fichiers de l’application chez tous les utilisateurs.

---

## 3. Installation sur smartphone

### Chrome / Android

1. Ouvre le site dans **Google Chrome** (en HTTPS).
2. Appuie sur le menu **⋮** en haut à droite.
3. Choisis **« Installer l’application »** ou **« Ajouter à l’écran d’accueil »**.
4. Confirme : KetoFit s’ouvre en plein écran (`display: standalone`) et fonctionne hors-ligne.

Le bouton **« Installer l’app »** du header déclenche l’invite native si elle est disponible, sinon il affiche les instructions en 4 étapes. Sur ordinateur, l’icône ⊕ de la barre d’adresse fait le même travail.

### iPhone / iPad

Ouvre le site dans **Safari**, appuie sur **Partager**, puis **« Sur l’écran d’accueil »**.

### Hors-ligne

Le service worker pré-cache l’application (HTML, CSS, JS, manifest, icônes). Les GIFs distants sont mis en cache au fur et à mesure de leur consultation : une séance déjà ouverte reste consultable sans réseau, les GIFs jamais vus se chargeront à la prochaine connexion.

---

## 4. Données locales

Tout est stocké dans le navigateur, sous la clé `ketofit.v1` :

- durée choisie et variante (A/B/C) ;
- exercices générés pour chaque jour/durée/variante de la semaine ;
- séries cochées et séances validées ;
- historique de phrases affichées ;
- compteur d’utilisation des exercices.

Aucune donnée n’est envoyée à un serveur. Le bouton **« Réinitialiser mes données locales »** (onglet Programme, en bas) efface tout après confirmation.

> En navigation privée, `localStorage` peut être bloqué : l’application reste utilisable, mais rien n’est conservé après fermeture.

---

## 5. Bibliothèque et GIFs

- **50 exercices** : 29 kettlebell + 21 bandes, couvrant pectoraux, dos, épaules, bras, jambes/fessiers et gainage.
- Chaque exercice possède un **GIF de démonstration**, affiché sur la carte et en grand dans la modale, avec une **image SVG de secours** si le chargement échoue (`onerror`).
- Les GIFs proviennent du dépôt public [`hasaneyldrm/exercises-dataset`](https://github.com/hasaneyldrm/exercises-dataset). **Attention : ce dépôt ne contient pas de dossier `exercises/`** ; les médias sont rangés dans `videos/` (GIF) et `images/` (miniatures), et le nom du fichier est `videos/<id>-<code>.gif`. Les URL utilisées dans `js/data.js` sont donc du type :

  ```text
  https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1298-rg59QCH.gif
  ```

- Pour une trentaine de mouvements, le dataset ne propose pas le clip exact (par exemple Squeeze Press, Halo, Face Pull, Skullcrusher au kettlebell). La fiche affiche alors le clip le plus proche, signalé par le badge **« démo proche »** et par la ligne « Démo : … » en bas de la modale. Le nom, les consignes et le tempo restent ceux du mouvement réel.
- **Crédits obligatoires** : les médias sont © [Gym visual](https://gymvisual.com/), redistribués dans le dataset avec autorisation, à 180 × 180 px. Le crédit « © Gym visual » est conservé dans la modale et dans la bibliothèque. Pour un usage au-delà de la démonstration, consulte les [conditions de Gym visual](https://gymvisual.com/content/3-terms-and-conditions-of-use).

---

## 6. Structure des fichiers

```text
ketofit/
├── index.html              # interface (header logo, mot du jour, 3 vues, minuteur)
├── manifest.json           # PWA : nom, icônes, standalone, thème
├── sw.js                   # service worker (pré-cache + GIFs hors-ligne)
├── css/
│   └── app.css             # dark mode mobile-first + overlay séance guidée
├── js/
│   ├── data.js             # 21 phrases, 50 exercices, plans 7 jours, échauffement/étirements
│   └── app.js              # état, génération, minuteur, biblio, modale, séance guidée, PWA
├── icons/
│   ├── favicon.svg
│   ├── ketofit-mark.png    # logo carré pour le header
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── maskable-512.png
│   └── apple-touch-icon.png
├── .nojekyll               # empêche GitHub Pages d’ignorer certains fichiers
├── LICENSE
└── README.md
```

---

## 7. Personnalisation

### Ajouter ou modifier un exercice

Tout est dans `js/data.js`, tableau `EXERCISES` :

```js
{
  id: 'kb-goblet-squat',          // identifiant unique
  name: 'Goblet Squat',           // nom affiché
  equipment: 'kb',                // 'kb' ou 'band'
  focus: 'quads',                 // cible utilisée par le générateur
  group: 'Jambes & Fessiers',     // filtre de la bibliothèque
  gif: 'videos/0534-ZA8b5hc.gif', // chemin relatif au dépôt du dataset
  source: 'Kettlebell Goblet Squat',
  proxy: false,                   // true → badge « démo proche »
  reps: '10–15',
  charge: 'Conseil de charge personnalisé…',
  setup: 'Position de départ…',
  steps: ['Étape 1', 'Étape 2', 'Étape 3', 'Étape 4'],
  tempo: 'Descente 3 s · pause 1 s · montée 1 s',
  mistake: 'L’erreur de débutant à éviter…'
}
```

Cibles (`focus`) reconnues par les plans : `chest`, `back`, `shoulders`, `rear_delts`, `biceps`, `triceps`, `quads`, `hamstrings`, `glutes`, `core`.

Ajoute un exercice de même `equipment` + `focus` qu’un emplacement du plan pour qu’il entre dans la rotation : le générateur l’utilisera automatiquement, et le bouton 🎲 le proposera.

### Modifier les plans

`PLANS` (toujours dans `js/data.js`) : chaque jour contient `kb` et `band`, des listes ordonnées de cibles. La durée choisie prend les N premiers emplacements — `kb` d’abord, puis `band`. Pour la 60 min, il faut 5 cibles `kb` et 3 cibles `band` qui possèdent assez d’exercices.

### Modifier les phrases

Tableau `QUOTES` dans `js/data.js`. Ajoute ou retire des phrases librement ; le tirage s’adapte.

### Modifier les durées

Tableau `DURATIONS` dans `js/app.js` : `kb`, `band`, `sets`, `rest` et texte d’aide.

### Changer les couleurs

Variables CSS en haut de `css/app.css` : `--bg`, `--card`, `--orange`, `--amber`, `--blue`, `--violet`, `--kb-grad`, `--band-grad`.

---

## 8. Notes techniques

- **Aucune dépendance**, aucun bundler, aucun cookie, aucun tracker.
- `target` minimum : Chrome/Edge/Firefox/Safari récents. `navigator.vibrate` et Web Audio sont utilisés avec des garde-fous (vibration absente sur iOS, bip silencieux si le navigateur bloque l’audio).
- Le minuteur utilise une échéance `Date.now()` : il reste juste même si l’onglet passe en arrière-plan (l’intervalle peut être ralenti, l’affichage se resynchronise au retour).
- Les séances sont générées de façon **déterministe** à partir de la semaine ISO, du jour, de la durée et de la variante : recharger la page ne change pas les exercices. Le bouton 🎲 ou un changement de semaine régénère.
- Le service worker ne met en cache que les requêtes `GET`. Sur GitHub Pages, vérifie que les GIFs se chargent bien depuis `raw.githubusercontent.com` (CORS `*`, compatible avec le cache d’images opaque).
- Le mode guidé demande le plein écran (`requestFullscreen`) et un Wake Lock ; si le navigateur refuse (iOS notamment), l’overlay plein écran et le décompte fonctionnent quand même.
- Le guidage GIF est un support pédagogique : pour tout débutant, privilégie des charges légères et un avis professionnel en cas de douleur.

---

## 9. Licence

- Code et textes de ce dépôt : licence MIT — voir `LICENSE`.
- Médias (GIF/miniatures) : © Gym visual, via le dataset `hasaneyldrm/exercises-dataset`, avec le crédit affiché dans l’application. Voir les conditions de Gym visual avant toute réutilisation hors de ce projet.
