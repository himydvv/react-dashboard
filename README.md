# Project Console

React project dashboard backed by Supabase.

## What It Does

- Shows project portfolio metrics.
- Lists tracked projects with status, owner, priority, progress, deadline, and budget.
- Lets users create new project records from the dashboard UI.
- Includes a Supabase migration for the `projects` table.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`.
3. Apply the SQL in `supabase/migrations/202604290001_create_projects.sql`.
4. Read `SUPABASE_SETUP.md` for the full setup guide.

## Scripts

### `npm start`

Starts the React development server.

### `npm test`

Runs the test suite.

### `npm run build`

Creates a production build.
