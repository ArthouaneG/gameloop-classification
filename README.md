# GameLoop — Micro · Meso · Macro

An interactive video game classification site based on [Surnex](https://www.youtube.com/@real_surnex)'s Micro / Meso / Macro game design theory.

## What is it?

Every video game can be broken down across three layers:

- **Micro** — Execution Layer: aim, timing, precision, combos
- **Meso** — Probability Layer: game sense, adaptation, reading opponents
- **Macro** — Systems Layer: economy, build orders, meta optimization

This site visualizes 80+ games as a Venn diagram showing where each game falls across these three dimensions.

## Features

- Interactive Venn diagram with zone filtering
- 80+ classified games with layer scores
- Community vote system to classify games
- Steam Discovery — top played games from the Steam charts
- Game detail modal with Steam description, Metacritic score, and Steam reviews
- Comparative bar chart
- Bilingual interface (FR / EN) with Steam descriptions in the selected language

## Tech stack

- **Vite.js** — fast modern build tooling
- **Anime.js v4** — animations
- **Steam API** — live game data (proxied via Vercel rewrites)
- **localStorage** — community votes

## Credits

Theory created by **[Surnex](https://www.youtube.com/@real_surnex)** — American YouTube creator specializing in human performance and cognition in gaming.
Original video: [youtube.com/watch?v=NgHvdCcmQ4o](https://www.youtube.com/watch?v=NgHvdCcmQ4o)

## Development

```bash
npm install
npm run dev
```

## Deploy

Configured for [Vercel](https://vercel.com) — import the repo and it deploys automatically.
The `vercel.json` handles Steam API proxying for production.

## License

MIT
