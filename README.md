# React Dashboard

A React-based dashboard project for tracking projects, team members, and project activity with a Supabase backend.

## Overview

This repository combines:

- A React frontend created with Create React App
- Client-side routing with `react-router-dom`
- Supabase SQL migrations for project, team, and activity data
- Seed data for local or dashboard-based testing

The backend schema is more developed than the current UI. At the moment, the repository contains the data model and early frontend scaffolding, which makes it a good base for continuing dashboard development.

## Current Scope

The Supabase layer in this repo is set up to support:

- Projects with status, priority, progress, budget, due date, summary, and description
- Team members with role, department, bio, and avatar color
- Project-member assignments through a junction table
- Activity logging for new project and team-member records
- Trigger-based updates such as auto-setting `progress = 100` when a project is marked `Completed`

## Tech Stack

- React 19
- React Router 7
- Create React App / `react-scripts`
- Supabase
- PostgreSQL SQL migrations

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_TABLE=projects
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Add your Supabase credentials to `.env`.

### 3. Run the frontend

```bash
npm start
```

The app will run on `http://localhost:3000`.

## Supabase Setup

Apply the SQL migration files in the `supabase/migrations/` folder to your Supabase project in order.

If you want sample records for testing, run the seed SQL from the `supabase/seed/` folder.

## Available Scripts

```bash
npm start
npm test
npm run build
```

## Development Status

This project is currently in an early build stage.

- The database schema and seed data are in place
- Routing dependencies are installed
- The frontend is still being scaffolded and refined

If you are publishing this on GitHub, it is worth treating this repo as a work-in-progress dashboard starter rather than a finished product.

## Roadmap

- Build the actual dashboard UI
- Connect the frontend to Supabase
- Add project and team management flows
- Add authentication and stricter row-level security policies
- Replace placeholder components with production-ready views

## License

Add your preferred license here before publishing if you want others to reuse the code.
