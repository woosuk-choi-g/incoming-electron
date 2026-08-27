# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the renderer (React + TypeScript); organise UI in `components/`, `hooks/`, `styles/`, and `assets/`, with fixtures in `__mocks__/` and end-to-end specs in `tests/e2e/`.
- `electron/` houses the main process (`main.ts`), the preload bridge, and shared types in `electron-env.d.ts`; keep renderer contracts aligned with these definitions.
- `public/` holds static assets, while generated folders (`dist/`, `dist-electron/`, `release/`) stay out of commits. Update `vite.config.ts`, `tsconfig*.json`, lint/format configs, and `electron-builder.json5` together when altering build flow.

## Build, Test, and Development Commands
- `npm install` installs dependencies for both processes.
- `npm run dev` runs Vite with `vite-plugin-electron`, launching Electron alongside the renderer with hot reload.
- `npm run build` executes `tsc`, `vite build`, and `electron-builder`, emitting artefacts to `dist*` and `release/`.
- `npm run clean` removes build outputs before a fresh package.
- Leverage Context7 for code suggestions when drafting or refining implementation details.
- Agents must invoke Context7 whenever writing or refactoring implementation code to stay aligned with shared patterns.
- `npm run lint`, `npm run format`, and `npm run preview` lint, format, or serve the renderer build for quick smoke checks.
- `npm run test:e2e` runs the Playwright Electron suite (automatically performs a production build first); use `npm run test:e2e:ui` to debug interactively.
- Both `npm run test:e2e` and `npm run test:e2e:ui` launch a real Electron GUI process through Playwright's `_electron.launch()` API. They are not headless just because they are started from a CLI.
- Never run Electron or another GUI process inside the default sandbox. Request escalated execution with a clear GUI-specific justification before running either E2E command. If approval is unavailable, limit verification to non-GUI checks and report that E2E was not run.
- Ensure every new feature or fix passes the Playwright E2E checks before handoff.

## Coding Style & Naming Conventions
- Prettier enforces 2-space indent, semicolons, single quotes, and 80-character lines; keep sources in `.ts`/`.tsx`.
- Name components in PascalCase, hooks with the `use` prefix, and utilities in camelCase; colocate shared types rather than duplicating literals.
- Restrict the preload surface: define IPC types in `electron-env.d.ts`, expose only curated APIs, and strip stray `console` calls before release.

## Testing Guidelines
- End-to-end coverage lives in `tests/e2e/` and is implemented with Playwright’s native Electron support.
- Run `npm run test:e2e` only with GUI-capable escalated execution (it performs `npm run build` automatically), and escalate failures before submission.
- Use `npm run test:e2e:ui` only with GUI-capable escalated execution to iteratively debug or capture evidence; keep specs deterministic via shared fixtures in `src/__mocks__/` when needed.
- Do not treat Electron page crashes from a sandboxed E2E run as application regressions. Stop the surviving Playwright/Electron process, identify the invalid execution environment, and rerun only after obtaining the required GUI execution approval.
- Focus coverage on timer overlay flows, IPC handlers, and primary renderer journeys that impact the desktop experience.

## Commit & Pull Request Guidelines
- Follow existing history: short, imperative, lower-case subjects (`add timer overlay`) with optional wrapped body content.
- Reference tracking IDs (`Refs #123`), call out follow-ups, and keep generated `dist*` or `release/` artefacts out of commits.
- PRs must explain intent, enumerate manual test steps, attach UI evidence when relevant, and rebase on `main` before submission.

## Electron & Security Notes
- Validate renderer requests inside `preload.ts` and `main.ts`; never widen `contextBridge` beyond necessary IPC methods.
- Store secrets and platform paths in environment variables or `electron-builder.json5`, not in renderer bundles or tracked assets.
