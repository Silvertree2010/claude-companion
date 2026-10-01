# Desktop engine (Linux / Hyprland companion)

Full engine used by the desktop companion (Quickshell overlay on Hyprland):
`engine/*.js` (pixels, props, accessories, animations, transitions, world/physics) and `auswahl.json` (moves and looks).

Desktop installs pull this folder automatically and rebuild their `engine.js`.
The website in the repo root uses its own, smaller copy in `/engine`.
