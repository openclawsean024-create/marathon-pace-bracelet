import { describe, it, expect } from 'vitest';
import { calculateSegments } from '../lib/pace-engine';
import { COURSES } from '../lib/courses';

describe('Task 3 smoke tests', () => {
  it('calculateSegments produces 9 segments for default config', () => {
    const config = {
      targetTime: '04:00:00',
      course: COURSES.taipei,
      strategy: 'negative-split' as const,
      showElevation: true,
      showQR: false,
    };
    const segments = calculateSegments(config);
    expect(segments).toHaveLength(9);
  });

  it('page module is importable', async () => {
    // Just verify we can resolve the page module without error
    const mod = await import('../app/page');
    expect(mod.default).toBeDefined();
  });
});
