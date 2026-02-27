import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Content Security Policy', () => {
  it('should have a CSP meta tag in index.html', () => {
    const htmlPath = path.resolve(process.cwd(), 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // Check for the presence of the CSP meta tag
    // This regex looks for meta http-equiv="Content-Security-Policy" content="..."
    const cspRegex = /<meta\s+http-equiv=["']Content-Security-Policy["']\s+content=["'](.*?)["']\s*\/?>/i;
    const match = htmlContent.match(cspRegex);

    expect(match, 'CSP meta tag not found in index.html').not.toBeNull();

    if (match) {
        const content = match[1];
        // Basic checks for essential directives
        expect(content).toContain("default-src 'self'");
        expect(content).toContain("script-src");
        expect(content).toContain("style-src");
    }
  });
});
