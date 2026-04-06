import { Course, PaceStrategy } from './courses';

export interface PaceSegment {
  km: number; // 里程標記
  cumulativeTime: string; // 累積時間 (HH:MM:SS)
  splitTime: string; // 分段時間 (HH:MM:SS)
  pace: string; // 該公里配速 (MM:SS/km)
  elevation?: number; // 高度（公尺）
  note?: string; // 特殊標記
}

export interface WristbandConfig {
  targetTime: string; // 目標時間 "HH:MM:SS"
  course: Course;
  strategy: PaceStrategy;
  showElevation: boolean;
  showQR: boolean;
  qrUrl?: string;
}
