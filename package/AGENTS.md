# `package/` Guidelines (node_modules Patches)

## Runtime Prerequisite

- `nvm` is installed. Before running `node`, `npm`, or `npx`, use `nvm list`, activate the installed project-specific Node version with `nvm use <version>`, then verify with `node --version`.

- This folder holds targeted vendor overrides copied by `npm run apply-patches`.
- Patch only what is required; avoid broad or unrelated edits.
- Keep upstream path/version context in comments when practical.
- After patch changes or dependency upgrades, re-apply patches and verify with typecheck/build.
