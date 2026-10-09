# Deployment status and session notes

Last updated: 2026-10-07. Work below was done on 2026-10-05 with Claude Code.
No passwords are recorded here on purpose. Keep them in your password manager.

## 1. Where things stand

| Item | State |
| --- | --- |
| Local code | Header reworked (see section 2). Changes are NOT committed to git yet. |
| AWS (EC2 + Docker) | Live at http://35.156.198.51 and http://egyptgasfittings.com. HTTPS step (section 4, step 9) was given but not confirmed as done. |
| Domain | egyptgasfittings.com and www.egyptgasfittings.com, DNS at Dynu, both A records point to 35.156.198.51. |
| Hostinger VPS (no Docker) | Decided and planned, not started. See section 6. |

## 2. Code changes made locally (uncommitted)

- `src/components/site/site-nav.tsx` (new): one navigation element. Below 1024px it is the toggle
  panel; from 1024px up it is the inline link row and the toggle button is hidden. Links use tighter
  padding between 1024px and 1279px so the row fits.
- `src/components/site/header.tsx`: uses `SiteNav`; contact strip shows from 1024px up.
- Deleted `src/components/site/mobile-nav.tsx` and `src/components/site/nav-links.tsx`.
- `src/app/(site)/[locale]/products/[slug]/page.tsx`: deprecated `priority` prop replaced by `preload`.
- Earlier uncommitted work from previous sessions (brand assets, logo, hero) is still uncommitted too.
- Verified: typecheck and lint pass; no horizontal overflow on 14 pages at 6 widths; header correct at
  390/768/1023/1024/1093/1180/1280/1440 in English and Arabic.

To do: review `git status`, then commit and push.

## 3. AWS setup (region eu-central-1, Frankfurt)

- EC2 instance `egf-website`: Ubuntu 24.04, t3.small, 20 GB gp3, 2 GB swap file added.
- Elastic IP: 35.156.198.51 (attached).
- Key pair: `egf-website-key` (.pem downloaded to the PC on 2026-10-05).
- Security group: SSH from My IP + SSH from prefix list `com.amazonaws.eu-central-1.ec2-instance-connect`,
  HTTP 80 and HTTPS 443 from anywhere.
- IAM role `egf-ec2-s3-read` (AmazonS3ReadOnlyAccess) attached to the instance.
- S3 bucket `egf-website-deploy-2026`: project files at the bucket root (uploaded from the PC without
  node_modules). Also holds `egf-website.tar.gz` if it was uploaded for Hostinger (section 6).
- On the server: code in `/home/ubuntu/egf-website`, AWS CLI v2 installed, Docker installed.
  Docker group needs a fresh terminal; otherwise prefix docker commands with `sudo`.
- Docker Compose: `web` (port 127.0.0.1:3000) and one-off `migrate`; data in volume `egf_data`
  (SQLite file + uploads).
- Nginx installed with `deploy/nginx/egf.conf` (server_name egyptgasfittings.com www.egyptgasfittings.com),
  default site removed.
- Server `.env` currently has `NEXT_PUBLIC_SITE_URL="http://35.156.198.51"` and `COOKIE_SECURE="false"`
  until the HTTPS step below is completed.
- Connect: EC2 > Instances > select > Connect > EC2 Instance Connect tab > user `ubuntu`.

## 4. Pending on AWS: HTTPS (step 9)

Run on the server, in this order:

```bash
sudo apt-get install -y certbot python3-certbot-nginx && sudo certbot --nginx -d egyptgasfittings.com -d www.egyptgasfittings.com --redirect --agree-tos --no-eff-email -m "$(grep ADMIN_EMAIL ~/egf-website/.env | cut -d'"' -f2)"
```

```bash
sed -i -e 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL="https://egyptgasfittings.com"|' -e 's|^COOKIE_SECURE=.*|COOKIE_SECURE="true"|' ~/egf-website/.env && cd ~/egf-website && sudo docker compose up -d --force-recreate web && sleep 5 && curl -sI https://egyptgasfittings.com | head -1
```

Check: https://egyptgasfittings.com loads with a padlock and /admin login works.

## 5. Updating the AWS site after local changes

1. Upload the changed files (or the whole project without node_modules) to bucket `egf-website-deploy-2026`.
2. On the server:

```bash
cd ~/egf-website && aws s3 sync s3://egf-website-deploy-2026/ ~/egf-website --exclude ".env" --exclude "tsconfig.tsbuildinfo" --exclude "next-env.d.ts" --exclude "prisma/*.db*" && sudo docker compose up -d --build
```

Sync never deletes: remove deleted files from the bucket and from `~/egf-website` by hand.
After editing `.env` on the server: `sudo docker compose up -d --force-recreate web`.

Backup of database + uploads (README "Backups"): run on the server
`docker run --rm -v egf-website_egf_data:/data -v "$PWD":/backup alpine tar czf /backup/egf-backup-$(date +%F).tgz -C /data .`

## 6. Planned: Hostinger VPS without Docker

Follows README section "Deploying without Docker (Node + systemd + Nginx)" and `deploy/systemd/egf-website.service`,
`deploy/nginx/egf.conf`, `deploy/update.sh`.

Prepared: project archive `D:\Dev Ops-Journey\nada\egf-website.tar.gz` (built 2026-10-05, 171 files,
includes the header changes, excludes node_modules, .env, local database).

Steps agreed:

1. hPanel > VPS: plain Ubuntu 24.04 LTS (no control panel), set root password, note the IP, open Browser terminal as root.
2. Upload `egf-website.tar.gz` to bucket `egf-website-deploy-2026`, create a 12-hour presigned URL.
3. Server prep as root: `apt update`, Node.js 24 (NodeSource), `npm i -g pnpm@10.21.0`, nginx, git, certbot;
   `useradd --system --create-home --shell /bin/bash egf`; firewall allow 22, 80, 443.
4. As user `egf`: download and extract the archive to `/var/www/egf-website`; create `.env` with ABSOLUTE paths:
   `DATABASE_URL="file:/var/www/egf-website/data/egf.db"`, `UPLOAD_DIR="/var/www/egf-website/data/uploads"`,
   `NEXT_PUBLIC_SITE_URL="https://egyptgasfittings.com"`, admin email/password, `COOKIE_SECURE="true"`;
   `mkdir -p data/uploads`; then `pnpm install --frozen-lockfile && pnpm db:deploy && pnpm db:seed && pnpm build`.
5. Service: copy `deploy/systemd/egf-website.service` to `/etc/systemd/system/`, `daemon-reload`, `enable --now`.
6. Nginx: copy `deploy/nginx/egf.conf` to sites-available, symlink, remove default, `nginx -t`, reload;
   certbot for both names.
7. Move the domain: change the two A records at Dynu from 35.156.198.51 to the Hostinger IP.
8. Only if content was edited on the AWS site: back up the `egf_data` volume (section 5) and copy the
   SQLite file + uploads into `/var/www/egf-website/data` on Hostinger before step 5.
9. Decide what to do with the AWS instance afterwards (stop it to avoid charges, or keep as backup).

Open questions: was any content edited or uploaded in the AWS admin (needs step 8)? Keep AWS or switch fully?

## 7. Pitfalls met along the way

- Browser-terminal pastes can add leading spaces (breaks heredocs, use single-line `printf` commands)
  and can turn `--` into a long dash (retype the dashes).
- `apt install awscli` is not available on Ubuntu 24.04; use the official AWS CLI v2 installer.
- EC2 Instance Connect needs the SSH rule for the region's ec2-instance-connect prefix list.
- Docker group membership needs a new login; otherwise use `sudo docker ...`.
- Local dev: `pnpm dev` at http://localhost:3000, admin at /admin with the credentials from the README.
