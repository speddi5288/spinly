# Spinly — Simple React Build Plan

Status: Step 1 complete and verified on September 13, 2026. Step 2 is next.

Build a Ninja CREAMi recipe app with React, plain JavaScript, and Supabase. Keep the original core features: browsing, filtering, sorting, recipe details, accounts, recipe submissions, and editing your own recipes.

Work through one step at a time. Verify it, record the result here, then wait for the user's go-ahead before starting the next step. Keep this checklist as `PLAN.md` at the project root.

## 1. The simpler setup

| Part | Choice | Purpose |
| --- | --- | --- |
| Screens | React with JavaScript/JSX | Recipe cards, details, and forms |
| Development tooling | Vite | Run and build the app |
| Styling | Regular CSS | Responsive dark theme with few dependencies |
| Navigation | React Router | Browse, detail, account, and form URLs |
| Accounts and shared data | Hosted Supabase | Email/password sign-in and saved recipes |
| Database access | `@supabase/supabase-js` | Read and write from the React app |

React runs in the browser and calls Supabase directly. Supabase provides the hosted backend, so we do not write or run a separate application server. This is a supported [Supabase React setup](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs).

Remove Python, FastAPI, SQLAlchemy, Alembic, custom API endpoints, and handwritten JWT verification. Also skip MCP setup, Docker, TypeScript, Tailwind, and shadcn/ui for this first version. They are not prerequisites for this app.

Local development needs Node.js and npm. Use a currently supported Node.js LTS release compatible with [Vite's requirements](https://vite.dev/guide/). There is one app folder and one development command: `npm run dev`.

## 2. Keep the first version focused

Include:

- A responsive dark browse screen with recipe photo, title, calories, protein, and tub size.
- Filters for maximum calories, minimum protein, and maximum carbs, including an “Under 300 kcal” shortcut.
- Sorting by newest, highest protein, and lowest calories.
- Recipe details with nutrition, ingredients, numbered directions, and machine settings.
- Email/password signup, sign-in, and sign-out.
- A form to submit recipes and edit recipes you own.
- Recipe photos entered as image URLs, with a fallback when an image fails.

Keep Spin Score, ratings, comments, leaderboards, photo uploads, and public profile pages for later. Public usernames are also deferred; recipe ownership still uses the signed-in user's account ID. The reference screenshots mentioned in the original plan are not included with this attachment, so start with its described dark, minimal style.

## 3. Start with one application table

Supabase already manages user accounts. Create only a `recipes` table for application data:

| Fields | Stored information |
| --- | --- |
| `id`, `user_id`, `created_at` | Recipe ID, owner account ID, creation time |
| `title`, `description`, `image_url` | Recipe introduction and photo |
| `tub_size_oz`, `program` | Container size and machine program |
| `freeze_time_hours`, `freeze_note`, `respin_note` | Preparation and processing notes |
| `calories`, `protein`, `carbs`, `fat` | User-entered nutrition for the entire tub; macros in grams |
| `ingredients` | Ordered JSON array of `{ name, amount, unit }` objects |
| `steps` | Ordered array of instruction strings |

Link `user_id` to Supabase's `auth.users.id`. Store ingredients and steps together with the recipe so saving a recipe requires one database write. PostgreSQL supports [JSON data through Supabase](https://supabase.com/docs/guides/database/json). A separate ingredients table can be introduced if later features need ingredient-level queries.

Save the initial database setup in `supabase/schema.sql`, including constraints, grants, and access policies. Run it once in the Supabase SQL Editor. Save future changes as separate numbered SQL files instead of rerunning a destructive setup script. No migration framework is needed for this first version.

Database permissions are part of this setup: everyone can read recipes; signed-in users can insert recipes owned by themselves; only an owner can update an existing recipe, and an update cannot transfer ownership. Enforce this with Row Level Security and explicit grants, including checks on both existing and updated rows. [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)

The React app uses the project URL and publishable key. Secret or service-role keys never belong in browser code. [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)

## 4. Build in small steps

### Step 1 — Create the React shell

- [x] Scaffold React with Vite using the JavaScript template.
- [x] Add the Spinly header, navigation, and basic responsive dark styling.
- [x] Add this plan, a short README, and a `.gitignore`.

**Verify:** `npm run dev` opens the page without console errors, and `npm run build` succeeds. No Supabase setup is needed yet.

**Verified September 13, 2026:** `npm run build` and `npm run lint` passed. The Vite development server loaded successfully. Browser checks at 1440px, 390px, and 320px widths found no horizontal overflow; the local illustration loaded. Explore recipes, How it works, and Back to top navigated to their sections. The keyboard skip link displayed a visible focus outline and moved focus into the main content. The browser reported no warnings or errors. The shell uses local SVG artwork and system fonts. No database connection is needed. Steps 2–6 remain unimplemented.
### Step 2 — Build recipe browsing with sample data

- [ ] Add a small local JavaScript file containing varied sample recipes.
- [ ] Build recipe cards, nutrition filters, sort controls, and an empty-results state.
- [ ] Apply the filters and sorting to sample data in JavaScript.

**Verify:** filters combine correctly, clearing them restores all recipes, and sorting changes the order. “Under 300 kcal” excludes a recipe with exactly 300 calories. Check the layout on a narrow screen.

### Step 3 — Build recipe details

- [ ] Add navigation to a recipe's own URL.
- [ ] Show nutrition per tub, machine settings, freeze/respin notes, ingredients, and ordered instructions.
- [ ] Add ingredient checkboxes for the current viewing session.
- [ ] Handle missing recipes and broken image URLs.

**Verify:** clicking a card opens the correct recipe; refreshing its URL still works in development; ingredient checks toggle independently; an unknown recipe ID shows a useful message.

### Step 4 — Connect Supabase and add accounts

- [ ] Create a Supabase project and apply the saved schema and access policies.
- [ ] Add `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; put actual configuration in ignored `.env.local`.
- [ ] Add the Supabase client and a small auth context using the JavaScript SDK.
- [ ] Implement signup, sign-in, and sign-out. Handle email confirmation when enabled and configure the localhost redirect URL.
- [ ] Replace the sample-data source with Supabase queries. Move numeric filters and sorting into those queries and use bounded pagination so browsing does not load every recipe at once.
- [ ] Add loading, error, retry, and empty states.

**Verify:** sign up, complete confirmation if required, sign in, refresh, and sign out. Public recipe reads work while signed out. Test access with two accounts: account A can create and update its recipe, account B cannot modify it, and neither account can assign a recipe to the other. Signed-out writes fail. Check the stored row after denied updates because a filtered update may affect zero rows without returning an error.

Use ordinary client requests for these permission checks, rather than an administrator connection. The [Supabase React auth guide](https://supabase.com/docs/guides/auth/quickstarts/react) covers the account integration.

### Step 5 — Add submission and editing

- [ ] Create one reusable form for adding and editing a recipe.
- [ ] Support ingredient rows, one instruction per line, photo URL, nutrition, and machine settings.
- [ ] Validate required values and numeric ranges; enforce essential constraints in the database too.
- [ ] Require sign-in for submission and show edit controls only for the owner.
- [ ] Show save progress and errors, prevent duplicate submits, and navigate to the saved recipe on success.

**Verify:** submit a recipe, see it in Browse, reopen it after refresh, and edit it. Confirm ingredient and instruction order is preserved. Invalid input produces clear feedback, and a failed save preserves the form contents. A second account can read the recipe but cannot change it.

### Step 6 — Finish the core app

- [ ] Check keyboard navigation, form labels, mobile layout, and loading/error states.
- [ ] Document a fresh setup: install dependencies, apply SQL, configure Supabase, and run `npm run dev`.
- [ ] Run the production build and check it locally with `npm run preview`.
- [ ] Record the completed checks in this plan.

**Verify:** complete signup → browse → filter/sort → detail → submit → edit → sign out. Confirm the saved recipe is visible in a second browser session and has not merely been saved locally.

Publishing is a separate step when requested. Hosting will need to serve the Vite build, support direct navigation to React routes, and use the appropriate Supabase auth redirect URLs.

## 5. Suggested project layout

Create files only as their build step needs them:

```text
spinly/
  src/
    components/RecipeCard.jsx
    components/RecipeForm.jsx
    context/AuthContext.jsx
    data/sampleRecipes.js
    lib/supabase.js
    lib/recipes.js
    pages/Browse.jsx
    pages/RecipeDetail.jsx
    pages/RecipeEditor.jsx
    pages/Auth.jsx
    App.jsx
    main.jsx
    styles.css
  supabase/schema.sql
  .env.example
  .gitignore
  package.json
  PLAN.md
  README.md
```

The first three steps produce a usable visual prototype without an account or database setup. Steps four through six turn it into the shared recipe app. Local sample data is a development stage; real user submissions will be stored in Supabase.
