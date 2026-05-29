# `package/` Guidelines (node_modules Patches)

- This folder holds targeted vendor overrides copied by `npm run apply-patches`.
- Patch only what is required; avoid broad or unrelated edits.
- Keep upstream path/version context in comments when practical.
- After patch changes or dependency upgrades, re-apply patches and verify with typecheck/build.
