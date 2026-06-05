# Scripts

| Script | Where it runs | What it does |
| --- | --- | --- |
| `push-to-vps.sh` | local (dev machine) | `npm run build:all` then deploys `build/nl` + `build/en` to `/var/www/yres-wiki` on the VPS via tar-over-ssh (see `../DEPLOY.md`). |
| `build-wiki-index.mjs` | local (pre-build) | Builds the search index per language (`WIKI_LANG`). |
| `git-hooks/post-merge` | local (git hook) | After a merge into `main`, builds + deploys the wiki, then pushes `main` to GitHub (`origin`). |

## Auto-deploy on merge to main

Enabled via:

```bash
git config core.hooksPath scripts/git-hooks
```

After that, any merge (or `git pull`) that updates `main` rebuilds the wiki,
deploys it to the VPS, and (on success) pushes `main` to GitHub as a backup.

Manual deploy without a merge:

```bash
scripts/push-to-vps.sh
```
