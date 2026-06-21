export async function fetchSteamProfile(query) {
  const res = await fetch(`/api/steam-player?q=${encodeURIComponent(query.trim())}`, {
    signal: AbortSignal.timeout(12000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'fetch_failed');
  return data;
}

export function analyzePlaystyle(userGames, classifiedGames) {
  let wMicro = 0, wMeso = 0, wMacro = 0, wTotal = 0;
  const matched = [];

  for (const ug of userGames) {
    if ((ug.playtime ?? 0) < 30) continue; // skip < 30 min
    const cg = classifiedGames.find(g => g.appid && g.appid === ug.appid);
    if (!cg) continue;
    const w = Math.log1p(ug.playtime); // log-scale: diminishing returns for 1000h vs 100h
    wMicro += cg.micro * w;
    wMeso  += cg.meso  * w;
    wMacro += cg.macro * w;
    wTotal += w;
    matched.push({ ...cg, playtime: ug.playtime });
  }

  if (!matched.length) return null;

  const micro = wMicro / wTotal;
  const meso  = wMeso  / wTotal;
  const macro = wMacro / wTotal;

  // Determine zone: strongest layer combination above threshold
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
    matchedGames: matched.sort((a, b) => b.playtime - a.playtime).slice(0, 8),
    matchedCount: matched.length,
    totalGames:   userGames.length,
  };
}
