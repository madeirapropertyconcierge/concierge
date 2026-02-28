# Deployment (Vercel + GitHub)

## Automatic production deploy

Production deploys are automatic through Vercel Git integration.

Trigger:

- every push to `main` on `madeirapropertyconcierge/concierge`

## Vercel environment variables (runtime)

Set these in Vercel Project Settings for `Development`, `Preview`, and `Production`:

- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH` (`main`)

## Important

- The commit author/committer must be a user that belongs to the Vercel team.
- If commits are authored as another GitHub account, Vercel blocks the Git-triggered deployment.

## Manual fallback

```bash
bun run build
bun run deploy:prod
```
