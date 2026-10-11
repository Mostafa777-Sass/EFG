# Deployment status and session notes

Last updated: 2026-10-09 (Hostinger deployment done with Claude Code).
No passwords are recorded here on purpose. Keep them in your password manager.

## 1. Where things stand

| Item | State |
| --- | --- |
| Production | Hostinger VPS, live at https://egyptgasfittings.com and https://www.egyptgasfittings.com since 2026-10-09. Node + systemd + Nginx, no Docker (README section "Deploying without Docker"). |
| HTTPS | Let's Encrypt certificate via certbot (Nginx plugin). HTTP redirects to HTTPS. Renewal runs from the certbot systemd timer. |
| Domain | DNS at Dynu. A records for the root and `www` point to 191.218.162.217 (TTL 120 s). |
| AWS (EC2 + Docker) | Superseded. The instance at 35.156.198.51 was unreachable on 2026-10-09. Stop or terminate it to avoid charges (section 7). |
| Local code | Clean, committed and pushed (commit `8a644b6` on `main`). |
| GitHub repo | `Mostafa777-Sass/EFG`. Made public on 2026-10-09 so the server could clone it. Switch it back to private after the deploy key is in place (section 4). |

## 2. Hostinger VPS layout

- Host `srv2048300`, IPv4 `191.218.162.217`, Ubuntu 24.04 LTS. Connect from the PC: `ssh root@191.218.162.217`.
- Node v24.21.0 (NodeSource), pnpm 10.21.0, Nginx 1.24.0, certbot with `python3-certbot-nginx`.
- App user `egf` (system user, home `/home/egf`). Code cloned from GitHub into `/var/www/egf-website`.
- `/var/www/egf-website/.env` (mode 600): absolute `DATABASE_URL` and `UPLOAD_DIR` under `/var/www/egf-website/data`,
  `NEXT_PUBLIC_SITE_URL="https://egyptgasfittings.com"`, `COOKIE_SECURE="true"`, SMTP left empty (inquiry e-mails off,
  inquiries are still stored in the admin).
- Database: SQLite at `/var/www/egf-website/data/egf.db`, uploads in `/var/www/egf-website/data/uploads`.
  Seeded on 2026-10-09 with the company profile content and the admin account `admin@egyptgasfittings.com`.
- Service `egf-website` (unit from `deploy/systemd/egf-website.service`): runs `node .next/standalone/server.js`
  on 127.0.0.1:3000 as `egf`, enabled at boot. Logs: `journalctl -u egf-website -n 50`.
- Nginx: `/etc/nginx/sites-enabled/egf.conf` (from `deploy/nginx/egf.conf`, extended by certbot with the 443 server
  and the redirect). Default site removed.
- Sudo: `/etc/sudoers.d/egf` should let `egf` run `systemctl ... egf-website` without a password; `deploy/update.sh`
  needs it. Verify with `visudo -cf /etc/sudoers.d/egf` (see section 3).

## 3. Pending wrap-up (run as root unless stated)

- [ ] After the next deploy, once, as `egf` in `/var/www/egf-website`: `rm -rf .next/cache/images && sudo systemctl restart egf-website`.
      Seven product photos were replaced under their existing names (EGF marking added), the two gas meter
      union photos were swapped, the expansion bellow photo was replaced, and nine client logos were rebuilt
      from new source files under their existing names (2026-10-11); Next's image optimizer keeps the old
      versions cached for hours otherwise.
- [ ] After the next deploy, once, as `egf` in `/var/www/egf-website`: `pnpm content:update`. It applies the
      2026-10-10 wording changes to content stored in the database: the hero headline becomes the company name
      (English and Arabic), and the CTA headline and facility photo titles get Title Case to match
      `messages/en.json`. Since 2026-10-11 it also deletes the "Steel Hose Nipples & Couplings" product, which
      EGF confirmed does not exist (the seed no longer creates it), drops "BS 21" from the standards list in
      Settings, changes the CEO title to "Chief Executive Officer", replaces the two mobile numbers with the
      single corrected one (+20 106 654 5882), and fills in the Google Maps embed on the Contact page (the Badr
      City industrial zone; swap in the exact pin from Google Maps "Share > Embed a map" in Settings once EGF
      provides it), gives the "EGAS Registered" certification its badge image, and moves the SEWA logo ahead of
      SIANKO in the home page logo band. The three new leaders on the
      About page are new content blocks that `pnpm db:seed` (part of `deploy/update.sh`) creates by itself. Safe
      to re-run; it never overwrites admin edits.
- [ ] Server firewall was inactive on 2026-10-09. Enable it:
      `ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable` (answer `y`), then `ufw status`.
- [ ] Sudo rule check: `visudo -cf /etc/sudoers.d/egf`. If the file is missing:
      `echo 'egf ALL=(root) NOPASSWD: /usr/bin/systemctl * egf-website' > /etc/sudoers.d/egf && chmod 440 /etc/sudoers.d/egf`
- [ ] Deploy key (section 4), then set the GitHub repo back to private.
- [ ] Nightly backup cron (section 5).
- [ ] Renewal check: `systemctl is-active certbot.timer` should print `active`.
- [ ] Change the admin password in the admin Settings page if it was ever pasted in a chat.
- [ ] Decide on the AWS instance and the S3 bucket `egf-website-deploy-2026` (section 7).
- [ ] Content checks from README "Content to verify with EGF before launch".

## 4. Updating the site after code changes

One-time setup so the server can pull from a private repo (as `egf`: `su - egf`):

1. `ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519 -C egf-vps` then `cat ~/.ssh/id_ed25519.pub`.
2. GitHub > repo `EFG` > Settings > Deploy keys > Add deploy key, paste the public key, leave it read-only.
3. `cd /var/www/egf-website && git remote set-url origin git@github.com:Mostafa777-Sass/EFG.git && ssh -T git@github.com`
   (answer `yes` to the fingerprint; "successfully authenticated" is the expected message) then `git fetch`.

Every later update: commit and push on the PC, then on the VPS as `egf`:

```bash
cd /var/www/egf-website && ./deploy/update.sh
```

It pulls, installs, applies migrations, seeds missing rows, rebuilds and restarts the service.
After editing `.env` on the server: `sudo systemctl restart egf-website`. A change to `NEXT_PUBLIC_SITE_URL`
also needs `pnpm build` first.

## 5. Backups

Everything that changes at runtime is in `/var/www/egf-website/data` (SQLite file + uploads). Nightly archive, as root:

```bash
mkdir -p /home/egf/backups && chown egf:egf /home/egf/backups && (crontab -u egf -l 2>/dev/null; echo '0 2 * * * tar czf /home/egf/backups/egf-$(date +\%F).tgz -C /var/www/egf-website data') | crontab -u egf -
```

Copy the archives off the server from time to time (`scp root@191.218.162.217:/home/egf/backups/*.tgz .` on the PC).

## 6. Pitfalls met along the way

- Pasting multi-line blocks into the SSH session adds leading spaces, which breaks heredocs. Write files with a
  single-line `printf '%s\n' 'line1' 'line2' ... > file` instead.
- A pasted `--` can turn into a long dash; the error then shows `\xe2\x80\x93`. Retype the two hyphens or use
  single-dash options (`certbot -a nginx -i nginx -d ... -m ...`).
- certbot must run after the DNS change, because the certificate authority validates through the domain name.
- Keep `COOKIE_SECURE="false"` until HTTPS exists, otherwise the admin login cannot set its cookie over plain HTTP.
  Switch it to `"true"` and restart the service once the certificate is in place.
- Local dev: `pnpm dev` at http://localhost:3000, admin at /admin with the credentials from the README.

## 7. Old AWS setup (reference until it is shut down)

Region eu-central-1 (Frankfurt). EC2 instance `egf-website` (Ubuntu 24.04, t3.small), Elastic IP 35.156.198.51,
key pair `egf-website-key`, IAM role `egf-ec2-s3-read`, S3 bucket `egf-website-deploy-2026`, Docker Compose with
the data in volume `egf_data`, Nginx with `deploy/nginx/egf.conf`. HTTPS was never confirmed there. Unreachable on
2026-10-09 (no answer on ports 22, 80, 443). If it is stopped rather than terminated, release the Elastic IP too,
otherwise it keeps billing.
