import type { Course, PaceStrategy } from './courses';
import type { PaceSegment, WristbandConfig } from './types';

const CHECKPOINTS = [5, 10, 15, 21.0975, 25, 30, 35, 40, 42.195];

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

function paceMultiplier(strategy: PaceStrategy, km: number) {
  if (strategy === 'negative-split') return km <= 21.0975 ? 1.015 : 0.985;
  if (strategy === 'safe-start') return km <= 5 ? 1.03 : km <= 30 ? 1 : 0.985;
  return 1;
}

export function calculateSegments(config: WristbandConfig): PaceSegment[] {
  const base = basePaceSeconds(config.targetTime, config.course);

  return CHECKPOINTS.map((km) => {
    const multiplier = paceMultiplier(config.strategy, km);
    const paceSeconds = base * multiplier;
    const cumulative = paceSeconds * km;
    const split = km === 21.0975 ? paceSeconds * 21.0975 : km === 42.195 ? paceSeconds * 42.195 : paceSeconds * 5;
    const node = config.course.elevationNodes.find((n) => Math.abs(n.km - km) < 0.2);

    return {
      km,
      cumulativeTime: formatSeconds(cumulative),
      splitTime: formatSeconds(split),
      pace: formatPace(paceSeconds),
      elevation: node?.elevation,
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
