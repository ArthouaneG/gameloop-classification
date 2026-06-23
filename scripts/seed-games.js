/**
 * Seed script — builds data/games.db with the most popular Steam games.
 *
 * Strategy:
 * 1. Fetch 5 SteamSpy bulk pages (5000 games with CCU data)
 * 2. Sort ALL games by CCU descending → take top N by actual popularity
 * 3. For each: fetch SteamSpy appdetails → real genre + adult tags
 * 4. Estimate Micro/Meso/Macro scores from genre; curated games use exact scores
 *
 * Usage:   node scripts/seed-games.js [count=2500]
 * Default: 2500 games (takes ~15-20 min due to SteamSpy rate limit)
 * Quick:   node scripts/seed-games.js 500
 */
import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');
const DB_PATH   = path.join(ROOT, 'data', 'games.db');

// ── Curated games with hand-crafted scores
const CURATED = [
  { appid: 504230,  name: 'Celeste',                  micro: 9,  meso: 2,  macro: 2,  zone: 'micro' },
  { appid: 322170,  name: 'Geometry Dash',             micro: 10, meso: 1,  macro: 1,  zone: 'micro' },
  { appid: 1058830, name: 'Spin Rhythm XD',            micro: 9,  meso: 2,  macro: 1,  zone: 'micro' },
  { appid: 531510,  name: 'Just Shapes & Beats',       micro: 9,  meso: 2,  macro: 1,  zone: 'micro' },
  { appid: 945360,  name: 'Among Us',                  micro: 2,  meso: 9,  macro: 2,  zone: 'meso' },
  { appid: 739630,  name: 'Phasmophobia',              micro: 3,  meso: 9,  macro: 2,  zone: 'meso' },
  { appid: 1092790, name: 'Inscryption',               micro: 2,  meso: 8,  macro: 4,  zone: 'meso' },
  { appid: 427520,  name: 'Factorio',                  micro: 2,  meso: 3,  macro: 10, zone: 'macro' },
  { appid: 526870,  name: 'Satisfactory',              micro: 2,  meso: 2,  macro: 10, zone: 'macro' },
  { appid: 1366540, name: 'Dyson Sphere Program',      micro: 2,  meso: 2,  macro: 10, zone: 'macro' },
  { appid: 457140,  name: 'Oxygen Not Included',       micro: 2,  meso: 3,  macro: 9,  zone: 'macro' },
  { appid: 294100,  name: 'Rimworld',                  micro: 2,  meso: 4,  macro: 9,  zone: 'macro' },
  { appid: 255710,  name: 'Cities: Skylines',          micro: 1,  meso: 2,  macro: 9,  zone: 'macro' },
  { appid: 289070,  name: 'Civilization VI',            micro: 1,  meso: 5,  macro: 10, zone: 'macro' },
  { appid: 236850,  name: 'Europa Universalis IV',      micro: 1,  meso: 4,  macro: 10, zone: 'macro' },
  { appid: 394360,  name: 'Hearts of Iron IV',          micro: 2,  meso: 5,  macro: 10, zone: 'macro' },
  { appid: 1158310, name: 'Crusader Kings III',         micro: 1,  meso: 5,  macro: 9,  zone: 'macro' },
  { appid: 281990,  name: 'Stellaris',                  micro: 1,  meso: 4,  macro: 10, zone: 'macro' },
  { appid: 529340,  name: 'Victoria 3',                 micro: 1,  meso: 4,  macro: 10, zone: 'macro' },
  { appid: 916440,  name: 'Anno 1800',                  micro: 2,  meso: 4,  macro: 9,  zone: 'macro' },
  { appid: 2252570, name: 'Football Manager 2024',      micro: 1,  meso: 6,  macro: 9,  zone: 'macro' },
  { appid: 1222670, name: 'The Sims 4',                 micro: 1,  meso: 3,  macro: 7,  zone: 'macro' },
  { appid: 1245620, name: 'Elden Ring',                 micro: 9,  meso: 4,  macro: 8,  zone: 'micro-macro' },
  { appid: 374320,  name: 'Dark Souls III',             micro: 9,  meso: 4,  macro: 7,  zone: 'micro-macro' },
  { appid: 814380,  name: 'Sekiro: Shadows Die Twice',  micro: 10, meso: 4,  macro: 7,  zone: 'micro-macro' },
  { appid: 367520,  name: 'Hollow Knight',              micro: 8,  meso: 4,  macro: 7,  zone: 'micro-macro' },
  { appid: 582010,  name: 'Monster Hunter: World',      micro: 8,  meso: 4,  macro: 8,  zone: 'micro-macro' },
  { appid: 1446780, name: 'Monster Hunter Rise',        micro: 8,  meso: 4,  macro: 8,  zone: 'micro-macro' },
  { appid: 601150,  name: 'Devil May Cry 5',            micro: 10, meso: 3,  macro: 6,  zone: 'micro-macro' },
  { appid: 782330,  name: 'DOOM Eternal',               micro: 9,  meso: 5,  macro: 7,  zone: 'micro-macro' },
  { appid: 230410,  name: 'Warframe',                   micro: 8,  meso: 4,  macro: 9,  zone: 'micro-macro' },
  { appid: 1145360, name: 'Hades',                      micro: 8,  meso: 5,  macro: 7,  zone: 'micro-macro' },
  { appid: 1801505, name: 'Hades II',                   micro: 8,  meso: 5,  macro: 7,  zone: 'micro-macro' },
  { appid: 105600,  name: 'Terraria',                   micro: 7,  meso: 4,  macro: 8,  zone: 'micro-macro' },
  { appid: 1627720, name: 'Lies of P',                  micro: 9,  meso: 4,  macro: 7,  zone: 'micro-macro' },
  { appid: 292030,  name: 'The Witcher 3',              micro: 6,  meso: 5,  macro: 7,  zone: 'micro-macro' },
  { appid: 990080,  name: 'Hogwarts Legacy',            micro: 7,  meso: 4,  macro: 7,  zone: 'micro-macro' },
  { appid: 1091500, name: 'Cyberpunk 2077',             micro: 7,  meso: 5,  macro: 8,  zone: 'micro-macro' },
  { appid: 379720,  name: 'DOOM (2016)',                 micro: 9,  meso: 4,  macro: 6,  zone: 'micro-macro' },
  { appid: 730,     name: 'Counter-Strike 2',            micro: 10, meso: 9,  macro: 9,  zone: 'all-three' },
  { appid: 594650,  name: 'Hunt: Showdown 1896',         micro: 8,  meso: 8,  macro: 8,  zone: 'all-three' },
  { appid: 359550,  name: 'Rainbow Six Siege',           micro: 8,  meso: 9,  macro: 8,  zone: 'all-three' },
  { appid: 1517290, name: 'Battlefield 2042',            micro: 7,  meso: 7,  macro: 7,  zone: 'all-three' },
  { appid: 686810,  name: 'Hell Let Loose',              micro: 7,  meso: 8,  macro: 8,  zone: 'all-three' },
  { appid: 2073850, name: 'The Finals',                  micro: 8,  meso: 7,  macro: 7,  zone: 'all-three' },
  { appid: 570,     name: 'Dota 2',                      micro: 9,  meso: 8,  macro: 10, zone: 'all-three' },
  { appid: 252950,  name: 'Rocket League',               micro: 9,  meso: 8,  macro: 7,  zone: 'all-three' },
  { appid: 1142710, name: 'Total War: Warhammer III',    micro: 7,  meso: 7,  macro: 9,  zone: 'all-three' },
  { appid: 1599340, name: 'Lost Ark',                    micro: 8,  meso: 8,  macro: 9,  zone: 'all-three' },
  { appid: 271590,  name: 'Grand Theft Auto V',          micro: 7,  meso: 7,  macro: 7,  zone: 'all-three' },
  { appid: 892970,  name: 'Valheim',                     micro: 7,  meso: 7,  macro: 8,  zone: 'all-three' },
  { appid: 346110,  name: 'ARK: Survival Evolved',       micro: 6,  meso: 7,  macro: 9,  zone: 'all-three' },
  { appid: 1623730, name: 'Palworld',                    micro: 7,  meso: 7,  macro: 8,  zone: 'all-three' },
  { appid: 275850,  name: "No Man's Sky",                micro: 5,  meso: 6,  macro: 8,  zone: 'all-three' },
  { appid: 1172470, name: 'Apex Legends',                micro: 9,  meso: 8,  macro: 7,  zone: 'all-three' },
  { appid: 440,     name: 'Team Fortress 2',             micro: 8,  meso: 7,  macro: 4,  zone: 'micro-meso' },
  { appid: 548430,  name: 'Deep Rock Galactic',          micro: 7,  meso: 7,  macro: 4,  zone: 'micro-meso' },
  { appid: 550,     name: 'Left 4 Dead 2',               micro: 7,  meso: 7,  macro: 3,  zone: 'micro-meso' },
  { appid: 381210,  name: 'Dead by Daylight',            micro: 7,  meso: 8,  macro: 4,  zone: 'micro-meso' },
  { appid: 1097150, name: 'Fall Guys',                   micro: 7,  meso: 7,  macro: 3,  zone: 'micro-meso' },
  { appid: 252490,  name: 'Rust',                        micro: 7,  meso: 8,  macro: 5,  zone: 'micro-meso' },
  { appid: 646570,  name: 'Slay the Spire',              micro: 3,  meso: 8,  macro: 9,  zone: 'meso-macro' },
  { appid: 2379780, name: 'Balatro',                     micro: 2,  meso: 8,  macro: 9,  zone: 'meso-macro' },
  { appid: 238960,  name: 'Path of Exile',               micro: 4,  meso: 7,  macro: 9,  zone: 'meso-macro' },
  { appid: 2694490, name: 'Path of Exile 2',             micro: 4,  meso: 7,  macro: 9,  zone: 'meso-macro' },
  { appid: 1086940, name: "Baldur's Gate 3",             micro: 3,  meso: 8,  macro: 9,  zone: 'meso-macro' },
  { appid: 268500,  name: 'XCOM 2',                      micro: 3,  meso: 8,  macro: 8,  zone: 'meso-macro' },
  { appid: 1102190, name: 'Monster Train',               micro: 2,  meso: 7,  macro: 9,  zone: 'meso-macro' },
  { appid: 413150,  name: 'Stardew Valley',              micro: 2,  meso: 6,  macro: 8,  zone: 'meso-macro' },
  { appid: 435150,  name: 'Divinity: Original Sin 2',    micro: 3,  meso: 8,  macro: 8,  zone: 'meso-macro' },
  { appid: 1282730, name: 'Loop Hero',                   micro: 2,  meso: 6,  macro: 9,  zone: 'meso-macro' },
  { appid: 590380,  name: 'Into the Breach',             micro: 3,  meso: 8,  macro: 8,  zone: 'meso-macro' },
  { appid: 578080,  name: 'PUBG: Battlegrounds',         micro: 8,  meso: 8,  macro: 7,  zone: 'all-three' },
];

// ── Genre → Micro/Meso/Macro (case-insensitive match against Steam/SteamSpy genre names)
const GENRE_SCORES = {
  'action':                { micro: 8, meso: 5, macro: 4 },
  'adventure':             { micro: 4, meso: 6, macro: 5 },
  'casual':                { micro: 3, meso: 4, macro: 4 },
  'free to play':          { micro: 6, meso: 6, macro: 6 },
  'massively multiplayer': { micro: 6, meso: 7, macro: 8 },
  'rpg':                   { micro: 5, meso: 6, macro: 8 },
  'racing':                { micro: 8, meso: 4, macro: 5 },
  'simulation':            { micro: 2, meso: 4, macro: 9 },
  'sports':                { micro: 7, meso: 6, macro: 5 },
  'strategy':              { micro: 2, meso: 6, macro: 9 },
};

// SteamSpy tags that indicate adult/nudity content
const ADULT_TAGS = new Set([
  'Nudity', 'Sexual Content', 'Adult Content', 'NSFW',
  'Hentai', 'Explicit Sexual Content', 'Eroge', 'Sexual',
  'Mature Sexual Content', 'Adult Only',
]);

function estimateFromGenres(genreStr) {
  const known = (genreStr || '').split(',')
    .map(g => GENRE_SCORES[g.toLowerCase().trim()])
    .filter(Boolean);
  if (!known.length) return null;
  return {
    micro: known.reduce((s, x) => s + x.micro, 0) / known.length,
    meso:  known.reduce((s, x) => s + x.meso,  0) / known.length,
    macro: known.reduce((s, x) => s + x.macro, 0) / known.length,
  };
}

function computeZone(micro, meso, macro) {
  const T = 5.5;
  const m = micro >= T, s = macro >= T, p = meso >= T;
  if (m && s && p) return 'all-three';
  if (m && s)      return 'micro-macro';
  if (m && p)      return 'micro-meso';
  if (s && p)      return 'meso-macro';
  if (m)           return 'micro';
  if (s)           return 'macro';
  if (p)           return 'meso';
  if (micro >= meso && micro >= macro) return 'micro';
  if (macro >= micro && macro >= meso) return 'macro';
  return 'meso';
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchBulkPage(page) {
  const res = await fetch(`https://steamspy.com/api.php?request=all&page=${page}`);
  if (!res.ok) throw new Error(`SteamSpy page ${page}: HTTP ${res.status}`);
  return res.json();
}

// Fetch full details for one appid from SteamSpy (genre + tags).
async function fetchSpyDetails(appid) {
  try {
    const res = await fetch(`https://steamspy.com/api.php?request=appdetails&appid=${appid}`,
      { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d?.appid) return null;
    // Tags: array of strings in individual appdetails
    const tags = Array.isArray(d.tags) ? d.tags
      : typeof d.tags === 'object' ? Object.keys(d.tags)
      : [];
    return { genre: d.genre ?? '', tags };
  } catch { return null; }
}

async function main() {
  const TARGET = parseInt(process.argv[2] ?? '2500', 10);
  console.log(`Target: ${TARGET} games (sorted by CCU)\n`);

  // ── Step 1: Fetch bulk pages for CCU data
  console.log('Step 1 — Fetching SteamSpy bulk pages (CCU data)...');
  const allGames = {};
  for (let p = 0; p < 5; p++) {
    process.stdout.write(`  Page ${p}... `);
    const data = await fetchBulkPage(p);
    console.log(`${Object.keys(data).length} games`);
    Object.assign(allGames, data);
    if (p < 4) await sleep(1500);
  }

  // ── Step 2: Sort by CCU descending, take top TARGET
  const sorted = Object.values(allGames)
    .filter(g => g.appid && g.name)
    .sort((a, b) => (b.ccu ?? 0) - (a.ccu ?? 0))
    .slice(0, TARGET);

  console.log(`\nTop ${sorted.length} games by CCU (highest: ${sorted[0]?.name} ${sorted[0]?.ccu} CCU)`);

  // ── Step 3: Init DB
  if (!existsSync(path.join(ROOT, 'data'))) mkdirSync(path.join(ROOT, 'data'));
  const db = new Database(DB_PATH);
  db.exec(`
    DROP TABLE IF EXISTS games;
    CREATE TABLE games (
      appid   INTEGER PRIMARY KEY,
      name    TEXT    NOT NULL,
      genre   TEXT    DEFAULT '',
      micro   REAL,
      meso    REAL,
      macro   REAL,
      zone    TEXT,
      adult   INTEGER NOT NULL DEFAULT 0,
      curated INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX idx_zone ON games(zone);
  `);

  const curatedMap = new Map(CURATED.map(g => [g.appid, g]));
  const insert     = db.prepare(`
    INSERT OR REPLACE INTO games (appid, name, genre, micro, meso, macro, zone, adult, curated)
    VALUES (@appid, @name, @genre, @micro, @meso, @macro, @zone, @adult, @curated)
  `);
  const insertAll  = db.transaction(rows => { for (const r of rows) insert.run(r); });

  // ── Step 4: Insert curated games (exact scores, no fetch needed)
  insertAll(CURATED.map(c => ({
    appid: c.appid, name: c.name, genre: '', micro: c.micro, meso: c.meso,
    macro: c.macro, zone: c.zone, adult: 0, curated: 1,
  })));
  console.log(`Inserted ${CURATED.length} curated games.`);

  // ── Step 5: Fetch SteamSpy appdetails for non-curated top games
  const nonCurated = sorted.filter(g => !curatedMap.has(g.appid));
  console.log(`\nStep 2 — Fetching SteamSpy appdetails for ${nonCurated.length} games...`);
  console.log(`  Sequential, 1.1s per request (~${Math.ceil(nonCurated.length * 1.1 / 60)} min)\n`);

  let scored = 0, noData = 0;
  const batch = [];

  for (let i = 0; i < nonCurated.length; i++) {
    const g    = nonCurated[i];
    const data = await fetchSpyDetails(g.appid);

    if (!data) { noData++; }
    else {
      const est = estimateFromGenres(data.genre);
      if (!est) { noData++; }
      else {
        const adult = data.tags.some(t => ADULT_TAGS.has(t)) ? 1 : 0;
        batch.push({
          appid: g.appid, name: g.name, genre: data.genre,
          micro: est.micro, meso: est.meso, macro: est.macro,
          zone: computeZone(est.micro, est.meso, est.macro),
          adult, curated: 0,
        });
        scored++;
      }
    }

    // Flush batch every 50 rows
    if (batch.length >= 50) { insertAll([...batch]); batch.length = 0; }

    if (i % 50 === 0 || i === nonCurated.length - 1) {
      process.stdout.write(`  ${i + 1}/${nonCurated.length} — scored: ${scored}, skipped: ${noData}\r`);
    }

    await sleep(1100); // ~1 req/s per SteamSpy guidelines
  }

  if (batch.length) insertAll([...batch]);
  console.log(`\n`);

  // ── Stats
  const total     = db.prepare('SELECT COUNT(*) AS n FROM games').get().n;
  const withScore = db.prepare('SELECT COUNT(*) AS n FROM games WHERE micro IS NOT NULL').get().n;
  const adults    = db.prepare('SELECT COUNT(*) AS n FROM games WHERE adult = 1').get().n;
  console.log(`Done:`);
  console.log(`  Total in DB:    ${total}`);
  console.log(`  Scored:         ${withScore}  (${CURATED.length} curated + ${scored} estimated)`);
  console.log(`  Adult flagged:  ${adults}`);
  console.log(`  No data/genre:  ${noData}`);
  db.close();
  console.log(`\nDB saved → ${DB_PATH}`);
}

main().catch(e => { console.error(e); process.exit(1); });
