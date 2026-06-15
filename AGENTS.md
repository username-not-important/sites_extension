# Repository Guidelines

## Project Structure & Module Organization

This repository is a lightweight Chrome/Chromium extension (Manifest V3) for styling and behavior tweaks on AvalAI Chat and GapGPT.

### Root

- manifest.json: Extension metadata, permissions, match patterns, injected JS/CSS.
- content.js: Global runtime bootstrap that defines window.siteEnhancer.
- styles.css: Base/global overrides (legacy single-file mode).
- icons/: Extension icons.

---

## GapGPT Architecture

GapGPT logic is modular and feature-based.

### Orchestrator  
sites/gapgpt/content.js

This file coordinates all GapGPT features.

Responsibilities:
- Creates window.siteEnhancer.gapgpt namespace.
- Maintains an internal feature registry.
- Exposes:
  - register(name, feature)
  - refresh()
- Calls init() once per feature after DOM ready.
- Runs a single shared MutationObserver that calls refresh().
- Sets document.documentElement.dataset.siteEnhancer = 'gapgpt'.

Features must not create their own global observers.

---

## Feature Modules

Located in:

sites/gapgpt/modules/

Each module:
- Is wrapped in an IIFE.
- Guards against missing runtime.
- Registers itself via gapgpt.register(name, { init, refresh }).
- Must be idempotent (safe under repeated refresh calls).

### message-navigation.js
Owns:
- Message selector logic.
- Previous/next navigation controls.
- Rendering and deduplication of navigation UI.

Must:
- Avoid duplicate buttons.
- Work with dynamically added messages.

### code-blocks.js
Owns all ```<pre>``` code block enhancements:
- Collapse/expand button.
- Collapsed state via data-collapsed.
- max-height transition handling.
- Bottom copy footer that delegates to the original copy button.

Owned classes include:
- site-enhancer-code-footer
- site-enhancer-code-collapse
- site-enhancer-code-collapsible
- site-enhancer-code-copy-bottom

Must:
- Use :scope selectors where appropriate.
- Not duplicate footers or buttons.
- Remove temporary transition listeners.

### inline-code-copy.js
Owns inline ```<code>``` floating copy behavior:
- Single floating button instance.
- Pointer delegation.
- Clipboard copy + visual feedback.
- Tracks current inline code element.

Owned class:
- site-enhancer-inline-code-copy

Must:
- Create only one floating button.
- Guard event.target instanceof Element.
- Avoid duplicate global listeners.
- Work with dynamically inserted inline code.

---

## CSS Structure (GapGPT)

Recommended split:

sites/gapgpt/styles/
- styles.css (entry or shared variables)
- base.css
- message-navigation.css
- code-blocks.css
- inline-code-copy.css

Ownership should match JS modules:

- message-navigation.css: navigation layout and states.
- code-blocks.css: header layout, collapse styles, footer copy UI.
- inline-code-copy.css: floating button, visible and copied states.
- base.css: layout tweaks, ad hiding, spacing.

Use the site-enhancer-* prefix for injected classes.

---

## Idempotency Rules

Because refresh() runs after every DOM mutation:

- Never insert duplicate DOM nodes.
- Always check before appending UI.
- Avoid duplicate event listeners.
- Keep one floating inline copy instance.
- Use dataset or class markers as guards.

---

## Build, Test, and Development Commands

No build pipeline required.

Syntax checks:
- node --check content.js
- node --check sites/gapgpt/content.js
- node --check sites/gapgpt/modules/*.js

Optional packaging:
zip -r release.zip manifest.json content.js styles.css icons/ sites/

---

## Coding Style & Naming Conventions

JavaScript:
- 2-space indentation
- Semicolons
- Single quotes
- IIFE modules (no ES modules unless manifest changes)
- Only extend window via window.siteEnhancer

CSS:
- Kebab-case class names
- site-enhancer-* namespace
- Scoped, specific selectors
- Clear feature grouping

---

## Security & Configuration Tips

- Keep manifest permissions minimal.
- Validate matches patterns carefully.
- Do not inject into unintended origins.
- Do not commit .pem files.
- Do not hardcode secrets or tokens.
- Avoid inline onclick in injected UI.