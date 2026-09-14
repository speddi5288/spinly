# Spinly

A Ninja CREAMi recipe app built with React, JavaScript, Vite, and regular CSS.

Step 1 implements the responsive app shell: branding, working section navigation, a landing page, an empty recipe collection, and a “How it works” section. Recipe browsing, filters, accounts, and submissions follow the checkpoints in [PLAN.md](./PLAN.md).

## Run locally

Install a supported Node.js LTS release compatible with Vite (Node 22.12+ or 24.x). This project was verified with Node 24.14.1 and npm 11.11.0.

Open a terminal in this `spinly` folder, then run:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, normally http://localhost:5173. Stop the server with Ctrl+C. Python, database configuration, and environment variables are not needed for this step.

For a reproducible install from the included lockfile, use `npm ci` instead of `npm install`.

## Check and build

```sh
npm run lint
npm run build
npm run preview
```

The production files are generated in `dist/`. `npm run preview` serves them locally, normally on port 4173.

## Files

- `src/App.jsx`: app shell and page sections.
- `src/styles.css`: theme, layout, responsive styles, and focus states.
- `public/pint.svg`: original decorative pint illustration.
- `PLAN.md`: implementation checklist and verification results.

Images and fonts have no external network dependencies. The later Supabase integration will provide shared recipe storage and authentication.
