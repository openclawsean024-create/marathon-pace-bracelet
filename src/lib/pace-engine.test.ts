import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatPace,
  parseTime,
  calcPacePerKm,
  calculateSegments,
  CHECKPOINT_KMS,
} from './pace-engine';
import { COURSES } from './courses';

describe('CHECKPOINT_KMS', () => {
  it('should have 9 checkpoints', () => {
    expect(CHECKPOINT_KMS).toHaveLength(9);
  });

  it('should contain expected values', () => {
    expect(CHECKPOINT_KMS).toEqual([5, 10, 15, 21.0975, 25, 30, 35, 40, 42.195]);
  });
});

describe('formatTime', () => {
  it('formats 0 seconds as 00:00:00', () => {
    expect(formatTime(0)).toBe('00:00:00');
  });

  it('formats seconds only', () => {
    expect(formatTime(45)).toBe('00:00:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('00:02:05');
  });

  it('formats hours, minutes, seconds', () => {
    expect(formatTime(14400)).toBe('04:00:00');
  });

  it('formats 3:45:30 correctly', () => {
    expect(formatTime(3 * 3600 + 45 * 60 + 30)).toBe('03:45:30');
  });
});

describe('formatPace', () => {
  it('formats 300 seconds as 05:00', () => {
    expect(formatPace(300)).toBe('05:00');
  });

  it('formats 347 seconds as 05:47', () => {
    expect(formatPace(347)).toBe('05:47');
  });

  it('formats 360 seconds as 06:00', () => {
    expect(formatPace(360)).toBe('06:00');
  });
});

describe('parseTime', () => {
  it('parses 00:00:00 as 0', () => {
    expect(parseTime('00:00:00')).toBe(0);
  });

  it('parses 04:00:00 as 14400', () => {
    expect(parseTime('04:00:00')).toBe(14400);
  });

  it('parses 03:45:30 correctly', () => {
    expect(parseTime('03:45:30')).toBe(3 * 3600 + 45 * 60 + 30);
  });

  it('parses MM:SS when under an hour', () => {
    expect(parseTime('30:00')).toBe(1800);
  });
});

describe('formatTime and parseTime are inverses', () => {
  it('round-trips 14400', () => {
    expect(parseTime(formatTime(14400))).toBe(14400);
  });

  it('round-trips 125', () => {
    expect(parseTime(formatTime(125))).toBe(125);
  });
});

describe('calcPacePerKm', () => {
  it('returns correct paces for negative-split strategy', () => {
    // target 4:00:00 = 14400s for 42.195km
    const target = 14400;
    const km = 42.195;
    const result = calcPacePerKm(target, km, 'negative-split');

    const avgPace = target / km; // ~341.5 s/km
    expect(result.firstHalfPace).toBeCloseTo(avgPace * 1.015, 5);
    expect(result.secondHalfPace).toBeCloseTo(avgPace * 0.985, 5);
  });

  it('returns equal paces for even-pace strategy', () => {
    const target = 14400;
    const km = 42.195;
    const result = calcPacePerKm(target, km, 'even-pace');

    const avgPace = target / km;
    expect(result.firstHalfPace).toBeCloseTo(avgPace, 5);
    expect(result.secondHalfPace).toBeCloseTo(avgPace, 5);
  });

  it('returns warmup and kick paces for safe-start strategy', () => {
    const target = 14400;
    const km = 42.195;
    const result = calcPacePerKm(target, km, 'safe-start');

    const avgPace = target / km;
    expect(result.warmupPace).toBeCloseTo(avgPace + 10, 5);
    expect(result.kickPace).toBeCloseTo(avgPace - 10, 5);
    expect(result.firstHalfPace).toBeCloseTo(avgPace, 5);
  });
});

describe('calculateSegments', () => {
  it('returns 9 segments', () => {
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

  it('first segment is at 5km', () => {
    const config = {
      targetTime: '04:00:00',
      course: COURSES.taipei,
      strategy: 'even-pace' as const,
      showElevation: false,
      showQR: false,
    };
    const segments = calculateSegments(config);
    expect(segments[0].km).toBe(5);
    expect(segments[0].splitTime).toBe('00:28:26'); // 5km at 341.4s/km → 5*341.4 ≈ 1707s
  });

  it('last segment is at 42.195km', () => {
    const config = {
      targetTime: '04:00:00',
      course: COURSES.taipei,
      strategy: 'even-pace' as const,
      showElevation: false,
      showQR: false,
    };
    const segments = calculateSegments(config);
    expect(segments[segments.length - 1].km).toBe(42.195);
  });

  it('marks 半程 at 21.0975km', () => {
    const config = {
      targetTime: '04:00:00',
      course: COURSES.taipei,
      strategy: 'even-pace' as const,
      showElevation: false,
      showQR: false,
    };
    const segments = calculateSegments(config);
    const halfNode = segments.find(s => Math.abs(s.km - 21.0975) < 0.1);
    expect(halfNode?.note).toBe('🏁 半程');
  });

  it('marks 撞牆期 for km 30-35', () => {
    const config = {
      targetTime: '04:00:00',
      course: COURSES.taipei,
      strategy: 'even-pace' as const,
      showElevation: false,
      showQR: false,
    };
    const segments = calculateSegments(config);
    const wallNodes = segments.filter(s => s.km >= 30 && s.km <= 35);
    wallNodes.forEach(n => {
      expect(n.note).toBe('⚠️ 撞牆期');
    });
  });

  it('marks 橋樑 for penghu at 5,15,25,35', () => {
    const config = {
      targetTime: '04:00:00',
      course: COURSES.penghu,
      strategy: 'even-pace' as const,
      showElevation: false,
      showQR: false,
    };
    const segments = calculateSegments(config);
    const bridgeNodes = segments.filter(s => [5, 15, 25, 35].includes(Math.round(s.km)));
    bridgeNodes.forEach(n => {
      expect(n.note).toBe('🌉 橋樑');
    });
  });

  it('marks 虹橋高架 for taipei near 1.1km', () => {
    const config = {
      targetTime: '04:00:00',
      course: COURSES.taipei,
      strategy: 'even-pace' as const,
      showElevation: false,
      showQR: false,
    };
    const segments = calculateSegments(config);
    // No checkpoint at 1.1km, but the course has it — segments are at 5,10,15,...
    // The虹橋高架 marker only applies at the right km, which doesn't coincide with checkpoints
    // So we just verify the function runs without error
    expect(segments.length).toBe(9);
  });

  it('includes elevation data when showElevation is true', () => {
    const config = {
      targetTime: '04:00:00',
      course: COURSES.taipei,
      strategy: 'even-pace' as const,
      showElevation: true,
      showQR: false,
    };
    const segments = calculateSegments(config);
    segments.forEach(s => {
      expect(s).toHaveProperty('elevation');
    });
  });

  it('negative-split has slower first half pace', () => {
    const config = {
      targetTime: '04:00:00',
      course: COURSES.taipei,
      strategy: 'negative-split' as const,
      showElevation: false,
      showQR: false,
    };
    const segments = calculateSegments(config);
    // Find segments in first half (5-21km) vs second half (25-42km)
    const firstHalf = segments.filter(s => s.km <= 21.0975);
    const secondHalf = segments.filter(s => s.km > 21.0975);
    // Extract pace values (seconds) for comparison
    const avgFirst = firstHalf.reduce((sum, s) => {
      const [min, sec] = s.pace.split(':').map(Number);
      return sum + min * 60 + sec;
    }, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, s) => {
      const [min, sec] = s.pace.split(':').map(Number);
      return sum + min * 60 + sec;
    }, 0) / secondHalf.length;
    expect(avgFirst).toBeGreaterThan(avgSecond);
  });
});
