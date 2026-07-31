import { describe, it, expect } from 'vitest';
import { escapeHtml } from './navigation';

describe('escapeHtml', () => {
	it('leaves plain text untouched', () => {
		expect(escapeHtml('hello world')).toBe('hello world');
	});

	it('escapes all HTML-significant characters', () => {
		expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
	});

	it('neutralizes an XSS payload so no element can be injected via innerHTML', () => {
		const payload = '<img src=x onerror=alert(1)>';
		const escaped = escapeHtml(payload);
		// No raw angle brackets may survive — innerHTML cannot parse a tag from this
		expect(escaped).not.toContain('<');
		expect(escaped).not.toContain('>');
		expect(escaped).toBe('&lt;img src=x onerror=alert(1)&gt;');
	});

	it('neutralizes script tags', () => {
		const escaped = escapeHtml('<script>alert(1)</script>');
		expect(escaped).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
	});

	it('escapes ampersands first to avoid double-escaping entities incorrectly', () => {
		expect(escapeHtml('&lt;')).toBe('&amp;lt;');
	});

	it('does not break trusted internal links used as href', () => {
		expect(escapeHtml('/download')).toBe('/download');
		expect(escapeHtml('/blog/my-post')).toBe('/blog/my-post');
		expect(escapeHtml('/#features')).toBe('/#features');
	});
});
