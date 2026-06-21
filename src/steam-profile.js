export async function fetchSteamProfile(query) {
  const res = await fetch(`/api/steam-player?q=${encodeURIComponent(query.trim())}`, {
    signal: AbortSignal.timeout(12000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'fetch_failed');
  return data;
}

// Steam genre → rough Micro/Meso/Macro scores
const GENRE_SCORES = {
  'Action':                { micro: 8, meso: 5, macro: 4 },
  'Adventure':             { micro: 4, meso: 6, macro: 5 },
  'Casual':                { micro: 3, meso: 4, macro: 4 },
  'Free to Play':          { micro: 6, meso: 6, macro: 6 },
  'Massively Multiplayer': { micro: 6, meso: 7, macro: 8 },
  'RPG':                   { micro: 5, meso: 6, macro: 8 },
  'Racing':                { micro: 8, meso: 4, macro: 5 },
  'Simulation':            { micro: 2, meso: 4, macro: 9 },
  'Sports':                { micro: 7, meso: 6, macro: 5 },
  'Strategy':              { micro: 2, meso: 6, macro: 9 },
};

function estimateFromGenres(genres) {
  const known = genres.map(g => GENRE_SCORES[g]).filter(Boolean);
  if (!known.length) return null;
  return {
    micro: known.reduce((s, x) => s + x.micro, 0) / known.length,
    meso:  known.reduce((s, x) => s + x.meso,  0) / known.length,
    macro: known.reduce((s, x) => s + x.macro, 0) / known.length,
  };
}

/**
 * Analyze the user's top 20 most played games against our classified database.
 * Games in the database use exact scores; others are estimated from Steam genres.
 */
export function analyzePlaystyle(topGames, classifiedGames) {
  let wMicro = 0, wMeso = 0, wMacro = 0, wTotal = 0;
  const dbMatches = []; // games with exact DB scores (shown in "defining games" list)
  let analyzedTotal = 0; // DB matches + genre estimates

  for (const tg of topGames) {
    if ((tg.playtime ?? 0) < 30) continue;

    const cg = classifiedGames.find(g => g.appid && g.appid === tg.appid);
    let micro, meso, macro;

    if (cg) {
      ({ micro, meso, macro } = cg);
      dbMatches.push({ name: tg.name, playtime: tg.playtime });
    } else {
      const est = estimateFromGenres(tg.genres ?? []);
      if (!est) continue; // no genre data, skip
      ({ micro, meso, macro } = est);
    }

    const w = Math.log1p(tg.playtime); // log-scale weight: diminishing returns past 100h
    wMicro += micro * w;
    wMeso  += meso  * w;
    wMacro += macro * w;
    wTotal += w;
    analyzedTotal++;
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
    matchedGames:  dbMatches.sort((a, b) => b.playtime - a.playtime).slice(0, 8),
    matchedCount:  dbMatches.length,   // DB matches shown in "defining games"
    analyzedTotal, // DB + genre estimates (for stats display)
    totalGames:    topGames.length,
  };
}

/**
 * Easter egg: returns true if ≥30% of the top 20 games have adult content
 * Steam content descriptor IDs: 1 = Some Nudity, 2 = Frequent Nudity, 3 = Adult Only Sexual Content
 */
export function checkGoonerEgg(topGames) {
  if (!topGames?.length) return false;
  const adultCount = topGames.filter(g =>
    g.contentDescriptorIds?.some(id => [1, 2, 3].includes(id))
  ).length;
  return adultCount / topGames.length >= 0.3;
}
