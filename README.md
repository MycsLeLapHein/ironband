# IronBand

**Prise de masse · 70 % Kettlebell / 30 % Bandes élastiques**

Application web installable (PWA) pour un programme hybride de prise de masse au kettlebell et aux bandes élastiques. 100 % statique : HTML, CSS, JavaScript, sans build ni dépendance. Conçue pour GitHub Pages et l’installation depuis Google Chrome sur Android.

---

## 1. Fonctionnalités

| Écran | Contenu |
|---|---|
| **Séance** | Séance du jour, 4 durées (15/30/45/60 min), 3 variantes (Semaine A/B/C), bouton « Varier les exercices 🎲 », échauffement et étirements dépliables, coche des séries, **carnet de charges**, validation |
| **Séance guidée** | Mode plein écran pas à pas : une série à la fois, GIF en grand, repos automatique, série suivante, bilan et validation |
| **Programme** | Les 7 jours, statut de chaque séance, variantes, 7 règles de prise de masse, accès au téléchargement des GIFs hors-ligne |
| **Biblio** | 50 exercices filtrables par matériel (Tout / Kettlebell / Bandes), par muscle et par recherche |
| **Technique** | GIF en grand, **sélecteur de charge**, position de départ, exécution pas à pas, tempo, erreur de débutant, guide des charges |
| **Hors-ligne** | GIFs en cache-first, pré-téléchargement en un clic avec barre de progression, secours textuel si un GIF manque |
| **Minuteur** | Panneau flottant 45/60/90 s, anneau, vibration + bip à 0 s |
| **PWA** | Manifest, icônes, service worker, bouton « Installer l’app », mode standalone |

### Le mot du jour

21 phrases uniques (prise de masse, constance, nutrition, dépassement). Une phrase différente à chaque ouverture, sans répétition immédiate, mémorisée dans `localStorage`. Bouton ↻ pour passer à la suivante.

### Durées et volumes

| Durée | Exercices | Répartition | Séries | Repos |
|---|---|---|---|---|
| **15 min** (Express) | 3 | 2 Kettlebell + 1 Bande | 3 | 45–60 s |
| **30 min** (Standard) | 5 | 3 Kettlebell + 2 Bandes | 3 | 60–90 s |
| **45 min** (Complet) | 6 | 4 Kettlebell + 2 Bandes | 4 | 90 s |
| **60 min** (Volume max) | 8 | 5 Kettlebell + 3 Bandes | 4 | 90–120 s |

Structure constante : **Bloc 1 · Kettlebell (force & volume)** puis **Bloc 2 · Bandes (congestion & isolation)**.

### Planification

- **Lundi** : Haut du corps, poussée (pectoraux, épaules, triceps)
- **Mardi** : Bas du corps & chaîne postérieure (cuisses, fessiers, lombaires)
- **Mercredi** : Repos actif
- **Jeudi** : Haut du corps, tirage (dos, arrière d’épaule, biceps)
- **Vendredi** : Full body, épaules & bras
- **Samedi / Dimanche** : Repos

Les exercices sont piochés selon la cible musculaire, avec un compteur d’utilisation et une protection contre les doublons de mouvement entre les deux blocs.

### Mode séance guidée

Bouton **« ▶ Mode séance guidée »** sous le titre de la séance :

- reprend à la **première série non cochée** ;
- demande le **plein écran** et un **Wake Lock** (écran allumé) si le navigateur l’autorise ;
- affiche une série à la fois (GIF, nom, « Série 2 / 4 », répétitions, tempo, charge conseillée) ;
- **« Série terminée »** coche la série, lance le repos en anneau (« +15 s », « Passer le repos ») puis enchaîne ;
- « Passer la série » avance sans cocher ; `Échap` ou ✕ quitte ;
- bilan final et validation.

---

## 2. Carnet de charges (surcharge progressive)

Chaque carte d’exercice **et** la fiche Technique proposent un sélecteur rapide, pensé pour le pouce :

- **Kettlebell** : `8 kg`, `12 kg`, `16 kg`, `20 kg`, `24 kg`.
- **Bande** : `Jaune (2–7 kg)`, `Rouge (7–16 kg)`, `Noire (11–30 kg)`, `Violette (16–38 kg)`, `Verte (23–57 kg)`.
- Un champ texte court (facultatif) pour noter les répétitions exactes ou une remarque (`10 reps propres`, `RPE 8`…).

**Mémorisation automatique** dans `localStorage`, indexée par l’identifiant de l’exercice (indépendante de la séance ou de la variante). Dès qu’un exercice revient, un badge affiche :

> Dernière fois : **KB 12 kg** · aujourd’hui
>
> Dernière fois : **Bande Noire** · 12 nov.

La date est affichée (« aujourd’hui » ou date courte) pour visualiser la progression d’une semaine à l’autre. Un bouton `×` efface la charge enregistrée.

---

## 3. Hors-ligne et GIFs

Les démonstrations proviennent de `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/...`.

- **Cache dédié** : `ironband-gifs-v1`, alimenté par le service worker en **cache-first**. Un GIF affiché une fois est servi instantanément depuis le téléphone, même sans réseau.
- **Pré-téléchargement** : bouton discret 📥 dans l’en-tête (et ligne « GIFs hors-ligne » dans Programme). La feuille affiche `X / 49 GIFs en cache`, une barre de progression et un bouton **« Télécharger les GIFs hors-ligne »**. Téléchargement en arrière-plan (4 requêtes parallèles), reprise possible, demande de stockage persistant (`navigator.storage.persist`).
- **Secours visuel** : si un GIF n’est pas en cache et que le réseau est absent, l’image cassée est remplacée par un encart avec pictogramme d’entraînement. Dans la fiche Technique, l’encart affiche aussi la **position de départ** et l’**exécution pas à pas**.

Le service worker pré-cache l’application (HTML, CSS, JS, manifest, icônes) pour démarrer sans réseau. Incrémenter `CACHE_VERSION` force la mise à jour des fichiers ; le cache GIFs est conservé entre les versions.

---

## 4. Déploiement sur GitHub Pages

1. Crée un dépôt public (par exemple `ironband`).
2. Dépose **tout le contenu de ce dossier** à la racine (`index.html` à la racine).
3. **Settings → Pages** → **Deploy from a branch** → branche `main`, dossier `/ (root)` → Save.
4. Ouvre `https://<ton-pseudo>.github.io/ironband/` en **HTTPS**.

Toutes les URL sont relatives (`./`) : l’app fonctionne à la racine d’un domaine comme dans un sous-dossier.

### Mettre à jour

Modifie les fichiers puis incrémente la version du cache en haut de `sw.js` :

```js
const CACHE_VERSION = 'ironband-v1.2.1';
```

Le service worker supprime les anciens caches au chargement suivant (le cache `ironband-gifs-v1` est conservé).

---

## 5. Installation sur smartphone

### Chrome / Android

1. Ouvre le site dans **Chrome** (HTTPS obligatoire).
2. Menu **⋮ → « Installer l’application »** (ou « Ajouter à l’écran d’accueil »).
3. Confirme : IronBand s’ouvre en plein écran et fonctionne hors-ligne.

Le bouton **« Installer l’app »** du header déclenche l’invite native si disponible, sinon affiche les instructions en 4 étapes.

### iPhone / iPad

Dans **Safari** : **Partager → « Sur l’écran d’accueil »**.

---

## 6. Données locales

Clé `ironband.v1` (migration douce depuis `ketofit.v1` et `kettleband.v1`) :

- durée, variante, jour sélectionné ;
- exercices générés de la semaine ;
- séries cochées et séances validées ;
- **charges et notes par exercice** ;
- historique des phrases ;
- compteur d’utilisation.

Aucune donnée n’est envoyée à un serveur. **« Réinitialiser mes données locales »** (Programme, en bas) efface tout après confirmation. En navigation privée, `localStorage` peut être bloqué : l’app reste utilisable en mémoire.

---

## 7. Bibliothèque et crédits GIFs

- **50 exercices** : 29 kettlebell + 21 bandes.
- Le dépôt du dataset **ne contient pas de dossier `exercises/`** : les médias sont dans `videos/` sous la forme `videos/<id>-<code>.gif`. Les URL utilisées dans `js/data.js` sont de ce type :

  ```text
  https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/1298-rg59QCH.gif
  ```

- Pour une trentaine de mouvements, le clip exact n’existe pas (Squeeze Press, Halo, Face Pull…). La fiche affiche le clip le plus proche, signalé **« démo proche »**. Le nom, les consignes et le tempo restent ceux du mouvement réel.
- **Médias © [Gym visual](https://gymvisual.com/)**, via le dataset `hasaneyldrm/exercises-dataset`. Le crédit est conservé dans la modale et la bibliothèque. Voir les conditions de Gym visual avant toute réutilisation.

---

## 8. Structure

```text
ironband/
├── index.html              # interface (header, mot du jour, 3 vues, minuteur, hors-ligne)
├── manifest.json           # PWA : IronBand, icônes, standalone
├── sw.js                   # SW : app + cache GIFs ironband-gifs-v1
├── css/
│   └── app.css             # dark mode, carnet de charges, guidé, hors-ligne
├── js/
│   ├── data.js             # phrases, exercices, plans, charges
│   └── app.js              # état, génération, charges, minuteur, guidé, cache GIFs
├── icons/
│   ├── favicon.svg
│   ├── ironband-mark.png   # logo carré du header
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── maskable-512.png
│   └── apple-touch-icon.png
├── .nojekyll
├── LICENSE
└── README.md
```

---

## 9. Personnalisation

### Exercice

Dans `js/data.js`, tableau `EXERCISES` :

```js
{
  id: 'kb-goblet-squat',
  name: 'Goblet Squat',
  equipment: 'kb',                // 'kb' ou 'band'
  focus: 'quads',                 // cible du générateur
  group: 'Jambes & Fessiers',     // filtre bibliothèque
  gif: 'videos/0534-ZA8b5hc.gif',
  source: 'Kettlebell Goblet Squat',
  proxy: false,                   // true → badge « démo proche »
  reps: '10–15',
  charge: 'Conseil de charge…',
  setup: 'Position de départ…',
  steps: ['Étape 1', '…'],
  tempo: 'Descente 3 s · montée 1 s',
  mistake: 'Erreur de débutant…'
}
```

Cibles : `chest`, `back`, `shoulders`, `rear_delts`, `biceps`, `triceps`, `quads`, `hamstrings`, `glutes`, `core`.

### Charges rapides

`KB_LOADS` et `BAND_LOADS` dans `js/data.js`.

### Durées / plans / phrases / couleurs

- `DURATIONS` dans `js/app.js` ;
- `PLANS` et `QUOTES` dans `js/data.js` ;
- variables CSS en haut de `css/app.css` (`--amber`, `--blue`, `--violet`, `--kb-grad`, `--band-grad`).

---

## 10. Notes techniques

- Aucune dépendance, aucun cookie, aucun tracker.
- Web Audio + `navigator.vibrate` avec garde-fous (iOS).
- Le minuteur utilise `Date.now()` : juste même en arrière-plan.
- Génération déterministe par semaine ISO/jour/durée/variante ; le bouton 🎲 régénère.
- Cache GIFs : `ironband-gifs-v1`, partagé entre la page (pré-téléchargement) et le service worker (interception).
- Les GIFs restent un support pédagogique : charges légères et avis professionnel en cas de douleur.

---

## 11. Licence

- Code et textes : MIT — voir `LICENSE`.
- Médias GIF/miniatures : © Gym visual via `hasaneyldrm/exercises-dataset`, crédit affiché dans l’application.
