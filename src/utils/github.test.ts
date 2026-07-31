import { describe, it, expect } from 'vitest';
import { formatSize, formatCompactNumber } from './github';

describe('formatSize', () => {
  it('returns bytes for values under 1024', () => {
    expect(formatSize(0)).toBe('0.0 B');
    expect(formatSize(512)).toBe('512.0 B');
    expect(formatSize(1023)).toBe('1023.0 B');
  });

  it('returns KB at 1024', () => {
    expect(formatSize(1024)).toBe('1.0 KB');
    expect(formatSize(1536)).toBe('1.5 KB');
  });

  it('returns MB at 1024^2', () => {
    expect(formatSize(1048576)).toBe('1.0 MB');
    expect(formatSize(1572864)).toBe('1.5 MB');
  });

  it('returns GB at 1024^3', () => {
    expect(formatSize(1073741824)).toBe('1.0 GB');
  });
});

describe('formatCompactNumber', () => {
  it('returns the number as-is below 1000', () => {
    expect(formatCompactNumber(0)).toBe('0');
    expect(formatCompactNumber(999)).toBe('999');
  });

  it('formats thousands with one decimal', () => {
    expect(formatCompactNumber(1000)).toBe('1.0k');
    expect(formatCompactNumber(1500)).toBe('1.5k');
    expect(formatCompactNumber(999999)).toBe('1000.0k');
  });
});
