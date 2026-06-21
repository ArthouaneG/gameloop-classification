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

  // Parse Steam URL, SteamID64, or plain username
  const profileMatch = raw.match(/\/profiles\/(\d{15,})/);
  const idMatch      = raw.match(/\/id\/([^/?#\s]+)/);
  if (profileMatch)              steamid = profileMatch[1];
  else if (idMatch)              vanity  = idMatch[1];
  else if (/^\d{15,}$/.test(raw)) steamid = raw;
  else                            vanity  = raw;

  // Resolve vanity URL to SteamID64
  if (vanity) {
    const data = await safeFetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(vanity)}`
    );
    if (data?.response?.success === 1) {
      steamid = data.response.steamid;
    } else {
      return res.status(404).json({ error: 'profile_not_found' });
    }
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

  res.setHeader('Cache-Control', 's-maxage=300');
  return res.status(200).json({
    steamId:    steamid,
    name:       player.personaname,
    avatar:     player.avatarmedium,
    profileUrl: player.profileurl,
    games:      gameList,
  });
}

async function safeFetch(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return r.ok ? r.json() : null;
  } catch { return null; }
}
