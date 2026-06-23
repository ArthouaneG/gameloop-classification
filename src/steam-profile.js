export async function fetchSteamProfile(query) {
  const res = await fetch(`/api/steam-player?q=${encodeURIComponent(query.trim())}`, {
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'fetch_failed');
  return data;
}

/**
 * Analyze the user's top 20 most played games.
 * topGames come pre-scored from the DB (micro/meso/macro/curated/inDb fields).
 */
export function analyzePlaystyle(topGames) {
  let wMicro = 0, wMeso = 0, wMacro = 0, wTotal = 0;
  const curatedMatches = []; // curated games shown in "defining games"
  let analyzedTotal    = 0;  // all DB hits (curated + estimated)

  for (const tg of topGames) {
    if ((tg.playtime ?? 0) < 30) continue;
    if (!tg.inDb || tg.micro === null) continue;

    const w = Math.log1p(tg.playtime);
    wMicro += tg.micro * w;
    wMeso  += tg.meso  * w;
    wMacro += tg.macro * w;
    wTotal += w;
    analyzedTotal++;

    if (tg.curated) curatedMatches.push({ name: tg.name, playtime: tg.playtime });
  }

  if (wTotal === 0) return null;

  const micro = wMicro / wTotal;
  const meso  = wMeso  / wTotal;
  const macro = wMacro / wTotal;

  const T = 5.5;
  const m = micro >= T, s = macro >= T, p = meso >= T;
  let zone;
  if      (m && s && p) zone = 'all-three';
  else if (m && s)      zone = 'micro-macro';
  else if (m && p)      zone = 'micro-meso';
  else if (s && p)      zone = 'meso-macro';
  else if (m)           zone = 'micro';
  else if (s)           zone = 'macro';
  else if (p)           zone = 'meso';
  else if (micro >= meso && micro >= macro) zone = 'micro';
  else if (macro >= micro && macro >= meso) zone = 'macro';
  else                                       zone = 'meso';

  return {
    micro, meso, macro, zone,
    matchedGames:  curatedMatches.sort((a, b) => b.playtime - a.playtime).slice(0, 8),
    matchedCount:  curatedMatches.length,
    analyzedTotal,
    totalGames:    topGames.length,
  };
}

/**
 * Easter egg: true if ≥30% of top games have adult/nudity tags (set at seed time).
 * Uses DB `adult` flag from SteamSpy tags — NOT Steam content descriptor IDs
 * (ID 2 = "Violence/Gore", not nudity, which made this fire for all action game players).
 */
export function checkGoonerEgg(topGames) {
  if (!topGames?.length) return false;
  const adultCount = topGames.filter(g => g.adult).length;
  return adultCount / topGames.length >= 0.3;
}
