import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  detectVideoQuality,
  prefersReducedMotion,
  prefersReducedData,
  VIDEO_SOURCES,
  type VideoQuality,
} from './video-quality';

function setNavigator(value: unknown): void {
  if (value === undefined) {
    vi.stubGlobal('navigator', undefined);
  } else {
    vi.stubGlobal('navigator', value);
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('VIDEO_SOURCES', () => {
  it('exposes a URL for every tier', () => {
    expect(VIDEO_SOURCES.low).toBe('/images/screenshots/wbw_lyrics_showcase_low.mp4');
    expect(VIDEO_SOURCES.med).toBe('/images/screenshots/wbw_lyrics_showcase_med.mp4');
    expect(VIDEO_SOURCES.high).toBe('/images/screenshots/wbw_lyrics_showcase.mp4');
  });
});

describe('detectVideoQuality', () => {
  it('returns med when navigator is undefined (SSR)', () => {
    setNavigator(undefined);
    expect(detectVideoQuality()).toBe<VideoQuality>('med');
  });

  it('returns med for an empty navigator object', () => {
    setNavigator({});
    expect(detectVideoQuality()).toBe<VideoQuality>('med');
  });

  it('saveData wins over everything', () => {
    setNavigator({
      connection: { saveData: true, effectiveType: '4g' },
      deviceMemory: 8,
      hardwareConcurrency: 8,
    });
    expect(detectVideoQuality()).toBe<VideoQuality>('low');
  });

  it('treats slow-2g as low', () => {
    setNavigator({ connection: { effectiveType: 'slow-2g' } });
    expect(detectVideoQuality()).toBe<VideoQuality>('low');
  });

  it('treats 2g as low', () => {
    setNavigator({ connection: { effectiveType: '2g' } });
    expect(detectVideoQuality()).toBe<VideoQuality>('low');
  });

  it('treats 3g as med', () => {
    setNavigator({ connection: { effectiveType: '3g' } });
    expect(detectVideoQuality()).toBe<VideoQuality>('med');
  });

  it('treats 4g with mid-range device as med', () => {
    setNavigator({
      connection: { effectiveType: '4g' },
      deviceMemory: 4,
      hardwareConcurrency: 4,
    });
    expect(detectVideoQuality()).toBe<VideoQuality>('med');
  });

  it('treats 1 GB deviceMemory as low', () => {
    setNavigator({ deviceMemory: 1, hardwareConcurrency: 8 });
    expect(detectVideoQuality()).toBe<VideoQuality>('low');
  });

  it('treats 2 GB deviceMemory as low', () => {
    setNavigator({ deviceMemory: 2, hardwareConcurrency: 8 });
    expect(detectVideoQuality()).toBe<VideoQuality>('low');
  });

  it('treats 3 GB deviceMemory as med', () => {
    setNavigator({ deviceMemory: 3, hardwareConcurrency: 8 });
    expect(detectVideoQuality()).toBe<VideoQuality>('med');
  });

  it('treats 4 GB deviceMemory as med', () => {
    setNavigator({ deviceMemory: 4, hardwareConcurrency: 8 });
    expect(detectVideoQuality()).toBe<VideoQuality>('med');
  });

  it('returns low when hardwareConcurrency is 1', () => {
    setNavigator({ hardwareConcurrency: 1 });
    expect(detectVideoQuality()).toBe<VideoQuality>('low');
  });

  it('returns low when hardwareConcurrency is 2', () => {
    setNavigator({ hardwareConcurrency: 2 });
    expect(detectVideoQuality()).toBe<VideoQuality>('low');
  });

  it('returns med when hardwareConcurrency is 3', () => {
    setNavigator({ hardwareConcurrency: 3 });
    expect(detectVideoQuality()).toBe<VideoQuality>('med');
  });

  it('returns med when hardwareConcurrency is 4', () => {
    setNavigator({ hardwareConcurrency: 4 });
    expect(detectVideoQuality()).toBe<VideoQuality>('med');
  });

  it('returns high when hardwareConcurrency is 8', () => {
    setNavigator({ hardwareConcurrency: 8 });
    expect(detectVideoQuality()).toBe<VideoQuality>('high');
  });

  it('3g signal wins over a fast device', () => {
    setNavigator({
      connection: { effectiveType: '3g' },
      deviceMemory: 8,
      hardwareConcurrency: 8,
    });
    expect(detectVideoQuality()).toBe<VideoQuality>('med');
  });

  it('2g signal wins over a fast device', () => {
    setNavigator({
      connection: { effectiveType: '2g' },
      deviceMemory: 8,
      hardwareConcurrency: 8,
    });
    expect(detectVideoQuality()).toBe<VideoQuality>('low');
  });

  it('4g with 8 GB and 8 cores reaches high', () => {
    setNavigator({
      connection: { effectiveType: '4g' },
      deviceMemory: 8,
      hardwareConcurrency: 8,
    });
    expect(detectVideoQuality()).toBe<VideoQuality>('high');
  });
});

describe('detectVideoQuality maxTier cap', () => {
  it('caps a high-tier device at med for autoplay previews', () => {
    setNavigator({
      connection: { effectiveType: '4g' },
      deviceMemory: 8,
      hardwareConcurrency: 8,
    });
    expect(detectVideoQuality('med')).toBe<VideoQuality>('med');
  });

  it('does not cap below the detected tier', () => {
    setNavigator({ hardwareConcurrency: 2 });
    expect(detectVideoQuality('med')).toBe<VideoQuality>('low');
  });

  it('default (uncapped) still reaches high on a capable device', () => {
    setNavigator({
      connection: { effectiveType: '4g' },
      deviceMemory: 8,
      hardwareConcurrency: 8,
    });
    expect(detectVideoQuality()).toBe<VideoQuality>('high');
  });
});

describe('prefersReducedMotion', () => {
  it('returns false when window is undefined', () => {
    vi.stubGlobal('window', undefined);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('returns true when matchMedia reports reduce', () => {
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: true }),
    });
    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when matchMedia reports no preference', () => {
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
    });
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('prefersReducedData', () => {
  it('returns true when navigator.connection.saveData is true', () => {
    setNavigator({ connection: { saveData: true } });
    expect(prefersReducedData()).toBe(true);
  });

  it('returns false when navigator is undefined', () => {
    setNavigator(undefined);
    expect(prefersReducedData()).toBe(false);
  });

  it('returns false when connection is missing', () => {
    setNavigator({});
    expect(prefersReducedData()).toBe(false);
  });

  it('returns false when saveData is false', () => {
    setNavigator({ connection: { saveData: false } });
    expect(prefersReducedData()).toBe(false);
  });
});
