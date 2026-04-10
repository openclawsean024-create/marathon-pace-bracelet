import type { Course, PaceStrategy } from './courses';

export interface PaceSegment {
  km: number;
  cumulativeTime: string;
  splitTime: string;
  pace: string;
  elevation?: number;
  note?: string;
}

export interface WristbandConfig {
  targetTime: string;
  course: Course;
  strategy: PaceStrategy;
  showElevation: boolean;
  showQR: boolean;
  staminaFactor?: number; // -2 to +2
  qrUrl?: string;
}
