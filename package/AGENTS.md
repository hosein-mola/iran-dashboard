# `package/` Guidelines (node_modules patches)

- `npm run apply-patches` copies `package/` into `node_modules/`.
- Keep patches minimal and well-targeted (only the files you must override).
- When updating dependencies, re-apply patches and verify builds still work.
