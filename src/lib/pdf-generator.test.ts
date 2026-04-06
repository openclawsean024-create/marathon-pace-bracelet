import { describe, it, expect } from 'vitest';
import { generateWristbandPDF } from './pdf-generator';
import { COURSES } from './courses';

describe('pdf-generator', () => {
  it('should generate a PDF with 2 pages', async () => {
    const config = {
      targetTime: '04:00:00',
      course: COURSES['taipei'],
      strategy: 'negative-split' as const,
      showElevation: true,
      showQR: false,
    };

    const doc = await generateWristbandPDF(config);

    // Verify the doc has 2 pages
    expect(doc.getNumberOfPages()).toBe(2);
  });

  it('should generate a PDF with custom strategy', async () => {
    const config = {
      targetTime: '03:30:00',
      course: COURSES['penghu'],
      strategy: 'even-pace' as const,
      showElevation: false,
      showQR: false,
    };

    const doc = await generateWristbandPDF(config);
    expect(doc.getNumberOfPages()).toBe(2);
  });
});
