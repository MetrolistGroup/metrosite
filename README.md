# Metrosite

The official website for Metrolist, built with Astro and Material 3.

This project features a strictly achromatic (monochrome) design, focusing on tonal elevation and typography to provide a premium feel using only shades of gray and precise spacing.

## Stack

| Purpose | Tool |
|---|---|
| Framework | Astro 4 (SSR via `@astrojs/cloudflare`) |
| Content | `.astro` + TypeScript, MDX blog/docs |
| Styling | M3 design tokens (CSS custom properties) |
| i18n | Cookie-based locale (`en`, `es`, `ar`, `de`, `fr`, `hi`, `id`, `pl`, `pt-BR`) |
| Package manager | Bun |

## Setup

```bash
bun install
```

## Development

```bash
bun run dev
```

The site uses cookie-based locale negotiation (`/download` not `/en/download`). Set the
`GITHUB_TOKEN` env var (see `.env.example`) so the download/stats pages render real data locally.

## Build

```bash
bun run build
```

Runs `astro check` first, then builds the project to `dist/`. The Cloudflare adapter emits
an SSR Worker (`dist/_worker.js`) and static assets.

## Preview

```bash
bun run preview
```

## Testing

```bash
bunx vitest run   # unit tests (vitest — the configured runner for src/**/*.test.ts)
bun run check     # astro check (type/diagnostics)
bunx playwright test   # e2e specs in tests/*.spec.ts (auto-starts a dev server + Chromium)
```

> Note: the unit tests use vitest's `vi` API (`vi.stubGlobal`), so they must run under
> `vitest`, not Bun's native `bun test` runner. CI runs `bunx vitest run`.
> End-to-end specs in `tests/*.spec.ts` use Playwright (`bunx playwright test`) and need a
> running dev server + browser.

## Environment

Create a `.dev.vars` file (gitignored) for local development:

```
GITHUB_TOKEN=ghp_xxx
```

The `GITHUB_TOKEN` is a GitHub personal access token with public repo read access, needed
for the GitHub API calls on the download and stats pages.
