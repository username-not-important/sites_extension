# Repository Guidelines

## Project Structure & Module Organization
This repository is a lightweight Chrome/Chromium extension (Manifest V3) for styling and behavior tweaks on AvalAI Chat.

- `manifest.json`: Extension metadata, permissions, match patterns, and injected assets.
- `content.js`: Content script entry point for runtime behavior.
- `styles.css`: Main UI/theme overrides and layout adjustments.
- `icons/`: Extension icons (`icon16.png`, `icon48.png`, `icon128.png`).

Keep logic in `content.js` and presentation in `styles.css`. If features grow, split JS into small modules and load them from `manifest.json`.

## Build, Test, and Development Commands
No build pipeline is currently required.
- Optional packaging: `zip -r release.zip manifest.json content.js styles.css icons/`.

## Coding Style & Naming Conventions
- JavaScript: 2-space indentation, semicolons, single quotes (match existing style as you edit).
- CSS: grouped sections with clear headers; prefer kebab-case class naming and readable rule blocks.
- Keep selectors scoped and specific; avoid broad overrides unless intentional.
- Use descriptive names for new files/features (e.g., `chat-toolbar.js`, `message-layout.css`).

## Security & Configuration Tips
- Keep permissions minimal in `manifest.json`; add only when required.
- Validate `matches` patterns carefully to avoid injecting scripts on unintended sites.
- Do not hardcode secrets, tokens, or private endpoints in client-side files.
