# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the renderer (React + TypeScript); organise UI in `components/`, `hooks/`, `styles/`, and `assets/`, with fixtures in `__mocks__/` and future specs in `__tests__/`.
- `electron/` houses the main process (`main.ts`), the preload bridge, and shared types in `electron-env.d.ts`; keep renderer contracts aligned with these definitions.
- `public/` holds static assets, while generated folders (`dist/`, `dist-electron/`, `release/`) stay out of commits. Update `vite.config.ts`, `tsconfig*.json`, lint/format configs, and `electron-builder.json5` together when altering build flow.

## Build, Test, and Development Commands
- `npm install` installs dependencies for both processes.
- `npm run dev` runs Vite with `vite-plugin-electron`, launching Electron alongside the renderer with hot reload.
- `npm run build` executes `tsc`, `vite build`, and `electron-builder`, emitting artefacts to `dist*` and `release/`.
- `npm run clean` removes build outputs before a fresh package.
- `npm run lint`, `npm run format`, and `npm run preview` lint, format, or serve the renderer build for quick smoke checks.

## Coding Style & Naming Conventions
- Prettier enforces 2-space indent, semicolons, single quotes, and 80-character lines; keep sources in `.ts`/`.tsx`.
- Name components in PascalCase, hooks with the `use` prefix, and utilities in camelCase; colocate shared types rather than duplicating literals.
- Restrict the preload surface: define IPC types in `electron-env.d.ts`, expose only curated APIs, and strip stray `console` calls before release.

## Testing Guidelines
- Seed tests under `src/__tests__/` and place reusable fixtures in `src/__mocks__/`.
- Adopt Vitest with React Testing Library (fits Vite); after installing, run suites via `npx vitest --run` and add `"test": "vitest"` to `package.json`.
- Prioritise coverage on timer reducers, IPC handlers, and primary hooks before review, keeping specs deterministic through shared mocks.

## Commit & Pull Request Guidelines
- Follow existing history: short, imperative, lower-case subjects (`add timer overlay`) with optional wrapped body content.
- Reference tracking IDs (`Refs #123`), call out follow-ups, and keep generated `dist*` or `release/` artefacts out of commits.
- PRs must explain intent, enumerate manual test steps, attach UI evidence when relevant, and rebase on `main` before submission.

## Electron & Security Notes
- Validate renderer requests inside `preload.ts` and `main.ts`; never widen `contextBridge` beyond necessary IPC methods.
- Store secrets and platform paths in environment variables or `electron-builder.json5`, not in renderer bundles or tracked assets.
