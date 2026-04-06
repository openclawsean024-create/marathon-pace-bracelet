import { Course, PaceStrategy } from './courses';
import { PaceSegment, WristbandConfig } from './types';

export const CHECKPOINT_KMS = [5, 10, 15, 21.0975, 25, 30, 35, 40, 42.195];

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatPace(secondsPerKm: number): string {
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function parseTime(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }
  // HH:MM:SS
  return parts[0] * 3600 + parts[1] * 60 + (parts[2] ?? 0);
}

export function calcPacePerKm(
  targetSeconds: number,
  totalKm: number,
  strategy: PaceStrategy
): {
  firstHalfPace: number;
  secondHalfPace: number;
  warmupPace?: number;
  kickPace?: number;
} {
  const avgPace = targetSeconds / totalKm;

  if (strategy === 'negative-split') {
    return {
      firstHalfPace: avgPace * 1.015,
      secondHalfPace: avgPace * 0.985,
    };
  }

  if (strategy === 'even-pace') {
    return {
      firstHalfPace: avgPace,
      secondHalfPace: avgPace,
    };
  }

  // safe-start
  return {
    firstHalfPace: avgPace,
    secondHalfPace: avgPace,
    warmupPace: avgPace + 10,
    kickPace: avgPace - 10,
  };
}

export function calculateSegments(config: WristbandConfig): PaceSegment[] {
  const { targetTime, course, strategy } = config;
  const targetSeconds = parseTime(targetTime);
  const km = course.totalKm;

  const paces = calcPacePerKm(targetSeconds, km, strategy);

  const segments: PaceSegment[] = [];
  let prevKm = 0;
  let prevTime = 0;

  for (const ck of CHECKPOINT_KMS) {
    const kmDelta = ck - prevKm;
    let paceForThisSegment: number;

    if (ck <= 5) {
      paceForThisSegment = paces.warmupPace ?? paces.firstHalfPace;
    } else if (ck <= 21.0975) {
      paceForThisSegment = paces.firstHalfPace;
    } else {
      paceForThisSegment = paces.kickPace ?? paces.secondHalfPace;
    }

    const splitSeconds = Math.round(kmDelta * paceForThisSegment);
    const cumulativeSeconds = prevTime + splitSeconds;

    // Nearest elevation node
    const elevNode = course.elevationNodes.reduce((prev, curr) =>
      Math.abs(curr.km - ck) < Math.abs(prev.km - ck) ? curr : prev
    );

    // Special markers
    let note = '';
    if (Math.abs(ck - 21.0975) < 0.1) note = '🏁 半程';
    if (ck >= 30 && ck <= 35) note = '⚠️ 撞牆期';
    if (course.id === 'penghu' && [5, 15, 25, 35].includes(Math.round(ck))) note = '🌉 橋樑';
    if (course.id === 'taipei' && Math.abs(ck - 1.1) < 0.2) note = '🌉 虹橋高架';

    segments.push({
      km: ck,
      cumulativeTime: formatTime(cumulativeSeconds),
      splitTime: formatTime(splitSeconds),
      pace: formatPace(paceForThisSegment),
      elevation: elevNode?.elevation,
      note,
    });

    prevKm = ck;
    prevTime = cumulativeSeconds;
  }

  return segments;
}
