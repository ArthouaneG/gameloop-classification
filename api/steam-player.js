import Database from 'better-sqlite3';
import path from 'path';

// Open DB once per warm function instance (readonly, no WAL needed)
const db       = new Database(path.join(process.cwd(), 'data', 'games.db'), { readonly: true });
const stmtGame = db.prepare('SELECT micro, meso, macro, zone, adult, curated FROM games WHERE appid = ?');

export default async function handler(req, res) {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: 'STEAM_API_KEY not set' });
  }

  const raw = String(req.query.q ?? '').trim();
  if (!raw) return res.status(400).json({ error: 'Missing ?q parameter' });

  let steamid = null;
  let vanity  = null;

  const profileMatch = raw.match(/\/profiles\/(\d{15,})/);
  const idMatch      = raw.match(/\/id\/([^/?#\s]+)/);
  if (profileMatch)               steamid = profileMatch[1];
  else if (idMatch)               vanity  = idMatch[1];
  else if (/^\d{15,}$/.test(raw)) steamid = raw;
  else                             vanity  = raw;

  if (vanity) {
    const data = await safeFetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(vanity)}`
    );
    if (data?.response?.success === 1) steamid = data.response.steamid;
    else return res.status(404).json({ error: 'profile_not_found' });
  }

  const [summary, games] = await Promise.all([
    safeFetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamid}`),
    safeFetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true&format=json`),
  ]);

  const player = summary?.response?.players?.[0];
  if (!player) return res.status(404).json({ error: 'profile_not_found' });

  const gameList = (games?.response?.games ?? []).map(g => ({
    appid:    g.appid,
    name:     g.name ?? '',
    playtime: g.playtime_forever ?? 0,
  }));

  // Top 20 most played — enrich with DB scores (no Steam Store calls needed)
  const top20 = gameList
    .filter(g => g.playtime > 0)
    .sort((a, b) => b.playtime - a.playtime)
    .slice(0, 20);

  const dbEnriched = top20.map(g => {
    const row = stmtGame.get(g.appid);
    return { ...g, row };
  });

  // For games missing from DB, fetch genres from Steam Store API (max 20 individual calls)
  const missing = dbEnriched.filter(g => !g.row);
  if (missing.length) {
    const storeResults = await Promise.all(
      missing.map(g =>
        safeFetch(
          `https://store.steampowered.com/api/appdetails?appids=${g.appid}&filters=genres,content_descriptors`,
          5000
        )
      )
    );
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
    for (let i = 0; i < missing.length; i++) {
      const entry = storeResults[i]?.[String(missing[i].appid)];
      const d     = entry?.success ? entry.data : null;
      if (!d?.genres?.length) continue;
      const known = d.genres
        .map(g => GENRE_SCORES[g.description.toLowerCase()])
        .filter(Boolean);
      if (!known.length) continue;
      missing[i].row = {
        micro:   known.reduce((s, x) => s + x.micro, 0) / known.length,
        meso:    known.reduce((s, x) => s + x.meso,  0) / known.length,
        macro:   known.reduce((s, x) => s + x.macro, 0) / known.length,
        zone:    null,
        adult:   0,
        curated: 0,
      };
    }
  }

  const topGames = dbEnriched.map(g => ({
    appid:    g.appid,
    name:     g.name,
    playtime: g.playtime,
    micro:    g.row?.micro   ?? null,
    meso:     g.row?.meso    ?? null,
    macro:    g.row?.macro   ?? null,
    zone:     g.row?.zone    ?? null,
    adult:    g.row?.adult   ?? 0,
    curated:  g.row?.curated ?? 0,
    inDb:     !!g.row,
  }));

  res.setHeader('Cache-Control', 's-maxage=300');
  return res.status(200).json({
    steamId:    steamid,
    name:       player.personaname,
    avatar:     player.avatarmedium,
    profileUrl: player.profileurl,
    games:      gameList,
    topGames,
  });
}

async function safeFetch(url, timeoutMs = 8000) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    return r.ok ? r.json() : null;
  } catch { return null; }
}
