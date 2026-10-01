# Turfer

Turfer is a Next.js application that uses Supabase for authentication and data access. hello

## Prerequisites 

- Node.js 20.9 or later
- npm 10 or later
- A Supabase project

## Setup

1. Clone the repository and move into the project directory:

   ```bash
   git clone <repository-url>
   cd turfer
   ```

2. Install dependencies using the committed npm lockfile:

   ```bash
   npm ci
   ```

3. Create `.env.local` and add your Supabase values:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   Find these values in Supabase under **Project Settings → API**. Use a publishable key, not a secret or service-role key.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev    # Start the development server
npm run lint   # Run ESLint
npm run build  # Create a production build
npm run start  # Serve the production build
```

Run `npm run build` before `npm run start`.

## Project structure

- `app/` — routes, layouts, and pages
- `components/` — reusable UI components
- `lib/supabase/` — Supabase browser and server clients
- `public/` — static assets

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL of the Supabase project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable client key |

Never commit `.env.local` or expose Supabase secret/service-role keys to the browser.

## Troubleshooting

### “Your project's URL and Key are required to create a Supabase client”

This means the app cannot read the Supabase environment variables. Confirm that:

- The file is named exactly `.env.local`, including the leading dot.
- It is in the project root beside `package.json`.
- The variable names match exactly:

  ```dotenv
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
  ```

- You restarted the development server after creating or changing the file.

On Windows PowerShell, restart it with:

```powershell
Ctrl+C
npm run dev
```

Do not paste the Supabase key into screenshots, commits, or public messages.

## Deployment

Configure the two environment variables in your hosting provider, then run:

```bash
npm run build
npm run start
```
