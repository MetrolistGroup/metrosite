import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';

// NOTE: This must be a plain object, not defineConfig(({ mode }) => ...).
// A config *function* silently suppresses integration hooks such as the
// @astrojs/mdx addContentEntryType hook, which left the .mdx content
// collections (blog/docs) empty at build time.

// Prefetching compiles a full SSR route on every hover/viewport hit. In dev
// this storms the dev server (CPU spikes on every navigation); disable it
// there. In prod keep it, but on hover rather than viewport to stay light.
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  site: 'https://metrolist.cc',
  output: 'server',
  adapter: cloudflare(),
  server: { host: true },
  integrations: [mdx()],
  prefetch: isDev
    ? false
    : {
        prefetchAll: true,
        defaultStrategy: 'hover',
      },
});
