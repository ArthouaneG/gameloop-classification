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

  const topGames = top20.map(g => {
    const row = stmtGame.get(g.appid);
    return {
      ...g,
      micro:   row?.micro   ?? null,
      meso:    row?.meso    ?? null,
      macro:   row?.macro   ?? null,
      zone:    row?.zone    ?? null,
      adult:   row?.adult   ?? 0,
      curated: row?.curated ?? 0,
      inDb:    !!row,
    };
  });

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
