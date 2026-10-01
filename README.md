# Clean

An on-demand laundry service platform, **“clean”** aims to make laundry less of a hassle for the people of Dhaka by connecting customers with local laundry services.

## Features

- Laundry listings with photos, locations, and apparel prices.
- Email/password authentication through Supabase Auth.
- Customer profiles with street address, locality, and phone number.
- Bookings with washing, ironing, or both for each selected clothing item.
- Owner dashboards for editing laundry details, viewing customer information, and updating orders.
- A site administrator interface for creating listings and uploading photos.

## Technology

Next.js 16.3.5 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase Auth and Storage, PostgreSQL, and Drizzle ORM.

## Setup

### Prerequisites

- Node.js 20.9 or later and npm.
- A Supabase project with email/password authentication enabled.
- A PostgreSQL connection to the same Supabase project.

### 1. Install dependencies

From the repository root:

```bash
npm ci
```

### 2. Configure environment variables

Create `.env.local` in the repository root:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres

# Optional; defaults to Make Payment
PAYMENT_BKASH_METHOD=Make Payment
```

| Variable                               | Purpose                                                       |
| -------------------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL for browser and server clients.          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public Supabase client key.                                   |
| `DATABASE_URL`                         | Server-only PostgreSQL connection for queries and migrations. |
| `PAYMENT_BKASH_METHOD`                 | Label displayed in the bKash payment instructions.            |

Copy the database connection string from the Supabase dashboard's **Connect** dialog. Use a direct connection or session pooler for the current Postgres.js configuration. Transaction pooling requires changes to prepared-statement handling; see [Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres).

Keep database passwords and Supabase secret/service-role keys out of browser code and version control. Environment files are ignored by Git.

### 3. Prepare the database and storage

The schema is defined in `lib/drizzle/schema.ts`; committed migrations are in `drizzle/`.

Drizzle's configuration loads `.env` through `dotenv/config`, rather than automatically loading `.env.local`. For migration commands, put `DATABASE_URL` in an ignored `.env` file or export it in your shell.

On a new development database, apply the committed migrations:

```bash
npx drizzle-kit migrate
```

For an existing database, confirm its migration history before applying migrations. The history includes earlier turf tables from the project's previous naming.

Create a public Supabase Storage bucket named `laundry-images` and configure upload policies for the administrator. The app stores image paths in `laundry_images` and displays public image URLs. Bucket configuration and storage policies are not included in the Drizzle migrations.

The server database role needs access to the application tables and the contact metadata queried from `auth.users` for owner bookings. There is no bundled seed command; add listings through the administrator interface.

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes and account roles

| Route                 | Purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| `/`                   | Landing page and laundry listings.                            |
| `/explore`            | Browse laundries.                                             |
| `/explore/[store_id]` | Laundry details, service selection, and booking.              |
| `/auth`               | Authentication, customer profile, or administrator interface. |
| `/auth/[owner_page]`  | Owner dashboard; the parameter is the laundry ID.             |
| `/orders`             | Customer order history and tracking.                          |

Owners are matched by their signed-in email to `laundries.ownerEmail`. The administrator email is hardcoded in `app/auth/page.tsx` and `app/auth/adminLogic.ts`; update both to configure another administrator. The bKash recipient number is hardcoded in `app/explore/[store_id]/page.tsx`.

## Development commands

| Command         | Purpose                       |
| --------------- | ----------------------------- |
| `npm run dev`   | Start the development server. |
| `npm run lint`  | Run ESLint.                   |
| `npm run build` | Create a production build.    |
| `npm run start` | Serve the production build.   |

Run the existing unit and component tests:

```bash
node --import tsx --test lib/*.test.ts app/components/*.test.tsx
```

Database integration tests are opt-in. Point `.env` at a development Supabase database with the migrations applied, then run:

```bash
CLEAN_DB_TEST=1 node --env-file=.env --import tsx --test lib/drizzle/*.integration.test.ts
```

These tests cover ownership checks, order transitions, stale updates, and customer contact lookup. Test records are created inside transactions that roll back.

## Project structure

```text
app/              Pages, layouts, server actions, and app components
components/ui/    Reusable UI primitives
lib/              Booking, payment, pricing, and contact helpers
lib/drizzle/      Database connection, schema, queries, and integration tests
lib/supabase/     Browser and server Supabase clients
drizzle/          SQL migrations and schema snapshots
public/           Static images and assets
```

## Production

Configure the environment variables on your host, prepare the database and storage, then run:

```bash
npm run build
npm run start
```

The app requires a server runtime and database access for authentication, listings, and bookings.

## Troubleshooting

- **Missing Supabase URL or key:** check the exact variable names in `.env.local`, then restart the development server.
- **Database connection or missing-table errors:** check `DATABASE_URL`, network connectivity, and migration history. For Drizzle commands, supply the URL through `.env` or the shell.
- **Images fail to upload or display:** check the `laundry-images` bucket, its public setting, and upload policies.
- **Owner or administrator dashboard is unavailable:** check the account email against the listing owner email or configured administrator email.

Payment submission records a transaction reference; the app does not integrate with an automated bKash payment gateway.
