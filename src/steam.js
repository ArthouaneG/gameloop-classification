/* ══ STEAM API ══
   Proxied via Vite dev server (vite.config.js)
   → /api/steam-charts  →  api.steampowered.com
   → /api/steam-store   →  store.steampowered.com
══════════════════════════════════════════════════ */

const CHARTS_URL = '/api/steam-charts/ISteamChartsService/GetMostPlayedGames/v1/';
const STORE_URL  = (ids) =>
  `/api/steam-store/api/appdetails?appids=${ids}&filters=basic,genres,categories&l=french`;

/** Safe fetch — returns null on any error */
async function safeFetch(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch the current Steam top-100 most played.
 * Returns array of { rank, appid, peak_in_game }
 */
export async function fetchMostPlayed() {
  const data = await safeFetch(CHARTS_URL);
  return data?.response?.ranks ?? [];
}

/**
 * Fetch basic details for a list of AppIDs (max 30 at a time).
 * Returns an object keyed by appid string.
 * Each value: { name, header_image, genres:[], type }
 */
export async function fetchAppDetails(appids) {
  if (!appids.length) return {};
  const batch = appids.slice(0, 30).join(',');
  const data  = await safeFetch(STORE_URL(batch));
  if (!data) return {};

  const result = {};
  for (const [id, entry] of Object.entries(data)) {
    if (entry.success && entry.data?.type === 'game') {
      result[id] = {
        name:         entry.data.name,
        header_image: entry.data.header_image,
        genres:       entry.data.genres?.map(g => g.description) ?? [],
      };
    }
  }
  return result;
}

/** Full detail for a single game: description + Metacritic + Steam reviews */
export async function fetchGameDetail(appid, lang = 'french') {
  const detailUrl = `/api/steam-store/api/appdetails?appids=${appid}&filters=basic,short_description,metacritic&l=${lang}`;
  const reviewUrl = `/api/steam-store/appreviews/${appid}?json=1&purchase_type=all&num_per_page=0&l=all`;

  const [detailData, reviewData] = await Promise.all([
    safeFetch(detailUrl),
    safeFetch(reviewUrl),
  ]);

  const entry = detailData?.[String(appid)];
  const data  = entry?.success ? entry.data : null;
  const qs    = reviewData?.query_summary;

  return {
    shortDescription: data?.short_description ?? null,
    metacriticScore:  data?.metacritic?.score  ?? null,
    metacriticUrl:    data?.metacritic?.url    ?? null,
    reviewScoreDesc:  qs?.review_score_desc    ?? null,
    totalPositive:    qs?.total_positive       ?? 0,
    totalNegative:    qs?.total_negative       ?? 0,
    totalReviews:     qs?.total_reviews        ?? 0,
  };
}

/** CDN header image URL (460×215) — no API required */
export function steamHeaderUrl(appid) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
}

/** Attempt a rough genre-based zone guess for unclassified games */
export function guessZone(genres = []) {
  const g = genres.map(x => x.toLowerCase());
  const isAction   = g.some(x => ['action'].includes(x));
  const isStrategy = g.some(x => ['strategy'].includes(x));
  const isRPG      = g.some(x => ['rpg'].includes(x));
  const isSim      = g.some(x => ['simulation'].includes(x));

  if (isAction && isStrategy) return 'micro-macro';
  if (isAction)               return 'micro-meso';
  if (isStrategy || isSim)    return 'macro';
  if (isRPG)                  return 'meso-macro';
  return null; // truly unknown
}
