# KemetLeads 🌍

**Understand Africa before it makes the news.**

KemetLeads is an independent intelligence platform profiling the great leaders of Africa — past and present — with selected news commentary and political and business analysis for professionals and the diaspora.

## What's inside

- **Leaders Collection** — 18 honest profiles spanning liberation icons, contemporary heads of state, business builders, cultural voices, and global institution leaders. Each follows the KemetLeads format: *the rise · what they did · the full picture · why it matters · in their words.*
- **The Brief** — selected news with the KemetLeads take: the "so what" layer on the stories that matter.
- **Editorial** — the case for honest, balanced coverage of African leadership.
- **Membership tiers** — Free / Pro / Intelligence.
- **Newsletter signup** — captures emails via a simple API endpoint.

## Tech stack

- Node.js + Express (static hosting + a tiny `/api/subscribe` endpoint)
- Vanilla HTML/CSS/JS front end — no build step
- Deployed on [Railway](https://railway.app)

## Run locally

```bash
npm install
npm start
# open http://localhost:3000
```

## Deploy

The app reads `PORT` from the environment, so it runs on Railway, Render, Fly, or any Node host out of the box. `npm start` is the start command.

## Project structure

```
africaleads/
├── server.js          # Express server
├── package.json
└── public/
    ├── index.html     # The site
    ├── styles.css
    ├── app.js         # Rendering, filtering, search, modal, signup
    ├── leaders.js     # The leaders dataset
    └── news.js        # Selected news + commentary ("The Brief")
```

## Editing content

Add or edit leaders in `public/leaders.js`. Each entry needs:
`id, name, country, flag, era ("past"|"present"), category, years, role, tagline, rise, did, fullPicture, why, quote`.

---

*Profiles are editorial summaries for general information.*
