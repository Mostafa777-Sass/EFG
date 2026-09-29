# Egypt Gas Fittings (EGF) website

Corporate website and admin panel for Egypt Gas Fittings, built with Next.js 16, Prisma and SQLite.
English is live at `/`, Arabic is ready at `/ar` (enable it in the admin once the Arabic text is complete).

## Stack

| Layer      | Choice                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Actions, Turbopack), React 19, TypeScript                 |
| Styling    | Tailwind CSS 4 with the EGF brand tokens in `src/app/globals.css`                        |
| Database   | SQLite through Prisma 6 (one file, on a Docker volume in production)                     |
| i18n       | next-intl, `messages/en.json` and `messages/ar.json`, RTL layout for Arabic              |
| Images     | Uploads are resized to WebP with sharp and served from `UPLOAD_DIR` via `/uploads/...`   |
| Auth       | Admin sessions stored in the database, httpOnly cookie, bcrypt password hashes            |
| Deployment | Docker Compose on a VPS behind Nginx (see `deploy/nginx/egf.conf`)                       |

## Local development

Requirements: Node.js 22.9 or newer (24 LTS recommended) and pnpm.

```bash
pnpm install                # also runs `prisma generate`
cp .env.example .env        # already present in this checkout
pnpm db:migrate             # creates prisma/dev.db and applies migrations
pnpm db:seed                # loads the company profile content and the admin user
pnpm dev                    # http://localhost:3000
```

Admin panel: <http://localhost:3000/admin>
Default login comes from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` (`admin@egyptgasfittings.com` / `ChangeMe123!`).
Change the password in Settings after the first sign-in.

Other scripts:

| Script                | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `pnpm build`          | Production build; completes `.next/standalone` with static assets   |
| `pnpm start`          | Runs the standalone production server with `.env` loaded           |
| `pnpm typecheck`      | TypeScript check                                                    |
| `pnpm lint`           | ESLint                                                              |
| `pnpm db:studio`      | Prisma Studio, a GUI over the database                              |
| `pnpm db:reset`       | Drops and recreates the local database, then re-seeds               |
| `pnpm assets:prepare` | Rebuilds `public/images` from the original photography (see below)  |

## Project layout

```
messages/                 UI strings (en.json, ar.json)
prisma/schema.prisma      Data model
prisma/seed.mjs           Initial content from the company profile (create-if-missing, safe to re-run)
scripts/prepare-assets.mjs  Converts the original assets to WebP
src/app/(site)/[locale]/  Public pages (home, about, products, capabilities, quality, clients, facility, contact)
src/app/admin/            Admin panel (login, dashboard, products, categories, clients, facility, certifications,
                          inquiries, page content, settings)
src/app/uploads/          Route handler that serves admin-uploaded images
src/components/site/      Public UI components (header, footer, cards, contact form ...)
src/components/admin/     Admin UI components and forms
src/components/brand/     Vector logo mark and watermark
src/lib/actions/          Server Actions (all admin actions call requireAdmin())
src/lib/content.ts        Data access for the public pages
src/lib/auth.ts           Sessions and password helpers
src/proxy.ts              Locale routing for the site, cookie check for /admin
```

## What the admin manages

- **Products and categories**: names (EN/AR), sizes, standard, material, descriptions, photo, featured and published flags, order.
- **Clients and partners**: logos, domestic or export, country, website.
- **Facility photos**: the gallery on the Facility page (first three also appear on the home page).
- **Certifications**: badges on the Quality page and home page.
- **Inquiries**: every contact-form submission with status and internal notes. Optional email notification via SMTP.
- **Page content**: every headline and paragraph used on the public pages (hero, history, vision, mission, intros, CTA).
- **Settings**: company names, phones, email, address, Google Maps embed, headline figures, list of standards,
  social links, notification address, and the Arabic on/off switch.

Structured lists that rarely change (the four production technologies, the six process steps, the six testing
capabilities, the three pillars) live in `messages/en.json` and `messages/ar.json`.

## Arabic

The site is Arabic-ready: locale routing, right-to-left layout and Arabic UI strings are in place.
Every content field has an Arabic twin; empty Arabic fields fall back to English.
Turn on **Enable the Arabic version** in Settings when the translations are complete. That shows the language
switcher and adds `/ar` pages to the sitemap. To also redirect Arabic browsers automatically, set
`localeDetection: true` in `src/i18n/routing.ts`.

## Images

`public/images` holds the web-sized versions of the original photography and logos (products, clients, facility,
certification badges, hero). They were generated with `pnpm assets:prepare`, which reads the `EGF_Batch_*`
folders from the parent directory (override with `ASSETS_DIR=...`). Images uploaded through the admin are stored
in `UPLOAD_DIR` (default `./data/uploads`, `/data/uploads` in Docker) and are never part of the build.

## Deploying to a VPS with Docker

1. Install Docker Engine and the Compose plugin on the server, then copy the project (or `git clone` it).
2. Create the production `.env`:

   ```bash
   cp .env.example .env
   ```

   Set at least `NEXT_PUBLIC_SITE_URL=https://egyptgasfittings.com`, a strong `ADMIN_PASSWORD`, and the SMTP
   variables if inquiry emails are wanted. `DATABASE_URL` and `UPLOAD_DIR` are set by `docker-compose.yml`.

3. Build and start:

   ```bash
   docker compose up -d --build
   ```

   The `migrate` service applies the database migrations and seeds missing content, then exits. The `web`
   service listens on `127.0.0.1:3000`. Data lives in the named volume `egf_data` (`/data` inside the containers).

4. Put Nginx in front and add HTTPS:

   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   sudo cp deploy/nginx/egf.conf /etc/nginx/sites-available/egf.conf
   sudo ln -s /etc/nginx/sites-available/egf.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d egyptgasfittings.com -d www.egyptgasfittings.com
   ```

5. Updating later:

   ```bash
   git pull
   docker compose up -d --build
   ```

### Backups

Everything that changes at runtime is in the `egf_data` volume: the SQLite file and the uploads folder.

```bash
docker run --rm -v egf-website_egf_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/egf-backup-$(date +%F).tgz -C /data .
```

## Deploying without Docker (Node + systemd + Nginx)

The app is a plain Node.js process, so Docker is optional. On an Ubuntu or Debian VPS:

1. Install Node.js 24 LTS (22.9 or newer works), pnpm and Nginx, and create a system user:

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
   sudo apt install -y nodejs nginx git
   sudo npm install -g pnpm@10.21.0
   sudo useradd --system --create-home --shell /bin/bash egf
   ```

2. Get the code and configure it (as the `egf` user):

   ```bash
   sudo -iu egf
   git clone <your-repo-url> /var/www/egf-website && cd /var/www/egf-website
   cp .env.example .env
   mkdir -p data/uploads
   ```

   In `.env` use **absolute paths** (the standalone server resolves relative SQLite paths from a different
   folder than the Prisma CLI does) and the real domain:

   ```bash
   DATABASE_URL="file:/var/www/egf-website/data/egf.db"
   UPLOAD_DIR="/var/www/egf-website/data/uploads"
   NEXT_PUBLIC_SITE_URL="https://egyptgasfittings.com"
   ADMIN_PASSWORD="<strong password>"
   ```

3. Install, migrate, seed and build:

   ```bash
   pnpm install --frozen-lockfile
   pnpm db:deploy
   pnpm db:seed
   pnpm build
   ```

   `pnpm build` also copies `public` and `.next/static` into `.next/standalone`, so the standalone server
   is complete. `pnpm start` runs it with the `.env` loaded; `PORT` and `HOSTNAME` control the bind address.

4. Run it as a service:

   ```bash
   sudo cp deploy/systemd/egf-website.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now egf-website
   sudo systemctl status egf-website
   ```

   The unit binds to `127.0.0.1:3000`, loads `.env`, restarts on failure and starts at boot. Logs:
   `journalctl -u egf-website -f`.

5. Nginx and HTTPS are the same as in step 4 of the Docker section above (`deploy/nginx/egf.conf` + certbot).

6. Updating later:

   ```bash
   ./deploy/update.sh
   ```

   It pulls, installs, migrates, rebuilds and restarts the service.

Backups: copy the `data` folder (SQLite file plus uploads). For example, a nightly cron entry:

```bash
0 2 * * * tar czf /home/egf/backups/egf-$(date +\%F).tgz -C /var/www/egf-website data
```

If you prefer PM2 to systemd: `pm2 start "pnpm start" --name egf-website` then `pm2 save && pm2 startup`.

### Switching to PostgreSQL later

1. In `prisma/schema.prisma` change `provider = "sqlite"` to `provider = "postgresql"`.
2. Point `DATABASE_URL` at the Postgres server and add a `postgres` service to `docker-compose.yml`.
3. Delete `prisma/migrations` and run `pnpm prisma migrate dev --name init`.

No application code changes.

## Content to verify with EGF before launch

The seed reproduces the company profile, with these deliberate corrections that the client should confirm
(each is a one-line edit in the admin):

- Standard references were normalised to their published designations: `BS 669-1`, `BS EN ISO 10380:2012`,
  `BS EN 1254-2:2021`, `BS EN 12165`. The profile wrote `BS 669/1`, `BS 10380:2012`, `BS 1254-2:2021`, `BS 12165`.
- `CW617N` is a brass alloy grade, so it is stored as the coupling's material with `BS EN 12165` as the standard.
- The last client logo is named **Maya Gas** (from the logo file); the profile text says "May Gas".
- The logo in the header is a vector reconstruction of the gear-and-flame mark. Replace it with the original
  artwork in `src/components/brand/logo-mark.tsx` and `src/app/icon.svg` when available.
- Arabic product and category names were drafted for review; narrative paragraphs are still English-only.
