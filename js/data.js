/* =========================================================================
   KetoFit — Données éditoriales
   Prise de masse · 70 % Kettlebell / 30 % Bandes élastiques
   50 exercices réels · 21 phrases de motivation · plans 7 jours
   Démo GIF : dataset hasaneyldrm/exercises-dataset (© Gym visual)
   ========================================================================= */

'use strict';

const GIF_BASE =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

/* -------------------------------------------------------------------------
   21 phrases de motivation (prise de masse · constance · nutrition)
   ------------------------------------------------------------------------- */
const QUOTES = [
  'La masse se construit par la régularité, pas par l’intensité d’une seule séance.',
  'Chaque série terminée est un dépôt de plus dans ta banque de muscle.',
  'Tu ne t’entraînes pas seulement pour suer, tu t’entraînes pour mieux manger et mieux dormir.',
  'Un kilo de muscle se gagne en cent grammes, séance après séance.',
  'La constance bat le talent quand le talent ne s’entraîne pas.',
  'Mange comme la personne que tu veux devenir, pas comme celle que tu es aujourd’hui.',
  'La dernière répétition propre est celle qui construit.',
  'Le kettlebell ne ment pas : il récompense la technique.',
  'Aujourd’hui, tu n’as pas besoin de motivation. Juste de commencer.',
  'Progresser, c’est ajouter 2,5 kg ou deux répétitions. Le reste, c’est du bruit.',
  'Ton corps s’adapte à ce que tu répètes. Alors répète grand.',
  'Le repos fait partie du programme : c’est là que le muscle pousse.',
  'Ne cherche pas la séance parfaite, cherche la séance suivante.',
  'Les bandes ne sont pas un plan B : elles finissent le travail que la charge a commencé.',
  'Prends soin de tes protéines, de ton sommeil et de ta patience.',
  'La douleur de la discipline pèse moins lourd que le regret de l’abandon.',
  'Sois plus fort que ta dernière excuse.',
  'Un corps solide se construit les jours où tu n’as pas envie.',
  '70 % de fer, 30 % de tension, 100 % de régularité.',
  'Chaque séance terminée est une preuve que tu peux compter sur toi.',
  'Dans 12 semaines, tu remercieras la version de toi qui a commencé aujourd’hui.'
];

/* -------------------------------------------------------------------------
   Échauffement 3 min et étirements 3 min
   ------------------------------------------------------------------------- */
const WARMUP = {
  duration: '3 min',
  intro: 'Ne saute jamais cette étape : un corps chaud encaisse mieux la charge et pousse plus fort.',
  items: [
    { t: '0:00 – 0:30', title: 'Montées de genoux sur place', desc: 'Rythme tranquille, respire par le nez.' },
    { t: '0:30 – 1:00', title: 'Cercles de bras et d’épaules', desc: '10 cercles dans chaque sens, amplitude progressive.' },
    { t: '1:00 – 1:30', title: 'Charnière de hanche à vide', desc: '15 répétitions, dos plat, fessiers qui reculent.' },
    { t: '1:30 – 2:00', title: 'Squats au poids du corps', desc: '10 squats lents, genoux vers l’extérieur.' },
    { t: '2:00 – 2:30', title: 'Band pull-apart léger', desc: '15 répétitions avec la bande jaune pour ouvrir la poitrine.' },
    { t: '2:30 – 3:00', title: 'Planche 20 s + 10 cercles de poignets', desc: 'Gainage, puis mobilité des poignets pour le kettlebell.' }
  ]
};

const COOLDOWN = {
  duration: '3 min',
  intro: 'Respire lentement et étire sans rebondir. C’est le moment où le système nerveux redescend.',
  items: [
    { t: '0:00 – 0:30', title: 'Étirement des pectoraux au mur', desc: '30 s par côté, coude à hauteur d’épaule.' },
    { t: '0:30 – 1:00', title: 'Chat-chameau', desc: '8 allers-retours lents, colonne mobile.' },
    { t: '1:00 – 1:30', title: 'Ischios-jambiers assis', desc: '30 s par jambe, dos long, pas d’arrondi.' },
    { t: '1:30 – 2:00', title: 'Étirement fessier (pigeon au sol)', desc: '30 s par côté, respiration profonde.' },
    { t: '2:00 – 2:30', title: 'Quadriceps debout', desc: '30 s par jambe, genoux serrés, bassin neutre.' },
    { t: '2:30 – 3:00', title: 'Respiration diaphragmatique', desc: '5 cycles : 4 s d’inspiration, 6 s d’expiration.' }
  ]
};

/* -------------------------------------------------------------------------
   Guide des charges (affiché dans chaque modale Technique)
   ------------------------------------------------------------------------- */
const LOAD_GUIDE = {
  kb: [
    { name: 'Kettlebell 8 kg', use: 'Technique, isolation, premier mois. Ne rougis pas : 8 kg bien exécutés battent 16 kg balancés.' },
    { name: 'Kettlebell 12 kg', use: 'Charge de travail principale dès que 3 × 10 propres passent (press, rowing, goblet).' },
    { name: 'Kettlebell 16 kg', use: 'Swings, soulevé de terre, fentes, portés. Réservé aux mouvements où la technique est solide.' }
  ],
  band: [
    { name: 'Jaune · 2–7 kg', use: 'Échauffement, face pull, rotations externes, premier contact avec la tension.' },
    { name: 'Rouge · 7–16 kg', use: 'Volume principal : curl, élévations, tirage horizontal.' },
    { name: 'Noire · 11–30 kg', use: 'Tirage vertical, rowing assis, développé poitrine.' },
    { name: 'Violette · 16–38 kg', use: 'Squat, hip thrust, pallof press. Réservée aux mouvements de force.' },
    { name: 'Verte · 23–57 kg', use: 'Résistance maximale : hip thrust lourd, soulevé de terre bande. À utiliser avec prudence.' }
  ]
};

/* -------------------------------------------------------------------------
   Bibliothèque — 50 exercices (29 kettlebell + 21 bandes)
   Champs : id, name, equipment, focus, group, gif, source, proxy,
            reps, charge, setup, steps[], tempo, mistake
   ------------------------------------------------------------------------- */
const EXERCISES = [

  /* ============================ PECTORAUX ============================== */
  {
    id: 'kb-floor-press-1',
    name: 'Floor Press 1 bras',
    equipment: 'kb',
    focus: 'chest',
    group: 'Pectoraux',
    gif: 'videos/1298-rg59QCH.gif',
    source: 'Kettlebell One Arm Floor Press',
    reps: '8–10 par bras',
    charge: '8 kg pour la technique, 12 kg dès que 3 × 10 par bras passent sans perdre l’omoplate.',
    setup: 'Allongé sur le dos, genou droit fléchi et pied à plat. Kettlebell posée au sol à hauteur d’épaule, paume vers l’intérieur, coude à 45° du buste.',
    steps: [
      'Gainage : omoplate plaquée au sol, côtes basses, fessier serré.',
      'Pousse la kettlebell vers le plafond en gardant le poignet dans l’axe du bras.',
      'Verrouille le coude en haut sans décoller l’épaule du sol.',
      'Redescends en 3 secondes jusqu’à effleurer le sol avec le coude, puis repars.'
    ],
    tempo: 'Montée 1 s · pause 1 s en haut · descente 3 s',
    mistake: 'Cambrer le bas du dos et décoller la tête pour « aider » : signe d’une charge trop lourde ou d’un gainage relâché.'
  },
  {
    id: 'kb-floor-press-2',
    name: 'Floor Press 2 mains',
    equipment: 'kb',
    focus: 'chest',
    group: 'Pectoraux',
    gif: 'videos/0519-7w6i0vE.gif',
    source: 'Kettlebell Alternating Press on Floor',
    proxy: true,
    reps: '8–12',
    charge: 'Deux kettlebells de 8 kg, puis 2 × 12 kg quand la descente reste lente et contrôlée.',
    setup: 'Allongé sur le dos, une kettlebell de chaque côté, avant-bras verticaux, coudes à 45° du buste.',
    steps: [
      'Serre les fessiers et plaque le bas du dos au sol.',
      'Pousse les deux kettlebells simultanément vers le plafond.',
      'En haut, les poignets restent au-dessus des coudes, sans rouler les épaules vers l’avant.',
      'Descends en 3 secondes, coudes vers le sol, puis repars sans relâcher le gainage.'
    ],
    tempo: 'Montée 1 s · pause 1 s · descente 3 s',
    mistake: 'Laisser les coudes partir à 90° du buste : l’épaule trinque et les pectoraux perdent la tension.'
  },
  {
    id: 'kb-squeeze-press',
    name: 'Squeeze Press',
    equipment: 'kb',
    focus: 'chest',
    group: 'Pectoraux',
    gif: 'videos/0531-rseLfH3.gif',
    source: 'Kettlebell Extended Range One Arm Press on Floor',
    proxy: true,
    reps: '10–12',
    charge: 'Deux kettlebells de 8 kg. Inutile de monter lourd : c’est la pression qui compte, pas la charge.',
    setup: 'Allongé, deux kettlebells au-dessus de la poitrine, paumes face à face, serrées l’une contre l’autre.',
    steps: [
      'Écrase les deux kettlebells l’une contre l’autre de toutes tes forces.',
      'Descends vers la poitrine en gardant cette pression constante.',
      'En bas, les coudes restent proches du buste, la pression ne se relâche pas.',
      'Remonte en 1 seconde et serre encore plus fort en haut.'
    ],
    tempo: 'Descente 3 s · montée 1 s · pression continue',
    mistake: 'Relâcher la pression en bas : tout l’intérêt de l’exercice disparaît. Pense « je veux casser les kettlebells ».'
  },
  {
    id: 'kb-pushup',
    name: 'Pompes sur kettlebells',
    equipment: 'kb',
    focus: 'chest',
    group: 'Pectoraux',
    gif: 'videos/0545-ktf3nvW.gif',
    source: 'Kettlebell Plyo Push-Up',
    proxy: true,
    reps: '6–12',
    charge: 'Poids du corps. Trop dur ? Pose les genoux. Trop facile ? Surélève les pieds sur une chaise.',
    setup: 'Mains sur les poignées de deux kettlebells, pieds largeur de bassin, corps gainé, poitrine au-dessus de l’espace entre les kettlebells.',
    steps: [
      'Descends lentement jusqu’à ce que la poitrine arrive au niveau des poignées.',
      'Les kettlebells restent stables : ne les écarte pas.',
      'Pousse le sol en expirant et verrouille les coudes sans les bloquer.',
      'Garde le bassin dans l’alignement épaules-talons.'
    ],
    tempo: 'Descente 3 s · montée 1 s',
    mistake: 'Laisser les kettlebells s’écarter ou le bassin monter : le gainage lâche et les épaules prennent tout.'
  },
  {
    id: 'kb-pullover',
    name: 'Pullover kettlebell',
    equipment: 'kb',
    focus: 'chest',
    group: 'Pectoraux',
    gif: 'videos/0375-9XjtHvS.gif',
    source: 'Dumbbell Pullover',
    proxy: true,
    reps: '10–12',
    charge: '8 kg pour apprendre le trajet, 12 kg quand les côtes restent basses en bas du mouvement.',
    setup: 'Allongé, une kettlebell tenue à deux mains au-dessus de la poitrine, bras presque tendus.',
    steps: [
      'Inspire et descends la kettlebell derrière la tête en gardant les coudes légèrement fléchis.',
      'Va chercher l’étirement sans cambrer : les côtes restent basses.',
      'Expire et remonte en ramenant la kettlebell au-dessus de la poitrine.',
      'Garde les fessiers serrés pendant tout le trajet.'
    ],
    tempo: 'Descente 3 s · montée 2 s',
    mistake: 'Cambrer fort et décoller le bassin : l’étirement se fait dans le dos au lieu des pectoraux.'
  },

  /* ============================== DOS ================================== */
  {
    id: 'kb-row-1arm',
    name: 'Rowing buste penché 1 bras',
    equipment: 'kb',
    focus: 'back',
    group: 'Dos',
    gif: 'videos/0541-g9AsZ8P.gif',
    source: 'Kettlebell One Arm Row',
    reps: '8–10 par bras',
    charge: '12 kg dès la première séance, 16 kg quand tu sens le dos et non le bras travailler.',
    setup: 'Main libre appuyée sur un banc ou une chaise, dos plat, kettlebell au sol sous l’épaule.',
    steps: [
      'Tire la kettlebell vers la hanche en amenant le coude près du corps.',
      'En haut, serre l’omoplate 1 seconde sans tourner le buste.',
      'Redescends en 3 secondes jusqu’au sol, bras tendu.',
      'Garde le nombril rentré et le dos neutre du début à la fin.'
    ],
    tempo: 'Tirage 1 s · pause 1 s · descente 3 s',
    mistake: 'Tourner le buste et hausser l’épaule pour tirer plus lourd : c’est le dos qui doit travailler, pas l’élan.'
  },
  {
    id: 'kb-gorilla-row',
    name: 'Gorilla Row alterné',
    equipment: 'kb',
    focus: 'back',
    group: 'Dos',
    gif: 'videos/0522-Ca76jUE.gif',
    source: 'Kettlebell Alternating Row',
    proxy: true,
    reps: '8–10 par bras',
    charge: 'Deux kettlebells de 12 kg, 2 × 16 kg quand le buste reste immobile pendant les tirages.',
    setup: 'Deux kettlebells au sol devant toi, pieds largeur de bassin, charnière de hanche à 45–60°, dos plat.',
    steps: [
      'Reste penché et tire une kettlebell vers la hanche.',
      'Repose-la au sol, puis tire l’autre en alternance.',
      'Le buste ne se redresse pas entre les répétitions.',
      'Souffle à chaque tirage, inspire en reposant.'
    ],
    tempo: 'Tirage 1 s · repos au sol 1 s',
    mistake: 'Remonter le buste à chaque tirage : le dos perd son alignement et le mouvement devient un soulevé de terre raté.'
  },
  {
    id: 'kb-renegade-row',
    name: 'Renegade Row',
    equipment: 'kb',
    focus: 'back',
    group: 'Dos',
    gif: 'videos/0521-b9kqlBy.gif',
    source: 'Kettlebell Alternating Renegade Row',
    reps: '6–8 par bras',
    charge: '2 × 8 kg pour commencer. Le bassin doit rester parfaitement horizontal, sinon allège.',
    setup: 'Position de planche sur deux kettlebells, pieds écartés pour la stabilité.',
    steps: [
      'Gainage maximal : nombril rentré, fessiers serrés, bassin parallèle au sol.',
      'Tire une kettlebell vers la hanche sans bouger le bassin.',
      'Repose-la doucement, puis change de côté.',
      'Garde les appuis dans l’axe des épaules.'
    ],
    tempo: 'Tirage 1 s · descente 2 s',
    mistake: 'Laisser le bassin tourner ou les pieds glisser : l’exercice devient un rowing tordu et le dos s’en plaint.'
  },
  {
    id: 'kb-row-2arms',
    name: 'Rowing 2 mains',
    equipment: 'kb',
    focus: 'back',
    group: 'Dos',
    gif: 'videos/1345-wf24o8S.gif',
    source: 'Kettlebell Two Arm Row',
    reps: '10–12',
    charge: 'Deux kettlebells de 12 kg. Monte à 2 × 16 kg seulement si les omoplates se serrent franchement.',
    setup: 'Charnière de hanche, dos plat, deux kettlebells au sol devant les tibias.',
    steps: [
      'Tire les deux kettlebells vers le nombril, coudes le long du corps.',
      'Serre les omoplates 1 seconde en haut.',
      'Redescends en 3 secondes, bras tendus.',
      'Le buste reste fixe : seuls les bras bougent.'
    ],
    tempo: 'Tirage 1 s · pause 1 s · descente 3 s',
    mistake: 'Donner des à-coups avec le dos pour décoller la charge : c’est le signe qu’il faut alléger.'
  },
  {
    id: 'kb-deadlift',
    name: 'Soulevé de terre kettlebell',
    equipment: 'kb',
    focus: 'back',
    group: 'Dos',
    gif: 'videos/0300-nUwVh7b.gif',
    source: 'Dumbbell Deadlift',
    proxy: true,
    reps: '8–10',
    charge: '16 kg pour la technique. Deux kettlebells de 12 kg quand la charnière est propre.',
    setup: 'Kettlebell entre les pieds, hanches en arrière, dos neutre, prise à deux mains.',
    steps: [
      'Pousse le sol avec les pieds et tends les jambes en gardant le dos plat.',
      'En haut, verrouille les hanches et serre les fessiers, sans cambrer.',
      'Redescends en poussant les fessiers vers l’arrière, kettlebell près des tibias.',
      'Le dos reste neutre du début à la fin.'
    ],
    tempo: 'Montée 1 s · descente 3 s',
    mistake: 'Arrondir le dos et tirer avec les lombaires. La kettlebell doit rester proche du corps, portée par les jambes.'
  },

  /* ============================= ÉPAULES =============================== */
  {
    id: 'kb-clean-press',
    name: 'Clean & Press',
    equipment: 'kb',
    focus: 'shoulders',
    group: 'Épaules',
    gif: 'videos/0537-vzAxBtt.gif',
    source: 'Kettlebell One Arm Clean and Jerk',
    proxy: true,
    reps: '5–6 par bras',
    charge: '8 kg pour apprendre le clean sans claquer le poignet. 12 kg quand le rack est stable.',
    setup: 'Kettlebell au sol entre les pieds, charnière, dos plat, une main sur la poignée.',
    steps: [
      'Tire la kettlebell vers l’épaule en gardant le coude près du corps.',
      'Réceptionne-la au rack : poignet neutre, kettlebell contre l’avant-bras, coude serré.',
      'Pousse au-dessus de la tête en gainant, biceps près de l’oreille.',
      'Redescends au rack puis au sol en contrôlant.'
    ],
    tempo: 'Clean 1 s · press 1 s · descente 2 s',
    mistake: 'Laisser la kettlebell claquer sur le poignet : la rotation doit être guidée par la main, jamais subie.'
  },
  {
    id: 'kb-strict-press',
    name: 'Strict Press',
    equipment: 'kb',
    focus: 'shoulders',
    group: 'Épaules',
    gif: 'videos/0553-blBXysN.gif',
    source: 'Kettlebell Two Arm Military Press',
    reps: '6–10',
    charge: 'Deux kettlebells de 8 kg au début, 2 × 12 kg quand 3 × 8 passent sans cambrer.',
    setup: 'Deux kettlebells au rack, coudes sous les poignets, gainage, pieds largeur de bassin.',
    steps: [
      'Serre les fessiers et les abdos pour bloquer le buste.',
      'Pousse les kettlebells au-dessus de la tête, biceps près des oreilles.',
      'Verrouille les coudes en haut, sans creuser le dos.',
      'Redescends lentement au rack, coudes qui restent devant.'
    ],
    tempo: 'Montée 1 s · pause 1 s · descente 3 s',
    mistake: 'Cambrer le dos pour passer la charge : c’est un développé du dos, pas des épaules. Allège et gaine.'
  },
  {
    id: 'kb-push-press',
    name: 'Push Press',
    equipment: 'kb',
    focus: 'shoulders',
    group: 'Épaules',
    gif: 'videos/0540-osdXT3K.gif',
    source: 'Kettlebell One Arm Push Press',
    reps: '6–8 par bras',
    charge: '12 kg quand le strict press à 8 kg est solide. Le push press sert à dépasser cette charge.',
    setup: 'Kettlebell au rack, gainage, genoux légèrement fléchis.',
    steps: [
      'Fléchis les genoux de 10 cm, buste droit.',
      'Pousse le sol et transmets l’élan à la kettlebell.',
      'Verrouille le bras au-dessus de la tête et reste gainé.',
      'Redescends au rack en absorbant avec les jambes.'
    ],
    tempo: 'Descente 1 s · poussée explosive · retour contrôlé',
    mistake: 'Transformer le mouvement en squat puis pousser avec le dos : l’élan doit venir des jambes, pas des lombaires.'
  },
  {
    id: 'kb-halo',
    name: 'Halo kettlebell',
    equipment: 'kb',
    focus: 'shoulders',
    group: 'Épaules',
    gif: 'videos/0554-9Tkqa9O.gif',
    source: 'Kettlebell Windmill',
    proxy: true,
    reps: '8 cercles par sens',
    charge: '8 kg maximum. C’est un exercice de mobilité et de contrôle, pas de force.',
    setup: 'Debout, pieds largeur de bassin, kettlebell tenue à deux mains par la poignée, bras fléchis devant la poitrine.',
    steps: [
      'Fais passer la kettlebell autour de ta tête, près du crâne.',
      'Garde les épaules basses et le buste immobile.',
      'Termine le cercle devant la poitrine, puis inverse le sens.',
      'Respire lentement et garde les abdos engagés.'
    ],
    tempo: 'Cercle fluide 2 s · 8 répétitions par sens',
    mistake: 'Hausser les épaules et coller la kettlebell à la nuque. L’espace doit rester libre autour de la tête.'
  },
  {
    id: 'kb-upright-row',
    name: 'Upright Row (tirage menton)',
    equipment: 'kb',
    focus: 'shoulders',
    group: 'Épaules',
    gif: 'videos/0548-8ARQ9Hw.gif',
    source: 'Kettlebell Sumo High Pull',
    proxy: true,
    reps: '10–12',
    charge: '12 kg. Au-delà, la prise et les épaules trinquent vite : 16 kg seulement si tout reste confortable.',
    setup: 'Debout, kettlebell tenue à deux mains devant les cuisses, pieds un peu plus larges que le bassin.',
    steps: [
      'Tire la kettlebell vers le haut en amenant les coudes au-dessus des poignets.',
      'Monte jusqu’à hauteur de poitrine, pas plus haut.',
      'Marque une pause d’une seconde, épaules basses.',
      'Redescends en 3 secondes en contrôlant.'
    ],
    tempo: 'Montée 1 s · pause 1 s · descente 3 s',
    mistake: 'Monter les coudes au-dessus des épaules et hausser les trapèzes : risque d’irritation de l’épaule.'
  },

  /* =============================== BRAS ================================ */
  {
    id: 'kb-hammer-curl',
    name: 'Curl marteau kettlebell',
    equipment: 'kb',
    focus: 'biceps',
    group: 'Bras',
    gif: 'videos/0313-slDvUAU.gif',
    source: 'Dumbbell Hammer Curl',
    proxy: true,
    reps: '10–12 par bras',
    charge: '8 kg puis 12 kg. Le curl marteau supporte plus lourd que le curl classique, mais le coude fixe reste la règle.',
    setup: 'Debout, kettlebell tenue par la poignée, paume vers l’intérieur, bras le long du corps.',
    steps: [
      'Colle le coude contre les côtes et n’en bouge plus.',
      'Monte la kettlebell vers l’épaule en gardant la prise neutre.',
      'Serre le biceps 1 seconde en haut.',
      'Redescends en 3 secondes, bras presque tendu.'
    ],
    tempo: 'Montée 1 s · pause 1 s · descente 3 s',
    mistake: 'Balancer le buste pour monter la charge : le coude doit rester fixe, sinon les biceps ne font pas le travail.'
  },
  {
    id: 'kb-concentration-curl',
    name: 'Curl concentré kettlebell',
    equipment: 'kb',
    focus: 'biceps',
    group: 'Bras',
    gif: 'videos/0297-gvsWLQw.gif',
    source: 'Dumbbell Concentration Curl',
    proxy: true,
    reps: '10–12 par bras',
    charge: '8 kg suffit. La concentration, c’est le contrôle et la contraction, pas la charge.',
    setup: 'Assis, coude calé contre l’intérieur de la cuisse, kettlebell tenue par la poignée.',
    steps: [
      'Monte la kettlebell vers l’épaule en tournant légèrement la paume vers le haut.',
      'Serre le biceps 2 secondes en haut.',
      'Redescends très lentement, jusqu’à l’extension presque complète.',
      'Garde le dos droit et la respiration régulière.'
    ],
    tempo: 'Montée 1 s · pic 2 s · descente 3 s',
    mistake: 'Décoller le coude de la cuisse ou aider avec l’épaule : tout le bénéfice de l’isolation disparaît.'
  },
  {
    id: 'kb-triceps-overhead',
    name: 'Extension triceps au-dessus de la tête',
    equipment: 'kb',
    focus: 'triceps',
    group: 'Bras',
    gif: 'videos/0092-5uFK1xr.gif',
    source: 'Barbell Seated Overhead Triceps Extension',
    proxy: true,
    reps: '10–12',
    charge: '8 kg à deux mains. Garde les coudes serrés : c’est la seule sécurité qui compte.',
    setup: 'Debout ou assis, dos droit, kettlebell tenue à deux mains derrière la tête, coudes pointés vers le plafond.',
    steps: [
      'Garde les coudes serrés et immobiles, proches des oreilles.',
      'Descends la kettlebell derrière la tête en fléchissant les coudes.',
      'Tends les bras sans verrouiller brutalement.',
      'Le buste reste droit, les abdos engagés.'
    ],
    tempo: 'Descente 2 s · montée 1 s',
    mistake: 'Écarter les coudes vers l’extérieur : le triceps perd la tension et l’épaule force.'
  },
  {
    id: 'kb-skullcrusher',
    name: 'Skullcrusher au sol',
    equipment: 'kb',
    focus: 'triceps',
    group: 'Bras',
    gif: 'videos/0060-h8LFzo9.gif',
    source: 'Barbell Lying Triceps Extension Skull Crusher',
    proxy: true,
    reps: '10–12',
    charge: '8 kg pour commencer. Le sol limite l’amplitude : la charge peut rester modérée.',
    setup: 'Allongé, kettlebell tenue à deux mains au-dessus de la poitrine, bras tendus.',
    steps: [
      'Fléchis les coudes pour descendre la kettlebell vers le front.',
      'Les coudes restent pointés vers le plafond, sans s’écarter.',
      'Quand la kettlebell est proche de la tête, tends les bras.',
      'Garde les poignets neutres et le gainage actif.'
    ],
    tempo: 'Descente 3 s · montée 1 s',
    mistake: 'Laisser les coudes partir vers les côtés et cambrer : tu transformes le mouvement en développé et tu forces les épaules.'
  },

  /* ======================= JAMBES & FESSIERS =========================== */
  {
    id: 'kb-goblet-squat',
    name: 'Goblet Squat',
    equipment: 'kb',
    focus: 'quads',
    group: 'Jambes & Fessiers',
    gif: 'videos/0534-ZA8b5hc.gif',
    source: 'Kettlebell Goblet Squat',
    reps: '10–15',
    charge: '12 kg pour débuter, 16 kg quand tu descends sous la parallèle en gardant les talons au sol.',
    setup: 'Kettlebell tenue contre la poitrine, coudes sous la kettlebell, pieds un peu plus larges que le bassin, pointes légèrement ouvertes.',
    steps: [
      'Descends en poussant les fessiers vers l’arrière, genoux dans l’axe des pieds.',
      'Va chercher une profondeur où le dos reste neutre, talons au sol.',
      'Marque une courte pause en bas, coudes entre les genoux.',
      'Remonte en poussant le sol, fessiers serrés en haut.'
    ],
    tempo: 'Descente 3 s · pause 1 s · montée 1 s',
    mistake: 'Laisser les talons se soulever et les genoux rentrer vers l’intérieur : réduis la profondeur ou élargis la stance.'
  },
  {
    id: 'kb-front-rack-squat',
    name: 'Front Rack Squat',
    equipment: 'kb',
    focus: 'quads',
    group: 'Jambes & Fessiers',
    gif: 'videos/0533-DB0n8AG.gif',
    source: 'Kettlebell Front Squat',
    reps: '8–10',
    charge: 'Deux kettlebells de 8 kg, puis 2 × 12 kg. Le rack doit rester haut et les coudes relevés.',
    setup: 'Deux kettlebells au rack : poignets neutres, kettlebells posées sur les avant-bras, coudes hauts.',
    steps: [
      'Gaine le buste et garde les coudes hauts.',
      'Descends en squat en gardant le buste le plus vertical possible.',
      'Pause en bas sans laisser les coudes tomber.',
      'Remonte en poussant le sol et en serrant les fessiers.'
    ],
    tempo: 'Descente 3 s · pause 1 s · montée 1 s',
    mistake: 'Laisser les coudes descendre et le buste se pencher : les kettlebells roulent et le dos prend le relais.'
  },
  {
    id: 'kb-rdl',
    name: 'Soulevé de terre roumain (RDL)',
    equipment: 'kb',
    focus: 'hamstrings',
    group: 'Jambes & Fessiers',
    gif: 'videos/1459-rR0LJzx.gif',
    source: 'Dumbbell Romanian Deadlift',
    proxy: true,
    reps: '10–12',
    charge: 'Deux kettlebells de 12 kg. La charge n’est utile que si tu sens l’étirement des ischios.',
    setup: 'Debout, deux kettlebells devant les cuisses, genoux légèrement fléchis, dos neutre.',
    steps: [
      'Pousse les fessiers vers l’arrière en gardant les kettlebells près des jambes.',
      'Descends jusqu’à sentir l’étirement des ischios, sans arrondir le dos.',
      'Remonte en tendant les hanches, fessiers serrés en haut.',
      'Les genoux restent légèrement fléchis tout du long.'
    ],
    tempo: 'Descente 3 s · montée 1 s',
    mistake: 'Transformer le mouvement en squat en pliant les genoux : la charnière doit partir des hanches.'
  },
  {
    id: 'kb-reverse-lunge',
    name: 'Fentes arrière',
    equipment: 'kb',
    focus: 'glutes',
    group: 'Jambes & Fessiers',
    gif: 'videos/0536-WKMQzCD.gif',
    source: 'Kettlebell Lunge Pass Through',
    proxy: true,
    reps: '8–10 par jambe',
    charge: '12 kg en goblet. 16 kg quand l’équilibre est stable et que le genou avant reste dans l’axe.',
    setup: 'Kettlebell contre la poitrine, debout, pieds largeur de bassin.',
    steps: [
      'Recule un pied et descends le genou arrière vers le sol.',
      'Le genou avant reste au-dessus de la cheville, buste droit.',
      'Pousse sur le pied avant pour revenir debout.',
      'Alterne les jambes ou termine une série complète d’un côté.'
    ],
    tempo: 'Descente 2 s · remontée 1 s',
    mistake: 'Faire un grand pas et laisser le genou avant s’effondrer vers l’intérieur. Réduis la longueur du pas.'
  },
  {
    id: 'kb-bulgarian',
    name: 'Fentes bulgares',
    equipment: 'kb',
    focus: 'glutes',
    group: 'Jambes & Fessiers',
    gif: 'videos/0410-qx4fgX7.gif',
    source: 'Dumbbell Single Leg Split Squat',
    proxy: true,
    reps: '8–10 par jambe',
    charge: '8 kg en goblet pour commencer. C’est déjà exigeant : ne cherche pas à monter trop vite.',
    setup: 'Pied arrière posé sur une chaise ou un canapé, pied avant à environ 60 cm devant, kettlebell en goblet.',
    steps: [
      'Descends verticalement, le genou arrière vers le sol.',
      'Le buste reste droit, légèrement penché si tu veux cibler les fessiers.',
      'Pousse sur le talon avant pour remonter.',
      'Termine toutes les répétitions d’un côté avant de changer.'
    ],
    tempo: 'Descente 3 s · montée 1 s',
    mistake: 'Placer le pied avant trop près de la chaise : le genou dépasse les orteils et l’équilibre casse. Recule un peu.'
  },
  {
    id: 'kb-swing-2',
    name: 'Kettlebell Swing 2 mains',
    equipment: 'kb',
    focus: 'glutes',
    group: 'Jambes & Fessiers',
    gif: 'videos/0549-UHJlbu3.gif',
    source: 'Kettlebell Swing',
    reps: '15–20',
    charge: '12 kg pour apprendre la charnière, 16 kg pour le travail. Le swing est un mouvement de hanches, pas de bras.',
    setup: 'Kettlebell au sol devant toi, pieds largeur d’épaules, prise à deux mains, dos plat.',
    steps: [
      'Balance la kettlebell entre les jambes en poussant les fessiers vers l’arrière.',
      'Claque les hanches vers l’avant : la kettlebell monte seule jusqu’à hauteur de poitrine.',
      'Garde les bras souples, comme des cordes.',
      'Laisse la kettlebell redescendre et enchaîne sans pause en bas.'
    ],
    tempo: 'Explosif en haut · descente contrôlée',
    mistake: 'Monter la kettlebell avec les bras et les épaules, ou s’accroupir à chaque répétition. C’est un hinge, pas un squat.'
  },
  {
    id: 'kb-swing-1',
    name: 'Kettlebell Swing 1 main',
    equipment: 'kb',
    focus: 'glutes',
    group: 'Jambes & Fessiers',
    gif: 'videos/0549-UHJlbu3.gif',
    source: 'Kettlebell Swing',
    reps: '10–15 par bras',
    charge: '12 kg puis 16 kg. Le gainage anti-rotation est la priorité, pas la vitesse.',
    setup: 'Kettlebell au sol, prise à une main, pieds largeur d’épaules, dos plat.',
    steps: [
      'Balance la kettlebell entre les jambes et claque les hanches.',
      'Le bras reste souple, l’épaule stable.',
      'Résiste à la rotation du buste : les épaules restent carrées.',
      'Change de main au sommet, toutes les 5 répétitions si tu es à l’aise.'
    ],
    tempo: 'Explosif · changement de main maîtrisé',
    mistake: 'Laisser les épaules tourner avec la kettlebell : le dos encaisse la rotation. Garde le buste verrouillé.'
  },
  {
    id: 'kb-suitcase-carry',
    name: 'Suitcase Carry (marche du fermier 1 bras)',
    equipment: 'kb',
    focus: 'core',
    group: 'Gainage',
    gif: 'videos/2133-qPEzJjA.gif',
    source: 'Farmers Walk',
    proxy: true,
    reps: '30–40 m par côté',
    charge: '16 kg suffit pour un débutant. La difficulté, c’est de rester droit, pas de porter lourd.',
    setup: 'Debout, une kettlebell dans une main le long du corps, épaules basses.',
    steps: [
      'Marche lentement en gardant le buste parfaitement vertical.',
      'Ne te penche pas du côté opposé à la charge.',
      'Garde le bras tendu et l’épaule stable.',
      'Fais le retour avec la kettlebell dans l’autre main.'
    ],
    tempo: 'Marche lente · 30–40 m par côté',
    mistake: 'Se pencher pour compenser le poids. Le but est justement de résister à l’inclinaison.'
  },
  {
    id: 'kb-russian-twist',
    name: 'Russian Twist kettlebell',
    equipment: 'kb',
    focus: 'core',
    group: 'Gainage',
    gif: 'videos/0846-fZFZ704.gif',
    source: 'Weighted Russian Twist',
    proxy: true,
    reps: '10–12 par côté',
    charge: '8 kg. La rotation doit venir du buste, pas des bras.',
    setup: 'Assis, genoux fléchis, talons au sol, kettlebell tenue à deux mains devant la poitrine.',
    steps: [
      'Garde le dos long et la poitrine ouverte.',
      'Tourne le buste d’un côté en amenant la kettlebell près de la hanche.',
      'Reviens au centre, puis tourne de l’autre côté.',
      'Les pieds restent stables et les abdos engagés.'
    ],
    tempo: 'Rotation 1 s · retour 1 s',
    mistake: 'Bouger seulement les bras et arrondir le dos. La rotation part des côtes, pas des épaules.'
  },
  {
    id: 'kb-thruster',
    name: 'Kettlebell Thruster',
    equipment: 'kb',
    focus: 'shoulders',
    group: 'Épaules',
    gif: 'videos/0550-yWxMvB5.gif',
    source: 'Kettlebell Thruster',
    reps: '8–10',
    charge: 'Deux kettlebells de 8 kg. C’est un exercice global : commence léger, il fatigue vite.',
    setup: 'Deux kettlebells au rack, coudes hauts, pieds largeur de bassin.',
    steps: [
      'Descends en squat en gardant les coudes hauts.',
      'Remonte en poussant le sol.',
      'Enchaîne directement en développé au-dessus de la tête.',
      'Redescends au rack et enchaîne la répétition suivante.'
    ],
    tempo: 'Squat 2 s · press explosif · retour contrôlé',
    mistake: 'Faire une pause entre le squat et le press : le thruster doit être un mouvement continu, sinon tu perds l’élan.'
  },

  /* ============================ BANDES ================================= */
  {
    id: 'band-chest-fly',
    name: 'Écartés poitrine bande',
    equipment: 'band',
    focus: 'chest',
    group: 'Pectoraux',
    gif: 'videos/0227-Pr9Rhf4.gif',
    source: 'Cable Standing Fly',
    proxy: true,
    reps: '12–15',
    charge: 'Bande rouge (7–16 kg) pour 12–15 répétitions propres. Jaune si l’amplitude casse.',
    setup: 'Bande fixée derrière toi à hauteur de poitrine (porte, poteau). Un pied devant, buste légèrement penché.',
    steps: [
      'Bras presque tendus, amène les mains l’une vers l’autre devant la poitrine.',
      'Serre les pectoraux 1 seconde au croisement.',
      'Reviens lentement en contrôlant l’ouverture.',
      'Les coudes restent légèrement fléchis et fixes.'
    ],
    tempo: 'Croisement 1 s · pic 1 s · retour 3 s',
    mistake: 'Plier les coudes comme un développé : les écartés se transforment en press et le pectoral se relâche.'
  },
  {
    id: 'band-chest-press',
    name: 'Développé poitrine bande dans le dos',
    equipment: 'band',
    focus: 'chest',
    group: 'Pectoraux',
    gif: 'videos/1254-khlHMqs.gif',
    source: 'Band Bench Press',
    reps: '12–15',
    charge: 'Bande noire (11–30 kg) pour 12 répétitions. Rouge si la bande tire trop fort au début.',
    setup: 'Bande passée dans le dos, une poignée dans chaque main, coudes fléchis à 90°, paumes vers l’avant.',
    steps: [
      'Pousse les mains devant toi en tendant les bras.',
      'En fin de mouvement, serre les pectoraux sans verrouiller brutalement.',
      'Reviens lentement jusqu’à sentir l’étirement.',
      'Le buste reste droit, les abdos engagés.'
    ],
    tempo: 'Poussée 1 s · retour 3 s',
    mistake: 'Cambrer le dos pour pousser plus fort. Garde les côtes basses et les fessiers serrés.'
  },
  {
    id: 'band-pulldown',
    name: 'Tirage vertical bande',
    equipment: 'band',
    focus: 'back',
    group: 'Dos',
    gif: 'videos/1013-k6tUeqS.gif',
    source: 'Band Underhand Pulldown',
    reps: '12–15',
    charge: 'Bande noire (11–30 kg). Positionne-toi assez loin pour avoir de la tension dès le départ.',
    setup: 'Bande fixée en hauteur au-dessus de la tête. À genoux ou debout, prise en supination.',
    steps: [
      'Tire les poignées vers la poitrine en amenant les coudes vers le bas.',
      'Serre les omoplates 1 seconde en bas.',
      'Remonte lentement en gardant le buste droit.',
      'Les épaules restent basses, le cou relâché.'
    ],
    tempo: 'Tirage 1 s · pause 1 s · retour 3 s',
    mistake: 'Tirer avec les bras et hausser les épaules. Pense à amener les coudes vers les hanches.'
  },
  {
    id: 'band-seated-row',
    name: 'Tirage horizontal assis bande',
    equipment: 'band',
    focus: 'back',
    group: 'Dos',
    gif: 'videos/3144-Nu7jqFE.gif',
    source: 'Resistance Band Seated Straight Back Row',
    reps: '12–15',
    charge: 'Bande rouge ou noire selon la longueur. Assieds-toi plus loin pour plus de résistance.',
    setup: 'Assis jambes tendues, bande passée autour des pieds, poignées en main, dos droit.',
    steps: [
      'Tire les poignées vers le nombril, coudes le long du corps.',
      'Serre les omoplates et redresse la poitrine.',
      'Reviens lentement bras tendus, sans arrondir le dos.',
      'Le buste reste immobile : seuls les bras bougent.'
    ],
    tempo: 'Tirage 1 s · pause 1 s · retour 3 s',
    mistake: 'Se pencher en arrière pour tirer plus fort. C’est le dos qui doit rester droit et les omoplates qui travaillent.'
  },
  {
    id: 'band-pull-apart',
    name: 'Pull-Apart bande',
    equipment: 'band',
    focus: 'back',
    group: 'Dos',
    gif: 'videos/1017-aHDy5O5.gif',
    source: 'Band Y-Raise',
    proxy: true,
    reps: '15–20',
    charge: 'Bande jaune ou rouge. Léger et fréquent : idéal en échauffement ou en finition.',
    setup: 'Debout, bande tenue à deux mains devant toi, bras tendus à hauteur d’épaules, mains écartées de la largeur des épaules.',
    steps: [
      'Écarte les mains vers l’extérieur en gardant les bras tendus.',
      'Serre les omoplates en fin de mouvement.',
      'Reviens lentement au centre, sans laisser la bande te ramener.',
      'Les épaules restent basses et le buste droit.'
    ],
    tempo: 'Ouverture 1 s · retour 3 s',
    mistake: 'Hausser les épaules et cambrer le dos. Ce sont les omoplates qui bougent, pas le cou.'
  },
  {
    id: 'band-straight-arm',
    name: 'Straight-Arm Pulldown bande',
    equipment: 'band',
    focus: 'back',
    group: 'Dos',
    gif: 'videos/0238-x69MAlq.gif',
    source: 'Cable Straight Arm Pulldown',
    proxy: true,
    reps: '12–15',
    charge: 'Bande noire. Privilégie la tension continue plutôt que la résistance maximale.',
    setup: 'Bande fixée en hauteur, debout à un pas, bras tendus devant toi à hauteur d’épaules.',
    steps: [
      'En gardant les coudes légèrement fléchis mais fixes, amène les mains vers les cuisses.',
      'Les bras décrivent un arc, le dos reste droit.',
      'Serre les dorsaux en bas du mouvement.',
      'Remonte lentement en contrôlant.'
    ],
    tempo: 'Tirage 1 s · pic 1 s · retour 3 s',
    mistake: 'Plier les coudes et tirer avec les biceps. Les bras restent tendus, seules les épaules bougent.'
  },
  {
    id: 'band-lateral-raise',
    name: 'Élévations latérales bande',
    equipment: 'band',
    focus: 'shoulders',
    group: 'Épaules',
    gif: 'videos/0977-sTg7iys.gif',
    source: 'Band Front Lateral Raise',
    reps: '12–15',
    charge: 'Bande rouge (7–16 kg). Le petit muscle deltoïde n’a pas besoin de plus au début.',
    setup: 'Debout sur la bande, une poignée dans chaque main, bras le long du corps, coudes légèrement fléchis.',
    steps: [
      'Monte les bras sur les côtés jusqu’à l’horizontale, pas plus haut.',
      'Les coudes mènent le mouvement, les poignets restent souples.',
      'Marque une pause de 1 seconde en haut.',
      'Redescends lentement en résistant à la bande.'
    ],
    tempo: 'Montée 1 s · pause 1 s · descente 3 s',
    mistake: 'Monter les épaules et utiliser l’élan du buste. Allège et garde les trapèzes relâchés.'
  },
  {
    id: 'band-front-raise',
    name: 'Élévations frontales bande',
    equipment: 'band',
    focus: 'shoulders',
    group: 'Épaules',
    gif: 'videos/0978-TFA88iB.gif',
    source: 'Band Front Raise',
    reps: '12–15',
    charge: 'Bande rouge, voire jaune pour commencer. Le deltoïde antérieur fatigue vite.',
    setup: 'Debout sur la bande, poignées devant les cuisses, paumes vers le bas.',
    steps: [
      'Monte un bras tendu devant toi jusqu’à hauteur d’épaule.',
      'Garde le buste droit et les abdos serrés.',
      'Redescends lentement, puis alterne ou monte les deux bras.',
      'Ne balance pas le buste vers l’arrière.'
    ],
    tempo: 'Montée 1 s · descente 3 s',
    mistake: 'Se pencher en arrière pour aider. La charge est légère : c’est le contrôle qui compte.'
  },
  {
    id: 'band-face-pull',
    name: 'Face Pull bande',
    equipment: 'band',
    focus: 'rear_delts',
    group: 'Épaules',
    gif: 'videos/1022-tc5dYrf.gif',
    source: 'Band Standing Rear Delt Row',
    proxy: true,
    reps: '15–20',
    charge: 'Bande jaune ou rouge. C’est un exercice de posture : léger, propre, fréquent.',
    setup: 'Bande fixée à hauteur du visage, bras tendus devant toi, poignées en prise neutre.',
    steps: [
      'Tire la bande vers le visage en écartant les coudes.',
      'En fin de mouvement, les mains passent à côté des oreilles, pouces vers l’arrière.',
      'Serre l’arrière d’épaule 1 seconde.',
      'Reviens lentement en contrôlant.'
    ],
    tempo: 'Tirage 1 s · rotation externe · retour 3 s',
    mistake: 'Tirer avec les biceps et laisser les coudes bas. Les coudes doivent rester hauts, à hauteur des épaules.'
  },
  {
    id: 'band-rear-delt-fly',
    name: 'Oiseau (Rear Delt Fly) bande',
    equipment: 'band',
    focus: 'rear_delts',
    group: 'Épaules',
    gif: 'videos/0993-sTfvVsG.gif',
    source: 'Band Reverse Fly',
    reps: '12–15',
    charge: 'Bande rouge. L’arrière d’épaule est petit : la résistance doit rester modérée.',
    setup: 'Debout, bande tenue à deux mains devant toi, bras tendus à hauteur d’épaules, mains proches.',
    steps: [
      'Écarte les bras vers l’arrière en gardant une légère flexion des coudes.',
      'Serre les omoplates et l’arrière d’épaule en fin de mouvement.',
      'Reviens lentement, sans laisser les épaules rouler vers l’avant.',
      'Le buste reste droit et les abdos engagés.'
    ],
    tempo: 'Ouverture 1 s · pic 1 s · retour 3 s',
    mistake: 'Cambrer le dos et monter les épaules. Pense « coudes vers l’arrière », pas « mains vers le haut ».'
  },
  {
    id: 'band-curl',
    name: 'Curl supination bande',
    equipment: 'band',
    focus: 'biceps',
    group: 'Bras',
    gif: 'videos/0968-3omWx6P.gif',
    source: 'Band Alternating Biceps Curl',
    reps: '12–15 par bras',
    charge: 'Bande rouge. Pour plus de résistance, raccourcis la bande ou recule d’un pas.',
    setup: 'Debout sur la bande, poignées en prise supination, coudes collés au buste.',
    steps: [
      'Monte une main vers l’épaule en gardant le coude fixe.',
      'En haut, tourne la paume vers l’intérieur pour finir la contraction.',
      'Redescends lentement jusqu’à l’extension presque complète.',
      'Alterne les bras sans balancer le buste.'
    ],
    tempo: 'Montée 1 s · pic 1 s · descente 3 s',
    mistake: 'Avancer les coudes pour monter plus haut. Le coude reste collé aux côtes.'
  },
  {
    id: 'band-triceps-overhead',
    name: 'Extension triceps au-dessus de la tête bande',
    equipment: 'band',
    focus: 'triceps',
    group: 'Bras',
    gif: 'videos/0998-obe5LMq.gif',
    source: 'Band Side Triceps Extension',
    proxy: true,
    reps: '12–15 par bras',
    charge: 'Bande rouge. Si l’épaule tire, baisse la main de départ.',
    setup: 'Bande sous un pied, main derrière la tête, coude pointé vers le plafond.',
    steps: [
      'Tends le bras au-dessus de la tête sans bouger le coude.',
      'Serre le triceps 1 seconde en haut.',
      'Reviens lentement derrière la tête.',
      'Garde le buste droit et l’épaule basse.'
    ],
    tempo: 'Montée 1 s · pic 1 s · descente 3 s',
    mistake: 'Laisser le coude s’écarter vers l’extérieur. Il doit rester fixe, proche de l’oreille.'
  },
  {
    id: 'band-kickback',
    name: 'Kickback triceps bande',
    equipment: 'band',
    focus: 'triceps',
    group: 'Bras',
    gif: 'videos/0333-W6PxUkg.gif',
    source: 'Dumbbell Kickback',
    proxy: true,
    reps: '12–15 par bras',
    charge: 'Bande rouge ou jaune. Amplitude courte : la qualité prime sur la résistance.',
    setup: 'Bande fixée devant toi à hauteur de taille, buste penché à 45°, coude collé au corps.',
    steps: [
      'Tends le bras vers l’arrière jusqu’à l’extension complète.',
      'Serre le triceps 1 seconde.',
      'Reviens lentement en contrôlant.',
      'Garde le coude collé à la hanche et le dos plat.'
    ],
    tempo: 'Extension 1 s · pic 1 s · retour 3 s',
    mistake: 'Balancer le bras et décoller le coude. L’avant-bras seul doit bouger.'
  },
  {
    id: 'band-pushdown',
    name: 'Pushdown triceps bande',
    equipment: 'band',
    focus: 'triceps',
    group: 'Bras',
    gif: 'videos/0201-3ZflifB.gif',
    source: 'Cable Pushdown',
    proxy: true,
    reps: '12–15',
    charge: 'Bande noire fixée en hauteur. Assez pour sentir la tension, pas au point de perdre les coudes fixes.',
    setup: 'Bande fixée en hauteur, prise neutre, coudes collés au buste, buste légèrement penché.',
    steps: [
      'Tends les bras vers le bas en gardant les coudes fixes.',
      'En bas, serre les triceps 1 seconde.',
      'Remonte lentement jusqu’à 90° de flexion.',
      'Les épaules restent basses, le buste immobile.'
    ],
    tempo: 'Descente 1 s · pic 1 s · montée 3 s',
    mistake: 'Écarter les coudes et pousser avec tout le corps. Les coudes restent verrouillés le long des côtes.'
  },
  {
    id: 'band-good-morning',
    name: 'Good Morning bande',
    equipment: 'band',
    focus: 'hamstrings',
    group: 'Jambes & Fessiers',
    gif: 'videos/1009-kuMiR2T.gif',
    source: 'Band Stiff Leg Deadlift',
    proxy: true,
    reps: '12–15',
    charge: 'Bande violette sous les pieds. La résistance doit te tirer vers l’avant, pas t’écraser.',
    setup: 'Debout sur la bande, bande passée derrière la nuque ou tenue aux épaules, genoux légèrement fléchis.',
    steps: [
      'Pousse les fessiers vers l’arrière en gardant le dos plat.',
      'Descends jusqu’à sentir l’étirement des ischios, pas plus.',
      'Remonte en tendant les hanches et en serrant les fessiers.',
      'Garde le regard légèrement devant toi.'
    ],
    tempo: 'Descente 3 s · montée 1 s',
    mistake: 'Arrondir le dos et plier les genoux. La charnière part des hanches, le dos reste droit.'
  },
  {
    id: 'band-hip-thrust',
    name: 'Hip Thrust / Pont fessier bande',
    equipment: 'band',
    focus: 'glutes',
    group: 'Jambes & Fessiers',
    gif: 'videos/3236-Pjbc0Kt.gif',
    source: 'Resistance Band Hip Thrusts on Knees',
    reps: '15–20',
    charge: 'Bande violette (16–38 kg) au-dessus des genoux. La verte est réservée aux habitués.',
    setup: 'Dos appuyé sur un canapé ou un banc, pieds à plat largeur de bassin, bande au-dessus des genoux.',
    steps: [
      'Pousse dans les talons et monte les hanches jusqu’à l’alignement genoux-hanches-épaules.',
      'Serre les fessiers 2 secondes en haut.',
      'Redescends lentement sans poser complètement.',
      'Garde les genoux légèrement écartés contre la bande.'
    ],
    tempo: 'Montée 1 s · pic 2 s · descente 2 s',
    mistake: 'Cambrer le bas du dos en haut au lieu de serrer les fessiers. La côte reste basse, le bassin légèrement en rétroversion.'
  },
  {
    id: 'band-pallof',
    name: 'Pallof Press bande',
    equipment: 'band',
    focus: 'core',
    group: 'Gainage',
    gif: 'videos/0979-9pa4H5m.gif',
    source: 'Band Horizontal Pallof Press',
    reps: '10–12 par côté',
    charge: 'Bande rouge ou noire. Si tu peux tourner, la bande est trop légère.',
    setup: 'Bande fixée à hauteur de poitrine sur le côté, debout perpendiculairement, prise à deux mains devant la poitrine.',
    steps: [
      'Tends les bras devant toi en résistant à la rotation.',
      'Garde les hanches et les épaules face à l’avant.',
      'Reviens lentement au buste.',
      'Fais toutes les répétitions d’un côté, puis tourne-toi.'
    ],
    tempo: 'Extension 1 s · pause 1 s · retour 3 s',
    mistake: 'Laisser le buste tourner vers l’ancre. Le but est justement de ne pas bouger.'
  },
  {
    id: 'band-crunch',
    name: 'Crunch bande haute',
    equipment: 'band',
    focus: 'core',
    group: 'Gainage',
    gif: 'videos/1005-Kzg30R7.gif',
    source: 'Band Standing Crunch',
    reps: '15–20',
    charge: 'Bande noire fixée en hauteur. Résiste à la bande sur tout le trajet, pas seulement en haut.',
    setup: 'À genoux ou debout face à l’ancre, bande tenue derrière la nuque, coudes ouverts.',
    steps: [
      'Enroule le buste vers le bas en contractant les abdos.',
      'Expire à fond en fin de mouvement.',
      'Reviens lentement en contrôlant la bande.',
      'Garde le bassin stable, ne tire pas avec les bras.'
    ],
    tempo: 'Enroulement 1 s · pic 1 s · retour 3 s',
    mistake: 'Tirer avec les bras et la nuque. Les mains restent légères, les abdos font le travail.'
  },
  {
    id: 'band-dead-bug',
    name: 'Dead Bug bande',
    equipment: 'band',
    focus: 'core',
    group: 'Gainage',
    gif: 'videos/0276-iny3m5y.gif',
    source: 'Dead Bug',
    proxy: true,
    reps: '8–10 par côté',
    charge: 'Bande jaune autour des pieds ou des mains. Léger : c’est un exercice de contrôle.',
    setup: 'Allongé sur le dos, bande passée autour des pieds, bras tendus vers le plafond, genoux à 90°.',
    steps: [
      'Plaque le bas du dos au sol et garde les côtes basses.',
      'Descends un bras et la jambe opposée lentement.',
      'Reviens à la position de départ sans cambrer.',
      'Alterne les côtés en respirant régulièrement.'
    ],
    tempo: 'Descente 3 s · retour 2 s',
    mistake: 'Laisser le bas du dos se creuser quand la jambe descend. Réduis l’amplitude.'
  },
  {
    id: 'band-plank-pull-through',
    name: 'Plank Pull-Through',
    equipment: 'band',
    focus: 'core',
    group: 'Gainage',
    gif: 'videos/0991-VtTbiP3.gif',
    source: 'Band Pull Through',
    proxy: true,
    reps: '8–10 par côté',
    charge: 'Bande rouge. La résistance ne doit pas casser le gainage.',
    setup: 'Planche haute, bande fixée sur le côté à hauteur du sol, une main tient la poignée.',
    steps: [
      'Garde la planche stable, pieds écartés.',
      'Tire la poignée sous le corps vers l’autre côté.',
      'Résiste à la rotation du bassin.',
      'Relâche lentement et refais de l’autre main.'
    ],
    tempo: 'Tirage 2 s · retour 2 s',
    mistake: 'Tourner le bassin et laisser les hanches monter. Le gainage doit rester parfaitement immobile.'
  },
  {
    id: 'band-sumo-squat',
    name: 'Sumo Squat bande',
    equipment: 'band',
    focus: 'glutes',
    group: 'Jambes & Fessiers',
    gif: 'videos/1004-TUZLh71.gif',
    source: 'Band Squat',
    proxy: true,
    reps: '12–15',
    charge: 'Bande violette sous les pieds. Écarte les pieds pour cibler les fessiers et l’intérieur des cuisses.',
    setup: 'Bande sous les pieds, prise à deux mains devant la poitrine, pieds très écartés, pointes ouvertes à 45°.',
    steps: [
      'Descends entre tes pieds en gardant le buste droit.',
      'Pousse les genoux vers l’extérieur dans l’axe des pointes de pieds.',
      'Remonte en serrant les fessiers en haut.',
      'Garde les talons au sol pendant toute la descente.'
    ],
    tempo: 'Descente 3 s · montée 1 s',
    mistake: 'Laisser les genoux rentrer vers l’intérieur. La bande doit rester tendue et les genoux ouverts.'
  }
];

/* -------------------------------------------------------------------------
   Planification 7 jours — 4 séances / 3 repos
   Les listes kb / band sont ordonnées par priorité : la durée choisie
   prend les N premiers « slots ».
   ------------------------------------------------------------------------- */
const PLANS = {
  j1: {
    dow: 1,
    day: 'Lundi',
    short: 'Poussée',
    title: 'Haut du corps — Poussée',
    focus: 'Pectoraux · Épaules · Triceps',
    intention: 'Aujourd’hui, tu construis la force qui pousse : chaque répétition contrôlée vaut mieux qu’une répétition arrachée.',
    kb: ['chest', 'shoulders', 'chest', 'triceps', 'shoulders'],
    band: ['chest', 'shoulders', 'triceps']
  },
  j2: {
    dow: 2,
    day: 'Mardi',
    short: 'Bas du corps',
    title: 'Bas du corps & chaîne postérieure',
    focus: 'Cuisses · Fessiers · Lombaires',
    intention: 'Les jambes portent tout le reste. Descends proprement, pousse fort, et laisse la chaîne postérieure travailler.',
    kb: ['glutes', 'quads', 'hamstrings', 'glutes', 'core'],
    band: ['glutes', 'hamstrings', 'core']
  },
  rest3: {
    dow: 3,
    day: 'Mercredi',
    short: 'Repos',
    rest: true,
    title: 'Repos actif',
    focus: 'Marche · mobilité · récupération',
    intention: 'Le muscle se construit au repos. Marche 20 à 30 minutes, hydrate-toi, dors 7 à 9 heures.'
  },
  j4: {
    dow: 4,
    day: 'Jeudi',
    short: 'Tirage',
    title: 'Haut du corps — Tirage',
    focus: 'Dos · Arrière d’épaule · Biceps',
    intention: 'Tire avec les omoplates, pas avec les bras. C’est ce qui fera la différence sur ta posture.',
    kb: ['back', 'back', 'back', 'biceps', 'back'],
    band: ['back', 'rear_delts', 'biceps']
  },
  j5: {
    dow: 5,
    day: 'Vendredi',
    short: 'Full Body',
    title: 'Full Body — Épaules & Bras',
    focus: 'Corps entier · Rappel de volume',
    intention: 'Séance de rappel : un peu de tout, beaucoup de qualité. Termine la semaine en beauté.',
    kb: ['glutes', 'chest', 'back', 'shoulders', 'biceps'],
    band: ['glutes', 'back', 'core']
  },
  rest6: {
    dow: 6,
    day: 'Samedi',
    short: 'Repos',
    rest: true,
    title: 'Repos',
    focus: 'Récupération',
    intention: 'Profite de ta journée : les protéines et le sommeil font la moitié du travail.'
  },
  rest7: {
    dow: 7,
    day: 'Dimanche',
    short: 'Repos',
    rest: true,
    title: 'Repos',
    focus: 'Récupération',
    intention: 'Prépare les repas de la semaine. Un corps nourri est un corps qui progresse.'
  }
};
