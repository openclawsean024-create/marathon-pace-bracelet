import type { Course, PaceStrategy } from './courses';
import type { PaceSegment, WristbandConfig } from './types';

// P0 fix: 16K added as explicit checkpoint to avoid interpolation ambiguity
// Also 5K intervals for clarity
const CHECKPOINTS = [5, 10, 15, 16, 21.0975, 25, 30, 35, 40, 42.195];

function parseTimeToSeconds(time: string) {
  const [h, m, s] = time.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

function formatSeconds(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatPace(secondsPerKm: number) {
  const safe = Math.max(1, Math.round(secondsPerKm));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}/km`;
}

function basePaceSeconds(targetTime: string, course: Course) {
  return parseTimeToSeconds(targetTime) / course.totalKm;
}

// P1: staminaFactor adjusts pace (runner fitness: -2=slow, 0=normal, +2=fast)
// Each level = ±5 seconds per km
function paceMultiplier(strategy: PaceStrategy, km: number, staminaFactor = 0) {
  let m = staminaFactor * 5; // ±5 sec/km per level
  if (strategy === 'negative-split') m += km <= 21.0975 ? 0.015 : -0.015;
  if (strategy === 'positive-split') m += km <= 21.0975 ? -0.015 : 0.015;
  if (strategy === 'even-pace') m += 0;
  return 1 + m;
}

// Find previous checkpoint km for split calculation
function prevCheckpointKm(km: number) {
  const sorted = CHECKPOINTS.filter(k => k <= km).sort((a, b) => b - a);
  return sorted[1] ?? 0;
}

export function calculateSegments(config: WristbandConfig): PaceSegment[] {
  const base = basePaceSeconds(config.targetTime, config.course);
  const { staminaFactor = 0 } = config;

  return CHECKPOINTS.map((km) => {
    const multiplier = paceMultiplier(config.strategy, km, staminaFactor);
    const paceSeconds = base * multiplier;
    const cumulative = paceSeconds * km;

    // BUG FIX: split = pace × segment distance (NOT cumulative distance)
    const prevKm = prevCheckpointKm(km);
    const segmentKm = km === 21.0975 ? 21.0975 : km === 42.195 ? 42.195 : km - prevKm;
    const split = paceSeconds * (km === 42.195 ? 42.195 : segmentKm > 0 ? segmentKm : 5);

    const node = config.course.elevationNodes.find((n) => Math.abs(n.km - km) < 0.2);

    return {
      km,
      cumulativeTime: formatSeconds(cumulative),
      splitTime: formatSeconds(split),
      pace: formatPace(paceSeconds),
      elevation: config.showElevation ? node?.elevation : undefined,
      note: node?.label,
    };
  });
}

export function getCheckpointKms() {
  return CHECKPOINTS;
}

export function getTargetPace(targetTime: string, course: Course) {
  return formatPace(basePaceSeconds(targetTime, course));
}
