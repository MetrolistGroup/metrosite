import { describe, it, expect } from 'vitest';
import { renderChangelog } from './changelog';

describe('renderChangelog', () => {
  it('returns empty string for empty input', () => {
    expect(renderChangelog('')).toBe('');
  });

  it('renders nothing when no sections match', () => {
    const out = renderChangelog('just some plain text');
    expect(out).toContain('just some plain text');
    expect(out).not.toContain('changelog-section');
  });

  it('renders a standard section with a list', () => {
    const body = "# What's Changed\n- Fixed a bug\n- Added a feature";
    const out = renderChangelog(body);
    expect(out).toContain('changelog-section');
    expect(out).toContain("What's Changed");
    expect(out).toContain('<li>Fixed a bug</li>');
    expect(out).toContain('<li>Added a feature</li>');
  });

  it('renders a maintenance banner for MAINTENANCE MODE', () => {
    const body = '# MAINTENANCE MODE\nServer is down for maintenance.';
    const out = renderChangelog(body);
    expect(out).toContain('changelog-banner');
    expect(out).toContain('Server is down for maintenance.');
  });

  it('renders contributor chips for New Contributors', () => {
    const body = '# New Contributors\n- @octocat made their first contribution';
    const out = renderChangelog(body);
    expect(out).toContain('contributor-chip');
    expect(out).toContain('@octocat');
    expect(out).toContain('https://github.com/octocat');
  });

  it('escapes HTML in content', () => {
    const body = '# Notes\n- <script>alert(1)</script>';
    const out = renderChangelog(body);
    expect(out).not.toContain('<script>alert(1)</script>');
    expect(out).toContain('&lt;script&gt;');
  });
});
