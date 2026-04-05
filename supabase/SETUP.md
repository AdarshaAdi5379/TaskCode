# Supabase Setup (Postgres + Auth)

## 1) Create a Supabase project

- Create a new Supabase project (any region).
- In **Authentication → Providers**, enable **Email** (email + password).

## 2) Create tables + RLS policies

- Open **SQL Editor** and run `supabase/schema.sql`.

This creates `public.projects` and `public.tasks` with Row Level Security so each user can only access their own rows (`user_id = auth.uid()`).

## 3) Configure environment variables

Create `.env.local` in the repo root:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

You can copy keys from **Project Settings → API**.

## 4) Install the Supabase client

```
npm i @supabase/supabase-js
```

## 5) Run the app

```
npm run dev
```

- Visit `/login` to create an account and sign in.
- After sign-in, the app will seed a few default projects for your account (first time only).

