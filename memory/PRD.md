# PRD — Cosmopolitan Ecommerce (Next.js on Cloudflare Workers)

## Original Problem Statement
User (Hindi/Hinglish): "bhai ye git ka code gadbad hai sahi krna hai deploy nahi hai aur jo file upload kia hu usme sare enviorments hai"
Translation: The git repo is broken; deployment is failing. Uploaded a `.env.local` file with all environment variables. Need to fix so deploy succeeds.

Repo: https://github.com/suhaibusmani0-lang/cxnew71126.git (branch `main`)
Deploy target: Cloudflare Pages / Workers via `@opennextjs/cloudflare`.

## Root Cause of Failed Deploy
Wrangler build error at line 15 of `wrangler.toml`:
```
✘ [ERROR] Invalid TOML document: invalid value
    /opt/buildhome/repo/wrangler.toml:15:12
      15 │ MONGODB_URI=mongodb+srv://...
```
Environment variables (`MONGODB_URI=...`, `JWT_SECRET=...`, etc.) were pasted directly at the top level of `wrangler.toml` **without** a `[vars]` section header. TOML disallows bare `key=value` lines that are not inside a table, so Wrangler's parser rejected the file and `wrangler deploy` aborted.

Additional problems found:
- `.gitignore` still contained unresolved git merge-conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`).
- `.dev.vars` (containing production secrets) was committed to git.
- `package.json` build + `wrangler.toml` `[build]` command caused double OpenNext build (minor, not blocking).

## Fixes Applied (commit `9f861b1`)
1. **`wrangler.toml`** — rewritten with valid TOML:
   - Kept: `name`, `main`, `compatibility_date = "2024-09-23"`, `compatibility_flags = ["nodejs_compat", "global_fetch_strictly_public"]`.
   - Added: `[assets]` block (directory `.open-next/assets`, binding `ASSETS`) required by OpenNext.
   - Added: `[vars]` block containing all 22 environment variables in valid TOML `key = "value"` form.
   - Removed: the broken `[build]` block (Cloudflare Pages uses its own dashboard build command; `wrangler deploy` users can rely on `npm run build` or `npm run deploy`).
2. **`.gitignore`** — merge conflict markers removed; standard Next.js + Wrangler + OpenNext ignores (`.env`, `.env.*`, `.dev.vars`, `.dev.vars.*`, `.open-next`, `.wrangler`, `.next`, `node_modules`, etc.).
3. **`.dev.vars`** — removed from git tracking (`git rm --cached`) so future edits stay local only.
4. **`.dev.vars.example`** — added template with placeholder values so contributors know what keys to set.
5. **`.env.local`** — created locally at `/app/.env.local` from the file the user uploaded (dev/localhost values). Ignored by git.
6. Committed and pushed to `origin/main`.

## Status
- TOML validated with Python `tomllib` (parses cleanly, 22 vars).
- Commit `9f861b1` pushed to `origin/main`. If Cloudflare Pages has a GitHub trigger, a fresh build will run automatically.
- No node_modules installed / no local build run — Cloudflare will do that in its build container.

## Action Items for User
1. Trigger a fresh deploy from Cloudflare Pages (or wait for the auto-deploy from the new commit).
2. **Rotate all secrets** — MongoDB, JWT_SECRET, Nodemailer app password, Cloudinary API secret, Razorpay keys, Firebase API key. These were committed in `.dev.vars` and remain in git history, so they must be considered leaked.
3. If the deployed URL is not `cosmopolitan.pages.dev`, update `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_APP_URL` in `wrangler.toml`, or move them to Cloudflare Pages dashboard → Environment Variables and remove from `[vars]`.
4. For better security, migrate sensitive keys (MongoDB, JWT, Cloudinary secret, Razorpay secret, Nodemailer pass) to Cloudflare secrets:
   ```
   npx wrangler secret put MONGODB_URI
   npx wrangler secret put JWT_SECRET
   ...
   ```
   and remove them from `[vars]` in `wrangler.toml`.

## Backlog / Future
- Move all sensitive credentials out of `[vars]` into Cloudflare secrets.
- Add a proper build cache configuration (R2 incremental cache) for faster Cloudflare cold starts (see `open-next.config.ts` commented reference).
- Clean up duplicate `open-next.config.ts` and `opennext.config.ts` files.
- Delete stale `origin/master` branch on GitHub if unused.
