# Supabase Setup

This dashboard expects a table named `projects` with the schema defined in:

`supabase/migrations/202604290001_create_projects.sql`

## 1. Create a Supabase project

1. Sign in to Supabase and create a new project.
2. Wait until the database and API are ready.
3. Open `Project Settings` -> `API`.

You will need:

- `Project URL`
- `anon` or `publishable` key

Do not use the `service_role` key in this React app.

## 2. Apply the migration

Use one of these approaches:

### Option A: SQL Editor

1. Open the SQL Editor in Supabase.
2. Paste the contents of `supabase/migrations/202604290001_create_projects.sql`.
3. Run the SQL.

### Option B: Supabase CLI

If you already use the CLI:

```bash
supabase db push
```

## 3. Configure environment variables

Create `.env.local` in the project root:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-public-anon-key
REACT_APP_SUPABASE_TABLE=projects
```

Restart the dev server after changing env vars.

## 4. Start the app

If Node is installed in the standard Windows path on this machine, use:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' start
```

## 5. Seed some real project rows

Example insert:

```sql
insert into public.projects
  (name, owner, team, status, priority, progress, budget, due_date, summary)
values
  (
    'Client Portal Refresh',
    'Priya Shah',
    'Engineering',
    'In progress',
    'High',
    72,
    82000,
    '2026-05-30',
    'Refreshing the client workspace and onboarding flow.'
  ),
  (
    'Finance Reporting Migration',
    'Arjun Rao',
    'Operations',
    'Planned',
    'Medium',
    10,
    46000,
    '2026-06-15',
    'Migrating weekly reporting from spreadsheets into the shared platform.'
  );
```

## 6. Row Level Security note

The included migration enables RLS and creates open `select`, `insert`, and `update` policies so the dashboard works immediately from the browser with the anon key.

That is acceptable for an internal prototype, but not for a production multi-user app. For production, tighten the policies and add Supabase Auth so access is limited by user or team.
