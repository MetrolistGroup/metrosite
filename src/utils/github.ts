export interface GithubRelease {
  tag_name: string;
  name: string;
  body: string;
  prerelease: boolean;
  published_at: string;
  assets: {
    name: string;
    browser_download_url: string;
    size: number;
  }[];
}

export interface RepoStats {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  description: string | null;
  language: string | null;
  license: { spdx_id: string } | null;
}

export interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

const REPO = 'MetrolistGroup/Metrolist';
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

// Simple in-memory cache for local development and SSR persistence
interface CacheEntry<T> {
  data: T;
  expiry: number;
}
const localCache: Record<string, CacheEntry<any>> = {};

async function fetchGithub<T>(endpoint: string): Promise<T | null> {
  // Check memory cache first
  const now = Date.now();
  if (localCache[endpoint] && localCache[endpoint].expiry > now) {
    return localCache[endpoint].data;
  }

  const url = `https://api.github.com/${endpoint}`;

  try {
    // Read from the runtime environment (not import.meta.env): under the
    // Cloudflare adapter the Worker runs per-request, so the token must come
    // from the live env (wrangler secret / process.env), not a value inlined
    // at build time. Build-time inlining would (a) freeze it to whatever the
    // CI build saw and (b) bake the secret into the public _worker.js bundle.
    const token = process.env.GITHUB_TOKEN ?? import.meta.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Metrosite-Astro'
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(url, { 
      headers,
      // @ts-ignore - still keep cf for production edge caching
      cf: {
        cacheTtl: 3600,
        cacheEverything: true,
      }
    });
    
    if (!response.ok) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      console.warn(`[GitHub API] Error ${response.status} for ${endpoint}. Remaining: ${remaining}`);
      
      // If we have stale data in cache, return it rather than null during a 403
      if (localCache[endpoint]) return localCache[endpoint].data;
      return null;
    }

    const data = await response.json();
    
    // Save to memory cache
    localCache[endpoint] = {
      data,
      expiry: now + CACHE_TTL
    };

    return data;
  } catch (error) {
    if (localCache[endpoint]) return localCache[endpoint].data;
    return null;
  }
}

export async function getRepoStats(): Promise<RepoStats | null> {
  return await fetchGithub<RepoStats>(`repos/${REPO}`);
}

export async function getLatestRelease(): Promise<GithubRelease | null> {
  return await fetchGithub<GithubRelease>(`repos/${REPO}/releases/latest`);
}

export async function getNightlyRelease(): Promise<GithubRelease | null> {
  const releases = await fetchGithub<GithubRelease[]>(`repos/${REPO}/releases`);
  if (!releases) return null;
  
  const latestStable = releases.find(r => !r.prerelease);
  const latestPrerelease = releases.find(r => r.prerelease);

  if (latestPrerelease && latestStable) {
    if (new Date(latestPrerelease.published_at) > new Date(latestStable.published_at)) {
      return latestPrerelease;
    }
  }

  return null;
}

export async function getContributors(): Promise<Contributor[]> {
  const contributors = await fetchGithub<Contributor[]>(`repos/${REPO}/contributors?per_page=100`);
  return contributors || [];
}

export function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatCompactNumber(number: number): string {
  if (number < 1000) return number.toString();
  return (number / 1000).toFixed(1) + 'k';
}
