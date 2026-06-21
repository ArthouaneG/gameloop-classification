/* ══ VOTE SYSTEM — localStorage ══════════════════
   Community votes on game zone classification.
   One vote per game per browser (localStorage flag).
═════════════════════════════════════════════════ */

const KEY_VOTES = 'gameloop_votes';
const KEY_USER  = 'gameloop_user_votes';

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); }
  catch { return {}; }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Cast a vote for a game's zone.
 * Returns { votes, userVote, alreadyVoted }
 */
export function castVote(gameKey, zone) {
  const user = load(KEY_USER);
  if (user[gameKey]) {
    return { votes: load(KEY_VOTES)[gameKey] ?? {}, userVote: user[gameKey], alreadyVoted: true };
  }

  const votes = load(KEY_VOTES);
  if (!votes[gameKey]) votes[gameKey] = {};
  votes[gameKey][zone] = (votes[gameKey][zone] ?? 0) + 1;
  save(KEY_VOTES, votes);

  user[gameKey] = zone;
  save(KEY_USER, user);

  return { votes: votes[gameKey], userVote: zone, alreadyVoted: false };
}

/** Get all votes for a game. Returns { [zone]: count } */
export function getGameVotes(gameKey) {
  return load(KEY_VOTES)[gameKey] ?? {};
}

/** Get the zone this user voted for (or null) */
export function getUserVote(gameKey) {
  return load(KEY_USER)[gameKey] ?? null;
}

/** Total vote count for a game */
export function getTotalVotes(gameKey) {
  return Object.values(getGameVotes(gameKey)).reduce((a, b) => a + b, 0);
}

/** Zone with the most community votes (or null) */
export function getTopVotedZone(gameKey) {
  const v = getGameVotes(gameKey);
  const entries = Object.entries(v);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

/** Top 3 voted zones sorted by count */
export function getVoteDistribution(gameKey) {
  const v = getGameVotes(gameKey);
  return Object.entries(v)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}
