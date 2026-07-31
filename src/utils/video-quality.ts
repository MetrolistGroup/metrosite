export type VideoQuality = 'low' | 'med' | 'high';

export const VIDEO_SOURCES: Record<VideoQuality, string> = {
  low: '/images/screenshots/wbw_lyrics_showcase_low.mp4',
  med: '/images/screenshots/wbw_lyrics_showcase_med.mp4',
  high: '/images/screenshots/wbw_lyrics_showcase.mp4',
};

// Rank used to cap a detected tier at a maximum allowed value.
const TIER_RANK: Record<VideoQuality, number> = { low: 0, med: 1, high: 2 };

function detectVideoQualityUncapped(): VideoQuality {
  if (typeof navigator === 'undefined') return 'med';

  const connection = navigator.connection;
  const saveData = connection?.saveData === true;
  const effectiveType = connection?.effectiveType;
  const deviceMemory = navigator.deviceMemory;
  const hardwareConcurrency = navigator.hardwareConcurrency;

  if (saveData) return 'low';
  if (effectiveType === '2g' || effectiveType === 'slow-2g') return 'low';
  if (effectiveType === '3g') return 'med';
  // 4g and 5g fall through to hardware-based checks below

  if (typeof deviceMemory === 'number') {
    if (deviceMemory <= 2) return 'low';
    if (deviceMemory <= 4) return 'med';
  }

  if (typeof hardwareConcurrency === 'number') {
    if (hardwareConcurrency <= 2) return 'low';
    if (hardwareConcurrency <= 4) return 'med';
    if (hardwareConcurrency >= 8) return 'high';
  }

  return 'med';
}

/**
 * Detect the best video quality for the current device/connection.
 * `maxTier` caps the result — autoplaying preview videos should stay at
 * `med` to avoid decoding a 1080p clip in a loop on capable machines.
 */
export function detectVideoQuality(maxTier: VideoQuality = 'high'): VideoQuality {
  const tier = detectVideoQualityUncapped();
  return TIER_RANK[tier] > TIER_RANK[maxTier] ? maxTier : tier;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function prefersReducedData(): boolean {
  return typeof navigator !== 'undefined' && navigator.connection?.saveData === true;
}
