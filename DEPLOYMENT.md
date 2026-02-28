# Deployment (Vercel + GitHub)

## 1) Local prerequisites

- Bun installed
- Vercel CLI authenticated: `bunx vercel login`
- Repo secrets in `.env` (see `.env.example`)

## 2) Push code

```bash
git push origin main
```

## 3) Configure Vercel environment variables

Set these in Vercel Project Settings for `Development`, `Preview`, and `Production`:

- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH` (`main`)

## 4) Deploy with Bun scripts

```bash
bun run build
bun run deploy:preview
bun run deploy:prod
```

## 5) GitHub token minimum permissions

- Repository access: only this repository
- Repository permissions:
  - `Contents`: Read and write
  - `Metadata`: Read-only (default)
