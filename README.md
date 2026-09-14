# Spinly

Ninja CREAMi recipes, built with React, JavaScript, Vite, React Router, regular CSS, and optional Supabase.

## Features

- Browse, filter (calories, protein, carbs), and sort recipes. Nutrition is per tub.
- Recipe pages that name the right program for your machine (7-in-1, Deluxe, Scoop & Swirl), scale to your pint size, and switch between US and metric.
- Starter recipes ship with the app, with nutrition calculated from USDA FoodData Central.
- Pantry: pick what you have and see what you can make.
- Pint log: 24-hour freeze countdown, calendar reminders, ratings, and notes.
- Saved recipes.
- Accounts (optional): email sign-in, submit and edit your own recipes, and sync saved recipes, the pint log, and your machine across devices.

## Run locally

Requires Node 22.12+ (or 24.x).

```sh
npm install
npm run dev
```

Open http://localhost:5173. Without Supabase keys, the app runs on the starter recipes, and everything you save stays in the browser.

## Checks

```sh
npm run lint
npm test
npm run build
npm run preview
```

## Turn on accounts and community recipes

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` once in the SQL Editor.
3. Under Authentication → URL Configuration, add `http://localhost:5173/account` (and your deployed URL) as redirect URLs.
4. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Restart `npm run dev`.

## Adding a starter recipe

Add it to `src/data/starterRecipes.js`. Ingredients must use ids from `src/lib/ingredients.js`, which stores USDA values per 100 g and gram weights per unit. Write `{program}` in the step where you press the button, and list programs in order of preference. `npm test` checks the data.

## Layout

- `src/pages/`: Home + Browse, RecipeDetail, Pantry, Pints, Saved, Auth, RecipeEditor
- `src/components/`: Layout, RecipeCard, RecipeForm, and page pieces
- `src/lib/`: recipe normalization, machines, units, nutrition, pantry, pints, local storage, Supabase
- `src/data/starterRecipes.js`: starter recipes
- `public/recipes/`: recipe photos (see `docs/ASSETS.md`)
- `supabase/schema.sql`: database tables and access rules

Not affiliated with SharkNinja.
