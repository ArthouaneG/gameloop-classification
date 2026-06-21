import './style.css';
import { animate, stagger, createTimeline } from 'animejs';
import { fetchMostPlayed, fetchAppDetails, fetchGameDetail, steamHeaderUrl, guessZone } from './steam.js';
import { castVote, getUserVote, getTotalVotes, getVoteDistribution } from './votes.js';
import { t, currentLang, setLang, steamLang } from './i18n.js';

/* ══════════════════════════════════════════════════════════════
   GAME DATA
══════════════════════════════════════════════════════════════ */
const GAMES = [

  // ── MICRO PUR
  { appid:504230,  name:'Celeste',                zone:'micro',      genre:'Plateforme',     micro:9,  meso:2,  macro:2,  desc:'Maîtrise du mouvement pixel-perfect — le layer exécution dans sa forme la plus pure.' },
  { appid:322170,  name:'Geometry Dash',           zone:'micro',      genre:'Rythme / Reflex',micro:10, meso:1,  macro:1,  desc:'Timing conditionné et réflexes — un faux mouvement remet tout à zéro.' },
  { appid:1058830, name:'Spin Rhythm XD',           zone:'micro',      genre:'Rythme',         micro:9,  meso:2,  macro:1,  desc:'Contrôle rotatif ultra-précis synchronisé à la musique.' },
  { appid:531510,  name:'Just Shapes & Beats',      zone:'micro',      genre:'Rythme',         micro:9,  meso:2,  macro:1,  desc:'Esquive de patterns synchronisés à la musique — réaction pure.' },
  { appid:null,    name:'Sifu',                     zone:'micro',      genre:'Combat',         micro:9,  meso:3,  macro:2,  desc:'Kung-fu millimétré — parry, combo, esquive dans un ballet de précision.' },
  { appid:null,    name:'Osu!',                     zone:'micro',      genre:'Rythme / Aim',   micro:10, meso:2,  macro:1,  desc:'Précision absolue et réflexes — le layer exécution à l\'état pur.' },
  { appid:null,    name:'Clone Hero',               zone:'micro',      genre:'Rythme',         micro:10, meso:1,  macro:1,  desc:'Synchronisation note par note — réplication rythmique parfaite.' },

  // ── MESO PUR
  { appid:945360,  name:'Among Us',                 zone:'meso',       genre:'Social',         micro:2,  meso:9,  macro:2,  desc:'Déduction sociale et lecture des comportements — l\'adaptabilité avant tout.' },
  { appid:739630,  name:'Phasmophobia',              zone:'meso',       genre:'Horreur',        micro:3,  meso:9,  macro:2,  desc:'Lecture des indices, adaptation à chaque fantôme et gestion du risque.' },
  { appid:null,    name:'Town of Salem 2',           zone:'meso',       genre:'Social',         micro:1,  meso:9,  macro:3,  desc:'Déduction et bluff social — probabilité des rôles et adaptation.' },
  { appid:1092790, name:'Inscryption',               zone:'meso',       genre:'Cartes / Horror',micro:2,  meso:8,  macro:4,  desc:'Adaptation au méta-jeu changeant — les règles évoluent, vous lisez.' },

  // ── MACRO PUR
  { appid:427520,  name:'Factorio',                  zone:'macro',      genre:'Stratégie',      micro:2,  meso:3,  macro:10, desc:'Optimisation de systèmes de production — le jeu comme équation mathématique.' },
  { appid:526870,  name:'Satisfactory',              zone:'macro',      genre:'Simulation',     micro:2,  meso:2,  macro:10, desc:'Chaînes de production en 3D — architecture systémique à grande échelle.' },
  { appid:1366540, name:'Dyson Sphere Program',      zone:'macro',      genre:'Stratégie',      micro:2,  meso:2,  macro:10, desc:'Construction d\'une sphère de Dyson — optimisation à l\'échelle stellaire.' },
  { appid:457140,  name:'Oxygen Not Included',       zone:'macro',      genre:'Simulation',     micro:2,  meso:3,  macro:9,  desc:'Gestion d\'une colonie souterraine — systèmes interconnectés de survie.' },
  { appid:294100,  name:'Rimworld',                  zone:'macro',      genre:'Simulation',     micro:2,  meso:4,  macro:9,  desc:'Colonie sur une planète hostile — narration systémique émergente.' },
  { appid:255710,  name:'Cities: Skylines',          zone:'macro',      genre:'Simulation',     micro:1,  meso:2,  macro:9,  desc:'Planification urbaine — optimisation du traffic, budget et services.' },
  { appid:289070,  name:'Civilization VI',            zone:'macro',      genre:'Stratégie',      micro:1,  meso:5,  macro:10, desc:'Construction mathématique d\'un empire sur des millénaires simulés.' },
  { appid:236850,  name:'Europa Universalis IV',      zone:'macro',      genre:'Grand Stratégie',micro:1,  meso:4,  macro:10, desc:'Maîtrise des systèmes géopolitiques du monde pré-moderne.' },
  { appid:394360,  name:'Hearts of Iron IV',         zone:'macro',      genre:'Grand Stratégie',micro:2,  meso:5,  macro:10, desc:'Optimisation militaire et industrielle pendant la Seconde Guerre mondiale.' },
  { appid:1158310, name:'Crusader Kings III',        zone:'macro',      genre:'Grand Stratégie',micro:1,  meso:5,  macro:9,  desc:'Gestion dynastique médiévale — politique, mariage et systèmes féodaux.' },
  { appid:281990,  name:'Stellaris',                 zone:'macro',      genre:'Grand Stratégie',micro:1,  meso:4,  macro:10, desc:'Empire galactique — expansion et optimisation à l\'échelle de la galaxie.' },
  { appid:529340,  name:'Victoria 3',                zone:'macro',      genre:'Grand Stratégie',micro:1,  meso:4,  macro:10, desc:'Économie politique du XIX° siècle — idéologie, industrie, statistiques.' },
  { appid:916440,  name:'Anno 1800',                 zone:'macro',      genre:'Simulation',     micro:2,  meso:4,  macro:9,  desc:'Chaînes de production industrielles — équilibre systémique de l\'ère victorienne.' },
  { appid:2252570, name:'Football Manager 2024',     zone:'macro',      genre:'Sport / Gestion',micro:1,  meso:6,  macro:9,  desc:'Gestion d\'équipe — recrutement, tactiques et systèmes de développement.' },
  { appid:1222670, name:'The Sims 4',                zone:'macro',      genre:'Simulation',     micro:1,  meso:3,  macro:7,  desc:'Optimisation de vie simulée — progression, construction et systèmes sociaux.' },

  // ── MICRO + MACRO
  { appid:1245620, name:'Elden Ring',                zone:'micro-macro', genre:'Action-RPG',   micro:9,  meso:4,  macro:8,  desc:'Combat ultra-précis + connaissance profonde des systèmes, boss knowledge et builds.' },
  { appid:374320,  name:'Dark Souls III',            zone:'micro-macro', genre:'Action-RPG',   micro:9,  meso:4,  macro:7,  desc:'Maîtrise des timings + profondeur des builds et mécaniques cachées.' },
  { appid:814380,  name:'Sekiro: Shadows Die Twice', zone:'micro-macro', genre:'Action',       micro:10, meso:4,  macro:7,  desc:'Parry parfait et rythme de combat + connaissance systémique des patterns de boss.' },
  { appid:367520,  name:'Hollow Knight',             zone:'micro-macro', genre:'Metroidvania', micro:8,  meso:4,  macro:7,  desc:'Précision du combat + exploration systémique du monde et de ses mécaniques.' },
  { appid:582010,  name:'Monster Hunter: World',     zone:'micro-macro', genre:'Action-RPG',   micro:8,  meso:4,  macro:8,  desc:'Maîtrise des armes + optimisation approfondie des builds et des éléments.' },
  { appid:1446780, name:'Monster Hunter Rise',       zone:'micro-macro', genre:'Action-RPG',   micro:8,  meso:4,  macro:8,  desc:'Combat fluide + systèmes de build, de Silkbind et de Wyvern Riding.' },
  { appid:601150,  name:'Devil May Cry 5',           zone:'micro-macro', genre:'Action',       micro:10, meso:3,  macro:6,  desc:'Style et combos d\'exécution + maîtrise des systèmes de chaque personnage.' },
  { appid:782330,  name:'DOOM Eternal',              zone:'micro-macro', genre:'FPS',          micro:9,  meso:5,  macro:7,  desc:'Mouvement et combat frénétiques + gestion systémique des ressources et ennemis.' },
  { appid:230410,  name:'Warframe',                  zone:'micro-macro', genre:'Action',       micro:8,  meso:4,  macro:9,  desc:'Combat fluide + construction extensive de builds et gestion de l\'arsenal.' },
  { appid:1145360, name:'Hades',                     zone:'micro-macro', genre:'Roguelike',    micro:8,  meso:5,  macro:7,  desc:'Combat précis + choix de boons et construction de synergies sur chaque run.' },
  { appid:1801505, name:'Hades II',                  zone:'micro-macro', genre:'Roguelike',    micro:8,  meso:5,  macro:7,  desc:'Profondeur du combat + nouvelles synergies de mécaniques et d\'incantations.' },
  { appid:105600,  name:'Terraria',                  zone:'micro-macro', genre:'Survie',       micro:7,  meso:4,  macro:8,  desc:'Combat et exploration + progression systémique de crafting et de boss.' },
  { appid:1627720, name:'Lies of P',                 zone:'micro-macro', genre:'Action-RPG',   micro:9,  meso:4,  macro:7,  desc:'Parade parfaite + systèmes de build et de personnalisation d\'armes.' },
  { appid:292030,  name:'The Witcher 3',             zone:'micro-macro', genre:'RPG',          micro:6,  meso:5,  macro:7,  desc:'Combat et exploration + système d\'alchimie, de signes et de build profond.' },
  { appid:990080,  name:'Hogwarts Legacy',           zone:'micro-macro', genre:'Action-RPG',   micro:7,  meso:4,  macro:7,  desc:'Combat de sorts + maîtrise des systèmes de progression et de customisation.' },
  { appid:1091500, name:'Cyberpunk 2077',            zone:'micro-macro', genre:'RPG',          micro:7,  meso:5,  macro:8,  desc:'Combat FPS/melee + construction de build cyberpunk profonde et choix systémiques.' },
  { appid:379720,  name:'DOOM (2016)',               zone:'micro-macro', genre:'FPS',          micro:9,  meso:4,  macro:6,  desc:'Mouvement constant et tir précis + gestion de l\'arène et des ressources.' },

  // ── ALL THREE
  { appid:730,     name:'Counter-Strike 2',          zone:'all-three',  genre:'FPS Tactique',  micro:10, meso:9,  macro:9,  desc:'Aim (micro) + économie/reading adversaire (meso) + maîtrise des callouts, smokes et rotations de map (macro).' },
  { appid:594650,  name:'Hunt: Showdown 1896',       zone:'all-three',  genre:'FPS',          micro:8,  meso:8,  macro:8,  desc:'Gunplay précis (micro) + lecture des chasseurs adverses (meso) + connaissance des compounds, spawns et routes (macro).' },
  { appid:359550,  name:'Rainbow Six Siege',         zone:'all-three',  genre:'FPS Tactique',  micro:8,  meso:9,  macro:8,  desc:'Aim (micro) + lecture des opérateurs et flanks (meso) + maîtrise des callouts de salle et rotations (macro).' },
  { appid:1517290, name:'Battlefield 2042',          zone:'all-three',  genre:'FPS',          micro:7,  meso:7,  macro:7,  desc:'Combat (micro) + lecture de situation (meso) + connaissance des objectifs, véhicules et positions de map (macro).' },
  { appid:686810,  name:'Hell Let Loose',            zone:'all-three',  genre:'FPS Tactique',  micro:7,  meso:8,  macro:8,  desc:'Tir réaliste (micro) + coordination d\'équipe (meso) + conscience tactique de la map et des lignes de front (macro).' },
  { appid:2073850, name:'The Finals',                zone:'all-three',  genre:'FPS',          micro:8,  meso:7,  macro:7,  desc:'Précision (micro) + lecture adversaire (meso) + exploitation systémique de la destruction d\'environnement (macro).' },
  { appid:null,    name:'Fortnite',                  zone:'all-three',  genre:'Battle Royale', micro:8,  meso:8,  macro:7,  desc:'Building execution (micro) + lecture de zone (meso) + rotation meta, zone management et matériaux (macro).' },
  { appid:null,    name:'Escape from Tarkov',        zone:'all-three',  genre:'FPS / Survie',  micro:8,  meso:9,  macro:9,  desc:'Gunplay précis (micro) + lecture du risque (meso) + connaissance des spawns, loot et extractions de chaque map (macro).' },
  { appid:570,     name:'Dota 2',                    zone:'all-three',  genre:'MOBA',          micro:9,  meso:8,  macro:10, desc:'Mécaniques précises + lecture de draft et rotations + macro économique totale — la référence des trois layers.' },
  { appid:252950,  name:'Rocket League',             zone:'all-three',  genre:'Sport',         micro:9,  meso:8,  macro:7,  desc:'Contrôle voiture (micro) + lecture adversaire (meso) + positionnement et rotations systémiques (macro).' },
  { appid:1142710, name:'Total War: Warhammer III',  zone:'all-three',  genre:'Stratégie',     micro:7,  meso:7,  macro:9,  desc:'Micro de batailles (micro) + lecture de situation (meso) + macro campagne et armées (macro).' },
  { appid:1599340, name:'Lost Ark',                  zone:'all-three',  genre:'MMORPG',        micro:8,  meso:8,  macro:9,  desc:'Exécution de skills (micro) + lecture des patterns de raid (meso) + optimisation de build (macro).' },
  { appid:271590,  name:'Grand Theft Auto V',        zone:'all-three',  genre:'Open World',    micro:7,  meso:7,  macro:7,  desc:'Combat (micro) + lecture de situation (meso) + systèmes économiques et progression Online (macro).' },
  { appid:892970,  name:'Valheim',                   zone:'all-three',  genre:'Survie',        micro:7,  meso:7,  macro:8,  desc:'Combat précis (micro) + lecture des biomes (meso) + progression systémique Viking (macro).' },
  { appid:346110,  name:'ARK: Survival Evolved',     zone:'all-three',  genre:'Survie',        micro:6,  meso:7,  macro:9,  desc:'Taming et combat (micro) + lecture de menaces (meso) + systèmes de base et dinos évolutifs (macro).' },
  { appid:1623730, name:'Palworld',                  zone:'all-three',  genre:'Survie',        micro:7,  meso:7,  macro:8,  desc:'Capture et combat (micro) + lecture de situation (meso) + systèmes de base et d\'usine (macro).' },
  { appid:275850,  name:'No Man\'s Sky',             zone:'all-three',  genre:'Exploration',   micro:5,  meso:6,  macro:8,  desc:'Combat (micro) + lecture des systèmes planétaires (meso) + optimisation de vaisseau et base (macro).' },
  { appid:1172470, name:'Apex Legends',              zone:'all-three',  genre:'Battle Royale', micro:9,  meso:8,  macro:7,  desc:'Aim (micro) + lecture contextuelle (meso) + rotation macro, zone management et positionnement (macro).' },

  // ── MICRO + MESO
  { appid:440,     name:'Team Fortress 2',           zone:'micro-meso', genre:'FPS',           micro:8,  meso:7,  macro:4,  desc:'Aim de classe + lecture des compositions d\'équipe et des pushes adverses.' },
  { appid:548430,  name:'Deep Rock Galactic',        zone:'micro-meso', genre:'FPS Coop',      micro:7,  meso:7,  macro:4,  desc:'Combat coopératif + lecture des vagues et adaptation aux biomes générés.' },
  { appid:550,     name:'Left 4 Dead 2',             zone:'micro-meso', genre:'FPS',           micro:7,  meso:7,  macro:3,  desc:'Tir précis + lecture et anticipation des hordes et spawns spéciaux.' },
  { appid:381210,  name:'Dead by Daylight',          zone:'micro-meso', genre:'Horreur Asym.', micro:7,  meso:8,  macro:4,  desc:'Exécution des mécaniques + lecture des esprits et adaptation tueur/survivant.' },
  { appid:1097150, name:'Fall Guys',                 zone:'micro-meso', genre:'Battle Royale', micro:7,  meso:7,  macro:3,  desc:'Contrôle précis du personnage + lecture des autres joueurs et placement.' },
  { appid:252490,  name:'Rust',                      zone:'micro-meso', genre:'Survie',        micro:7,  meso:8,  macro:5,  desc:'Combat PvP + lecture de la menace sociale et adaptation à l\'environnement.' },

  // ── MESO + MACRO
  { appid:646570,  name:'Slay the Spire',            zone:'meso-macro', genre:'Roguelike',     micro:3,  meso:8,  macro:9,  desc:'Construction de deck optimale + gestion probabiliste des rencontres et du shop.' },
  { appid:2379780, name:'Balatro',                   zone:'meso-macro', genre:'Cartes',        micro:2,  meso:8,  macro:9,  desc:'Synergies de jokers systémiques + probabilité de main poker.' },
  { appid:238960,  name:'Path of Exile',             zone:'meso-macro', genre:'Action-RPG',    micro:4,  meso:7,  macro:9,  desc:'Optimisation de build extrêmement profonde + probabilité de loot et crafting.' },
  { appid:2694490, name:'Path of Exile 2',           zone:'meso-macro', genre:'Action-RPG',    micro:4,  meso:7,  macro:9,  desc:'Profondeur de build amplifiée + nouvelle économie et probabilités de drop.' },
  { appid:1086940, name:'Baldur\'s Gate 3',          zone:'meso-macro', genre:'RPG',           micro:3,  meso:8,  macro:9,  desc:'Construction de classe + lecture tactique des dés et probabilités de combat.' },
  { appid:268500,  name:'XCOM 2',                    zone:'meso-macro', genre:'Tactique',      micro:3,  meso:8,  macro:8,  desc:'Gestion des soldats et équipements + probabilités de tir et couverts.' },
  { appid:1102190, name:'Monster Train',             zone:'meso-macro', genre:'Roguelike',     micro:2,  meso:7,  macro:9,  desc:'Synergies de clans systémiques + gestion de la probabilité de draft.' },
  { appid:413150,  name:'Stardew Valley',            zone:'meso-macro', genre:'Simulation',    micro:2,  meso:6,  macro:8,  desc:'Optimisation de ferme + gestion saisonnière et adaptation aux événements.' },
  { appid:435150,  name:'Divinity: Original Sin 2',  zone:'meso-macro', genre:'RPG',           micro:3,  meso:8,  macro:8,  desc:'Combinaisons d\'éléments systémiques + lecture tactique du terrain et ennemis.' },
  { appid:1282730, name:'Loop Hero',                 zone:'meso-macro', genre:'Roguelike',     micro:2,  meso:6,  macro:9,  desc:'Placement de tuiles systémique + adaptation à la progression probabiliste.' },
  { appid:590380,  name:'Into the Breach',           zone:'meso-macro', genre:'Tactique',      micro:3,  meso:8,  macro:8,  desc:'Puzzle tactique de positionnement + méta-progression systémique entre les runs.' },
  { appid:578080,  name:'PUBG: Battlegrounds',       zone:'all-three',  genre:'Battle Royale', micro:8,  meso:8,  macro:7,  desc:'Gunplay (micro) + lecture de zone et loot (meso) + connaissance des compounds et rotations de map (macro).' },
];

/* ══ SET D'APPIDS CONNUS ══ */
const KNOWN_APPIDS = new Set(GAMES.filter(g => g.appid).map(g => g.appid));

/* ══ CHART GAMES ══ */
const CHART_GAMES = [
  'Osu!', 'Celeste', 'Counter-Strike 2', 'Hunt: Showdown 1896',
  'Slay the Spire', 'Balatro', 'Factorio', 'Civilization VI',
  'Dota 2', 'Elden Ring',
];

/* ══ ZONE METADATA (colors + circle lists — labels come from t()) ══ */
const ZONE_INFO = {
  micro:        { color:'#00f5ff', circles:['micro'] },
  macro:        { color:'#ffd700', circles:['macro'] },
  meso:         { color:'#b14fff', circles:['meso'] },
  'micro-macro':{ color:'#88e8ff', circles:['micro','macro'] },
  'micro-meso': { color:'#9988ff', circles:['micro','meso'] },
  'meso-macro': { color:'#cc88ff', circles:['meso','macro'] },
  'all-three':  { color:'#ffffff', circles:['micro','meso','macro'] },
};

/* ══ SVG GEOMETRY ══ */
const CIRCLES = {
  micro:{ cx:170, cy:185, r:155 },
  macro:{ cx:330, cy:185, r:155 },
  meso: { cx:250, cy:315, r:155 },
};

function inCircle(px,py,k){ const c=CIRCLES[k]; return (px-c.cx)**2+(py-c.cy)**2<=c.r*c.r; }
function getZone(px,py){
  const m=inCircle(px,py,'micro'),s=inCircle(px,py,'macro'),p=inCircle(px,py,'meso');
  if(m&&s&&p) return 'all-three';
  if(m&&s)    return 'micro-macro';
  if(m&&p)    return 'micro-meso';
  if(s&&p)    return 'meso-macro';
  if(m) return 'micro'; if(s) return 'macro'; if(p) return 'meso';
  return null;
}

/* ══ GENRE TRANSLATION (FR → EN) ══ */
const GENRE_EN = {
  'Plateforme':     'Platformer',
  'Rythme / Reflex':'Rhythm / Reflex',
  'Rythme':         'Rhythm',
  'Horreur':        'Horror',
  'Horreur Asym.':  'Asymm. Horror',
  'Stratégie':      'Strategy',
  'Grand Stratégie':'Grand Strategy',
  'Simulation':     'Simulation',
  'Survie':         'Survival',
  'FPS Tactique':   'Tactical FPS',
  'FPS Coop':       'Coop FPS',
  'FPS / Survie':   'FPS / Survival',
  'Tactique':       'Tactical',
  'Cartes':         'Cards',
  'Cartes / Horror':'Cards / Horror',
  'Sport / Gestion':'Sport / Management',
};

function localizeGenre(genre) {
  if (!genre || genre === '—') return genre ?? '—';
  return currentLang === 'en' ? (GENRE_EN[genre] ?? genre) : genre;
}

/* ══ I18N HELPERS ══ */
function zoneLabel(zone) { return t('zone.'+zone+'.label'); }
function zoneSub(zone)   { return t('zone.'+zone+'.sub'); }
function zoneShort(zone) { return t('zone.'+zone+'.short'); }

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(el.dataset.i18n);
    if (val && val !== el.dataset.i18n) el.innerHTML = val;
  });
}

/* ══ VOTE UI ══ */
function buildVoteSection(gameKey, container) {
  const userVote = getUserVote(gameKey);
  const total    = getTotalVotes(gameKey);
  const dist     = getVoteDistribution(gameKey);

  container.innerHTML = `
    <div class="vote-zone">
      <button class="vote-toggle ${userVote ? 'open' : ''}" data-key="${gameKey}">
        <span>👥 ${userVote ? t('vote.yourvote') : t('vote.classify')}</span>
        <span class="v-arrow">▾</span>
      </button>
      <div class="vote-panel ${userVote ? 'open' : ''}" id="vp-${gameKey}">
        ${userVote
          ? `<div class="vote-user-label"><span class="vote-check">✓</span> <strong>${zoneLabel(userVote) ?? userVote}</strong></div>`
          : `<div class="vote-zone-btns">${Object.keys(ZONE_INFO).map(z => `
              <button class="vbtn" data-game="${gameKey}" data-zone="${z}" data-tooltip="${zoneSub(z)}">${zoneShort(z)}</button>
            `).join('')}</div>`
        }
        ${total > 0
          ? `<div class="vote-distrib">
              ${dist.map(([z,c]) => {
                const pct = Math.round(c/total*100);
                return `<div class="vd-row">
                  <span class="vd-name">${zoneLabel(z) ?? z}</span>
                  <div class="vd-bar-track"><div class="vd-bar-fill" style="width:${pct}%"></div></div>
                  <span class="vd-count">${c}</span>
                </div>`;
              }).join('')}
             </div>
             <span class="vote-total">${t('vote.total').replace('%n', total)}</span>`
          : ''
        }
      </div>
    </div>`;

  container.querySelector('.vote-toggle').addEventListener('click', function() {
    const panel = document.getElementById('vp-' + gameKey);
    panel.classList.toggle('open');
    this.classList.toggle('open');
  });

  container.querySelectorAll('.vbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { alreadyVoted } = castVote(gameKey, btn.dataset.zone);
      if (!alreadyVoted) buildVoteSection(gameKey, container);
    });
  });
}

/* ══ GAME CARD ══ */
function createGameCard(game, unclassified = false) {
  const card     = document.createElement('div');
  card.className = `game-card${unclassified ? ' unclassified' : ''}`;
  if (!unclassified && game.zone) card.dataset.zone = game.zone;

  const gameKey = (game.name || game.appid?.toString() || 'unknown')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const imgUrl   = game.header_image ?? (game.appid ? steamHeaderUrl(game.appid) : null);
  const locale   = currentLang === 'fr' ? 'fr-FR' : 'en-US';

  const badgeHtml = unclassified
    ? `<span class="unclass-badge">${t('badge.unclass')}</span>`
    : `<span class="game-zone-badge badge-${game.zone}">${(zoneLabel(game.zone) ?? game.zone).toUpperCase()}</span>`;

  const barsHtml = (!unclassified && game.micro)
    ? `<div class="mini-bars">
         ${['micro','meso','macro'].map(l=>`
           <div class="mini-bar-row">
             <span class="mini-bar-label">${l[0].toUpperCase()+l.slice(1)}</span>
             <div class="mini-bar-track"><div class="mini-bar-fill fill-${l}" style="width:${game[l]*10}%"></div></div>
           </div>`).join('')}
       </div>`
    : '';

  const peakHtml = game.peak_in_game
    ? `<p class="peak-players" data-peak="${game.peak_in_game}">${t('peak.players').replace('%n', Number(game.peak_in_game).toLocaleString(locale))}</p>`
    : '';

  card.innerHTML = `
    ${imgUrl
      ? `<img class="game-thumb" src="${imgUrl}" alt="${game.name}" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="game-thumb-placeholder">🎮</div>`}
    ${badgeHtml}
    <h4>${game.name ?? `AppID ${game.appid}`}</h4>
    <p class="game-genre">${localizeGenre(game.genre)}</p>
    ${(game.desc && currentLang === 'fr') ? `<p class="game-desc-short">${game.desc}</p>` : ''}
    ${peakHtml}
    ${barsHtml}
    <div id="vote-${gameKey}"></div>
  `;

  card.addEventListener('click', e => {
    if (e.target.closest('.vote-zone, .info-bubble, .info-btn, .bubble-close')) return;
    openGameModal(game);
  });

  buildVoteSection(gameKey, card.querySelector(`#vote-${gameKey}`));
  return card;
}

/* ══ GAMES GRID ══ */
function renderGames(filter = 'all') {
  const grid = document.getElementById('games-grid');
  grid.innerHTML = '';
  const list = filter === 'all' ? GAMES : GAMES.filter(g => g.zone === filter);
  list.forEach(g => grid.appendChild(createGameCard(g)));
  animate('.game-card', { opacity:[0,1], translateY:[14,0], duration:450, delay:stagger(25), ease:'outQuart' });
}

function setupFilters() {
  document.querySelectorAll('#filter-bar .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGames(btn.dataset.filter === 'all' ? 'all' : btn.dataset.filter);
    });
  });
}

/* ══ INTERACTIVE VENN ══ */
let currentZone = null;
function setupVenn() {
  const svg   = document.getElementById('main-venn');
  const panel = document.getElementById('venn-info-panel');
  const tip   = document.getElementById('venn-tooltip');
  const tipT  = document.getElementById('venn-tooltip-title');
  const tipC  = document.getElementById('venn-tooltip-count');
  if (!svg) return;

  function svgPt(e) {
    const r=svg.getBoundingClientRect(), vb=svg.viewBox.baseVal;
    return { x:((e.clientX-r.left)/r.width)*vb.width, y:((e.clientY-r.top)/r.height)*vb.height };
  }
  function setActive(zk) {
    ['micro','macro','meso'].forEach(c=>document.getElementById('vc-'+c)?.classList.remove('active'));
    if(zk) ZONE_INFO[zk]?.circles.forEach(c=>document.getElementById('vc-'+c)?.classList.add('active'));
  }

  svg.addEventListener('mousemove', e => {
    const zone=getZone(svgPt(e).x, svgPt(e).y);
    if(zone===currentZone) return;
    currentZone=zone; setActive(zone);
    if (zone) {
      const cnt = GAMES.filter(g=>g.zone===zone).length;
      tipT.textContent = zoneLabel(zone);
      tipC.textContent = cnt <= 1 ? t('venn.game').replace('%n', cnt) : t('venn.games').replace('%n', cnt);
      tip.classList.remove('hidden');
    } else {
      tip.classList.add('hidden');
    }
  });
  svg.addEventListener('mouseleave',()=>{ currentZone=null; setActive(null); tip.classList.add('hidden'); });
  svg.addEventListener('click', e => {
    const zone=getZone(svgPt(e).x,svgPt(e).y);
    if(!zone) return;
    const info=ZONE_INFO[zone], games=GAMES.filter(g=>g.zone===zone);
    panel.innerHTML=`
      <p class="vip-zone-sub">${zoneSub(zone)}</p>
      <p class="vip-zone-name" style="color:${info.color}">${zoneLabel(zone)}</p>
      <div class="vip-games">${games.map(g=>`<span class="vip-game-chip">${g.name}</span>`).join('')}</div>`;
    animate(panel, {opacity:[0,1],translateY:[8,0],duration:350,ease:'outQuart'});
    document.querySelectorAll('#filter-bar .filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter===zone));
    renderGames(zone);
    setTimeout(()=>document.getElementById('games')?.scrollIntoView({behavior:'smooth',block:'start'}),150);
  });
}

/* ══ STEAM DISCOVER ══ */
async function loadSteamDiscover() {
  const statusEl = document.getElementById('discover-status');
  const grid     = document.getElementById('discover-grid');

  try {
    const ranks = await fetchMostPlayed();
    if (!ranks.length) throw new Error('no data');

    ranks.forEach(r => {
      const game = GAMES.find(g => g.appid === r.appid);
      if (game) game.peak_in_game = r.peak_in_game;
    });

    const unknownIds = ranks
      .filter(r => !KNOWN_APPIDS.has(r.appid))
      .slice(0, 20)
      .map(r => ({ appid: r.appid, peak_in_game: r.peak_in_game }));

    if (!unknownIds.length) {
      statusEl.innerHTML = '';
      return;
    }

    const details = await fetchAppDetails(unknownIds.map(x => x.appid));

    unknownIds.forEach(({ appid, peak_in_game }) => {
      const info = details[appid.toString()];
      if (!info) return;

      const guessed = guessZone(info.genres);
      const card = createGameCard({
        appid,
        name:         info.name,
        header_image: info.header_image,
        genre:        info.genres.join(', ') || '—',
        desc:         '',
        zone:         guessed,
        peak_in_game,
      }, true);
      grid.appendChild(card);
    });

    statusEl.innerHTML = '';
    if (grid.children.length) {
      animate('#discover-grid .game-card', { opacity:[0,1], translateY:[14,0], duration:450, delay:stagger(30), ease:'outQuart' });
    }

  } catch {
    statusEl.innerHTML = `<span class="discover-error">${t('discover.error')}</span>`;
  }
}

/* ══ BAR CHART ══ */
function renderChart() {
  const container = document.getElementById('chart-container');
  if (!container) return;
  container.innerHTML = '';
  GAMES.filter(g => CHART_GAMES.includes(g.name)).forEach(game => {
    const row = document.createElement('div');
    row.className = 'chart-row';
    row.innerHTML = `
      <div class="chart-game-name">${game.name}</div>
      <div class="chart-bars">
        ${['micro','meso','macro'].map(l=>`
          <div class="chart-bar-row">
            <div class="bar-track"><div class="bar-fill ${l}" data-val="${game[l]}"></div></div>
            <span class="chart-score">${game[l]}</span>
          </div>`).join('')}
      </div>`;
    container.appendChild(row);
  });
}

function setupChartObserver() {
  let done=false;
  new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting && !done){
      done=true;
      document.querySelectorAll('.bar-fill').forEach(b=>{ b.style.width=`${+b.dataset.val*10}%`; });
    }
  },{threshold:0.25}).observe(document.getElementById('chart')??document.body);
}

/* ══ GAME MODAL ══ */
function closeGameModal() {
  const modal = document.getElementById('game-modal');
  const panel = modal?.querySelector('.modal-panel');
  if (!panel || modal.classList.contains('hidden')) return;
  animate(panel, {
    opacity:[1,0], translateY:[0,-16], scale:[1,0.97], duration:230, ease:'inQuart',
    onComplete:() => modal.classList.add('hidden'),
  });
}

async function openGameModal(game) {
  const modal   = document.getElementById('game-modal');
  const content = document.getElementById('modal-content');
  const panel   = modal.querySelector('.modal-panel');

  modal.classList.remove('hidden');
  content.innerHTML = `<div class="modal-loading"><div class="loading-ring"></div><span>${t('modal.loading')}</span></div>`;
  animate(panel, { opacity:[0,1], translateY:[-24,0], scale:[0.97,1], duration:380, ease:'outExpo' });

  let sd = { shortDescription:null, metacriticScore:null, metacriticUrl:null, reviewScoreDesc:null, totalPositive:0, totalReviews:0 };
  if (game.appid) {
    try { sd = await fetchGameDetail(game.appid, steamLang()); } catch {}
  }

  const imgUrl    = game.header_image ?? (game.appid ? steamHeaderUrl(game.appid) : null);
  const zoneInfo  = ZONE_INFO[game.zone] ?? {};
  const reviewPct = sd.totalReviews > 0 ? Math.round(sd.totalPositive / sd.totalReviews * 100) : null;
  const mcScore   = sd.metacriticScore;
  const locale    = currentLang === 'fr' ? 'fr-FR' : 'en-US';
  const reviewWord = currentLang === 'fr' ? 'avis' : 'reviews';

  const reviewColor = reviewPct == null ? '' : reviewPct >= 80 ? 'review-positive' : reviewPct >= 60 ? 'review-mixed' : 'review-negative';
  const mcColor     = mcScore  == null ? '' : mcScore  >= 75   ? 'mc-green'        : mcScore  >= 50   ? 'mc-yellow'   : 'mc-red';

  content.innerHTML = `
    <div class="modal-header">
      ${imgUrl ? `<img class="modal-hero-img" src="${imgUrl}" alt="${game.name}" onerror="this.style.display='none'">` : ''}
      <div class="modal-title-area">
        <span class="game-zone-badge badge-${game.zone}">${(zoneLabel(game.zone) ?? game.zone ?? '').toUpperCase()}</span>
        <h2 class="modal-game-title">${game.name ?? `AppID ${game.appid}`}</h2>
        <p class="modal-genre">${localizeGenre(game.genre)}</p>
      </div>
    </div>

    <div class="modal-body">
      <div class="modal-desc-section">
        <h4 class="modal-section-label">${t('modal.desc')}</h4>
        <p class="modal-desc-text">${sd.shortDescription || game.desc || `<em style="color:var(--dim)">${t('modal.no.desc')}</em>`}</p>
      </div>

      ${(mcScore != null || reviewPct != null) ? `
      <div class="modal-scores-row">
        ${mcScore != null ? `
          <div class="score-block">
            <span class="score-block-label">Metacritic</span>
            ${sd.metacriticUrl
              ? `<a class="metacritic-score ${mcColor}" href="${sd.metacriticUrl}" target="_blank" rel="noopener">${mcScore}</a>`
              : `<div class="metacritic-score ${mcColor}">${mcScore}</div>`}
          </div>` : ''}
        ${reviewPct != null ? `
          <div class="score-block">
            <span class="score-block-label">${t('modal.reviews')}</span>
            <div class="steam-review ${reviewColor}">
              <span class="review-pct">${reviewPct}%</span>
              <span class="review-badge">${sd.reviewScoreDesc}</span>
              <span class="review-count">${sd.totalReviews.toLocaleString(locale)} ${reviewWord}</span>
            </div>
          </div>` : ''}
      </div>` : ''}

      <div class="modal-layer-section">
        <h4 class="modal-section-label">${t('modal.classif')}</h4>
        ${game.micro != null ? `
          <div class="modal-bars">
            ${['micro','meso','macro'].map(l => `
              <div class="modal-bar-row">
                <span class="modal-bar-lbl ${l}-text">${l[0].toUpperCase()+l.slice(1)}</span>
                <div class="bar-track"><div class="bar-fill ${l}" style="width:${(game[l]??0)*10}%"></div></div>
                <span class="chart-score">${game[l] ?? '?'}/10</span>
              </div>`).join('')}
          </div>`
        : `<p style="font-size:12px;color:var(--dim)">${t('modal.no.classif')}</p>`}
      </div>
    </div>

    ${game.appid ? `
    <div class="modal-footer">
      <a class="modal-steam-link" href="https://store.steampowered.com/app/${game.appid}" target="_blank" rel="noopener">${t('modal.steam')}</a>
    </div>` : ''}`;
}

function setupModal() {
  const modal = document.getElementById('game-modal');
  if (!modal) return;
  modal.querySelector('.modal-backdrop').addEventListener('click', closeGameModal);
  modal.querySelector('.modal-close').addEventListener('click', closeGameModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeGameModal();
  });
}

/* ══ INFO BUBBLES ══ */
function setupBubbles() {
  document.querySelectorAll('.info-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const b=document.getElementById(btn.dataset.target); if(!b) return;
      b.classList.remove('hidden');
      animate(b,{opacity:[0,1],scale:[0.96,1],duration:280,ease:'outQuart'});
    });
  });
  document.querySelectorAll('.bubble-close').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const b=document.getElementById(btn.dataset.bubble); if(!b) return;
      animate(b,{opacity:[1,0],scale:[1,0.96],duration:200,ease:'inQuart',
        onComplete:()=>b.classList.add('hidden')});
    });
  });
}

/* ══ LANG SWITCHER ══ */
function switchLang(lang) {
  if (lang === currentLang) return;
  setLang(lang);

  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === lang)
  );

  applyTranslations();

  // Re-render main games grid with current filter
  const activeFilter = document.querySelector('#filter-bar .filter-btn.active')?.dataset.filter ?? 'all';
  renderGames(activeFilter === 'all' ? 'all' : activeFilter);

  // Update discover badges + peak text (without re-fetching)
  document.querySelectorAll('.unclass-badge').forEach(el =>
    el.textContent = t('badge.unclass')
  );
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  document.querySelectorAll('.peak-players[data-peak]').forEach(el => {
    el.textContent = t('peak.players').replace('%n', Number(el.dataset.peak).toLocaleString(locale));
  });

  // Reset venn panel to placeholder (labels were in old language)
  const panel = document.getElementById('venn-info-panel');
  if (panel && !panel.querySelector('.vip-placeholder')) {
    panel.innerHTML = `<div class="vip-placeholder"><p>${t('venn.placeholder')}</p></div>`;
  }
}

function setupLangSwitcher() {
  const switcher = document.getElementById('lang-switcher');
  if (!switcher) return;
  switcher.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
    btn.addEventListener('click', () => switchLang(btn.dataset.lang));
  });
}

/* ══ INTRO ANIMATION ══ */
function runIntro() {
  const overlay=document.getElementById('intro-overlay');
  createTimeline({defaults:{ease:'outExpo'}})
    .add('.iv-micro',{opacity:[0,1],scale:[0.3,1],duration:950,transformOrigin:'170px 185px'})
    .add('.iv-macro',{opacity:[0,1],scale:[0.3,1],duration:950,transformOrigin:'330px 185px'},'-=650')
    .add('.iv-meso', {opacity:[0,1],scale:[0.3,1],duration:950,transformOrigin:'250px 315px'},'-=650')
    .add('.intro-venn',    {opacity:[0,1],duration:100},0)
    .add('.intro-title',   {opacity:[0,1],translateY:[20,0],duration:650},'-=350')
    .add('.intro-subtitle',{opacity:[0,1],translateY:[10,0],duration:500},'-=380')
    .add(overlay,{opacity:[1,0],duration:700,delay:950,ease:'inOutQuad',
      onComplete:()=>{ overlay.style.display='none'; animateHeroIn(); }});
}

function animateHeroIn() {
  animate('.hero-eyebrow,.hero-title,.hero-desc,.hero-pills,.cta-btn',
    {opacity:[0,1],translateY:[24,0],duration:650,delay:stagger(85),ease:'outExpo'});
  animate('.hero-venn-svg',{opacity:[0,1],scale:[0.92,1],duration:900,ease:'outBack'});
}

/* ══ SCROLL REVEAL ══ */
function setupReveal() {
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        animate(e.target,{opacity:[0,1],translateY:[32,0],duration:700,ease:'outExpo'});
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.07});
  document.querySelectorAll('.layer-card,.section-header,.venn-layout').forEach(el=>{
    el.style.opacity='0'; obs.observe(el);
  });
}

/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();      // set language from localStorage before anything renders
  renderGames();
  setupFilters();
  setupBubbles();
  renderChart();
  setupChartObserver();
  setupVenn();
  setupReveal();
  setupModal();
  setupLangSwitcher();
  requestAnimationFrame(()=>requestAnimationFrame(runIntro));
  loadSteamDiscover();
});
