import { detectVideoQuality, VIDEO_SOURCES, prefersReducedMotion, type VideoQuality } from './video-quality';

export function loadAdaptiveVideo(video: HTMLVideoElement, maxTier: VideoQuality = 'med'): void {
  const tier = detectVideoQuality(maxTier);
  const url = VIDEO_SOURCES[tier];

  // Clear any pre-existing sources to avoid double-fetch.
  while (video.firstChild) video.removeChild(video.firstChild);

  video.src = url;
  video.preload = tier === 'high' ? 'auto' : tier === 'med' ? 'metadata' : 'none';

  if (prefersReducedMotion()) {
    video.autoplay = false;
  }

  video.load();
}

export function setupAdaptiveVideos(maxTier: VideoQuality = 'med'): void {
  const videos = document.querySelectorAll<HTMLVideoElement>('video[data-adaptive-video]');
  videos.forEach(video => loadAdaptiveVideo(video, maxTier));
}
